import { ChefHat } from 'lucide-react';
import type { RecipeDetail } from '@/types';

export default function RecipeSteps({ steps, tips }: Pick<RecipeDetail, 'steps' | 'tips'>) {
  return (
    <>
      <section className="max-w-4xl mx-auto mb-14">
        <h2 className="text-3xl font-extrabold mb-10 flex items-center gap-3">
          <span className="w-1.5 h-8 bg-primary rounded-full" />
          Pasos de preparación
        </h2>

        <ol className="space-y-10">
          {(steps ?? []).map((step, idx, arr) => (
            <li key={step.stepNumber} className="flex gap-5 relative">
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-bold z-10 shrink-0">
                {step.stepNumber}
              </div>

              {idx < arr.length - 1 && <div className="absolute left-5 top-10 h-[calc(100%+1.2rem)] w-px bg-surface-container" />}

              <div className="pt-1 flex-1">
                <div className="flex items-center justify-between mb-2 gap-4">
                  <h3 className="text-xl font-bold">Paso {step.stepNumber}</h3>
                  {!!step.duration && (
                    <span className="text-primary font-bold text-xs bg-primary-container/25 px-3 py-1 rounded-full whitespace-nowrap">
                      {step.duration} min
                    </span>
                  )}
                </div>
                <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">{step.instruction}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {tips && (
        <section className="max-w-4xl mx-auto">
          <div className="bg-primary-container/35 p-6 rounded-3xl border border-primary-container/70 flex gap-4 items-start">
            <div className="w-11 h-11 rounded-2xl bg-primary text-on-primary flex items-center justify-center shrink-0">
              <ChefHat size={18} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-on-primary-container mb-1">Tip del chef</h3>
              <p className="text-on-surface text-sm leading-relaxed">{tips}</p>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
