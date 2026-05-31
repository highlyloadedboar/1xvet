"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Header from "@/components/Header";
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
      <main className="mx-auto w-full max-w-4xl px-6 py-8">
        <h1 className="font-serif text-3xl font-bold">Мои записи</h1>

        <div className="mt-8">
          {loading ? (
            <p className="text-muted">Загрузка...</p>
          ) : appointments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <p className="font-serif text-lg">Записей пока нет</p>
              {user.role === "OWNER" && (
                <a
                  href="/vets"
                  className="mt-4 inline-block rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
                >
                  Найти врача
                </a>
              )}
            </div>
          ) : (
            <ul className="space-y-4">
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
    <li
      className={`rounded-xl border bg-card p-6 transition-colors ${
        highlight ? "border-accent" : "border-border"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent/15 font-serif text-sm font-semibold text-accent">
            {other.firstName[0]}
            {other.lastName[0]}
          </div>
          <div>
            <p className="font-semibold">
              {other.firstName} {other.lastName}{" "}
              <span className="text-sm font-normal text-muted">
                · {other.roleLabel}
              </span>
            </p>
            <p className="text-sm text-muted">
              {formatDateTime(appointment.slotStartTime)}
            </p>
            {appointment.petName && (
              <p className="mt-1 text-sm">Питомец: {appointment.petName}</p>
            )}
            {appointment.reason && (
              <p className="mt-2 max-w-xl text-sm text-muted">
                «{appointment.reason}»
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <StatusBadge status={appointment.status} />
          {!cancelled && (
            <button
              type="button"
              onClick={onCancel}
              disabled={cancelling}
              className="rounded-full border border-border px-4 py-1.5 text-sm transition-colors hover:border-red-500/40 hover:text-red-600 disabled:opacity-50"
            >
              {cancelling ? "Отмена..." : "Отменить"}
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

function StatusBadge({ status }: { status: AppointmentResponse["status"] }) {
  if (status === "BOOKED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-700">
        <span className="size-1.5 rounded-full bg-green-500" />
        Подтверждено
      </span>
    );
  }
  return (
    <span className="rounded-full bg-muted/15 px-2.5 py-1 text-xs font-medium text-muted">
      Отменено
    </span>
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
