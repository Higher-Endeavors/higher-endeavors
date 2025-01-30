export interface PillarSettings {
  [key: string]: any; // This can be extended with specific pillar types as needed
}

export interface UserSettings {
  user_id: number;
  height_unit: 'imperial' | 'metric';
  weight_unit: 'lbs' | 'kg';
  temperature_unit: 'F' | 'C';
  time_format: '12h' | '24h';
  date_format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  language: string;
  notifications_email: boolean;
  notifications_text: boolean;
  notifications_app: boolean;
  pillar_settings: PillarSettings;
  created_at?: string;
  updated_at?: string;
}

export type UpdateUserSettingsInput = Partial<Omit<UserSettings, 'user_id' | 'created_at' | 'updated_at'>>;

export interface UseUserSettingsReturn {
  settings: UserSettings | null;
  isLoading: boolean;
  error: Error | null;
  updateSettings: (newSettings: UpdateUserSettingsInput) => Promise<void>;
  mutationError: Error | null;
  isMutating: boolean;
} 