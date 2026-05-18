"use client";

import { useAuth } from "@/lib/auth";
import Header from "@/components/Header";

export default function VetDashboard() {
  const { user, loading } = useAuth("VET");

  if (loading || !user) return null;

  return (
    <>
      <Header user={user} />
      <main className="mx-auto w-full max-w-5xl px-6 py-8">
        <h1 className="font-serif text-3xl font-bold">Кабинет ветеринара</h1>
        <p className="mt-2 text-muted">
          Здесь будут ваши консультации и расписание
        </p>

        <div className="mt-8 rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-muted">У вас пока нет запросов на консультацию</p>
        </div>
      </main>
    </>
  );
}
