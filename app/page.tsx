"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAppDispatch, useAppSelector } from "../store/hooks";
import { loadTokenFromStorage } from "../store/authSlice";

export default function Home() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);

  useEffect(() => {
    dispatch(loadTokenFromStorage());
  }, [dispatch]);

  useEffect(() => {
    if (token) router.replace("/sessions");
    else router.replace("/login");
  }, [router, token]);

  return (
    <div className="min-h-dvh p-6">
      <div className="mx-auto max-w-md rounded-3xl border border-zinc-800 bg-zinc-950/60 p-6">
        <div className="text-sm font-semibold text-fuchsia-200">
          cekinan Waren League
        </div>
        <div className="mt-2 text-xs text-zinc-400">Mengalihkan…</div>
      </div>
    </div>
  );
}
