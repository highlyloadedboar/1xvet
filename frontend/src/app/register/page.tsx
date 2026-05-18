"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, type ApiError } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);

    try {
      const res = await api.register({
        email: form.get("email") as string,
        password: form.get("password") as string,
        firstName: form.get("firstName") as string,
        lastName: form.get("lastName") as string,
        role: (form.get("role") as "OWNER" | "VET") ?? "OWNER",
      });
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      const target = res.user.role === "VET" ? "/vet/dashboard" : "/dashboard";
      router.push(target);
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.status === 409) {
        setError("Этот email уже зарегистрирован");
      } else {
        setError(apiErr.message || "Произошла ошибка");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <h1 className="font-serif text-3xl font-bold text-center">
          Регистрация
        </h1>
        <p className="mt-2 text-center text-muted">
          Создайте аккаунт, чтобы начать
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="firstName" className="block text-sm font-medium">
                Имя
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="mt-1 block w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-accent"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="lastName" className="block text-sm font-medium">
                Фамилия
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className="mt-1 block w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Пароль
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              className="mt-1 block w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-accent"
            />
            <p className="mt-1 text-xs text-muted">Минимум 8 символов</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Я —</label>
            <div className="mt-2 flex gap-3">
              <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm has-[:checked]:border-accent has-[:checked]:bg-accent/5">
                <input
                  type="radio"
                  name="role"
                  value="OWNER"
                  defaultChecked
                  className="accent-accent"
                />
                Владелец питомца
              </label>
              <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm has-[:checked]:border-accent has-[:checked]:bg-accent/5">
                <input
                  type="radio"
                  name="role"
                  value="VET"
                  className="accent-accent"
                />
                Ветеринар
              </label>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-accent py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? "Регистрация..." : "Зарегистрироваться"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Уже есть аккаунт?{" "}
          <a href="/login" className="text-accent hover:underline">
            Войти
          </a>
        </p>
      </div>
    </div>
  );
}
