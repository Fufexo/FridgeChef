function sanitizeJson(str: string): string {
  return str.replace(/,(\s*[}\]])/g, '$1');
}

function parseJson(raw: string, arrayOnly = false): unknown {
  const pattern = arrayOnly ? /\[[\s\S]*\]/ : /\{[\s\S]*\}/;
  const jsonStr = raw.match(pattern)?.[0] ?? raw;
  try {
    return JSON.parse(jsonStr);
  } catch {
    return JSON.parse(sanitizeJson(jsonStr));
  }
}

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

async function callGemini(prompt: string, maxTokens = 1200): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: maxTokens,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (res.status === 429) throw new Error('quota');

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

export async function getRecipeSuggestions(ingredients: string[], exclude: string[] = []) {
  const excludeLine = exclude.length > 0
    ? `NO incluir estas recetas (ya fueron mostradas): ${exclude.join(', ')}.`
    : '';
  const prompt = `Chef. Ingredientes: ${ingredients.join(', ')}.
${excludeLine}
Array JSON de exactamente 4 recetas: 2 con difficulty "fácil", 1 con difficulty "medio", 1 con difficulty "difícil". Ordenadas por matchPercentage desc dentro de cada grupo.
Schema por objeto: {name,matchPercentage,missingIngredients,availableIngredients,estimatedTime,difficulty,dietaryTags,servings,imageQuery}
IMPORTANTE: matchPercentage, estimatedTime y servings son números enteros, NO strings. difficulty: solo "fácil", "medio" o "difícil". No incluir ingredientes que el usuario no mencionó en availableIngredients.
dietaryTags: usar ÚNICAMENTE estos valores exactos cuando apliquen: "vegetariano" (sin carne ni pescado), "vegano" (sin ningún producto animal — si es vegano incluir TAMBIÉN "vegetariano"), "sin gluten" (sin trigo, cebada ni centeno), "sin lácteos" (sin leche, queso ni mantequilla). Array vacío si no aplica ninguno.
imageQuery: frase corta en español, muy visual y específica, de 4 a 8 palabras, que describa cómo debería verse el plato para buscar una imagen real. Debe incluir el plato principal y su presentación si ayuda, por ejemplo: "arroz con pollo en sartén", "tarta de tomate y cebolla", "sopa de verduras en cuenco". No usar palabras genéricas como 'delicioso', 'plato', 'receta' o 'comida'.`;

  const raw = await callGemini(prompt, 4096);
  return parseJson(raw, true);
}

export async function getRecipeDetail(recipeName: string, userIngredients: string[]) {
  const prompt = `Chef. Receta: "${recipeName}". Ingredientes del usuario: ${userIngredients.join(', ')}.
Responde completamente en español.
JSON: {steps:[{stepNumber,instruction,duration}],tips,calories}
duration en minutos o null. calories por porción o null. Máximo 8 pasos.`;

  const raw = await callGemini(prompt, 4096);
  return parseJson(raw);
}
