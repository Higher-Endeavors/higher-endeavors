"use client";
import React, { useEffect, useState, useCallback, useContext, createContext } from "react";
import { UserSettingsProvider } from "context/UserSettingsContext";
import type { UserSettings } from "lib/types/userSettings.zod";

interface UserSettingsRefreshContextType {
  refreshUserSettings: () => Promise<void>;
}

const UserSettingsRefreshContext = createContext<UserSettingsRefreshContextType | undefined>(undefined);

export function useUserSettingsRefresh() {
  const ctx = useContext(UserSettingsRefreshContext);
  if (!ctx) throw new Error("useUserSettingsRefresh must be used within UserSettingsProviderWrapper");
  return ctx;
}

export default function UserSettingsProviderWrapper({ children }: { children: React.ReactNode }) {
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

  const fetchSettings = useCallback(async () => {
    const res = await fetch("/api/user-settings");
    if (res.ok) {
      const data = await res.json();
      setUserSettings(data);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  if (!userSettings) {
    // Optionally show a loading spinner here
    return <div>Loading user settings...</div>;
  }

  return (
    <UserSettingsRefreshContext.Provider value={{ refreshUserSettings: fetchSettings }}>
      <UserSettingsProvider userSettings={userSettings}>
        {children}
      </UserSettingsProvider>
    </UserSettingsRefreshContext.Provider>
  );
} 