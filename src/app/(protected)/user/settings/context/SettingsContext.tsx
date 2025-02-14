'use client'

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { useUserSettings } from '@/app/lib/hooks/useUserSettings';
import { UserSettings } from '@/app/lib/types/user_settings';

// Initial state with default values
const initialSettings: UserSettings = {
  user_id: 0,
  height_unit: 'imperial',
  weight_unit: 'lbs',
  temperature_unit: 'F',
  time_format: '12h',
  date_format: 'MM/DD/YYYY',
  language: 'en',
  notifications_email: true,
  notifications_text: false,
  notifications_app: false,
  pillar_settings: {
    general: {
      heightUnit: 'ft_in',
      weightUnit: 'lbs',
      temperatureUnit: 'F',
      timeFormat: '12h',
      dateFormat: 'MM/DD/YYYY',
      language: 'en',
      notifications: ['email'],
    },
    lifestyle: {
      deviceIntegration: {
        enabled: false,
        devices: [],
      },
    },
    health: {
      circumferenceUnit: 'in',
      circumferenceMeasurements: [],
      bodyFatMethods: [],
      trackingPreferences: [],
    },
    nutrition: {
      foodMeasurement: 'grams',
      hydrationUnit: 'oz',
    },
    fitness: {
      resistanceTraining: {
        loadUnit: 'lbs',
      },
      cardioMetabolic: {
        speedUnit: 'mph',
      },
    },
  },
};

type SettingsAction = 
  | { type: 'UPDATE_SETTINGS'; payload: Partial<UserSettings> }
  | { type: 'RESET_SETTINGS' };

const settingsReducer = (state: UserSettings, action: SettingsAction): UserSettings => {
  switch (action.type) {
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        ...action.payload,
      };
    case 'RESET_SETTINGS':
      return initialSettings;
    default:
      return state;
  }
};

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, dispatch] = useReducer(settingsReducer, initialSettings);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
  };

  const resetSettings = () => {
    dispatch({ type: 'RESET_SETTINGS' });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 