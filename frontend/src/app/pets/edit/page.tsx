"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Header from "@/components/Header";
import PetForm from "@/components/PetForm";
import { api, type PetResponse } from "@/lib/api";

function EditPetContent() {
  const { user, loading: authLoading } = useAuth("OWNER");
  const router = useRouter();
  const searchParams = useSearchParams();
  const petId = searchParams.get("id");
  const [pet, setPet] = useState<PetResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!petId || authLoading) return;
    api
      .request<PetResponse>(`/api/pets/${petId}`)
      .then(setPet)
      .catch(() => router.push("/dashboard"))
      .finally(() => setLoading(false));
  }, [petId, authLoading, router]);

  if (authLoading || loading || !user || !pet) return null;

  return (
    <>
      <Header user={user} />
      <main className="mx-auto w-full max-w-lg px-6 py-8">
        <a
          href="/dashboard"
          className="text-sm text-muted hover:text-foreground"
        >
          &larr; Назад
        </a>
        <h1 className="mt-4 font-serif text-3xl font-bold">
          Редактировать питомца
        </h1>

        <div className="mt-8">
          <PetForm
            pet={pet}
            submitLabel="Сохранить"
            onSubmit={async (data) => {
              await api.updatePet(pet.id, data);
              router.push("/dashboard");
            }}
          />
        </div>
      </main>
    </>
  );
}

export default function EditPetPage() {
  return (
    <Suspense>
      <EditPetContent />
    </Suspense>
  );
}
