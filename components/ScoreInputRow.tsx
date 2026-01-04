"use client";

import { useId } from "react";

type Props = {
  label: string;
  value: string;
  onChange: (next: string) => void;
};

function normalizeScoreText(raw: string) {
  const trimmed = raw.trim();
  if (trimmed === "") return "";

  const isNegative = trimmed.startsWith("-");
  const digitsOnly = trimmed.replace(/[^0-9]/g, "");
  if (digitsOnly.length === 0) return isNegative ? "-" : "";
  return `${isNegative ? "-" : ""}${digitsOnly}`;
}

function toggleSign(current: string) {
  if (current === "") return "-";
  if (current === "-") return "";
  if (current.startsWith("-")) return current.slice(1);
  return `-${current}`;
}

export default function ScoreInputRow({ label, value, onChange }: Props) {
  const id = useId();

  return (
    <div className="rounded-2xl border border-zinc-800 p-3">
      <label htmlFor={id} className="block text-sm font-semibold">
        {label}
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          pattern="-?[0-9]*"
          value={value}
          onChange={(e) => onChange(normalizeScoreText(e.target.value))}
          className="h-12 flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-sm outline-none focus:border-fuchsia-500"
          placeholder="0"
          aria-label={`${label} score`}
        />
        <button
          type="button"
          className="h-12 min-w-12 rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-sm font-semibold text-zinc-200"
          onClick={() => onChange(toggleSign(value))}
          aria-label={`${label} toggle sign`}
        >
          ±
        </button>
      </div>
    </div>
  );
}
