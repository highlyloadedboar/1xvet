"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Header from "@/components/Header";
import Avatar from "@/components/ui/Avatar";
import Field from "@/components/ui/Field";
import Icon from "@/components/ui/Icon";
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
  const [search, setSearch] = useState("");

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

  const filtered = search.trim()
    ? conversations.filter((c) => {
        const other = otherParty(c, user);
        return `${other.firstName} ${other.lastName}`
          .toLowerCase()
          .includes(search.toLowerCase());
      })
    : conversations;

  return (
    <>
      <Header user={user} />
      <div className="flex h-[calc(100vh-58px)] bg-background">
        <aside className="flex w-[280px] shrink-0 flex-col border-r border-border bg-surface">
          <div className="border-b border-border p-4">
            <Field
              value={search}
              onChange={(e) => setSearch((e.target as HTMLInputElement).value)}
              placeholder="Поиск…"
              icon={<Icon name="search" size={15} />}
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {convLoading ? (
              <p className="px-4 py-6 text-sm text-muted">Загрузка...</p>
            ) : filtered.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted">
                {search.trim()
                  ? "Ничего не найдено"
                  : "Бесед пока нет. Начните с профиля врача."}
              </p>
            ) : (
              filtered.map((c) => (
                <ConversationRow
                  key={c.id}
                  conversation={c}
                  me={user}
                  active={c.id === activeId}
                  onSelect={() => handleSelect(c.id)}
                />
              ))
            )}
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
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
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-start gap-3 border-b border-border p-4 text-left transition-colors ${
        active ? "bg-accent-bg" : "hover:bg-background-alt"
      }`}
    >
      <Avatar
        name={`${other.firstName} ${other.lastName}`}
        size={42}
        seed={conversation.id}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate font-serif text-sm font-semibold">
            {other.firstName} {other.lastName}
          </p>
          <span className="shrink-0 text-[11px] text-light">
            {formatRelativeTime(conversation.updatedAt)}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-light">{other.roleLabel}</p>
      </div>
    </button>
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
      <div className="flex items-center gap-3 border-b border-border bg-surface px-7 py-3.5">
        <Avatar
          name={`${other.firstName} ${other.lastName}`}
          size={40}
          seed={conversation.id}
        />
        <div>
          <p className="font-serif text-base font-semibold">
            {other.firstName} {other.lastName}
          </p>
          <p className="text-[12px] text-light">{other.roleLabel}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-background px-7 py-6">
        {loading ? (
          <p className="text-sm text-muted">Загрузка сообщений...</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted">Сообщений пока нет — напишите первое</p>
        ) : (
          <ul className="space-y-2.5">
            {messages.map((m) => {
              const mine = m.senderId === me.id;
              return (
                <li
                  key={m.id}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-[14px] px-3.5 py-2.5 text-sm ${
                      mine
                        ? "rounded-br-[4px] bg-accent text-on-accent"
                        : "rounded-bl-[4px] border border-border bg-surface"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
                    <p
                      className={`mt-1 text-[10.5px] ${mine ? "text-on-accent/70" : "text-light"}`}
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
        className="flex items-end gap-2 border-t border-border bg-surface px-4 py-3"
      >
        <button
          type="button"
          className="text-light transition-colors hover:text-accent"
          aria-label="Прикрепить файл"
        >
          <Icon name="clip" size={20} />
        </button>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Написать сообщение..."
          rows={1}
          className="max-h-32 flex-1 resize-none rounded-[14px] border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={!draft.trim() || sending}
          className="flex size-10 items-center justify-center rounded-full bg-accent text-on-accent transition-colors hover:bg-accent-dim disabled:opacity-50"
          aria-label="Отправить"
        >
          <Icon name="send" size={17} />
        </button>
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
  return new Date(iso).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelativeTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });
}
