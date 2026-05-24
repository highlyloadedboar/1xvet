"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import Header from "@/components/Header";
import { api, type VetProfileResponse } from "@/lib/api";

const SPECIALTIES = [
  "Все",
  "Терапевт",
  "Дерматолог",
  "Офтальмолог",
  "Педиатр",
  "Онколог",
];

export default function VetSearchPage() {
  const { user, loading: authLoading } = useAuth("OWNER");
  const [vets, setVets] = useState<VetProfileResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [specialty, setSpecialty] = useState<string>("Все");
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (authLoading) return;
    setLoading(true);
    api
      .searchVets({
        specialty: specialty === "Все" ? undefined : specialty,
        available: onlineOnly ? true : undefined,
      })
      .then(setVets)
      .finally(() => setLoading(false));
  }, [authLoading, specialty, onlineOnly]);

  if (authLoading || !user) return null;

  const filtered = query.trim()
    ? vets.filter((v) => {
        const q = query.toLowerCase();
        return (
          `${v.firstName} ${v.lastName}`.toLowerCase().includes(q) ||
          v.specialty.toLowerCase().includes(q)
        );
      })
    : vets;

  return (
    <>
      <Header user={user} />
      <main className="mx-auto w-full max-w-5xl px-6 py-8">
        <h1 className="font-serif text-3xl font-bold">Найти ветеринара</h1>

        <div className="mt-8 space-y-5">
          <div>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по имени или специализации"
              className="w-full rounded-full border border-border bg-card px-5 py-3 text-sm outline-none focus:border-accent"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {SPECIALTIES.map((s) => {
              const active = s === specialty;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpecialty(s)}
                  className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                    active
                      ? "border-accent bg-accent text-white"
                      : "border-border bg-card hover:border-accent/40"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={onlineOnly}
              onChange={(e) => setOnlineOnly(e.target.checked)}
              className="accent-accent"
            />
            Только онлайн
          </label>
        </div>

        <div className="mt-8">
          {loading ? (
            <p className="text-muted">Загрузка...</p>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <p className="font-serif text-lg">Никого не нашлось</p>
              <p className="mt-2 text-sm text-muted">
                Попробуйте изменить фильтры
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {filtered.map((vet) => (
                <li
                  key={vet.id}
                  className="rounded-xl border border-border bg-card p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex size-14 items-center justify-center rounded-full bg-accent/15 font-serif text-lg font-semibold text-accent">
                        {vet.firstName[0]}
                        {vet.lastName[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">
                            {vet.firstName} {vet.lastName}
                          </p>
                          {vet.available && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-700">
                              <span className="size-1.5 rounded-full bg-green-500" />
                              Онлайн
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted">
                          {vet.specialty} · {formatExperience(vet.experienceYears)}
                        </p>
                        {vet.description && (
                          <p className="mt-2 max-w-xl text-sm text-muted">
                            {vet.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {vet.priceRub !== undefined && (
                        <p className="text-sm font-medium">
                          {vet.priceRub.toLocaleString("ru-RU")} ₽
                        </p>
                      )}
                      <a
                        href={`/vets/${vet.id}`}
                        className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
                      >
                        Записаться
                      </a>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
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
