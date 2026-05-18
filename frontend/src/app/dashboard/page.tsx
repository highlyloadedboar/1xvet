"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import Header from "@/components/Header";
import PetCard from "@/components/PetCard";
import { api, type PetResponse } from "@/lib/api";

export default function OwnerDashboard() {
  const { user, loading: authLoading } = useAuth("OWNER");
  const [pets, setPets] = useState<PetResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    api
      .getMyPets()
      .then(setPets)
      .finally(() => setLoading(false));
  }, [authLoading]);

  if (authLoading || !user) return null;

  async function handleDelete(petId: number) {
    await api.deletePet(petId);
    setPets((prev) => prev.filter((p) => p.id !== petId));
  }

  return (
    <>
      <Header user={user} />
      <main className="mx-auto w-full max-w-5xl px-6 py-8">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-3xl font-bold">Мои питомцы</h1>
          <a
            href="/pets/new"
            className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Добавить питомца
          </a>
        </div>

        {loading ? (
          <p className="mt-8 text-muted">Загрузка...</p>
        ) : pets.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-border p-12 text-center">
            <p className="text-muted">У вас пока нет питомцев</p>
            <a
              href="/pets/new"
              className="mt-4 inline-block rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Добавить питомца
            </a>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {pets.map((pet) => (
              <PetCard key={pet.id} pet={pet} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
