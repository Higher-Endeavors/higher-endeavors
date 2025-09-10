import React, { useState } from 'react';
import Section from '../Section';
import VolumeSettings from './VolumeSettings';
import TIZSettings from './TIZSettings';
import VolumePreview from './VolumePreview';
import PlanContextDisplay from './PlanContextDisplay';
import WeekCalculationTest from './WeekCalculationTest';
import AdjustmentManager from './AdjustmentManager';
import QuickAdjustmentModal from './QuickAdjustmentModal';
import StructuralAdjustmentModal from './StructuralAdjustmentModal';
import type { CMEVolumeSettings, CMEVolumePlan, CMEVolumeContext } from './cme-volumes.zod';
import type { VolumeAdjustment, AdjustmentType } from './VolumeAdjustmentTypes';

interface CMEVolumesProps {
  settings: CMEVolumeSettings;
  onSettingsChange: (settings: CMEVolumeSettings) => void;
  planContext?: CMEVolumeContext;
  onPlanChange?: (plan: CMEVolumePlan[]) => void;
  isModal?: boolean;
  onClose?: () => void;
  showPreview?: boolean;
  adjustments?: VolumeAdjustment[];
  onAdjustmentChange?: (adjustments: VolumeAdjustment[]) => void;
}

export const defaultSettings: CMEVolumeSettings = {
  baselineVolume: 180, // 3 hours per week
  peakVolume: 360, // 6 hours per week
  rampRate: 8, // 8% per week
  deloadEvery: 3, // Every 3 weeks
  deloadReduction: 20, // 20% reduction
  phaseDuration: 4, // 4 weeks per phase
  periodizationStyle: 'Linear',
  activities: [
    {
      id: 'running',
      name: 'Running',
      modality: 'running',
      baseVolume: 120,
      volumePercentage: 60,
      color: 'bg-red-100 text-red-700',
      icon: '🏃',
    },
    {
      id: 'cycling',
      name: 'Cycling',
      modality: 'cycling',
      baseVolume: 60,
      volumePercentage: 40,
      color: 'bg-blue-100 text-blue-700',
      icon: '🚴',
    },
  ],
  tizTargets: {
    z1: 108, // 60% of 180 minutes
    z2: 45,  // 25% of 180 minutes
    z3: 18,  // 10% of 180 minutes
    z4: 7,   // 4% of 180 minutes
    z5: 2,   // 1% of 180 minutes
    total: 180,
  },
};

export default function CMEVolumes({
  settings = defaultSettings,
  onSettingsChange,
  planContext,
  onPlanChange,
  isModal = false,
  onClose,
  showPreview = true,
  adjustments = [],
  onAdjustmentChange,
}: CMEVolumesProps) {
  const [activeTab, setActiveTab] = useState<'volume' | 'tiz' | 'preview' | 'adjustments'>('volume');
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [showStructuralModal, setShowStructuralModal] = useState(false);

  const handleSettingsChange = (newSettings: CMEVolumeSettings) => {
    onSettingsChange(newSettings);
  };

  const handleTIZChange = (tizTargets: typeof settings.tizTargets) => {
    onSettingsChange({
      ...settings,
      tizTargets,
    });
  };

  const handleAddAdjustment = (type: AdjustmentType) => {
    if (type === 'temporary') {
      setShowQuickModal(true);
    } else if (type === 'structural') {
      setShowStructuralModal(true);
    }
  };

  const handleApplyAdjustment = (adjustment: VolumeAdjustment) => {
    const newAdjustments = [...adjustments, adjustment];
    onAdjustmentChange?.(newAdjustments);
  };

  const handleRemoveAdjustment = (adjustmentId: string) => {
    const newAdjustments = adjustments.filter(adj => adj.id !== adjustmentId);
    onAdjustmentChange?.(newAdjustments);
  };

  const handleEditAdjustment = (adjustmentId: string) => {
    // TODO: Implement edit functionality
    console.log('Edit adjustment:', adjustmentId);
  };

  const tabs = [
    { id: 'volume', label: 'Volume Settings', icon: '📊' },
    { id: 'tiz', label: 'Time in Zone', icon: '⏱️' },
    { id: 'adjustments', label: 'Adjustments', icon: '🔧' },
  ];

  if (showPreview) {
    tabs.push({ id: 'preview', label: 'Preview', icon: '👁️' });
  }

  const content = (
    <div className="space-y-6">
      {/* Week Calculation Test - Remove in production */}
      {planContext && (
        <WeekCalculationTest 
          planStartDate={planContext.planStartDate} 
          totalWeeks={planContext.totalWeeks} 
        />
      )}
      
      {/* Plan Context Display */}
      <PlanContextDisplay planContext={planContext} />
      
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-sky-500 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'volume' && (
          <VolumeSettings
            settings={settings}
            onSettingsChange={handleSettingsChange}
          />
        )}

        {activeTab === 'tiz' && (
          <TIZSettings
            tizTargets={settings.tizTargets}
            onTIZChange={handleTIZChange}
          />
        )}

        {activeTab === 'adjustments' && (
          <AdjustmentManager
            adjustments={adjustments}
            onAddAdjustment={handleAddAdjustment}
            onRemoveAdjustment={handleRemoveAdjustment}
            onEditAdjustment={handleEditAdjustment}
          />
        )}

        {activeTab === 'preview' && showPreview && (
          <VolumePreview
            settings={settings}
            totalWeeks={planContext?.totalWeeks || 12}
            onPlanChange={onPlanChange}
          />
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            // Apply settings to plan
            console.log('Applying CME Volume settings:', settings);
            onPlanChange?.([]);
          }}
          className="px-4 py-2 text-sm bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
        >
          {isModal ? 'Apply to Plan' : 'Save Settings'}
        </button>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">CME Volume Planning</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Configure your cardiometabolic exercise volume, ramp rates, and time in zone targets
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {content}
        </div>
      </div>

      {/* Modals */}
      <QuickAdjustmentModal
        isOpen={showQuickModal}
        onClose={() => setShowQuickModal(false)}
        onApply={handleApplyAdjustment}
        currentWeek={planContext?.currentWeek || 0}
        plannedVolume={settings.baselineVolume}
        activities={settings.activities}
      />

      <StructuralAdjustmentModal
        isOpen={showStructuralModal}
        onClose={() => setShowStructuralModal(false)}
        onApply={handleApplyAdjustment}
        currentWeek={planContext?.currentWeek || 0}
        currentSettings={settings}
        totalWeeks={planContext?.totalWeeks || 12}
      />
    </div>
  );
  }

  return (
    <Section
      title="CME Volume Planning"
      subtitle="Configure your cardiometabolic exercise volume, ramp rates, and time in zone targets"
    >
      {content}
      <QuickAdjustmentModal
        isOpen={showQuickModal}
        onClose={() => setShowQuickModal(false)}
        onApply={handleApplyAdjustment}
        currentWeek={planContext?.currentWeek || 0}
        plannedVolume={settings.baselineVolume}
        activities={settings.activities}
      />
      <StructuralAdjustmentModal
        isOpen={showStructuralModal}
        onClose={() => setShowStructuralModal(false)}
        onApply={handleApplyAdjustment}
        currentWeek={planContext?.currentWeek || 0}
        currentSettings={settings}
        totalWeeks={planContext?.totalWeeks || 12}
      />
    </Section>
  );
}

export { CMEVolumeSettingsSchema } from './cme-volumes.zod';
