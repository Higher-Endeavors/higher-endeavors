import { BreathPattern, BreathTiming } from '(protected)/tools/health/breathing/types/breathing';
import { useState } from 'react';

interface SessionControlsProps {
  selectedPattern: BreathPattern;
  onPatternChange: (pattern: BreathPattern) => void;
  customPattern: BreathTiming;
  onCustomPatternChange: (pattern: BreathTiming) => void;
  pranayamaMultiplier: number;
  onPranayamaMultiplierChange: (multiplier: number) => void;
  sessionType: 'breaths' | 'duration' | 'open';
  onSessionTypeChange: (type: 'breaths' | 'duration' | 'open') => void;
  sessionValue: number | null;
  onSessionValueChange: (value: number | null) => void;
  isActive: boolean;
  onStart: () => void;
  onStop: () => void;
}

export function SessionControls({
  selectedPattern,
  onPatternChange,
  customPattern,
  onCustomPatternChange,
  pranayamaMultiplier,
  onPranayamaMultiplierChange,
  sessionType,
  onSessionTypeChange,
  sessionValue,
  onSessionValueChange,
  isActive,
  onStart,
  onStop
}: SessionControlsProps) {
  const [isOpen, setIsOpen] = useState(true);

  const handleCustomPatternChange = (phase: keyof BreathTiming, value: string) => {
    // Allow empty values - validation will happen when starting session
    if (value === '') {
      onCustomPatternChange({
        ...customPattern,
        [phase]: null
      });
    } else {
      const numValue = parseInt(value);
      if (!isNaN(numValue)) {
        onCustomPatternChange({
          ...customPattern,
          [phase]: numValue
        });
      }
    }
  };

  const handleSessionValueChange = (value: string) => {
    // Allow empty values - validation will happen when starting session
    if (value === '') {
      onSessionValueChange(null);
    } else {
      const numValue = parseInt(value);
      if (!isNaN(numValue)) {
        onSessionValueChange(numValue);
      }
    }
  };

  const getSessionTypeLabel = (type: 'breaths' | 'duration' | 'open') => {
    switch (type) {
      case 'breaths':
        return 'Breath Count';
      case 'duration':
        return 'Duration (minutes)';
      case 'open':
        return 'Open-ended';
      default:
        return '';
    }
  };

  const getSessionTypeDescription = (type: 'breaths' | 'duration' | 'open') => {
    switch (type) {
      case 'breaths':
        return 'Complete a specific number of breath cycles';
      case 'duration':
        return 'Practice for a set amount of time';
      case 'open':
        return 'Practice until you choose to stop';
      default:
        return '';
    }
  };

  const getInputProps = () => {
    switch (sessionType) {
      case 'breaths':
        return {
          type: 'number' as const,
          min: 1,
          max: 100,
          step: 1,
          placeholder: '10'
        };
      case 'duration':
        return {
          type: 'number' as const,
          min: 1,
          max: 120,
          step: 1,
          placeholder: '10'
        };
      case 'open':
        return {
          type: 'text' as const,
          disabled: true,
          placeholder: 'Unlimited',
          value: ''
        };
      default:
        return {};
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <h2 className="text-xl font-semibold text-gray-800">Breathing Settings</h2>
        <button
          className="text-gray-500 hover:text-gray-700 focus:outline-none transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>
      
      {isOpen && (
        <div className="space-y-6 mt-4">
          {/* Breath Style Selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Breath Pattern</h3>
            <div className="space-y-4">

              {/* Pranayama */}
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="pranayama"
                  name="breathPattern"
                  checked={selectedPattern === 'pranayama'}
                  onChange={() => onPatternChange('pranayama')}
                  className="w-4 h-4 text-blue-600"
                />
                <label htmlFor="pranayama" className="flex-1 lg:flex-none">
                  <div className="font-medium text-gray-800">Pranayama</div>
                  <div className="text-sm text-gray-600">
                    {pranayamaMultiplier}-{pranayamaMultiplier}-{pranayamaMultiplier * 2}-{pranayamaMultiplier} pattern
                  </div>
                </label>
                
                {/* Pranayama Multiplier Controls - only visible when selected */}
                {selectedPattern === 'pranayama' && (
                  <div className="flex items-center space-x-2 lg:pl-16">
                    <button
                      type="button"
                      onClick={() => onPranayamaMultiplierChange(Math.max(1, pranayamaMultiplier - 1))}
                      disabled={pranayamaMultiplier <= 1}
                      className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 font-bold text-lg flex items-center justify-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Decrease multiplier"
                    >
                      -
                    </button>
                    <span className="text-lg font-semibold text-blue-600 min-w-[2rem] text-center">
                      {pranayamaMultiplier}
                    </span>
                    <button
                      type="button"
                      onClick={() => onPranayamaMultiplierChange(Math.min(10, pranayamaMultiplier + 1))}
                      disabled={pranayamaMultiplier >= 10}
                      className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 font-bold text-lg flex items-center justify-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Increase multiplier"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>

              

              {/* Box Breathing */}
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="box"
                  name="breathPattern"
                  checked={selectedPattern === 'box'}
                  onChange={() => onPatternChange('box')}
                  className="w-4 h-4 text-blue-600"
                />
                <label htmlFor="box" className="flex-1">
                  <div className="font-medium text-gray-800">Box Breathing</div>
                  <div className="text-sm text-gray-600">4-4-4-4 pattern</div>
                </label>
              </div>

              

              {/* Custom Pattern */}
              <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="custom"
                    name="breathPattern"
                    checked={selectedPattern === 'custom'}
                    onChange={() => onPatternChange('custom')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <label htmlFor="custom" className="flex-1 lg:flex-none">
                    <div className="font-medium text-gray-800">Custom Pattern</div>
                    <div className="text-sm text-gray-600">Set your own timing for each phase</div>
                  </label>
                </div>
                
                {/* Custom Pattern Inputs - only visible when selected */}
                {selectedPattern === 'custom' && (
                  <div className="lg:ml-4">
                    {/* Mobile: Stacked layout */}
                    <div className="lg:hidden grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <label htmlFor="inhale" className="text-xs text-gray-600 w-16">Inhale:</label>
                        <input
                          type="number"
                          id="inhale"
                          min="1"
                          max="30"
                          value={customPattern.inhale?.toString() || ''}
                          onChange={(e) => handleCustomPatternChange('inhale', e.target.value)}
                          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-center dark:text-gray-600"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <label htmlFor="pause1" className="text-xs text-gray-600 w-16">Pause:</label>
                        <input
                          type="number"
                          id="pause1"
                          min="0"
                          max="30"
                          value={customPattern.pause1?.toString() || ''}
                          onChange={(e) => handleCustomPatternChange('pause1', e.target.value)}
                          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-center dark:text-gray-600"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <label htmlFor="exhale" className="text-xs text-gray-600 w-16">Exhale:</label>
                        <input
                          type="number"
                          id="exhale"
                          min="1"
                          max="30"
                          value={customPattern.exhale?.toString() || ''}
                          onChange={(e) => handleCustomPatternChange('exhale', e.target.value)}
                          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-center dark:text-gray-600"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <label htmlFor="pause2" className="text-xs text-gray-600 w-16">Pause:</label>
                        <input
                          type="number"
                          id="pause2"
                          min="0"
                          max="30"
                          value={customPattern.pause2?.toString() || ''}
                          onChange={(e) => handleCustomPatternChange('pause2', e.target.value)}
                          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-center dark:text-gray-600"
                        />
                      </div>
                    </div>
                    
                    {/* Desktop: Inline layout */}
                    <div className="hidden lg:flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <label htmlFor="inhale-desktop" className="text-xs text-gray-600">Inhale:</label>
                        <input
                          type="number"
                          id="inhale-desktop"
                          min="1"
                          max="30"
                          value={customPattern.inhale?.toString() || ''}
                          onChange={(e) => handleCustomPatternChange('inhale', e.target.value)}
                          className="w-12 px-1 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-center dark:text-gray-600"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <label htmlFor="pause1-desktop" className="text-xs text-gray-600">Pause:</label>
                        <input
                          type="number"
                          id="pause1-desktop"
                          min="0"
                          max="30"
                          value={customPattern.pause1?.toString() || ''}
                          onChange={(e) => handleCustomPatternChange('pause1', e.target.value)}
                          className="w-12 px-1 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-center dark:text-gray-600"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <label htmlFor="exhale-desktop" className="text-xs text-gray-600">Exhale:</label>
                        <input
                          type="number"
                          id="exhale-desktop"
                          min="1"
                          max="30"
                          value={customPattern.exhale?.toString() || ''}
                          onChange={(e) => handleCustomPatternChange('exhale', e.target.value)}
                          className="w-12 px-1 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-center dark:text-gray-600"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <label htmlFor="pause2-desktop" className="text-xs text-gray-600">Pause:</label>
                        <input
                          type="number"
                          id="pause2-desktop"
                          min="0"
                          max="30"
                          value={customPattern.pause2?.toString() || ''}
                          onChange={(e) => handleCustomPatternChange('pause2', e.target.value)}
                          className="w-12 px-1 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-center dark:text-gray-600"
                        />
                      </div>
                      
                      <div className="text-xs text-gray-500 ml-2">
                        {customPattern.inhale || '?'}-{customPattern.pause1 || '?'}-{customPattern.exhale || '?'}-{customPattern.pause2 || '?'}
                      </div>
                    </div>
                    
                    {/* Pattern display for mobile */}
                    <div className="lg:hidden text-xs text-gray-500 mt-2 text-center">
                      Pattern: {customPattern.inhale || '?'}-{customPattern.pause1 || '?'}-{customPattern.exhale || '?'}-{customPattern.pause2 || '?'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Session Type Selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Session Type</h3>
            <div className="space-y-3">
              {(['breaths', 'duration', 'open'] as const).map((type) => (
                <div key={type} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id={type}
                    name="sessionType"
                    checked={sessionType === type}
                    onChange={() => onSessionTypeChange(type)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <label htmlFor={type} className="flex-1">
                    <div className="font-medium text-gray-800">{getSessionTypeLabel(type)}</div>
                    <div className="text-sm text-gray-600">{getSessionTypeDescription(type)}</div>
                  </label>
                </div>
              ))}
            </div>

            {/* Session Value Input */}
            {sessionType !== 'open' && (
              <div className="pt-4">
                <label htmlFor="sessionValue" className="block text-sm font-medium text-gray-800 mb-2">
                  {getSessionTypeLabel(sessionType)}
                </label>
                <input
                  id="sessionValue"
                  value={sessionValue?.toString() || ''}
                  onChange={(e) => handleSessionValueChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  {...getInputProps()}
                />
                {sessionType === 'duration' && (
                  <div className="text-xs text-gray-600 mt-1">
                    Session will automatically end after {sessionValue} minute{sessionValue !== 1 ? 's' : ''}
                  </div>
                )}
                {sessionType === 'breaths' && (
                  <div className="text-xs text-gray-600 mt-1">
                    Session will automatically end after {sessionValue} breath cycle{sessionValue !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Start/Stop Controls */}
          <div className="pt-4">
            {!isActive ? (
              <button
                onClick={onStart}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Start Breathing Session
              </button>
            ) : (
              <button
                onClick={onStop}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Stop Session
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
