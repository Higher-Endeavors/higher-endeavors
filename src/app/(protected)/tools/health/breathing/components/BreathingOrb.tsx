'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { BreathTiming } from '(protected)/tools/health/breathing/types/breathing';

interface BreathingOrbProps {
  pattern: BreathTiming;
  isActive: boolean;
  onBreathComplete: () => void;
  onSessionUpdate: (duration: number) => void;
  breathCount: number;
  onStartSession: () => void;
  onStopSession: () => void;
  onFinalBreathComplete: () => void;
  sessionEnding: boolean;
  onCheckFinalCycle: (currentBreathCount: number) => void;
}

export function BreathingOrb({
  pattern,
  isActive,
  onBreathComplete,
  onSessionUpdate,
  breathCount,
  onStartSession,
  onStopSession,
  onFinalBreathComplete,
  sessionEnding,
  onCheckFinalCycle
}: BreathingOrbProps) {
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'pause1' | 'exhale' | 'pause2'>('inhale');
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [orbSize, setOrbSize] = useState(200);
  const [currentColor, setCurrentColor] = useState('#3B82F6'); // Simple blue color
  
  const sessionStartTime = useRef<number>(0);
  const phaseStartTime = useRef<number>(0);
  const animationFrameId = useRef<number | undefined>(undefined);
  const speechSynthesis = useRef<SpeechSynthesis | null>(null);
  const speechUtterance = useRef<SpeechSynthesisUtterance | null>(null);
  const animateBreathingRef = useRef<(() => void) | null>(null);
  const checkFinalCycleRef = useRef<((currentBreathCount: number) => void) | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize speech synthesis - single responsibility
  useEffect(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.current = window.speechSynthesis;
      speechUtterance.current = new SpeechSynthesisUtterance();
      speechUtterance.current.rate = 0.8;
      speechUtterance.current.pitch = 1.0;
      speechUtterance.current.volume = 0.8;
    }
  }, []); // No dependencies needed for initialization

  // Handle breathing cycle start/stop based on isActive changes - single responsibility
  useEffect(() => {
    if (isActive && !animationFrameId.current) {
      // Schedule the start for the next tick to avoid render issues
      const timer = setTimeout(() => {
        if (isActive && !animationFrameId.current) {
          startBreathingCycle();
        }
      }, 0);
      
      return () => clearTimeout(timer);
    }
    
    if (!isActive && animationFrameId.current) {
      // Stop breathing cycle
      if (animationFrameId.current !== undefined) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = undefined;
      }
      setCurrentPhase('inhale');
      setPhaseProgress(0);
      setOrbSize(200);
    }
  }, [isActive]); // Only depend on isActive, startBreathingCycle is defined below

  // Cleanup animation frame on unmount - single responsibility
  useEffect(() => {
    return () => {
      if (animationFrameId.current !== undefined) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []); // No dependencies needed for cleanup

  // Speech synthesis function
  const speak = useCallback((text: string) => {
    if (speechSynthesis.current && speechUtterance.current) {
      speechUtterance.current.text = text;
      speechSynthesis.current.speak(speechUtterance.current);
    }
  }, []);

  const getPhaseDuration = useCallback((phase: string): number => {
    switch (phase) {
      case 'inhale':
        return pattern.inhale || 4;
      case 'pause1':
        return pattern.pause1 || 0;
      case 'exhale':
        return pattern.exhale || 4;
      case 'pause2':
        return pattern.pause2 || 0;
      default:
        return 4;
    }
  }, [pattern]);

  const getPhaseInstruction = useCallback((phase: string): string => {
    switch (phase) {
      case 'inhale':
        return 'Inhale';
      case 'pause1':
        return 'Pause';
      case 'exhale':
        return 'Exhale';
      case 'pause2':
        return 'Pause';
      default:
        return '';
    }
  }, []);

  const getOrbSizeForPhase = useCallback((phase: string, progress: number): number => {
    // COMMENTED OUT: Orb expansion/contraction animation
    // const baseSize = 200;
    // const maxExpansion = 100;
    
    // switch (phase) {
    //   case 'inhale':
    //     // Expand during inhale
    //     return baseSize + (maxExpansion * progress);
    //   case 'pause1':
    //     // Stay expanded
    //     return baseSize + maxExpansion;
    //   case 'exhale':
    //     // Contract during exhale
    //     return baseSize + (maxExpansion * (1 - progress));
    //   case 'pause2':
    //     // Stay contracted
    //     return baseSize;
    //   default:
    //     return baseSize;
    // }
    
    // Keep orb at fixed size for now
    return 200;
  }, []);

  const getNextPhase = useCallback((current: string): 'inhale' | 'pause1' | 'exhale' | 'pause2' => {
    switch (current) {
      case 'inhale':
        return 'pause1';
      case 'pause1':
        return 'exhale';
      case 'exhale':
        return 'pause2';
      case 'pause2':
        return 'inhale';
      default:
        return 'inhale';
    }
  }, []);

  const startBreathingCycle = useCallback(() => {
    if (!isActive) return;

    sessionStartTime.current = Date.now();
    phaseStartTime.current = Date.now();
    setCurrentPhase('inhale');
    setPhaseProgress(0);
    setOrbSize(200);
    
    // Speak the first instruction
    speak('Inhale');
    
    // Start the animation loop
    if (animateBreathingRef.current) {
      animateBreathingRef.current();
    }
  }, [isActive, speak]);

  const animateBreathing = useCallback(() => {
    if (!isActive) return;

    const now = Date.now();
    const phaseDuration = getPhaseDuration(currentPhase) * 1000; // Convert to milliseconds
    const phaseElapsed = now - phaseStartTime.current;
    const progress = Math.min(phaseElapsed / phaseDuration, 1);

    setPhaseProgress(progress);
    setOrbSize(getOrbSizeForPhase(currentPhase, progress));

    // Update session duration
    const sessionElapsed = Math.floor((now - sessionStartTime.current) / 1000);
    onSessionUpdate(sessionElapsed);

    if (progress >= 1) {
      // Phase complete, move to next phase
      const nextPhase = getNextPhase(currentPhase);
      
      console.log(`Phase complete: ${currentPhase} -> ${nextPhase}, Progress: ${progress}`);
      
      // Check isActive again before proceeding
      if (!isActive) {
        console.log(`🛑 Session stopped during phase transition, stopping animation`);
        return;
      }
      
      if (nextPhase === 'inhale') {
        // Starting a new breath cycle
        console.log(`🔄 Starting new breath cycle ${breathCount + 1}`);
      }
      
      // Reset for next phase
      setCurrentPhase(nextPhase);
      setPhaseProgress(0);
      phaseStartTime.current = now;
      
      // If we just completed a breath cycle (transitioning from pause2 to inhale), update the count
      if (currentPhase === 'pause2' && nextPhase === 'inhale') {
        console.log(`🔄 Breath cycle completed, calling onBreathComplete`);
        onBreathComplete();
        
        // Check if session was stopped by handleBreathComplete
        if (!isActive) {
          console.log(`🛑 Session stopped, ending animation loop`);
          return; // Stop animation loop
        }
      }
      
      // Speak the next instruction only if session is still active
      if (isActive) {
        speak(getPhaseInstruction(nextPhase));
        
        // Schedule next frame with a small delay to ensure state updates
        setTimeout(() => {
          if (isActive && animateBreathingRef.current) {
            animateBreathingRef.current();
          }
        }, 50);
      }
      return; // Exit early to avoid double animation frame
    }

    // Continue animation - ensure this always runs when active
    if (isActive) {
      animationFrameId.current = requestAnimationFrame(animateBreathing);
    }
  }, [
    isActive,
    currentPhase,
    getPhaseDuration,
    getOrbSizeForPhase,
    onBreathComplete,
    onSessionUpdate,
    getPhaseInstruction,
    speak,
    breathCount,
    getNextPhase
  ]);

  // Store the function in the ref to avoid circular dependencies
  animateBreathingRef.current = animateBreathing;
  checkFinalCycleRef.current = onCheckFinalCycle;

  return (
    <div className="relative flex flex-col items-center">
      {/* Breathing Orb */}
      <div
        className="relative cursor-pointer transition-all duration-300 ease-in-out"
        style={{
          width: `${orbSize}px`,
          height: `${orbSize}px`
        }}
        onClick={() => {
          if (!isActive) {
            onStartSession();
          } else {
            onStopSession();
          }
        }}
      >
        {/* Main Orb */}
        <div
          className="absolute inset-0 rounded-full shadow-2xl flex items-center justify-center text-white font-bold text-xl transition-all duration-300 ease-in-out"
          style={{
            backgroundColor: currentColor,
            boxShadow: `0 0 40px ${currentColor}40, inset 0 0 40px ${currentColor}20`
          }}
        >
          <div className="text-center">
            <div className="text-2xl font-bold mb-2">
              {getPhaseInstruction(currentPhase)}
            </div>
            <div className="text-sm opacity-80">
              {Math.ceil(getPhaseDuration(currentPhase) - (phaseProgress * getPhaseDuration(currentPhase)))}s
            </div>
          </div>
        </div>

        {/* Phase Progress Ring */}
        <svg
          className="absolute inset-0 w-full h-full transform -rotate-90"
          style={{ width: orbSize, height: orbSize }}
        >
          <circle
            cx={orbSize / 2}
            cy={orbSize / 2}
            r={(orbSize / 2) - 10}
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="4"
            fill="none"
          />
          <circle
            cx={orbSize / 2}
            cy={orbSize / 2}
            r={(orbSize / 2) - 10}
            stroke="rgba(255, 255, 255, 0.8)"
            strokeWidth="4"
            fill="none"
            strokeDasharray={`${2 * Math.PI * ((orbSize / 2) - 10)}`}
            strokeDashoffset={`${2 * Math.PI * ((orbSize / 2) - 10) * (1 - phaseProgress)}`}
            className="transition-all duration-100 ease-out"
          />
        </svg>
      </div>

      {/* Instructions */}
      {!isActive && (
        <div className="text-center mt-8">
          <div className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            Click to Start Breathing
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Select your breath pattern and click start to begin
          </div>
        </div>
      )}
    </div>
  );
}