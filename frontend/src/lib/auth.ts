"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { UserInfo } from "./api";

export function useAuth(requiredRole?: "OWNER" | "VET") {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const stored = localStorage.getItem("user");

    if (!token || !stored) {
      router.replace("/login");
      return;
    }

    const parsed: UserInfo = JSON.parse(stored);

    if (requiredRole && parsed.role !== requiredRole) {
      const target = parsed.role === "VET" ? "/vet/dashboard" : "/dashboard";
      router.replace(target);
      return;
    }

    setUser(parsed);
    setLoading(false);
  }, [router, requiredRole]);

  return { user, loading };
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
}
