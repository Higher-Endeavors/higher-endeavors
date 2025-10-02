"use client";
import React, { createContext, useContext, ReactNode } from "react";
import type { UserSettings } from "lib/types/userSettings.zod";

interface UserSettingsContextType {
  userSettings: UserSettings | null;
}

const UserSettingsContext = createContext<UserSettingsContextType | undefined>(undefined);

export function useUserSettings() {
  const ctx = useContext(UserSettingsContext);
  if (!ctx) throw new Error("useUserSettings must be used within UserSettingsProvider");
  return ctx;
}

export function UserSettingsProvider({ children, userSettings }: { children: ReactNode; userSettings: UserSettings | null }) {
  return (
    <UserSettingsContext.Provider value={{ userSettings }}>
      {children}
    </UserSettingsContext.Provider>
  );
} 