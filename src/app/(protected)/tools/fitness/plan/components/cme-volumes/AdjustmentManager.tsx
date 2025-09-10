import React, { useState } from 'react';
import { HiPlus, HiTrash, HiClock, HiCog, HiExclamationTriangle } from 'react-icons/hi';
import type { VolumeAdjustment, AdjustmentType } from './VolumeAdjustmentTypes';

interface AdjustmentManagerProps {
  adjustments: VolumeAdjustment[];
  onAddAdjustment: (type: AdjustmentType) => void;
  onRemoveAdjustment: (adjustmentId: string) => void;
  onEditAdjustment: (adjustmentId: string) => void;
}

const adjustmentTypeConfig = {
  temporary: {
    icon: HiClock,
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    label: 'Temporary',
    description: 'Quick fixes that auto-revert'
  },
  structural: {
    icon: HiCog,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    label: 'Structural',
    description: 'Plan restructure changes'
  },
  recovery: {
    icon: HiExclamationTriangle,
    color: 'bg-red-100 text-red-700 border-red-200',
    label: 'Recovery',
    description: 'Extended recovery periods'
  },
  emergency: {
    icon: HiExclamationTriangle,
    color: 'bg-red-100 text-red-700 border-red-200',
    label: 'Emergency',
    description: 'Injury or illness adjustments'
  }
};

export default function AdjustmentManager({
  adjustments,
  onAddAdjustment,
  onRemoveAdjustment,
  onEditAdjustment
}: AdjustmentManagerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getAdjustmentTypeConfig = (type: AdjustmentType) => {
    return adjustmentTypeConfig[type] || adjustmentTypeConfig.temporary;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (adjustment: VolumeAdjustment) => {
    if (!adjustment.expiresAt) return false;
    return new Date() > new Date(adjustment.expiresAt);
  };

  const isActive = (adjustment: VolumeAdjustment) => {
    if (isExpired(adjustment)) return false;
    return true;
  };

  const activeAdjustments = adjustments.filter(isActive);
  const expiredAdjustments = adjustments.filter(isExpired);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
        >
          <span>Volume Adjustments</span>
          <span className={`px-2 py-1 text-xs rounded-full ${
            activeAdjustments.length > 0 
              ? 'bg-amber-100 text-amber-700' 
              : 'bg-slate-100 text-slate-600'
          }`}>
            {activeAdjustments.length} active
          </span>
        </button>
        
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onAddAdjustment('temporary')}
            className="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition-colors"
            title="Quick adjustment"
          >
            <HiClock className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => onAddAdjustment('structural')}
            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            title="Structural change"
          >
            <HiCog className="h-3 w-3" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-3">
          {/* Active Adjustments */}
          {activeAdjustments.length > 0 ? (
            <div className="space-y-2">
              <h5 className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                Active Adjustments
              </h5>
              {activeAdjustments.map((adjustment) => {
                const config = getAdjustmentTypeConfig(adjustment.type);
                const Icon = config.icon;
                
                return (
                  <div
                    key={adjustment.id}
                    className={`p-3 rounded-lg border ${config.color}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        <Icon className="h-4 w-4 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {config.label} - Week {adjustment.weekNumber + 1}
                            </span>
                            {adjustment.expiresAt && (
                              <span className="text-xs text-slate-500">
                                (expires {formatDate(adjustment.expiresAt)})
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mt-1">
                            {adjustment.description}
                          </p>
                          {adjustment.notes && (
                            <p className="text-xs text-slate-500 mt-1 italic">
                              "{adjustment.notes}"
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                            <span>Applied: {formatDate(adjustment.appliedAt)}</span>
                            <span>By: {adjustment.createdBy}</span>
                            {adjustment.volumeMultiplier && (
                              <span>
                                Volume: {Math.round(adjustment.volumeMultiplier * 100)}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => onEditAdjustment(adjustment.id)}
                          className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveAdjustment(adjustment.id)}
                          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        >
                          <HiTrash className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-slate-500">No active adjustments</p>
              <p className="text-xs text-slate-400 mt-1">
                Plan is following the original schedule
              </p>
            </div>
          )}

          {/* Expired Adjustments */}
          {expiredAdjustments.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                Recent Adjustments
              </h5>
              <div className="space-y-1">
                {expiredAdjustments.slice(0, 3).map((adjustment) => {
                  const config = getAdjustmentTypeConfig(adjustment.type);
                  const Icon = config.icon;
                  
                  return (
                    <div
                      key={adjustment.id}
                      className="p-2 rounded bg-slate-50 border border-slate-200"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-3 w-3 text-slate-400" />
                        <span className="text-xs text-slate-600">
                          {config.label} - Week {adjustment.weekNumber + 1} (expired)
                        </span>
                        <span className="text-xs text-slate-400">
                          {formatDate(adjustment.expiresAt!)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
