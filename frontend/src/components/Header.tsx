"use client";

import { logout } from "@/lib/auth";
import type { UserInfo } from "@/lib/api";

export default function Header({ user }: { user: UserInfo }) {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <a href="/" className="font-serif text-xl font-bold">
          1x<span className="text-accent">Vet</span>
        </a>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted">
            {user.firstName} {user.lastName}
          </span>
          <button
            onClick={logout}
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            Выйти
          </button>
        </div>
      </div>
    </header>
  );
}
