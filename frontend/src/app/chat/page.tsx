"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Header from "@/components/Header";
import {
  api,
  type ConversationResponse,
  type MessageResponse,
  type UserInfo,
} from "@/lib/api";

const POLL_INTERVAL_MS = 3000;

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatPageInner />
    </Suspense>
  );
}

function ChatPageInner() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [convLoading, setConvLoading] = useState(true);
  const [activeId, setActiveId] = useState<number | null>(null);

  useEffect(() => {
    if (authLoading) return;
    api
      .listConversations()
      .then(setConversations)
      .finally(() => setConvLoading(false));
  }, [authLoading]);

  useEffect(() => {
    const urlId = Number(searchParams.get("id"));
    if (Number.isFinite(urlId) && urlId > 0) {
      setActiveId(urlId);
      return;
    }
    if (activeId == null && conversations.length > 0) {
      setActiveId(conversations[0].id);
    }
  }, [searchParams, conversations, activeId]);

  const handleSelect = useCallback(
    (id: number) => {
      setActiveId(id);
      router.replace(`/chat?id=${id}`);
    },
    [router],
  );

  if (authLoading || !user) return null;

  const active = conversations.find((c) => c.id === activeId) ?? null;

  return (
    <>
      <Header user={user} />
      <main className="mx-auto w-full max-w-6xl px-6 py-6">
        <div className="grid h-[calc(100vh-9rem)] gap-4 overflow-hidden rounded-2xl border border-border bg-card lg:grid-cols-[300px_1fr]">
          <aside className="overflow-y-auto border-b border-border lg:border-b-0 lg:border-r">
            <div className="border-b border-border px-4 py-4">
              <h2 className="font-serif text-lg font-semibold">Беседы</h2>
            </div>
            {convLoading ? (
              <p className="px-4 py-6 text-sm text-muted">Загрузка...</p>
            ) : conversations.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted">
                У вас пока нет бесед. Начните с профиля врача.
              </p>
            ) : (
              <ul>
                {conversations.map((c) => (
                  <ConversationRow
                    key={c.id}
                    conversation={c}
                    me={user}
                    active={c.id === activeId}
                    onSelect={() => handleSelect(c.id)}
                  />
                ))}
              </ul>
            )}
          </aside>

          <section className="flex min-h-0 flex-col">
            {active ? (
              <ConversationView
                conversation={active}
                me={user}
                onMessageSent={() => {
                  api.listConversations().then(setConversations);
                }}
              />
            ) : (
              <div className="flex flex-1 items-center justify-center px-6 text-center text-muted">
                Выберите беседу слева
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

function ConversationRow({
  conversation,
  me,
  active,
  onSelect,
}: {
  conversation: ConversationResponse;
  me: UserInfo;
  active: boolean;
  onSelect: () => void;
}) {
  const other = otherParty(conversation, me);
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={`flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition-colors ${
          active ? "bg-accent/10" : "hover:bg-background"
        }`}
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/15 font-serif text-sm font-semibold text-accent">
          {other.firstName[0]}
          {other.lastName[0]}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {other.firstName} {other.lastName}
          </p>
          <p className="truncate text-xs text-muted">
            {formatRelativeTime(conversation.updatedAt)}
          </p>
        </div>
      </button>
    </li>
  );
}

function ConversationView({
  conversation,
  me,
  onMessageSent,
}: {
  conversation: ConversationResponse;
  me: UserInfo;
  onMessageSent: () => void;
}) {
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    let cancelled = false;

    const fetchOnce = () =>
      api.listMessages(conversation.id).then((m) => {
        if (!cancelled) setMessages(m);
      });

    fetchOnce().finally(() => {
      if (!cancelled) setLoading(false);
    });
    const interval = setInterval(fetchOnce, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [conversation.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;
    setSending(true);
    try {
      const msg = await api.sendMessage(conversation.id, content);
      setMessages((prev) => [...prev, msg]);
      setDraft("");
      onMessageSent();
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  }

  const other = otherParty(conversation, me);

  return (
    <>
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <div className="flex size-10 items-center justify-center rounded-full bg-accent/15 font-serif text-sm font-semibold text-accent">
          {other.firstName[0]}
          {other.lastName[0]}
        </div>
        <div>
          <p className="font-semibold">
            {other.firstName} {other.lastName}
          </p>
          <p className="text-xs text-muted">{other.roleLabel}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {loading ? (
          <p className="text-sm text-muted">Загрузка сообщений...</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted">
            Сообщений пока нет — напишите первое
          </p>
        ) : (
          <ul className="space-y-3">
            {messages.map((m) => {
              const mine = m.senderId === me.id;
              return (
                <li
                  key={m.id}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                      mine
                        ? "rounded-br-md bg-accent text-white"
                        : "rounded-bl-md bg-background"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
                    <p
                      className={`mt-1 text-xs ${mine ? "text-white/70" : "text-muted"}`}
                    >
                      {formatTime(m.createdAt)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="border-t border-border bg-card px-4 py-3"
      >
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Написать сообщение..."
            rows={1}
            className="max-h-32 flex-1 resize-none rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={!draft.trim() || sending}
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            Отправить
          </button>
        </div>
      </form>
    </>
  );
}

function otherParty(
  c: ConversationResponse,
  me: UserInfo,
): { firstName: string; lastName: string; roleLabel: string } {
  if (me.role === "OWNER") {
    return {
      firstName: c.vetFirstName,
      lastName: c.vetLastName,
      roleLabel: "Ветеринар",
    };
  }
  return {
    firstName: c.ownerFirstName,
    lastName: c.ownerLastName,
    roleLabel: "Владелец",
  };
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function formatRelativeTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });
}
