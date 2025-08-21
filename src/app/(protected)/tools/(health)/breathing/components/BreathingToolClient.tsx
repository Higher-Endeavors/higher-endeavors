'use client';

import { useState, useRef } from 'react';
import { BreathingOrb } from './BreathingOrb';
import { SessionControls } from './SessionControls';
import { SessionTracker } from './SessionTracker';
import { BreathPattern } from '../types/breathing';
import { clientLogger } from '@/app/lib/logging/logger.client';

export default function BreathingToolClient() {
  const [selectedPattern, setSelectedPattern] = useState<BreathPattern>('pranayama');
  const [customPattern, setCustomPattern] = useState<{ inhale: number | null; pause1: number | null; exhale: number | null; pause2: number | null }>({ inhale: 4, pause1: 4, exhale: 4, pause2: 4 });
  const [pranayamaMultiplier, setPranayamaMultiplier] = useState(2);
  const [sessionType, setSessionType] = useState<'breaths' | 'duration' | 'open'>('breaths');
  const [sessionValue, setSessionValue] = useState<number | null>(10);
  const [isActive, setIsActive] = useState(false);
  const [breathCount, setBreathCount] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(0);

  // Audio context for completion sound
  const audioContextRef = useRef<AudioContext | null>(null);
  
  // Ref to track session state immediately (avoid async state update issues)
  const sessionEndingRef = useRef<boolean>(false);

  const playCompletionSound = () => {
    try {
      // Create audio context if it doesn't exist
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;
      
      // Create a gentle, calming completion sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Gentle sine wave at 440Hz (A note) - calming frequency
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      oscillator.type = 'sine';
      
      // Fade in and out for subtle effect
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.8);
      
      // Play the sound
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.8);
      
      clientLogger.info('Completion sound played successfully', { 
        sessionType, 
        sessionValue, 
        breathCount, 
        sessionDuration 
      }, 'BreathingTool');
      
    } catch (error) {
      clientLogger.error('Failed to play completion sound', error, { 
        sessionType, 
        sessionValue, 
        breathCount, 
        sessionDuration 
      }, 'BreathingTool');
    }
  };

  const getCurrentPattern = (): { inhale: number; pause1: number; exhale: number; pause2: number } => {
    switch (selectedPattern) {
      case 'box':
        return { inhale: 4, pause1: 4, exhale: 4, pause2: 4 };
      case 'pranayama':
        return { 
          inhale: 1 * pranayamaMultiplier, 
          pause1: 1 * pranayamaMultiplier, 
          exhale: 2 * pranayamaMultiplier, 
          pause2: 1 * pranayamaMultiplier 
        };
      case 'custom':
        return { 
          inhale: customPattern.inhale || 4, 
          pause1: customPattern.pause1 || 0, 
          exhale: customPattern.exhale || 4, 
          pause2: customPattern.pause2 || 0 
        };
      default:
        return { inhale: 4, pause1: 4, exhale: 4, pause2: 4 };
    }
  };

  // Handle breath completion - now just updates the count, doesn't trigger session ending
  const handleBreathComplete = () => {
    const newBreathCount = breathCount + 1;
    clientLogger.debug('Breath completed', { 
      oldBreathCount: breathCount, 
      newBreathCount, 
      sessionType, 
      sessionValue 
    }, 'BreathingTool');
    
    setBreathCount(newBreathCount);
    
    // Check if we've reached the target breath count
    if (sessionType === 'breaths' && sessionValue && newBreathCount >= sessionValue) {
      clientLogger.info('Target breath count reached, stopping session', { 
        breathCount: newBreathCount, 
        sessionValue, 
        sessionType 
      }, 'BreathingTool');
      setIsActive(false);
      // Play completion sound immediately
      playCompletionSound();
    } else {
      clientLogger.debug('Breath count updated, continuing session', { 
        breathCount: newBreathCount, 
        sessionType, 
        sessionValue 
      }, 'BreathingTool');
    }
  };

  // Check if we're starting the final breath cycle - called when transitioning to 'inhale'
  const checkIfStartingFinalCycle = (currentBreathCount: number) => {
    clientLogger.debug('Checking if starting final breath cycle', { 
      currentBreathCount, 
      sessionValue, 
      sessionType 
    }, 'BreathingTool');
    
    if (sessionType === 'breaths' && sessionValue && currentBreathCount >= sessionValue) {
      clientLogger.info('Final breath cycle starting', { 
        currentBreathCount, 
        sessionValue, 
        sessionType 
      }, 'BreathingTool');
      sessionEndingRef.current = true;
      return true;
    }
    
    clientLogger.debug('Not final cycle', { 
      currentBreathCount, 
      sessionValue, 
      sessionType 
    }, 'BreathingTool');
    return false;
  };

  const handleSessionUpdate = (duration: number) => {
    clientLogger.debug('Session duration updated', { 
      duration, 
      sessionType, 
      sessionValue, 
      isActive 
    }, 'BreathingTool');
    
    setSessionDuration(duration);
    
    // Check if session should end based on duration
    if (sessionType === 'duration' && sessionValue && duration >= sessionValue * 60) {
      clientLogger.info('Duration limit reached, stopping session', { 
        duration, 
        sessionValue: sessionValue * 60, 
        sessionType 
      }, 'BreathingTool');
      // Mark session as ending immediately using ref
      sessionEndingRef.current = true;
      setIsActive(false);
    }
  };

  // Handle session completion after the final breath cycle finishes
  const handleFinalBreathComplete = () => {
    clientLogger.debug('Final breath complete handler called', { 
      breathCount, 
      sessionType, 
      sessionValue, 
      sessionDuration 
    }, 'BreathingTool');
    
    if (sessionType === 'breaths' && sessionValue && breathCount >= sessionValue) {
      clientLogger.info('Playing completion sound for breath count', { 
        breathCount, 
        sessionValue, 
        sessionType 
      }, 'BreathingTool');
      playCompletionSound();
    } else if (sessionType === 'duration' && sessionValue && sessionDuration >= sessionValue * 60) {
      clientLogger.info('Playing completion sound for duration', { 
        sessionDuration, 
        sessionValue: sessionValue * 60, 
        sessionType 
      }, 'BreathingTool');
      playCompletionSound();
    } else {
      clientLogger.warn('No completion sound conditions met', { 
        breathCount, 
        sessionDuration, 
        sessionType, 
        sessionValue 
      }, 'BreathingTool');
    }
  };

  const handleStartSession = () => {
    clientLogger.info('Starting new breathing session', { 
      sessionType, 
      sessionValue 
    }, 'BreathingTool');
    
    setIsActive(true);
    setBreathCount(0);
    setSessionDuration(0);
    sessionEndingRef.current = false; // Reset the ending flag
  };

  const handleStopSession = () => {
    clientLogger.info('Manually stopping breathing session', { 
      breathCount, 
      sessionDuration, 
      sessionType, 
      sessionValue 
    }, 'BreathingTool');
    
    setIsActive(false);
    sessionEndingRef.current = false;
  };

  return (
    <div className="rounded-lg shadow-md p-6 pt-6">
      

      <div className="flex flex-col space-y-6">
        {/* Breathing Orb - Top */}
        <div className="flex justify-center">
          <BreathingOrb
            pattern={getCurrentPattern()}
            isActive={isActive}
            onBreathComplete={handleBreathComplete}
            onSessionUpdate={handleSessionUpdate}
            breathCount={breathCount}
            onStartSession={handleStartSession}
            onFinalBreathComplete={handleFinalBreathComplete}
            sessionEnding={sessionEndingRef.current}
            onCheckFinalCycle={checkIfStartingFinalCycle}
          />
        </div>

        {/* Content Blocks - Below */}
        <div className="space-y-6">
          <SessionControls
            selectedPattern={selectedPattern}
            onPatternChange={setSelectedPattern}
            customPattern={customPattern}
            onCustomPatternChange={setCustomPattern}
            pranayamaMultiplier={pranayamaMultiplier}
            onPranayamaMultiplierChange={setPranayamaMultiplier}
            sessionType={sessionType}
            onSessionTypeChange={setSessionType}
            sessionValue={sessionValue}
            onSessionValueChange={setSessionValue}
            isActive={isActive}
            onStart={handleStartSession}
            onStop={handleStopSession}
          />

          <SessionTracker
            breathCount={breathCount}
            sessionDuration={sessionDuration}
            isActive={isActive}
          />
        </div>
      </div>
    </div>
  );
}
