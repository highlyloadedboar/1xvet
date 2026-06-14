"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import Header from "@/components/Header";
import { api, type ApiError, type SlotResponse } from "@/lib/api";

export default function VetDashboard() {
  const { user, loading: authLoading } = useAuth("VET");
  const [slots, setSlots] = useState<SlotResponse[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    api
      .getMyVetSlots()
      .then(setSlots)
      .finally(() => setSlotsLoading(false));
  }, [authLoading]);

  if (authLoading || !user) return null;

  return (
    <>
      <Header user={user} />
      <main className="mx-auto w-full max-w-5xl px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-serif text-3xl font-bold">Кабинет ветеринара</h1>
          <div className="flex items-center gap-3">
            <a
              href="/appointments"
              className="rounded-full border border-border bg-card px-6 py-2.5 text-sm font-medium transition-colors hover:border-accent/40"
            >
              Мои записи
            </a>
            <a
              href="/chat"
              className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Сообщения
            </a>
          </div>
        </div>

        <section className="mt-10">
          <h2 className="font-serif text-2xl font-bold">Расписание</h2>
          <p className="mt-1 text-sm text-muted">
            Добавляйте слоты, на которые владельцы смогут записаться.
            Длительность консультации — 30 минут.
          </p>

          <AddSlotForm
            onCreated={(slot) =>
              setSlots((prev) => [...prev, slot].sort(byStartTime))
            }
          />

          <div className="mt-8">
            {slotsLoading ? (
              <p className="text-sm text-muted">Загрузка...</p>
            ) : slots.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-12 text-center">
                <p className="text-muted">
                  Слотов пока нет. Добавьте первый — и владельцы смогут
                  записаться.
                </p>
              </div>
            ) : (
              <SlotsList
                slots={slots}
                onDeleted={(id) =>
                  setSlots((prev) => prev.filter((s) => s.id !== id))
                }
              />
            )}
          </div>
        </section>
      </main>
    </>
  );
}

function AddSlotForm({
  onCreated,
}: {
  onCreated: (slot: SlotResponse) => void;
}) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !time || submitting) return;
    setSubmitting(true);
    setError("");
    const startTime = new Date(`${date}T${time}:00`).toISOString();
    try {
      const slot = await api.createVetSlot(startTime);
      onCreated(slot);
      setTime("");
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.status === 409) {
        setError("Слот на это время уже существует");
      } else if (apiErr.status === 400) {
        setError("Время должно быть в будущем");
      } else if (apiErr.status === 404) {
        setError("Сначала заполните профиль ветеринара");
      } else {
        setError(apiErr.message || "Не удалось создать слот");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-xl border border-border bg-card p-5"
    >
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="slot-date" className="block text-xs font-medium text-muted">
            Дата
          </label>
          <input
            id="slot-date"
            type="date"
            min={todayIso}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="mt-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <div>
          <label htmlFor="slot-time" className="block text-xs font-medium text-muted">
            Время
          </label>
          <input
            id="slot-time"
            type="time"
            step={1800}
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            className="mt-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <button
          type="submit"
          disabled={!date || !time || submitting}
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {submitting ? "Добавляем..." : "Добавить слот"}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </form>
  );
}

function SlotsList({
  slots,
  onDeleted,
}: {
  slots: SlotResponse[];
  onDeleted: (id: number) => void;
}) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function handleDelete(slot: SlotResponse) {
    if (slot.booked) return;
    setDeletingId(slot.id);
    setError("");
    try {
      await api.deleteVetSlot(slot.id);
      onDeleted(slot.id);
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.status === 409) {
        setError("Слот уже забронирован — удалить нельзя");
      } else {
        setError(apiErr.message || "Не удалось удалить слот");
      }
    } finally {
      setDeletingId(null);
    }
  }

  const grouped = new Map<string, SlotResponse[]>();
  for (const slot of slots) {
    const key = new Date(slot.startTime).toDateString();
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(slot);
  }

  return (
    <div className="space-y-5">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {Array.from(grouped.entries()).map(([day, daySlots]) => (
        <div key={day}>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
            {formatDay(daySlots[0].startTime)}
          </p>
          <ul className="flex flex-wrap gap-2">
            {daySlots.map((slot) => (
              <li key={slot.id}>
                <SlotChip
                  slot={slot}
                  deleting={deletingId === slot.id}
                  onDelete={() => handleDelete(slot)}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function SlotChip({
  slot,
  deleting,
  onDelete,
}: {
  slot: SlotResponse;
  deleting: boolean;
  onDelete: () => void;
}) {
  if (slot.booked) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm">
        <span>{formatTime(slot.startTime)}</span>
        <span className="text-xs text-muted">Занято</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm">
      <span>{formatTime(slot.startTime)}</span>
      <button
        type="button"
        onClick={onDelete}
        disabled={deleting}
        aria-label="Удалить слот"
        className="rounded-full text-muted transition-colors hover:text-red-600 disabled:opacity-50"
      >
        ×
      </button>
    </span>
  );
}

function byStartTime(a: SlotResponse, b: SlotResponse): number {
  return a.startTime.localeCompare(b.startTime);
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}
