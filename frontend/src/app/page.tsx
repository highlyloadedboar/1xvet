import Link from "next/link";

const stats = [
  { value: "12 мин", label: "Среднее время ответа врача" },
  { value: "1 200+", label: "Проверенных ветеринаров" },
  { value: "48 000+", label: "Проведённых консультаций" },
];

const steps = [
  {
    number: "01",
    title: "Выберите врача",
    text: "Откройте каталог, отфильтруйте по специализации, рейтингу и онлайн-статусу.",
  },
  {
    number: "02",
    title: "Напишите в чат",
    text: "Опишите проблему, прикрепите фото или анализы. Врач ответит за минуты.",
  },
  {
    number: "03",
    title: "Получите помощь",
    text: "Рекомендации, схема лечения, направление к узкому специалисту — без выезда из дома.",
  },
];

const vets = [
  {
    name: "Анна Соколова",
    specialty: "Терапевт",
    experience: "12 лет",
    rating: 4.9,
    reviews: 312,
    online: true,
    tags: ["Кошки", "Собаки"],
  },
  {
    name: "Михаил Орлов",
    specialty: "Дерматолог",
    experience: "9 лет",
    rating: 4.8,
    reviews: 187,
    online: true,
    tags: ["Аллергии", "Кожа"],
  },
  {
    name: "Елена Воронова",
    specialty: "Офтальмолог",
    experience: "15 лет",
    rating: 5.0,
    reviews: 246,
    online: false,
    tags: ["Кошки", "Грызуны"],
  },
];

const reviews = [
  {
    quote:
      "Кот ночью начал странно дышать, паника — в клинике никто не отвечает. Через 8 минут уже общалась с терапевтом, разобрались, что обошлось без скорой.",
    author: "Мария",
    pet: "Барсик, мейн-кун, 4 года",
  },
  {
    quote:
      "Очень удобно, когда у тебя три собаки и нет времени тащить их по очереди в клинику. Дерматолог по фото поставил диагноз и расписал лечение.",
    author: "Денис",
    pet: "Туман, хаски, 6 лет",
  },
  {
    quote:
      "Записалась на удобное время, без очередей и стресса для кота. Врач отвечал по делу, без воды. Рекомендую.",
    author: "Ольга",
    pet: "Локи, британец, 2 года",
  },
];

export default function Home() {
  return (
    <>
      <nav className="border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-serif text-xl font-bold">
            1x<span className="text-accent">Vet</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              Войти
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Найти врача
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 sm:pt-28">
          <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <h1 className="font-serif text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
                Ветеринарная помощь{" "}
                <span className="text-accent">онлайн</span> — когда она нужна
              </h1>
              <p className="mt-6 max-w-xl text-lg text-muted">
                Консультации проверенных ветеринаров в чате. Без очередей, без
                стресса для животного, в любое время суток.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href="/register"
                  className="rounded-full bg-accent px-8 py-3.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
                >
                  Найти врача
                </Link>
                <Link
                  href="/register"
                  className="rounded-full border border-border bg-card px-8 py-3.5 text-sm font-medium transition-colors hover:border-foreground/30"
                >
                  Я ветеринар
                </Link>
              </div>
              <div className="mt-10 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {["#c4622d", "#a8511f", "#d68a55", "#8a4520"].map((c, i) => (
                    <span
                      key={i}
                      className="inline-block size-9 rounded-full border-2 border-background"
                      style={{ background: c }}
                      aria-hidden
                    />
                  ))}
                </div>
                <p className="text-sm text-muted">
                  <span className="font-semibold text-foreground">
                    48 000+
                  </span>{" "}
                  владельцев уже доверили нам своих питомцев
                </p>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute -inset-6 -z-10 rounded-3xl bg-accent/10 blur-2xl" />
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3 border-b border-border pb-4">
                  <div className="size-10 rounded-full bg-accent/20" />
                  <div>
                    <p className="text-sm font-semibold">Анна Соколова</p>
                    <p className="text-xs text-muted">
                      Терапевт · онлайн
                    </p>
                  </div>
                  <span className="ml-auto inline-flex size-2.5 rounded-full bg-green-500" />
                </div>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-accent px-4 py-2.5 text-white">
                    Кот вторые сутки отказывается от еды. Что делать?
                  </div>
                  <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-background px-4 py-2.5">
                    Понимаю беспокойство. Прикрепите, пожалуйста, фото — и
                    давайте уточним, есть ли рвота или вялость.
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted">
                    <span className="inline-block size-1.5 animate-pulse rounded-full bg-muted" />
                    <span className="inline-block size-1.5 animate-pulse rounded-full bg-muted [animation-delay:200ms]" />
                    <span className="inline-block size-1.5 animate-pulse rounded-full bg-muted [animation-delay:400ms]" />
                    <span className="ml-1">печатает</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-card">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-12 sm:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label} className="text-center sm:text-left">
                <p className="font-serif text-4xl font-bold text-accent">
                  {s.value}
                </p>
                <p className="mt-2 text-sm text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-wider text-accent">
              Как это работает
            </p>
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-tight">
              Три шага до консультации
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-2xl border border-border bg-card p-8 transition-colors hover:border-accent/40"
              >
                <p className="font-serif text-3xl text-accent">{step.number}</p>
                <h3 className="mt-4 font-serif text-xl font-semibold">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-card">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="flex items-end justify-between gap-6">
              <div className="max-w-2xl">
                <p className="text-sm font-medium uppercase tracking-wider text-accent">
                  Наши врачи
                </p>
                <h2 className="mt-3 font-serif text-4xl font-bold tracking-tight">
                  Проверенные специалисты
                </h2>
                <p className="mt-3 text-muted">
                  Каждый диплом верифицирован. Опыт от 5 лет.
                </p>
              </div>
              <Link
                href="/register"
                className="hidden text-sm font-medium text-accent hover:underline sm:inline"
              >
                Все врачи →
              </Link>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {vets.map((vet) => (
                <div
                  key={vet.name}
                  className="rounded-2xl border border-border bg-background p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-12 items-center justify-center rounded-full bg-accent/15 font-serif text-lg font-semibold text-accent">
                        {vet.name.split(" ").map((p) => p[0]).join("")}
                      </div>
                      <div>
                        <p className="font-semibold">{vet.name}</p>
                        <p className="text-sm text-muted">{vet.specialty}</p>
                      </div>
                    </div>
                    {vet.online && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-700">
                        <span className="size-1.5 rounded-full bg-green-500" />
                        Онлайн
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm">
                    <span className="font-semibold">★ {vet.rating}</span>
                    <span className="text-muted">
                      ({vet.reviews} отзывов)
                    </span>
                    <span className="text-muted">·</span>
                    <span className="text-muted">{vet.experience}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {vet.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-wider text-accent">
              Отзывы
            </p>
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-tight">
              Что говорят владельцы
            </h2>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {reviews.map((r) => (
              <figure
                key={r.author}
                className="flex flex-col rounded-2xl border border-border bg-card p-8"
              >
                <svg
                  className="size-7 text-accent/40"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M9 7c-3 0-5 2-5 5v5h5v-5H7c0-2 1-3 2-3V7zm9 0c-3 0-5 2-5 5v5h5v-5h-2c0-2 1-3 2-3V7z" />
                </svg>
                <blockquote className="mt-4 flex-1 font-serif text-lg leading-relaxed">
                  «{r.quote}»
                </blockquote>
                <figcaption className="mt-6 border-t border-border pt-4 text-sm">
                  <p className="font-semibold">{r.author}</p>
                  <p className="text-muted">{r.pet}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="overflow-hidden rounded-3xl bg-accent px-8 py-16 text-center text-white sm:px-16">
            <h2 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">
              Начните сегодня
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/85">
              Регистрация занимает минуту. Первая консультация — без обязательств.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register"
                className="rounded-full bg-white px-8 py-3.5 text-sm font-medium text-accent transition-colors hover:bg-white/90"
              >
                Найти врача
              </Link>
              <Link
                href="/register"
                className="rounded-full border border-white/30 px-8 py-3.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Я ветеринар
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-8 sm:flex-row sm:items-center">
          <p className="font-serif text-lg font-bold">
            1x<span className="text-accent">Vet</span>
          </p>
          <p className="text-sm text-muted">
            © {new Date().getFullYear()} 1xVet. Все права защищены.
          </p>
        </div>
      </footer>
    </>
  );
}
