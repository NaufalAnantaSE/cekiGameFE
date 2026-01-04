"use client";

import { useState } from "react";

import type { Player } from "../store/sessionSlice";

type Props = {
  open: boolean;
  players: Player[];
  onClose: () => void;
  onSubmit: (winnerPlayerId: string) => void;
};

export default function NgandangModal({
  open,
  players,
  onClose,
  onSubmit,
}: Props) {
  const [winner, setWinner] = useState<string>(players[0]?.id ?? "");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-3xl border border-cyan-400/30 bg-zinc-950 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold">Ronde NGANDANG</h3>
            <p className="mt-1 text-xs text-zinc-400">Pilih 1 pemenang.</p>
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

        <div className="mt-4 space-y-2">
          {players.map((p) => (
            <label
              key={p.id}
              className={
                winner === p.id
                  ? "flex items-center gap-3 rounded-2xl border border-cyan-400/40 bg-cyan-400/10 p-3"
                  : "flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-3"
              }
            >
              <input
                type="radio"
                name="winner"
                value={p.id}
                checked={winner === p.id}
                onChange={() => setWinner(p.id)}
              />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{p.name}</div>
                <div className="text-xs text-zinc-400">Total: {p.totalScore}</div>
              </div>
            </label>
          ))}
        </div>

        <button
          type="button"
          className="mt-4 h-12 w-full rounded-2xl bg-cyan-400 text-sm font-semibold text-black"
          onClick={() => {
            if (!winner) return;
            onSubmit(winner);
          }}
        >
          Submit NGANDANG
        </button>
      </div>
    </div>
  );
}
