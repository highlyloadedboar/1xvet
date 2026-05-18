export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        <h1 className="font-serif text-5xl font-bold tracking-tight">
          Ветеринарная помощь <span className="text-accent">онлайн</span>
        </h1>
        <p className="mt-6 text-lg text-muted">
          Консультации проверенных ветеринаров в чате — без очередей, без
          стресса для животного, в любое время суток.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <a
            href="/register"
            className="rounded-full bg-accent px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Найти ветеринара
          </a>
          <a
            href="/login"
            className="rounded-full border border-border px-8 py-3 text-sm font-medium transition-colors hover:bg-card"
          >
            Войти
          </a>
        </div>
      </div>
    </div>
  );
}
