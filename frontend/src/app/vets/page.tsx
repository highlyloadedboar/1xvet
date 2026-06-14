"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import Header from "@/components/Header";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import Icon from "@/components/ui/Icon";
import Pill from "@/components/ui/Pill";
import Stars from "@/components/ui/Stars";
import Toggle from "@/components/ui/Toggle";
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
      <main className="mx-auto w-full max-w-6xl px-7 py-10">
        <h1 className="mb-1.5 font-serif text-[clamp(26px,3.4vw,38px)] font-bold tracking-[-0.7px]">
          Найти врача
        </h1>
        <p className="mb-[30px] text-[15px] text-muted">
          Проверенные специалисты — выберите подходящего
        </p>

        <div className="mb-7 flex flex-wrap items-center gap-3 border-b border-border pb-[22px]">
          <div className="max-w-[320px] flex-1 basis-[240px]">
            <Field
              value={query}
              onChange={(e) =>
                setQuery((e.target as HTMLInputElement).value)
              }
              placeholder="Имя или специализация…"
              icon={<Icon name="search" size={16} />}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {SPECIALTIES.map((s) => (
              <Pill key={s} active={s === specialty} onClick={() => setSpecialty(s)}>
                {s}
              </Pill>
            ))}
          </div>
          <label className="ml-auto flex cursor-pointer items-center gap-2 whitespace-nowrap text-[13px] text-muted">
            <Toggle on={onlineOnly} onClick={() => setOnlineOnly((v) => !v)} />
            Только онлайн
          </label>
        </div>

        <div className="border-t border-border">
          {loading ? (
            <p className="py-12 text-center text-muted">Загрузка...</p>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="mb-1.5 font-serif text-xl">Никого не нашлось</p>
              <p className="text-sm text-light">Измените фильтры</p>
            </div>
          ) : (
            filtered.map((vet) => (
              <Link
                key={vet.id}
                href={`/vets/${vet.id}`}
                className="grid grid-cols-[1fr_auto] items-center gap-5 border-b border-border py-6 transition-colors hover:bg-background-alt/60"
              >
                <div className="flex items-center gap-[18px]">
                  <Avatar
                    name={`${vet.firstName} ${vet.lastName}`}
                    size={56}
                    seed={vet.id}
                  />
                  <div>
                    <div className="flex items-baseline flex-wrap gap-[11px]">
                      <span className="font-serif text-xl font-semibold">
                        {vet.firstName} {vet.lastName}
                      </span>
                      <span className="text-[13px] text-light">
                        {vet.specialty}
                      </span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-[14px]">
                      <span className="flex items-center gap-1.5">
                        <Stars value={5} size={12} />
                        <span className="text-[12.5px] text-muted">
                          {formatExperience(vet.experienceYears)}
                        </span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span
                          className={`size-1.5 rounded-full ${vet.available ? "bg-accent" : "bg-light"}`}
                        />
                        <span
                          className={`text-[12.5px] ${vet.available ? "text-accent" : "text-light"}`}
                        >
                          {vet.available ? "Онлайн" : "Офлайн"}
                        </span>
                      </span>
                    </div>
                    {vet.description && (
                      <p className="mt-2 line-clamp-2 max-w-2xl text-[13px] text-muted">
                        {vet.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2.5">
                  {vet.priceRub !== undefined && (
                    <div className="font-serif text-lg font-bold">
                      {vet.priceRub.toLocaleString("ru-RU")} ₽
                    </div>
                  )}
                  <Button size="sm" type="button">
                    Записаться
                  </Button>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
    </>
  );
}

function formatExperience(years: number): string {
  const mod10 = years % 10;
  const mod100 = years % 100;
  if (mod100 >= 11 && mod100 <= 14) return `${years} лет`;
  if (mod10 === 1) return `${years} год`;
  if (mod10 >= 2 && mod10 <= 4) return `${years} года`;
  return `${years} лет`;
}
