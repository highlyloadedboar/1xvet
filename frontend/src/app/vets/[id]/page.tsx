"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Header from "@/components/Header";
import { api, type ApiError, type VetProfileResponse } from "@/lib/api";

export default function VetProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const vetId = Number(params.id);

  const { user, loading: authLoading } = useAuth("OWNER");
  const [vet, setVet] = useState<VetProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [openingChat, setOpeningChat] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!Number.isFinite(vetId)) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    api
      .getVet(vetId)
      .then(setVet)
      .catch((err: ApiError) => {
        if (err.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [authLoading, vetId]);

  if (authLoading || !user) return null;

  async function openChat() {
    if (!vet || openingChat) return;
    setOpeningChat(true);
    try {
      const conversation = await api.createConversation(vet.userId);
      router.push(`/chat?id=${conversation.id}`);
    } catch {
      setOpeningChat(false);
    }
  }

  return (
    <>
      <Header user={user} />
      <main className="mx-auto w-full max-w-5xl px-6 py-8">
        <a
          href="/vets"
          className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
        >
          ← К списку врачей
        </a>

        {loading ? (
          <p className="mt-8 text-muted">Загрузка...</p>
        ) : notFound || !vet ? (
          <div className="mt-8 rounded-xl border border-dashed border-border p-12 text-center">
            <p className="font-serif text-lg">Ветеринар не найден</p>
            <p className="mt-2 text-sm text-muted">
              Возможно, профиль был удалён или ссылка неверна
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
            <section className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-8">
                <div className="flex items-start gap-5">
                  <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-accent/15 font-serif text-2xl font-semibold text-accent">
                    {vet.firstName[0]}
                    {vet.lastName[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="font-serif text-3xl font-bold">
                        {vet.firstName} {vet.lastName}
                      </h1>
                      {vet.available && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-700">
                          <span className="size-1.5 rounded-full bg-green-500" />
                          Онлайн
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-muted">
                      {vet.specialty} · {formatExperience(vet.experienceYears)}
                    </p>
                  </div>
                </div>
              </div>

              {vet.description && (
                <div className="rounded-2xl border border-border bg-card p-8">
                  <h2 className="font-serif text-xl font-semibold">О враче</h2>
                  <p className="mt-4 whitespace-pre-line text-sm leading-relaxed">
                    {vet.description}
                  </p>
                </div>
              )}

              {vet.education && (
                <div className="rounded-2xl border border-border bg-card p-8">
                  <h2 className="font-serif text-xl font-semibold">Образование</h2>
                  <p className="mt-4 whitespace-pre-line text-sm leading-relaxed">
                    {vet.education}
                  </p>
                </div>
              )}
            </section>

            <aside className="lg:sticky lg:top-6 lg:self-start">
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="font-serif text-lg font-semibold">
                  Запись на консультацию
                </h2>
                {vet.priceRub !== undefined && (
                  <p className="mt-2 text-2xl font-semibold">
                    {vet.priceRub.toLocaleString("ru-RU")} ₽
                  </p>
                )}
                <button
                  type="button"
                  onClick={openChat}
                  disabled={openingChat}
                  className="mt-5 w-full rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
                >
                  {openingChat ? "Открываем чат..." : "Написать в чат"}
                </button>
                <p className="mt-3 text-xs text-muted">
                  Запись на конкретные слоты появится после релиза модуля расписания
                </p>
              </div>
            </aside>
          </div>
        )}
      </main>
    </>
  );
}

function formatExperience(years: number): string {
  const mod10 = years % 10;
  const mod100 = years % 100;
  if (mod100 >= 11 && mod100 <= 14) return `опыт ${years} лет`;
  if (mod10 === 1) return `опыт ${years} год`;
  if (mod10 >= 2 && mod10 <= 4) return `опыт ${years} года`;
  return `опыт ${years} лет`;
}
