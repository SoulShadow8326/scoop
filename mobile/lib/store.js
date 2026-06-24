import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  profile: 'scoop_profile',
  onboarded: 'scoop_onboarded',
  history: 'scoop_history',
  saved: 'scoop_saved',
};

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState(null);
  const [onboarded, setOnboarded] = useState(false);
  const [history, setHistory] = useState([]);
  const [saved, setSaved] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const entries = await AsyncStorage.multiGet(Object.values(KEYS));
        const map = Object.fromEntries(entries);
        setProfile(parse(map[KEYS.profile], null));
        setOnboarded(map[KEYS.onboarded] === 'true');
        setHistory(parse(map[KEYS.history], []));
        setSaved(parse(map[KEYS.saved], []));
      } catch (e) {
        // first launch / unreadable store -> defaults
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const completeOnboarding = useCallback(async (p) => {
    setProfile(p);
    setOnboarded(true);
    await AsyncStorage.multiSet([
      [KEYS.profile, JSON.stringify(p || {})],
      [KEYS.onboarded, 'true'],
    ]);
  }, []);

  const addHistory = useCallback((entry) => {
    setHistory((prev) => {
      const next = [entry, ...prev.filter((h) => h.id !== entry.id)].slice(0, 50);
      AsyncStorage.setItem(KEYS.history, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const toggleSaved = useCallback((entry) => {
    setSaved((prev) => {
      const exists = prev.some((s) => s.id === entry.id);
      const next = exists ? prev.filter((s) => s.id !== entry.id) : [entry, ...prev];
      AsyncStorage.setItem(KEYS.saved, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const isSaved = useCallback((id) => saved.some((s) => s.id === id), [saved]);

  const signOut = useCallback(async () => {
    setProfile(null);
    setOnboarded(false);
    await AsyncStorage.multiRemove([KEYS.profile, KEYS.onboarded]);
  }, []);

  const value = {
    ready,
    profile,
    onboarded,
    history,
    saved,
    completeOnboarding,
    addHistory,
    toggleSaved,
    isSaved,
    signOut,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

function parse(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}
