"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/auth";
import type { UserInfo } from "@/lib/api";
import Avatar from "@/components/ui/Avatar";
import Icon from "@/components/ui/Icon";

const OWNER_LINKS: Array<[string, string]> = [
  ["/dashboard", "Главная"],
  ["/vets", "Найти врача"],
  ["/appointments", "Записи"],
  ["/chat", "Сообщения"],
];

const VET_LINKS: Array<[string, string]> = [
  ["/vet/dashboard", "Панель"],
  ["/appointments", "Записи"],
  ["/chat", "Чаты"],
];

export default function Header({ user }: { user: UserInfo }) {
  const pathname = usePathname();
  const links = user.role === "VET" ? VET_LINKS : OWNER_LINKS;
  const home = user.role === "VET" ? "/vet/dashboard" : "/dashboard";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-[58px] max-w-6xl items-center gap-6 px-7">
        <Link href={home} className="flex shrink-0 items-center gap-[9px]">
          <span
            className="flex size-[30px] items-center justify-center rounded-[12px] bg-accent text-on-accent"
            aria-hidden
          >
            <Icon name="pulse" size={17} strokeWidth={2.2} />
          </span>
          <span className="font-serif text-lg font-bold tracking-tight">
            ИКС&nbsp;<span className="text-accent">ВЕТ</span>
          </span>
        </Link>
        <nav className="flex flex-1 items-center gap-1 pl-1.5">
          {links.map(([href, label]) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={`border-b-2 px-[13px] py-1.5 text-sm transition-colors ${
                  active
                    ? "border-accent font-semibold text-foreground"
                    : "border-transparent font-medium text-muted hover:text-foreground"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <span className="relative cursor-pointer text-muted" aria-hidden>
            <Icon name="bell" size={19} />
            <span className="absolute -right-0.5 -top-0.5 size-[7px] rounded-full border-[1.5px] border-background bg-coral" />
          </span>
          <Avatar
            name={`${user.firstName} ${user.lastName}`}
            size={30}
            seed={user.id}
          />
          <button
            onClick={logout}
            className="text-[13px] text-light transition-colors hover:text-foreground"
          >
            Выйти
          </button>
        </div>
      </div>
    </header>
  );
}
