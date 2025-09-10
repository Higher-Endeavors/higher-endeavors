import React, { useState } from 'react';
import { HiChevronDown } from 'react-icons/hi';
import type { TIZTargets } from './cme-volumes.zod';

interface TIZSettingsProps {
  tizTargets: TIZTargets;
  onTIZChange: (tizTargets: TIZTargets) => void;
}

const zoneColors = {
  z1: 'bg-green-100 text-green-700 border-green-200',
  z2: 'bg-blue-100 text-blue-700 border-blue-200',
  z3: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  z4: 'bg-orange-100 text-orange-700 border-orange-200',
  z5: 'bg-red-100 text-red-700 border-red-200',
};

const zoneDescriptions = {
  z1: 'Recovery - Easy pace, conversational',
  z2: 'Aerobic Base - Comfortable, sustainable',
  z3: 'Tempo - Moderately hard, controlled',
  z4: 'Threshold - Hard, sustainable effort',
  z5: 'VO2 Max - Very hard, short intervals',
};

export default function TIZSettings({ tizTargets, onTIZChange }: TIZSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [distributionMode, setDistributionMode] = useState<'manual' | 'percentage'>('manual');

  const handleZoneChange = (zone: keyof TIZTargets, value: number) => {
    const newTIZ = { ...tizTargets, [zone]: value };
    
    // Recalculate total
    const total = Object.keys(newTIZ)
      .filter(key => key !== 'total')
      .reduce((sum, key) => sum + (newTIZ[key as keyof TIZTargets] as number), 0);
    
    onTIZChange({ ...newTIZ, total });
  };

  const handlePercentageChange = (zone: keyof TIZTargets, percentage: number) => {
    if (distributionMode !== 'percentage') return;
    
    const totalMinutes = tizTargets.total;
    const newMinutes = Math.round((percentage / 100) * totalMinutes);
    handleZoneChange(zone, newMinutes);
  };

  const getZonePercentage = (zone: keyof TIZTargets) => {
    if (tizTargets.total === 0) return 0;
    return Math.round((tizTargets[zone] / tizTargets.total) * 100);
  };

  const getRecommendedDistribution = () => {
    // Common endurance training distribution
    return {
      z1: Math.round(tizTargets.total * 0.60), // 60% Z1
      z2: Math.round(tizTargets.total * 0.25), // 25% Z2
      z3: Math.round(tizTargets.total * 0.10), // 10% Z3
      z4: Math.round(tizTargets.total * 0.04), // 4% Z4
      z5: Math.round(tizTargets.total * 0.01), // 1% Z5
    };
  };

  const applyRecommendedDistribution = () => {
    const recommended = getRecommendedDistribution();
    onTIZChange({
      ...tizTargets,
      ...recommended,
    });
  };

  const zones = [
    { key: 'z1' as keyof TIZTargets, label: 'Zone 1', color: zoneColors.z1 },
    { key: 'z2' as keyof TIZTargets, label: 'Zone 2', color: zoneColors.z2 },
    { key: 'z3' as keyof TIZTargets, label: 'Zone 3', color: zoneColors.z3 },
    { key: 'z4' as keyof TIZTargets, label: 'Zone 4', color: zoneColors.z4 },
    { key: 'z5' as keyof TIZTargets, label: 'Zone 5', color: zoneColors.z5 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
        >
          <span>Time in Zone (TIZ) Targets</span>
          <HiChevronDown className={`h-4 w-4 transform transition-transform ${isExpanded ? '' : '-rotate-180'}`} />
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={applyRecommendedDistribution}
            className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors"
          >
            Apply Recommended
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {/* Distribution Mode Toggle */}
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-600">Distribution Mode:</span>
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setDistributionMode('manual')}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  distributionMode === 'manual' 
                    ? 'bg-white text-slate-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Manual
              </button>
              <button
                type="button"
                onClick={() => setDistributionMode('percentage')}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  distributionMode === 'percentage' 
                    ? 'bg-white text-slate-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Percentage
              </button>
            </div>
          </div>

          {/* Zone Configuration */}
          <div className="space-y-3">
            {zones.map((zone) => (
              <div key={zone.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full border ${zone.color}`}>
                      {zone.label}
                    </span>
                    <span className="text-xs text-slate-500">
                      {zoneDescriptions[zone.key as keyof typeof zoneDescriptions] || ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {distributionMode === 'percentage' && (
                      <span className="text-xs text-slate-500">
                        {getZonePercentage(zone.key)}%
                      </span>
                    )}
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        className={`w-20 border rounded px-2 py-1 text-sm ${zone.color.split(' ')[0].replace('bg-', 'border-')}`}
                        value={tizTargets[zone.key]}
                        onChange={(e) => handleZoneChange(zone.key, Number(e.target.value))}
                        min={0}
                      />
                      <span className="text-xs text-slate-500">min</span>
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="h-2 bg-slate-200 rounded overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${zone.color.split(' ')[0].replace('bg-', 'bg-')}`}
                    style={{ 
                      width: `${tizTargets.total > 0 ? (tizTargets[zone.key] / tizTargets.total) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Total Summary */}
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Total Weekly TIZ</span>
              <span className="text-lg font-bold text-slate-800">{tizTargets.total} minutes</span>
            </div>
            <div className="text-xs text-slate-500">
              {tizTargets.total > 0 ? (
                <span>
                  {Math.round(tizTargets.total / 60)} hours {tizTargets.total % 60} minutes per week
                </span>
              ) : (
                <span>No time allocated to zones</span>
              )}
            </div>
          </div>

          {/* Quick Distribution Buttons */}
          <div className="space-y-2">
            <span className="text-xs text-slate-600">Quick Distributions:</span>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  const base = Math.round(tizTargets.total * 0.8);
                  onTIZChange({
                    ...tizTargets,
                    z1: base,
                    z2: Math.round(tizTargets.total * 0.15),
                    z3: Math.round(tizTargets.total * 0.05),
                    z4: 0,
                    z5: 0,
                  });
                }}
                className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                Base Building (80% Z1)
              </button>
              <button
                type="button"
                onClick={() => {
                  onTIZChange({
                    ...tizTargets,
                    z1: Math.round(tizTargets.total * 0.50),
                    z2: Math.round(tizTargets.total * 0.30),
                    z3: Math.round(tizTargets.total * 0.15),
                    z4: Math.round(tizTargets.total * 0.04),
                    z5: Math.round(tizTargets.total * 0.01),
                  });
                }}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                Balanced (50% Z1)
              </button>
              <button
                type="button"
                onClick={() => {
                  onTIZChange({
                    ...tizTargets,
                    z1: Math.round(tizTargets.total * 0.30),
                    z2: Math.round(tizTargets.total * 0.40),
                    z3: Math.round(tizTargets.total * 0.20),
                    z4: Math.round(tizTargets.total * 0.08),
                    z5: Math.round(tizTargets.total * 0.02),
                  });
                }}
                className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
              >
                High Intensity (30% Z1)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
