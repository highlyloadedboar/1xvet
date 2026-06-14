"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import Header from "@/components/Header";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import Tag from "@/components/ui/Tag";
import {
  api,
  type AppointmentResponse,
  type PetResponse,
} from "@/lib/api";

export default function OwnerDashboard() {
  const { user, loading: authLoading } = useAuth("OWNER");
  const [pets, setPets] = useState<PetResponse[]>([]);
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    Promise.all([api.getMyPets(), api.listMyAppointments()])
      .then(([p, a]) => {
        setPets(p);
        setAppointments(a);
      })
      .finally(() => setLoading(false));
  }, [authLoading]);

  if (authLoading || !user) return null;

  const upcoming = appointments
    .filter((a) => a.status === "BOOKED" && new Date(a.slotStartTime) > new Date())
    .sort((a, b) => a.slotStartTime.localeCompare(b.slotStartTime));
  const recent = appointments
    .filter((a) => a.status !== "BOOKED" || new Date(a.slotStartTime) <= new Date())
    .sort((a, b) => b.slotStartTime.localeCompare(a.slotStartTime))
    .slice(0, 3);
  const visible = [...upcoming, ...recent];

  return (
    <>
      <Header user={user} />
      <main className="mx-auto w-full max-w-6xl px-7 py-10">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="mb-1.5 text-[13px] text-light">{formatToday()}</p>
            <h1 className="font-serif text-[clamp(28px,3.6vw,40px)] font-bold leading-tight tracking-[-0.8px]">
              Добрый день, <span className="text-accent">{user.firstName}</span>
            </h1>
          </div>
          <Link href="/vets">
            <Button>
              <Icon name="search" size={16} />
              Найти врача
            </Button>
          </Link>
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <section>
            <SectionLabel>Консультации</SectionLabel>
            <div className="border-t border-border">
              {loading ? (
                <p className="py-6 text-sm text-muted">Загрузка...</p>
              ) : visible.length === 0 ? (
                <p className="py-6 text-sm text-muted">
                  У вас пока нет консультаций. Найдите врача и запишитесь на удобное время.
                </p>
              ) : (
                visible.map((a) => (
                  <Link
                    key={a.id}
                    href="/appointments"
                    className="flex cursor-pointer items-center gap-[14px] border-b border-border py-[18px] transition-colors hover:bg-background-alt"
                  >
                    <Avatar
                      name={`${a.vetFirstName} ${a.vetLastName}`}
                      size={44}
                      seed={a.vetProfileId}
                    />
                    <div className="flex-1">
                      <div className="font-serif text-base font-semibold">
                        {a.vetFirstName} {a.vetLastName}
                      </div>
                      <div className="mt-0.5 text-[13px] text-muted">
                        {a.petName ? `Питомец: ${a.petName}` : "Общая консультация"}
                      </div>
                      <div className="mt-0.5 text-xs text-light">
                        {formatDateTime(a.slotStartTime)}
                      </div>
                    </div>
                    <Tag tone={isUpcoming(a) ? "accent" : "neutral"}>
                      {a.status === "CANCELLED"
                        ? "Отменено"
                        : isUpcoming(a)
                          ? "Предстоит"
                          : "Завершено"}
                    </Tag>
                  </Link>
                ))
              )}
            </div>
          </section>

          <section>
            <SectionLabel
              action={
                <Link
                  href="/pets/new"
                  className="inline-flex items-center gap-1 rounded-[11px] border border-accent-border bg-accent-bg px-[11px] py-[5px] text-[12.5px] font-semibold text-accent transition-colors hover:bg-accent-bg/70"
                >
                  <Icon name="plus" size={13} />
                  Добавить
                </Link>
              }
            >
              Мои питомцы
            </SectionLabel>
            <div className="border-t border-border">
              {loading ? (
                <p className="py-6 text-sm text-muted">Загрузка...</p>
              ) : pets.length === 0 ? (
                <p className="py-6 text-sm text-muted">
                  У вас пока нет питомцев. Добавьте — и врач будет видеть данные при консультации.
                </p>
              ) : (
                pets.map((pet) => (
                  <Link
                    key={pet.id}
                    href={`/pets/edit?id=${pet.id}`}
                    className="flex cursor-pointer items-center gap-[13px] border-b border-border py-[15px] transition-colors hover:bg-background-alt"
                  >
                    <div className="flex size-[42px] shrink-0 items-center justify-center rounded-[13px] bg-accent-bg text-accent">
                      <Icon name="paw" size={20} fill />
                    </div>
                    <div className="flex-1">
                      <div className="font-serif text-[15px] font-semibold">
                        {pet.name}
                      </div>
                      <div className="text-[12.5px] text-muted">
                        {speciesLabel(pet.species)}
                        {pet.breed ? ` · ${pet.breed}` : ""}
                      </div>
                    </div>
                    <Icon name="arrow" size={15} className="text-light" />
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function SectionLabel({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <p className="text-[11.5px] font-semibold uppercase tracking-[1.4px] text-light">
        {children}
      </p>
      {action}
    </div>
  );
}

function isUpcoming(a: AppointmentResponse): boolean {
  return a.status === "BOOKED" && new Date(a.slotStartTime) > new Date();
}

function formatToday(): string {
  return new Date().toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function speciesLabel(s: PetResponse["species"]): string {
  return {
    DOG: "Собака",
    CAT: "Кошка",
    BIRD: "Птица",
    RODENT: "Грызун",
    REPTILE: "Рептилия",
    OTHER: "Другое",
  }[s];
}
