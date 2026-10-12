// AI client: a chain of Gemini models, then Groq as a free fallback.
// Every provider returns a JSON object; the caller normalizes it.

type GeminiSchema = Record<string, unknown>;

// Flash-Lite first: ~2s responses and a much larger free daily quota than Flash (20/day).
const GEMINI_MODELS = (process.env.GEMINI_MODELS ?? 'gemini-flash-lite-latest,gemini-flash-latest')
  .split(',').map((m) => m.trim()).filter(Boolean);
const GROQ_MODEL = process.env.GROQ_MODEL ?? 'openai/gpt-oss-120b';
const TIMEOUT_MS = 20_000;

// Skip a provider for a while after it runs out of quota (or rejects our request outright)
// instead of paying a failed round-trip on every request
const QUOTA_COOLDOWN_MS = 5 * 60_000;
const BROKEN_COOLDOWN_MS = 30 * 60_000;
const exhaustedUntil = new Map<string, number>();

function isExhausted(model: string): boolean {
  return (exhaustedUntil.get(model) ?? 0) > Date.now();
}

function sanitizeJson(str: string): string {
  return str.replace(/,(\s*[}\]])/g, '$1');
}

function parseJson(raw: string): unknown {
  const jsonStr = raw.match(/\{[\s\S]*\}/)?.[0] ?? raw;
  try {
    return JSON.parse(jsonStr);
  } catch {
    return JSON.parse(sanitizeJson(jsonStr));
  }
}

async function callGemini(model: string, prompt: string, schema: GeminiSchema): Promise<unknown> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
          responseSchema: schema,
          // Structured recipe output doesn't need long reasoning: ~6s instead of 10-25s on Flash.
          // Older 2.x models reject thinkingLevel — the chain then moves to the next model.
          thinkingConfig: { thinkingLevel: 'low' },
        },
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    }
  );

  if (res.status === 429) throw new Error('quota');
  if (!res.ok) throw new Error(`Gemini API error ${res.status}: ${await res.text()}`);

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
  return parseJson(text);
}

async function callGroq(prompt: string): Promise<unknown> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not set');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'Eres un chef profesional. Respondes solo con JSON válido, en español.' },
        { role: 'user', content: prompt },
      ],
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (res.status === 429) throw new Error('quota');
  if (!res.ok) throw new Error(`Groq API error ${res.status}: ${await res.text()}`);

  const data = await res.json();
  return parseJson(data.choices?.[0]?.message?.content ?? '');
}

type Provider = { name: string; call: () => Promise<unknown> };

async function generateJson(prompt: string, schema: GeminiSchema): Promise<unknown> {
  const providers: Provider[] = GEMINI_MODELS.map((model) => ({
    name: model,
    call: () => callGemini(model, prompt, schema),
  }));
  if (process.env.GROQ_API_KEY) {
    // Groq has no schema enforcement here, so the prompt spells out the shape
    providers.push({
      name: `groq:${GROQ_MODEL}`,
      call: () => callGroq(`${prompt}\n\nFormato de salida (JSON): ${JSON.stringify(schema)}`),
    });
  }

  const available = providers.filter((p) => !isExhausted(p.name));
  // Everything is cooling down after quota errors: report it as quota so the user is told to wait
  if (providers.length && !available.length) throw new Error('quota');

  let lastError: unknown = new Error('No AI provider configured');
  for (const provider of available) {
    try {
      return await provider.call();
    } catch (err) {
      lastError = err;
      const message = err instanceof Error ? err.message : '';
      if (message === 'quota') {
        exhaustedUntil.set(provider.name, Date.now() + QUOTA_COOLDOWN_MS);
      } else if (/API error (400|401|403|404)/.test(message)) {
        // Bad model name, unsupported config or bad key: retrying soon won't help
        exhaustedUntil.set(provider.name, Date.now() + BROKEN_COOLDOWN_MS);
      }
      console.warn(`[ai] ${provider.name} failed:`, err instanceof Error ? err.message.slice(0, 200) : err);
    }
  }
  throw lastError;
}

const RECIPES_SCHEMA: GeminiSchema = {
  type: 'OBJECT',
  properties: {
    recipes: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          name: { type: 'STRING' },
          availableIngredients: { type: 'ARRAY', items: { type: 'STRING' } },
          missingIngredients: { type: 'ARRAY', items: { type: 'STRING' } },
          estimatedTime: { type: 'INTEGER' },
          difficulty: { type: 'STRING', enum: ['fácil', 'medio', 'difícil'] },
          dietaryTags: {
            type: 'ARRAY',
            items: { type: 'STRING', enum: ['vegetariano', 'vegano', 'sin gluten', 'sin lácteos'] },
          },
          servings: { type: 'INTEGER' },
          imageQuery: { type: 'STRING' },
        },
        required: [
          'name', 'availableIngredients', 'missingIngredients', 'estimatedTime',
          'difficulty', 'dietaryTags', 'servings', 'imageQuery',
        ],
      },
    },
  },
  required: ['recipes'],
};

const DETAIL_SCHEMA: GeminiSchema = {
  type: 'OBJECT',
  properties: {
    steps: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          stepNumber: { type: 'INTEGER' },
          instruction: { type: 'STRING' },
          duration: { type: 'INTEGER', nullable: true },
        },
        required: ['stepNumber', 'instruction'],
      },
    },
    tips: { type: 'STRING' },
    calories: { type: 'INTEGER', nullable: true },
  },
  required: ['steps', 'tips'],
};

export async function getRecipeSuggestions(ingredients: string[], exclude: string[] = []) {
  const excludeLine = exclude.length > 0
    ? `- NO repitas estas recetas (ya se mostraron): ${exclude.join(', ')}.`
    : '';
  const prompt = `Eres un chef profesional. El usuario tiene en su cocina: ${ingredients.join(', ')}.
Se asume que también tiene sal, pimienta, aceite y agua.

Propón exactamente 4 recetas: 2 de dificultad "fácil", 1 "medio" y 1 "difícil".

Reglas para que las recetas sean acertadas:
- Solo platos reales y reconocibles (que existan en recetarios), con nombre en español. Nada de combinaciones inventadas.
- Prioriza recetas que aprovechen la mayor cantidad posible de los ingredientes del usuario y que necesiten comprar lo mínimo.
- Cada receta debe usar al menos uno de los ingredientes del usuario como ingrediente principal.
${excludeLine}

Campos de cada receta:
- availableIngredients: ingredientes del usuario que la receta usa, copiados EXACTAMENTE como aparecen en su lista.
- missingIngredients: ingredientes importantes que la receta necesita y el usuario NO tiene (nombre simple, ej. "cebolla"). No incluyas sal, pimienta, aceite ni agua.
- estimatedTime: minutos totales realistas (preparación + cocción), número entero.
- servings: porciones, número entero.
- dietaryTags: solo si se cumplen estrictamente con TODOS los ingredientes de la receta: "vegetariano" (sin carne ni pescado), "vegano" (sin productos animales; incluir también "vegetariano"), "sin gluten" (sin trigo, cebada ni centeno), "sin lácteos" (sin leche, queso, nata ni mantequilla). Array vacío si no aplica.
- imageQuery: frase en español de 4 a 8 palabras que describa visualmente el plato terminado, ej. "arroz con pollo en sartén", "sopa de verduras en cuenco". Sin palabras genéricas como "delicioso", "plato", "receta" o "comida".

Devuelve un objeto JSON {"recipes": [...]}.`;

  return generateJson(prompt, RECIPES_SCHEMA);
}

export async function getRecipeDetail(
  recipeName: string,
  availableIngredients: string[],
  missingIngredients: string[],
  servings?: number
) {
  const prompt = `Eres un chef profesional. Escribe la receta de "${recipeName}"${servings ? ` para ${servings} porciones` : ''}.
Ingredientes que tiene el usuario y debe usar: ${availableIngredients.join(', ') || 'ninguno'}.
Ingredientes adicionales que comprará: ${missingIngredients.join(', ') || 'ninguno'}.
Se asume que tiene sal, pimienta, aceite y agua. No uses otros ingredientes importantes fuera de estas listas.

Responde completamente en español:
- steps: máximo 8 pasos claros y concretos, con cantidades aproximadas cuando se use un ingrediente por primera vez. duration en minutos (entero) o null.
- tips: un consejo práctico breve (1-2 frases).
- calories: kcal aproximadas por porción (entero) o null.

Devuelve un objeto JSON {"steps": [...], "tips": "...", "calories": ...}.`;

  return generateJson(prompt, DETAIL_SCHEMA);
}
