"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Header from "@/components/Header";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Stars from "@/components/ui/Stars";
import Tag from "@/components/ui/Tag";
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
      <main className="mx-auto w-full max-w-6xl px-7 py-10">
        <button
          type="button"
          onClick={() => router.push("/vets")}
          className="mb-7 inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-foreground"
        >
          <Icon name="back" size={14} />
          Назад к поиску
        </button>

        {loading ? (
          <p className="text-muted">Загрузка...</p>
        ) : notFound || !vet ? (
          <Card className="border-dashed p-12 text-center">
            <p className="font-serif text-lg">Ветеринар не найден</p>
            <p className="mt-2 text-sm text-muted">
              Возможно, профиль был удалён или ссылка неверна
            </p>
          </Card>
        ) : (
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_300px]">
            <section>
              <div className="mb-[30px] flex items-start gap-5 border-b border-border pb-[30px]">
                <Avatar
                  name={`${vet.firstName} ${vet.lastName}`}
                  size={78}
                  seed={vet.id}
                />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="font-serif text-[clamp(24px,3vw,34px)] font-bold tracking-[-0.6px]">
                      {vet.firstName} {vet.lastName}
                    </h1>
                    <Tag tone="accent">
                      <Icon name="shield" size={12} />
                      Проверен
                    </Tag>
                  </div>
                  <p className="mt-1 text-[14.5px] text-muted">
                    {vet.specialty} · {formatExperience(vet.experienceYears)}
                  </p>
                  <div className="mt-2.5 flex items-center gap-2.5">
                    <Stars value={5} size={15} />
                    {vet.available && (
                      <span className="inline-flex items-center gap-1.5 text-[12.5px] text-accent">
                        <span className="size-[7px] rounded-full bg-accent" />
                        Онлайн
                      </span>
                    )}
                  </div>
                  {vet.description && (
                    <p className="mt-3.5 max-w-[470px] text-sm leading-[1.7] text-muted">
                      {vet.description}
                    </p>
                  )}
                </div>
              </div>

              {vet.education && (
                <div className="mb-6">
                  <p className="mb-3 text-[11.5px] font-semibold uppercase tracking-[1.4px] text-light">
                    Образование
                  </p>
                  <p className="text-sm leading-[1.7] text-foreground">
                    {vet.education}
                  </p>
                </div>
              )}
            </section>

            <aside className="lg:sticky lg:top-[74px]">
              <BookingCard vet={vet} onOpenChat={openChat} openingChat={openingChat} />
            </aside>
          </div>
        )}
      </main>
    </>
  );
}

function BookingCard({
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

  const groupedByDay = new Map<string, SlotResponse[]>();
  for (const slot of slots) {
    const key = new Date(slot.startTime).toDateString();
    if (!groupedByDay.has(key)) groupedByDay.set(key, []);
    groupedByDay.get(key)!.push(slot);
  }
  const firstDay = Array.from(groupedByDay.entries())[0];

  return (
    <Card className="p-[22px]">
      <div className="mb-1 flex items-baseline gap-1.5">
        {vet.priceRub !== undefined && (
          <>
            <span className="font-serif text-[26px] font-bold">
              {vet.priceRub.toLocaleString("ru-RU")} ₽
            </span>
            <span className="text-[12.5px] text-light">/ консультация</span>
          </>
        )}
      </div>

      {slotsLoading ? (
        <p className="mt-4 text-sm text-muted">Загрузка слотов...</p>
      ) : !firstDay ? (
        <p className="mt-4 rounded-lg bg-background-alt px-3 py-2.5 text-sm text-muted">
          У врача пока нет свободных слотов
        </p>
      ) : (
        <>
          <p className="mb-2.5 mt-3.5 text-[13px] font-semibold text-muted">
            {formatDayLong(firstDay[1][0].startTime)} — выберите время
          </p>
          <div className="mb-[18px] grid grid-cols-2 gap-2">
            {firstDay[1].slice(0, 6).map((slot) => {
              const active = selectedSlot?.id === slot.id;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => {
                    setSelectedSlot(slot);
                    setError("");
                  }}
                  className={`rounded-[11px] border-[1.5px] py-2.5 text-sm transition-all ${
                    active
                      ? "border-accent bg-accent-bg font-semibold text-accent"
                      : "border-border bg-transparent text-muted hover:border-accent-border"
                  }`}
                >
                  {formatTime(slot.startTime)}
                </button>
              );
            })}
          </div>

          {selectedSlot && (
            <div className="mb-3 space-y-2.5">
              <div>
                <label className="mb-1 block text-xs font-medium text-light">
                  Питомец
                </label>
                <select
                  value={petId}
                  onChange={(e) => setPetId(e.target.value)}
                  className="block w-full rounded-[11px] border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
                >
                  <option value="">Без указания питомца</option>
                  {pets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-light">
                  Причина (необязательно)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  maxLength={1000}
                  placeholder="Что беспокоит?"
                  className="block w-full resize-none rounded-[11px] border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </div>
            </div>
          )}
          {error && <p className="mb-3 text-sm text-danger">{error}</p>}

          <Button
            disabled={!selectedSlot || submitting}
            onClick={handleBook}
            className="mb-2.5 w-full"
          >
            {submitting
              ? "Записываем..."
              : selectedSlot
                ? `Записаться на ${formatTime(selectedSlot.startTime)}`
                : "Выберите время"}
          </Button>
        </>
      )}

      <Button
        variant="soft"
        onClick={onOpenChat}
        disabled={openingChat}
        className="w-full"
      >
        <Icon name="chat" size={15} />
        {openingChat ? "Открываем чат..." : "Написать в чат"}
      </Button>
    </Card>
  );
}

function formatExperience(years: number): string {
  const mod10 = years % 10;
  const mod100 = years % 100;
  if (mod100 >= 11 && mod100 <= 14) return `${years} лет опыта`;
  if (mod10 === 1) return `${years} год опыта`;
  if (mod10 >= 2 && mod10 <= 4) return `${years} года опыта`;
  return `${years} лет опыта`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDayLong(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
  });
}
