'use client';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center bg-surface-container-low rounded-3xl border border-black/5">
      <div className="text-6xl mb-3">🧑‍🍳</div>
      <h3 className="text-xl font-semibold text-on-surface mb-2">
        Tus recetas te esperan
      </h3>
      <p className="text-on-surface-variant text-sm max-w-sm">
        Agrega uno o más ingredientes y FridgeChef generará recetas personalizadas en segundos.
      </p>
    </div>
  );
}
