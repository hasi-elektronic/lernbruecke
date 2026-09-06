import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { ProgressRepository, createBrowserStore, parseImport } from './data/storage';
import type { AppData, AttemptRecord, ChildProfile, LessonCompletion, Settings } from './data/types';

interface AppContextValue {
  data: AppData;
  setProfile: (profile: ChildProfile) => void;
  setSettings: (settings: Settings) => void;
  addAttempt: (attempt: AttemptRecord) => void;
  addCompletion: (completion: LessonCompletion) => void;
  exportJson: () => string;
  importJson: (json: string) => boolean;
  clearAll: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const repoRef = useRef<ProgressRepository | null>(null);
  if (repoRef.current === null) {
    repoRef.current = new ProgressRepository(createBrowserStore());
  }
  const repo = repoRef.current;
  const [data, setData] = useState<AppData>(() => repo.getData());

  const setProfile = useCallback((profile: ChildProfile) => setData(repo.setProfile(profile)), [repo]);
  const setSettings = useCallback((settings: Settings) => setData(repo.setSettings(settings)), [repo]);
  const addAttempt = useCallback((a: AttemptRecord) => setData(repo.addAttempt(a)), [repo]);
  const addCompletion = useCallback((c: LessonCompletion) => setData(repo.addCompletion(c)), [repo]);
  const exportJson = useCallback(() => repo.exportJson(), [repo]);
  const clearAll = useCallback(() => setData(repo.clear()), [repo]);
  const importJson = useCallback(
    (json: string) => {
      const result = parseImport(json);
      if (!result.ok) return false;
      setData(repo.replaceAll(result.data));
      return true;
    },
    [repo],
  );

  const value = useMemo<AppContextValue>(
    () => ({ data, setProfile, setSettings, addAttempt, addCompletion, exportJson, importJson, clearAll }),
    [data, setProfile, setSettings, addAttempt, addCompletion, exportJson, importJson, clearAll],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used inside AppStateProvider');
  return ctx;
}
