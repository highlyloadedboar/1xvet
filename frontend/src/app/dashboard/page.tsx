"use client";

import { useAuth } from "@/lib/auth";
import Header from "@/components/Header";

export default function OwnerDashboard() {
  const { user, loading } = useAuth("OWNER");

  if (loading || !user) return null;

  return (
    <>
      <Header user={user} />
      <main className="mx-auto w-full max-w-5xl px-6 py-8">
        <h1 className="font-serif text-3xl font-bold">Мои питомцы</h1>
        <p className="mt-2 text-muted">
          Здесь будут ваши питомцы и консультации
        </p>

        <div className="mt-8 rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-muted">У вас пока нет питомцев</p>
          <button className="mt-4 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover">
            Добавить питомца
          </button>
        </div>
      </main>
    </>
  );
}
