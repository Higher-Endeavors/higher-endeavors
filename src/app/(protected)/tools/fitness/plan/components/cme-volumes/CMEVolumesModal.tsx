import React from 'react';
import CMEVolumes from './CMEVolumes';
import type { CMEVolumeSettings, CMEVolumePlan, CMEVolumeContext } from './cme-volumes.zod';

interface CMEVolumesModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CMEVolumeSettings;
  onSettingsChange: (settings: CMEVolumeSettings) => void;
  planContext?: CMEVolumeContext;
  onPlanChange?: (plan: CMEVolumePlan[]) => void;
}

export default function CMEVolumesModal({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  planContext,
  onPlanChange,
}: CMEVolumesModalProps) {
  if (!isOpen) return null;

  return (
    <CMEVolumes
      settings={settings}
      onSettingsChange={onSettingsChange}
      planContext={planContext}
      onPlanChange={onPlanChange}
      isModal={true}
      onClose={onClose}
      showPreview={true}
    />
  );
}
