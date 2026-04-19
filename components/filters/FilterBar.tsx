'use client';

import { useState, useRef } from 'react';
import { useClickOutside } from '@/lib/hooks/useClickOutside';
import { Clock, BarChart2, Leaf, ChevronDown } from 'lucide-react';
import { useStore } from '@/lib/store';

const TIME_OPTIONS = [
  { label: 'Cualquier tiempo', value: null },
  { label: '≤ 20 min', value: 20 },
  { label: '≤ 30 min', value: 30 },
  { label: '≤ 45 min', value: 45 },
  { label: '≤ 60 min', value: 60 },
];

const DIFFICULTY_OPTIONS = [
  { label: 'Cualquier dificultad', value: null },
  { label: 'Fácil', value: 'fácil' },
  { label: 'Medio', value: 'medio' },
  { label: 'Difícil', value: 'difícil' },
];

const DIET_OPTIONS = [
  { label: 'Cualquier dieta', value: null },
  { label: 'Vegetariano', value: 'vegetariano' },
  { label: 'Vegano', value: 'vegano' },
  { label: 'Sin gluten', value: 'sin gluten' },
  { label: 'Sin lácteos', value: 'sin lácteos' },
];

interface PillDropdownProps {
  icon: React.ReactNode;
  label: string;
  options: { label: string; value: string | number | null }[];
  value: string | number | null;
  onChange: (val: string | number | null) => void;
}

function PillDropdown({ icon, label, options, value, onChange }: PillDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = value !== null;
  const selectedLabel = options.find((o) => o.value === value)?.label ?? label;

  useClickOutside(ref, () => setOpen(false));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-[11px] md:text-xs font-semibold transition-colors ${
          active
            ? 'bg-primary text-on-primary border-primary shadow-[0_6px_12px_rgba(23,106,33,0.20)]'
            : 'bg-surface-container-lowest border-black/10 text-on-surface hover:bg-surface-container'
        }`}
      >
        <span className="opacity-80">{icon}</span>
        <span>{active ? selectedLabel : label}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul className="absolute z-30 top-full mt-2 left-0 min-w-40 bg-surface-container-lowest border border-black/10 rounded-2xl shadow-xl overflow-hidden">
          {options.map((opt) => (
            <li key={String(opt.value)}>
              <button
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  opt.value === value
                    ? 'bg-primary-container/75 text-on-primary-container font-semibold'
                    : 'hover:bg-surface-container text-on-surface'
                }`}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function FilterBar() {
  const { filters, setFilter } = useStore();

  return (
    <div className="flex flex-wrap gap-2.5">
      <PillDropdown
        icon={<Clock size={15} />}
        label="Tiempo"
        options={TIME_OPTIONS}
        value={filters.maxTime}
        onChange={(v) => setFilter('maxTime', v as number | null)}
      />
      <PillDropdown
        icon={<BarChart2 size={15} />}
        label="Dificultad"
        options={DIFFICULTY_OPTIONS}
        value={filters.difficulty}
        onChange={(v) => setFilter('difficulty', v as string | null)}
      />
      <PillDropdown
        icon={<Leaf size={15} />}
        label="Dieta"
        options={DIET_OPTIONS}
        value={filters.dietaryTag}
        onChange={(v) => setFilter('dietaryTag', v as string | null)}
      />
    </div>
  );
}
