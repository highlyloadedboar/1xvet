"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Header from "@/components/Header";
import {
  api,
  type ApiError,
  type PetResponse,
  type SlotResponse,
  type VetProfileResponse,
} from "@/lib/api";

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
          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
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

            <aside className="lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
              <BookingPanel
                vet={vet}
                onOpenChat={openChat}
                openingChat={openingChat}
              />
            </aside>
          </div>
        )}
      </main>
    </>
  );
}

function BookingPanel({
  vet,
  onOpenChat,
  openingChat,
}: {
  vet: VetProfileResponse;
  onOpenChat: () => void;
  openingChat: boolean;
}) {
  const router = useRouter();
  const [slots, setSlots] = useState<SlotResponse[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [pets, setPets] = useState<PetResponse[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SlotResponse | null>(null);
  const [petId, setPetId] = useState<string>("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .listVetSlots(vet.id)
      .then(setSlots)
      .finally(() => setSlotsLoading(false));
    api.getMyPets().then(setPets);
  }, [vet.id]);

  async function handleBook() {
    if (!selectedSlot || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const appointment = await api.createAppointment({
        slotId: selectedSlot.id,
        petId: petId ? Number(petId) : undefined,
        reason: reason.trim() || undefined,
      });
      router.push(`/appointments?highlight=${appointment.id}`);
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.status === 409) {
        setError("Этот слот уже занят. Выберите другой.");
        setSlots((prev) => prev.filter((s) => s.id !== selectedSlot.id));
        setSelectedSlot(null);
      } else {
        setError(apiErr.message || "Не удалось записаться");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-serif text-lg font-semibold">
        Запись на консультацию
      </h2>
      {vet.priceRub !== undefined && (
        <p className="mt-2 text-2xl font-semibold">
          {vet.priceRub.toLocaleString("ru-RU")} ₽
        </p>
      )}

      <div className="mt-5">
        {slotsLoading ? (
          <p className="text-sm text-muted">Загрузка слотов...</p>
        ) : slots.length === 0 ? (
          <p className="rounded-lg bg-background px-3 py-2 text-sm text-muted">
            У врача пока нет свободных слотов
          </p>
        ) : (
          <SlotList
            slots={slots}
            selectedId={selectedSlot?.id ?? null}
            onSelect={(s) => {
              setSelectedSlot(s);
              setError("");
            }}
          />
        )}
      </div>

      {selectedSlot && (
        <div className="mt-5 space-y-3 border-t border-border pt-5">
          <div>
            <label className="block text-sm font-medium">Питомец</label>
            <select
              value={petId}
              onChange={(e) => setPetId(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            >
              <option value="">Без указания питомца</option>
              {pets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {pets.length === 0 && (
              <p className="mt-1 text-xs text-muted">
                У вас пока нет питомцев — можно добавить позже
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">
              Причина обращения{" "}
              <span className="text-muted">(необязательно)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Что беспокоит?"
              className="mt-1 block w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="button"
            onClick={handleBook}
            disabled={submitting}
            className="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {submitting
              ? "Записываем..."
              : `Записаться на ${formatTime(selectedSlot.startTime)}`}
          </button>
        </div>
      )}

      <div className="mt-5 border-t border-border pt-5">
        <button
          type="button"
          onClick={onOpenChat}
          disabled={openingChat}
          className="w-full rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:border-accent/40 disabled:opacity-50"
        >
          {openingChat ? "Открываем чат..." : "Написать в чат"}
        </button>
      </div>
    </div>
  );
}

function SlotList({
  slots,
  selectedId,
  onSelect,
}: {
  slots: SlotResponse[];
  selectedId: number | null;
  onSelect: (s: SlotResponse) => void;
}) {
  const grouped = new Map<string, SlotResponse[]>();
  for (const slot of slots) {
    const key = new Date(slot.startTime).toDateString();
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(slot);
  }

  return (
    <div className="space-y-4">
      {Array.from(grouped.entries()).map(([day, daySlots]) => (
        <div key={day}>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
            {formatDay(daySlots[0].startTime)}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {daySlots.map((slot) => {
              const active = slot.id === selectedId;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => onSelect(slot)}
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    active
                      ? "border-accent bg-accent text-white"
                      : "border-border bg-background hover:border-accent/40"
                  }`}
                >
                  {formatTime(slot.startTime)}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
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

function formatExperience(years: number): string {
  const mod10 = years % 10;
  const mod100 = years % 100;
  if (mod100 >= 11 && mod100 <= 14) return `опыт ${years} лет`;
  if (mod10 === 1) return `опыт ${years} год`;
  if (mod10 >= 2 && mod10 <= 4) return `опыт ${years} года`;
  return `опыт ${years} лет`;
}
