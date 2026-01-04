"use client";

import { useMemo, useState } from "react";

import type { Player } from "../store/sessionSlice";

type Props = {
  players: Player[];
  onAddPlayer: (name: string) => void;
  onEditPlayer: (playerId: string, name: string) => void;
  onDeletePlayer: (playerId: string) => void;
};

export default function PlayerList({
  players,
  onAddPlayer,
  onEditPlayer,
  onDeletePlayer,
}: Props) {
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const hasPlayers = players.length > 0;

  const totalPlayersText = useMemo(() => {
    if (!hasPlayers) return "Belum ada player";
    return `${players.length} player`;
  }, [hasPlayers, players.length]);

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight">Players</h2>
        <span className="text-xs text-zinc-400">{totalPlayersText}</span>
      </div>

      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const trimmed = newName.trim();
          if (!trimmed) return;
          onAddPlayer(trimmed);
          setNewName("");
        }}
      >
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nama player"
          className="h-12 flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-sm outline-none focus:border-fuchsia-500"
        />
        <button
          type="submit"
          className="h-12 rounded-xl bg-fuchsia-600 px-4 text-sm font-semibold text-white"
        >
          Tambah
        </button>
      </form>

      <div className="mt-4 space-y-2">
        {players.map((p) => (
          <div
            key={p.id}
            className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full border border-fuchsia-500/50 bg-fuchsia-500/10 px-2 text-xs font-semibold text-fuchsia-200">
                    #{p.rank ?? "-"}
                  </span>
                  <div className="truncate text-sm font-semibold">{p.name}</div>
                </div>
                <div className="mt-1 text-xs text-zinc-400">
                  Total: <span className="text-zinc-200">{p.totalScore}</span>
                </div>
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  className="h-10 rounded-xl border border-zinc-800 px-3 text-xs font-semibold text-zinc-200"
                  onClick={() => {
                    setEditId(p.id);
                    setEditName(p.name);
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="h-10 rounded-xl border border-red-500/40 bg-red-500/10 px-3 text-xs font-semibold text-red-200"
                  onClick={() => onDeletePlayer(p.id)}
                >
                  Hapus
                </button>
              </div>
            </div>

            {editId === p.id && (
              <form
                className="mt-3 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const trimmed = editName.trim();
                  if (!trimmed) return;
                  onEditPlayer(p.id, trimmed);
                  setEditId(null);
                }}
              >
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-12 flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-sm outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  className="h-12 rounded-xl bg-cyan-500 px-4 text-sm font-semibold text-black"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  className="h-12 rounded-xl border border-zinc-800 px-4 text-sm font-semibold"
                  onClick={() => setEditId(null)}
                >
                  Batal
                </button>
              </form>
            )}
          </div>
        ))}

        {!hasPlayers && (
          <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 p-4 text-sm text-zinc-400">
            Tambahkan player untuk mulai.
          </div>
        )}
      </div>
    </section>
  );
}
