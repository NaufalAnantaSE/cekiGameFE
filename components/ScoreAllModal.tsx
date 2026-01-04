"use client";

import { useMemo, useState } from "react";

import ScoreInputRow from "./ScoreInputRow";
import type { Player } from "../store/sessionSlice";

type Props = {
  open: boolean;
  players: Player[];
  onClose: () => void;
  onSubmit: (scores: Array<{ playerId: string; score: number }>) => void;
};

export default function ScoreAllModal({
  open,
  players,
  onClose,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const p of players) initial[p.id] = "0";
    return initial;
  });

  const entries = useMemo(
    () =>
      players.map((p) => ({
        playerId: p.id,
        name: p.name,
        value: values[p.id] ?? "0",
      })),
    [players, values],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-3xl border border-fuchsia-500/30 bg-zinc-950 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold"> mulai hitung</h3>
            <p className="mt-1 text-xs text-zinc-400">
              Input delta skor tiap player (hint: kelipatan 5).
            </p>
          </div>
          <button
            type="button"
            className="h-10 rounded-xl border border-zinc-800 px-3 text-xs font-semibold"
            onClick={() => {
              onClose();
            }}
          >
            Tutup
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {entries.map((row) => {
            const num = Number.parseInt(row.value, 10);
            const isInt = Number.isFinite(num);
            const isMultipleOf5 = isInt && num % 5 === 0;
            return (
              <div key={row.playerId}>
                <ScoreInputRow
                  label={row.name}
                  value={row.value}
                  onChange={(next) =>
                    setValues((v) => ({
                      ...v,
                      [row.playerId]: next,
                    }))
                  }
                />

                <div className="mt-2 flex items-center justify-end">
                  <span
                    className={
                      isMultipleOf5
                        ? "text-xs font-semibold text-emerald-300"
                        : "text-xs font-semibold text-amber-300"
                    }
                  >
                    {isMultipleOf5 ? "OK" : "×5?"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          className="mt-4 h-12 w-full rounded-2xl bg-fuchsia-600 text-sm font-semibold text-white"
          onClick={() => {
            const scores = players.map((p) => {
              const raw = values[p.id] ?? "0";
              const num = Number.parseInt(raw, 10);
              return { playerId: p.id, score: Number.isFinite(num) ? num : 0 };
            });
            onSubmit(scores);
          }}
        >
          Submit Ronde
        </button>
      </div>
    </div>
  );
}
