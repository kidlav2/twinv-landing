"use client";

import { useRef, useState } from "react";
import { useStudio } from "@/lib/studio/store";
import { parseImportFile, type ParsedImport } from "@/lib/studio/import";

export function ImportPanel() {
  const { state, replaceLedger } = useStudio();
  const inputRef = useRef<HTMLInputElement>(null);
  const [parsed, setParsed] = useState<ParsedImport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"merge" | "replace">("merge");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const [source, setSource] = useState<{ name: string; text: string } | null>(null);

  const runParse = (name: string, text: string, nextMode: "merge" | "replace") => {
    const base = nextMode === "replace" ? { ...state, projects: [] } : state;
    return parseImportFile(name, text, base, state.settings.actingAs);
  };

  const onFile = async (file: File) => {
    setError(null);
    setDone(null);
    setBusy(true);
    try {
      const text = await file.text();
      setSource({ name: file.name, text });
      const result = runParse(file.name, text, mode);
      setParsed(result);
      if (result.preview.warnings.some((w) => w.includes("Excel"))) {
        setError(result.preview.warnings[0] ?? null);
      }
    } catch {
      setError("Could not read that file.");
      setParsed(null);
    } finally {
      setBusy(false);
    }
  };

  const apply = () => {
    if (!parsed) return;
    replaceLedger(parsed.next);
    setDone(parsed.preview.summary);
    setParsed(null);
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `twinv-ledger-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="studio-card p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="studio-label">Import</p>
          <h2 className="font-display text-heading-sm mt-1">Load a file</h2>
        </div>
        <button
          type="button"
          className="btn-ghost rounded-btn-sharp min-h-11 cursor-pointer border-[1.5px] px-4 text-body-sm"
          onClick={exportJson}
        >
          Export JSON
        </button>
      </div>
      <p className="text-muted mt-2 max-w-[56ch] text-body-sm">
        CSV, TSV, or JSON. Headers are matched automatically (project, client,
        amount, Stripe fee/net, time, expenses, payouts). Excel: save as CSV first.
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <label className="border-line-strong rounded-btn inline-flex min-h-11 cursor-pointer items-center border px-4 text-body-sm">
          <input
            type="radio"
            name="import-mode"
            checked={mode === "merge"}
            onChange={() => {
              setMode("merge");
              if (source) setParsed(runParse(source.name, source.text, "merge"));
            }}
            className="mr-2"
          />
          Merge with current
        </label>
        <label className="border-line-strong rounded-btn inline-flex min-h-11 cursor-pointer items-center border px-4 text-body-sm">
          <input
            type="radio"
            name="import-mode"
            checked={mode === "replace"}
            onChange={() => {
              setMode("replace");
              if (source) setParsed(runParse(source.name, source.text, "replace"));
            }}
            className="mr-2"
          />
          Replace projects
        </label>
      </div>

      <div
        className="border-line-strong mt-5 cursor-pointer rounded-[8px] border border-dashed px-6 py-10 text-center"
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) void onFile(file);
        }}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
      >
        <p className="text-fg text-body">Drop a file here, or click to choose</p>
        <p className="text-faint mt-2 text-caption">.csv · .tsv · .json · .txt</p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.tsv,.json,.txt,text/csv,application/json"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void onFile(file);
            e.target.value = "";
          }}
        />
      </div>

      {busy ? <p className="text-muted mt-4 text-body-sm">Reading…</p> : null}
      {error ? <p className="text-muted mt-4 text-body-sm">{error}</p> : null}
      {done ? <p className="text-muted mt-4 text-body-sm">{done}</p> : null}

      {parsed ? (
        <div className="mt-6 flex flex-col gap-3">
          <p className="text-fg text-body-sm">{parsed.preview.summary}</p>
          {parsed.preview.warnings.map((w) => (
            <p key={w} className="text-faint text-caption">
              {w}
            </p>
          ))}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="btn-primary rounded-btn min-h-11 cursor-pointer px-5 text-body-sm"
              onClick={apply}
              disabled={
                parsed.preview.projects +
                  parsed.preview.expenses +
                  parsed.preview.time +
                  parsed.preview.payouts ===
                0
              }
            >
              Apply import
            </button>
            <button
              type="button"
              className="btn-ghost rounded-btn-sharp min-h-11 cursor-pointer border-[1.5px] px-5 text-body-sm"
              onClick={() => setParsed(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
