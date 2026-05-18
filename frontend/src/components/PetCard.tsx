"use client";

import type { PetResponse } from "@/lib/api";
import { SPECIES_LABELS, SPECIES_EMOJI } from "@/lib/pets";

interface PetCardProps {
  pet: PetResponse;
  onDelete: (id: number) => void;
}

export default function PetCard({ pet, onDelete }: PetCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{SPECIES_EMOJI[pet.species]}</span>
          <div>
            <h3 className="font-serif text-lg font-semibold">{pet.name}</h3>
            <p className="text-sm text-muted">{SPECIES_LABELS[pet.species]}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <a
            href={`/pets/edit?id=${pet.id}`}
            className="rounded-lg border border-border px-3 py-1.5 text-xs transition-colors hover:bg-background"
          >
            Изменить
          </a>
          <button
            onClick={() => onDelete(pet.id)}
            className="rounded-lg border border-border px-3 py-1.5 text-xs text-red-600 transition-colors hover:bg-red-50"
          >
            Удалить
          </button>
        </div>
      </div>

      <div className="mt-3 flex gap-4 text-sm text-muted">
        {pet.breed && <span>{pet.breed}</span>}
        {pet.birthDate && <span>{pet.birthDate}</span>}
        {pet.weight && <span>{pet.weight} кг</span>}
      </div>
    </div>
  );
}
