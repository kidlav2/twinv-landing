"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  ActorId,
  LedgerState,
  PaymentAccount,
  Project,
  StudioSettings,
} from "./types";
import { LEDGER_VERSION, STORAGE_KEY } from "./constants";
import { sampleState } from "./sample";
import { audit } from "./id";
import { blankProject } from "./blank";

export { blankProject };

type Store = {
  ready: boolean;
  state: LedgerState;
  actor: ActorId;
  resetSample: () => void;
  patchSettings: (patch: Partial<StudioSettings>) => void;
  upsertAccount: (account: PaymentAccount) => void;
  removeAccount: (id: string) => void;
  addProject: (project: Project) => void;
  patchProject: (
    id: string,
    patch: Partial<Project> | ((p: Project) => Project),
    action: string,
    detail: string,
  ) => void;
  removeProject: (id: string) => void;
  replaceLedger: (next: LedgerState) => void;
};

const Ctx = createContext<Store | null>(null);

function load(): LedgerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return sampleState();
    const parsed = JSON.parse(raw) as LedgerState;
    if (parsed.version !== LEDGER_VERSION) return sampleState();
    return parsed;
  } catch {
    return sampleState();
  }
}

export function StudioProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LedgerState>(sampleState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(load());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, ready]);

  const actor: ActorId = state.settings.actingAs;

  const resetSample = useCallback(() => {
    setState(sampleState());
  }, []);

  const patchSettings = useCallback((patch: Partial<StudioSettings>) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  }, []);

  const upsertAccount = useCallback((account: PaymentAccount) => {
    setState((s) => {
      const i = s.accounts.findIndex((a) => a.id === account.id);
      const accounts =
        i === -1
          ? [...s.accounts, account]
          : s.accounts.map((a) => (a.id === account.id ? account : a));
      return { ...s, accounts };
    });
  }, []);

  const removeAccount = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      accounts: s.accounts.filter((a) => a.id !== id),
    }));
  }, []);

  const addProject = useCallback(
    (project: Project) => {
      setState((s) => ({
        ...s,
        projects: [
          {
            ...project,
            audit: [
              audit(s.settings.actingAs, "create", `Created ${project.name}`),
              ...project.audit,
            ],
          },
          ...s.projects,
        ],
      }));
    },
    [],
  );

  const patchProject = useCallback(
    (
      id: string,
      patch: Partial<Project> | ((p: Project) => Project),
      action: string,
      detail: string,
    ) => {
      setState((s) => ({
        ...s,
        projects: s.projects.map((p) => {
          if (p.id !== id) return p;
          const next = typeof patch === "function" ? patch(p) : { ...p, ...patch };
          return {
            ...next,
            audit: [audit(s.settings.actingAs, action, detail), ...next.audit],
          };
        }),
      }));
    },
    [],
  );

  const removeProject = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      projects: s.projects.filter((p) => p.id !== id),
    }));
  }, []);

  const replaceLedger = useCallback((next: LedgerState) => {
    setState(next);
  }, []);

  const value = useMemo(
    () => ({
      ready,
      state,
      actor,
      resetSample,
      patchSettings,
      upsertAccount,
      removeAccount,
      addProject,
      patchProject,
      removeProject,
      replaceLedger,
    }),
    [
      ready,
      state,
      actor,
      resetSample,
      patchSettings,
      upsertAccount,
      removeAccount,
      addProject,
      patchProject,
      removeProject,
      replaceLedger,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStudio() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStudio must be used inside StudioProvider");
  return ctx;
}
