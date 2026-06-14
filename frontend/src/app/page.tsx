import Image from "next/image";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Stars from "@/components/ui/Stars";

const STATS: Array<[string, string]> = [
  ["12 мин", "Среднее время ответа"],
  ["1 200+", "Проверенных врачей"],
  ["48 000+", "Консультаций проведено"],
  ["4.9 ★", "Средний рейтинг"],
];

const STEPS = [
  {
    n: "01",
    icon: "search" as const,
    title: "Выберите врача",
    body: "По специализации, рейтингу и отзывам. Каждый диплом проверен вручную.",
  },
  {
    n: "02",
    icon: "chat" as const,
    title: "Опишите проблему",
    body: "Симптомы, фото, документы — врач отвечает в течение 15 минут.",
  },
  {
    n: "03",
    icon: "shield" as const,
    title: "Получите помощь",
    body: "Назначения и наблюдение. Полная история остаётся у вас.",
  },
];

const VETS = [
  {
    name: "Дмитрий Волков",
    spec: "Терапевт · Хирург",
    rating: 4.9,
    reviews: 234,
    city: "Москва",
    online: true,
    seed: 0,
  },
  {
    name: "Елена Соколова",
    spec: "Дерматолог",
    rating: 4.8,
    reviews: 178,
    city: "Москва",
    online: true,
    seed: 1,
  },
  {
    name: "Артём Козлов",
    spec: "Офтальмолог",
    rating: 4.7,
    reviews: 95,
    city: "Санкт-Петербург",
    online: false,
    seed: 2,
  },
];

const REVIEWS = [
  {
    name: "Ольга",
    pet: "Рыжик · кот, 6 лет",
    text: "Написала в 23:00, Рыжик не ел два дня. Доктор ответил за 8 минут и успокоил. Это бесценно.",
    seed: 1,
  },
  {
    name: "Михаил",
    pet: "Граф · лабрадор",
    text: "После операции не знал, нормально ли заживает шов. Прислал фото — всё объяснили по-человечески.",
    seed: 4,
  },
  {
    name: "Татьяна",
    pet: "Снежинка · кролик",
    text: "Ни одна клиника в городе не работала с кроликами. Здесь нашла специалиста за 10 минут.",
    seed: 3,
  },
];

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-[58px] max-w-6xl items-center gap-6 px-7">
          <Link href="/" className="flex items-center gap-[9px]">
            <span className="flex size-[30px] items-center justify-center rounded-[12px] bg-accent text-on-accent">
              <Icon name="pulse" size={17} strokeWidth={2.2} />
            </span>
            <span className="font-serif text-lg font-bold tracking-tight">
              1x<span className="text-accent">Vet</span>
            </span>
          </Link>
          <div className="flex flex-1 items-center justify-end gap-3">
            <Link href="/login" className="text-sm text-muted hover:text-foreground">
              Войти
            </Link>
            <Link href="/register">
              <Button size="sm">Регистрация</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-7 pt-16 pb-14">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 70% 35%, rgba(255,106,77,0.13) 0%, transparent 62%)",
            }}
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="mb-[22px] inline-flex items-center gap-[7px] rounded-full border border-accent-border bg-accent-bg px-[13px] py-[5px]">
                <span className="size-1.5 rounded-full bg-accent" />
                <span className="text-[12.5px] font-semibold tracking-[0.2px] text-accent">
                  Ветеринары онлайн 24/7
                </span>
              </div>
              <h1 className="mb-[22px] font-serif text-[clamp(40px,4.6vw,62px)] font-bold leading-[1.05] tracking-[-1.6px] text-foreground">
                Врач для питомца —
                <br />
                <span className="text-accent">за восемь минут</span>
              </h1>
              <p className="mb-[30px] max-w-[440px] text-[17px] leading-[1.7] text-muted">
                Точные консультации с проверенными ветеринарами в чате. Без
                очередей и стресса для питомца, в любое время суток.
              </p>
              <div className="mb-[30px] flex flex-wrap gap-3">
                <Link href="/register">
                  <Button size="lg">Найти врача</Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline">
                    Я ветеринар
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-[14px]">
                <div className="flex">
                  {["Оля", "Миша", "Таня", "Катя"].map((nm, i) => (
                    <div
                      key={nm}
                      style={{ marginLeft: i ? -9 : 0 }}
                      className="rounded-full border-2 border-background"
                    >
                      <Avatar name={nm} size={30} seed={i + 1} />
                    </div>
                  ))}
                </div>
                <div>
                  <Stars value={5} size={12} />
                  <p className="text-[12.5px] text-muted">
                    <b className="text-foreground">48 000+</b> довольных владельцев
                  </p>
                </div>
              </div>
            </div>

            <div className="relative flex justify-center">
              <div className="absolute top-2 size-[300px] rounded-full border border-border bg-surface" />
              <div className="relative size-[300px] overflow-hidden rounded-full border-2 border-accent-border shadow-[0_12px_44px_rgba(16,60,40,0.11)]">
                <Image
                  src="/catsanddogs.png"
                  alt="Кошка и собака"
                  width={350}
                  height={350}
                  priority
                  className="block"
                  style={{
                    width: "116%",
                    marginLeft: "-8%",
                    marginTop: "4%",
                    mixBlendMode: "multiply",
                  }}
                />
              </div>
              <div className="absolute -bottom-2 left-0 flex items-center gap-2.5 rounded-2xl border border-border bg-surface px-3.5 py-[11px] shadow-[0_12px_44px_rgba(16,60,40,0.11)]">
                <div className="flex size-[34px] items-center justify-center rounded-full bg-accent-bg text-accent">
                  <Icon name="shield" size={17} />
                </div>
                <div>
                  <div className="text-[12.5px] font-bold whitespace-nowrap">
                    Дипломы проверены
                  </div>
                  <div className="text-[11px] text-muted whitespace-nowrap">
                    1 200+ врачей
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-surface">
          <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-6 px-7 py-[22px]">
            {STATS.map(([v, l]) => (
              <div key={l} className="flex flex-col">
                <span className="font-serif text-[26px] font-bold tracking-[-0.5px]">
                  {v}
                </span>
                <span className="text-[12.5px] text-muted">{l}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-7 py-16">
          <p className="mb-[14px] text-xs font-semibold uppercase tracking-[2px] text-accent">
            Как это работает
          </p>
          <h2 className="mb-9 font-serif text-[clamp(26px,3.2vw,38px)] font-bold tracking-[-0.6px]">
            Три шага до помощи
          </h2>
          <div className="grid gap-[18px] md:grid-cols-3">
            {STEPS.map((s) => (
              <Card key={s.n} className="p-[26px]">
                <div className="mb-[18px] flex items-center justify-between">
                  <div className="flex size-[46px] items-center justify-center rounded-[14px] bg-accent-bg text-accent">
                    <Icon name={s.icon} size={22} />
                  </div>
                  <span className="font-serif text-3xl font-bold text-border">
                    {s.n}
                  </span>
                </div>
                <div className="mb-[9px] font-serif text-[19px] font-semibold tracking-[-0.3px]">
                  {s.title}
                </div>
                <div className="text-sm leading-[1.65] text-muted">{s.body}</div>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-t border-border bg-background-alt">
          <div className="mx-auto max-w-6xl px-7 py-[60px]">
            <div className="mb-8 flex items-end justify-between gap-6">
              <h2 className="font-serif text-[clamp(24px,3vw,34px)] font-bold tracking-[-0.6px]">
                Врачи, которым доверяют
              </h2>
              <Link href="/register" className="hidden sm:inline-flex">
                <Button size="sm" variant="soft">
                  Все врачи <Icon name="arrow" size={15} />
                </Button>
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {VETS.map((v) => (
                <Card key={v.name} hover className="p-[22px]">
                  <div className="mb-[14px] flex items-center gap-[13px]">
                    <Avatar name={v.name} size={48} seed={v.seed} />
                    <div>
                      <div className="font-serif text-base font-semibold">
                        {v.name}
                      </div>
                      <div className="mt-0.5 text-[12.5px] text-muted">
                        {v.spec}
                      </div>
                    </div>
                  </div>
                  <div className="mb-3 flex items-center gap-[7px]">
                    <Stars value={Math.round(v.rating)} />
                    <span className="text-[12.5px] text-muted">
                      {v.rating} · {v.reviews}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`size-1.5 rounded-full ${v.online ? "bg-accent" : "bg-light"}`}
                    />
                    <span
                      className={`text-xs ${v.online ? "text-accent" : "text-light"}`}
                    >
                      {v.online ? "Онлайн" : "Офлайн"}
                    </span>
                    <span className="ml-auto text-xs text-light">{v.city}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-7 py-16">
          <p className="mb-9 text-xs font-semibold uppercase tracking-[2px] text-accent">
            Отзывы
          </p>
          <div className="grid gap-9 md:grid-cols-3">
            {REVIEWS.map((r) => (
              <div key={r.name}>
                <div
                  className="mb-2.5 select-none font-serif text-[56px] leading-[0.7] text-accent opacity-50"
                  aria-hidden
                >
                  &ldquo;
                </div>
                <p className="mb-4 font-serif text-[16.5px] font-medium leading-[1.6]">
                  {r.text}
                </p>
                <div className="flex items-center gap-2.5">
                  <Avatar name={r.name} size={32} seed={r.seed} />
                  <div>
                    <div className="text-[13px] font-semibold">{r.name}</div>
                    <div className="text-xs text-light">{r.pet}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-accent px-7 py-14 text-center text-on-accent">
          <h2 className="mb-3 font-serif text-[clamp(28px,3.6vw,42px)] font-bold tracking-[-0.8px]">
            Начните сегодня
          </h2>
          <p className="mb-[30px] text-base opacity-85">
            Первая консультация — уже через несколько минут
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/register">
              <button className="rounded-[13px] bg-on-accent px-[30px] py-[14px] text-[15px] font-bold text-accent transition-colors hover:bg-on-accent/90">
                Я владелец питомца
              </button>
            </Link>
            <Link href="/register">
              <button className="rounded-[13px] border-[1.5px] border-on-accent px-[30px] py-[14px] text-[15px] font-bold text-on-accent transition-colors hover:bg-on-accent/10">
                Я ветеринар
              </button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-7 py-8 sm:flex-row sm:items-center">
          <p className="font-serif text-lg font-bold">
            1x<span className="text-accent">Vet</span>
          </p>
          <p className="text-sm text-light">
            © {new Date().getFullYear()} 1xVet. Все права защищены.
          </p>
        </div>
      </footer>
    </>
  );
}
