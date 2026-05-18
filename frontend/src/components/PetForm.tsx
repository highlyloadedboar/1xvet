"use client";

import { useState } from "react";
import type { PetSpecies, PetResponse } from "@/lib/api";
import { SPECIES_LABELS } from "@/lib/pets";

interface PetFormProps {
  pet?: PetResponse;
  onSubmit: (data: {
    name: string;
    species: PetSpecies;
    breed?: string;
    birthDate?: string;
    weight?: number;
  }) => Promise<void>;
  submitLabel: string;
}

const SPECIES_OPTIONS: PetSpecies[] = ["DOG", "CAT", "BIRD", "RODENT", "REPTILE", "OTHER"];

export default function PetForm({ pet, onSubmit, submitLabel }: PetFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const weight = form.get("weight") as string;
    const birthDate = form.get("birthDate") as string;

    try {
      await onSubmit({
        name: form.get("name") as string,
        species: form.get("species") as PetSpecies,
        breed: (form.get("breed") as string) || undefined,
        birthDate: birthDate || undefined,
        weight: weight ? parseFloat(weight) : undefined,
      });
    } catch {
      setError("Произошла ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Кличка
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={pet?.name}
          className="mt-1 block w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-accent"
        />
      </div>

      <div>
        <label htmlFor="species" className="block text-sm font-medium">
          Вид
        </label>
        <select
          id="species"
          name="species"
          required
          defaultValue={pet?.species ?? ""}
          className="mt-1 block w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-accent"
        >
          <option value="" disabled>
            Выберите вид
          </option>
          {SPECIES_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {SPECIES_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="breed" className="block text-sm font-medium">
          Порода
        </label>
        <input
          id="breed"
          name="breed"
          type="text"
          defaultValue={pet?.breed ?? ""}
          className="mt-1 block w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label htmlFor="birthDate" className="block text-sm font-medium">
            Дата рождения
          </label>
          <input
            id="birthDate"
            name="birthDate"
            type="date"
            defaultValue={pet?.birthDate ?? ""}
            className="mt-1 block w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-accent"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="weight" className="block text-sm font-medium">
            Вес (кг)
          </label>
          <input
            id="weight"
            name="weight"
            type="number"
            step="0.1"
            min="0"
            defaultValue={pet?.weight ?? ""}
            className="mt-1 block w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-accent"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-accent py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
      >
        {loading ? "Сохранение..." : submitLabel}
      </button>
    </form>
  );
}
