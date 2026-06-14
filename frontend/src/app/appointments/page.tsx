"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Header from "@/components/Header";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Tag from "@/components/ui/Tag";
import {
  api,
  type AppointmentResponse,
  type UserInfo,
} from "@/lib/api";

export default function AppointmentsPage() {
  return (
    <Suspense fallback={null}>
      <AppointmentsPageInner />
    </Suspense>
  );
}

function AppointmentsPageInner() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const highlightId = Number(searchParams.get("highlight")) || null;

  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    if (authLoading) return;
    api
      .listMyAppointments()
      .then(setAppointments)
      .finally(() => setLoading(false));
  }, [authLoading]);

  if (authLoading || !user) return null;

  async function handleCancel(id: number) {
    if (!confirm("Отменить запись?")) return;
    setCancellingId(id);
    try {
      const updated = await api.cancelAppointment(id);
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <>
      <Header user={user} />
      <main className="mx-auto w-full max-w-5xl px-7 py-10">
        <h1 className="mb-1.5 font-serif text-[clamp(26px,3.4vw,38px)] font-bold tracking-[-0.7px]">
          Мои записи
        </h1>
        <p className="mb-8 text-[15px] text-muted">
          Предстоящие и прошедшие консультации
        </p>

        <div>
          {loading ? (
            <p className="text-muted">Загрузка...</p>
          ) : appointments.length === 0 ? (
            <Card className="border-dashed p-12 text-center">
              <p className="mb-4 font-serif text-lg">Записей пока нет</p>
              {user.role === "OWNER" && (
                <Link href="/vets" className="inline-block">
                  <Button>Найти врача</Button>
                </Link>
              )}
            </Card>
          ) : (
            <ul className="space-y-3">
              {appointments.map((a) => (
                <AppointmentCard
                  key={a.id}
                  appointment={a}
                  me={user}
                  highlight={a.id === highlightId}
                  cancelling={cancellingId === a.id}
                  onCancel={() => handleCancel(a.id)}
                />
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}

function AppointmentCard({
  appointment,
  me,
  highlight,
  cancelling,
  onCancel,
}: {
  appointment: AppointmentResponse;
  me: UserInfo;
  highlight: boolean;
  cancelling: boolean;
  onCancel: () => void;
}) {
  const other = otherParty(appointment, me);
  const cancelled = appointment.status === "CANCELLED";
  return (
    <li>
      <Card className={`p-6 ${highlight ? "border-accent" : ""}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar
              name={`${other.firstName} ${other.lastName}`}
              size={48}
              seed={appointment.vetProfileId + appointment.ownerId}
            />
            <div>
              <p className="font-serif text-base font-semibold">
                {other.firstName} {other.lastName}
                <span className="ml-2 text-sm font-normal text-light">
                  · {other.roleLabel}
                </span>
              </p>
              <p className="text-[13px] text-muted">
                {formatDateTime(appointment.slotStartTime)}
              </p>
              {appointment.petName && (
                <p className="mt-1 text-[13px]">
                  Питомец: <b>{appointment.petName}</b>
                </p>
              )}
              {appointment.reason && (
                <p className="mt-2 max-w-xl text-[13px] italic text-muted">
                  «{appointment.reason}»
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <Tag tone={cancelled ? "neutral" : "accent"}>
              {cancelled ? "Отменено" : "Подтверждено"}
            </Tag>
            {!cancelled && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onCancel}
                disabled={cancelling}
              >
                {cancelling ? "Отмена..." : "Отменить"}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </li>
  );
}

function otherParty(
  a: AppointmentResponse,
  me: UserInfo,
): { firstName: string; lastName: string; roleLabel: string } {
  if (me.role === "OWNER") {
    return {
      firstName: a.vetFirstName,
      lastName: a.vetLastName,
      roleLabel: "Ветеринар",
    };
  }
  return {
    firstName: a.ownerFirstName,
    lastName: a.ownerLastName,
    roleLabel: "Владелец",
  };
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("ru-RU", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}
