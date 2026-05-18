"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Header from "@/components/Header";
import PetForm from "@/components/PetForm";
import { api } from "@/lib/api";

export default function NewPetPage() {
  const { user, loading } = useAuth("OWNER");
  const router = useRouter();

  if (loading || !user) return null;

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
          Добавить питомца
        </h1>

        <div className="mt-8">
          <PetForm
            submitLabel="Добавить"
            onSubmit={async (data) => {
              await api.createPet(data);
              router.push("/dashboard");
            }}
          />
        </div>
      </main>
    </>
  );
}
