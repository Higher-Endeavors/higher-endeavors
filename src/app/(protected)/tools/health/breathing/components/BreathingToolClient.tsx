'use client';

import { useState, useRef, useEffect } from 'react';
import { BreathingOrb } from '(protected)/tools/health/breathing/components/BreathingOrb';
import { SessionControls } from '(protected)/tools/health/breathing/components/SessionControls';
import { SessionTracker } from '(protected)/tools/health/breathing/components/SessionTracker';
import { BreathPattern } from '(protected)/tools/health/breathing/types/breathing';
import { clientLogger } from 'lib/logging/logger.client';

/**
 * Server-Friendly Logging Strategy:
 * - console.log: Debug information (stays completely local, no server requests)
 * - clientLogger.info: Important events sent to server (session start/stop, completion)
 * - clientLogger.warn: Warnings sent to server for debugging
 * - clientLogger.error: Errors sent to server for monitoring
 * 
 * This approach minimizes server load by keeping frequent debug logs local while
 * maintaining important event logging for monitoring and analytics.
 */
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

  // Wake Lock API support
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const [wakeLockSupported, setWakeLockSupported] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);

  // Page visibility tracking
  const [isPageVisible, setIsPageVisible] = useState(true);

  // Fallback keep-alive mechanism for devices without wake lock support
  const keepAliveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize wake lock support
  useEffect(() => {
    // Check if Wake Lock API is supported
    if ('wakeLock' in navigator) {
      setWakeLockSupported(true);
      clientLogger.info('Wake Lock API supported', {}, 'BreathingTool');
    } else {
      clientLogger.warn('Wake Lock API not supported - device may sleep during sessions', {}, 'BreathingTool');
    }
  }, []); // No dependencies needed for this initialization

  // Set up page visibility change listener
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      setIsPageVisible(isVisible);
      
      if (isVisible && isActive) {
        // Important event - log to server
        clientLogger.info('Page became visible, resuming session', { breathCount, sessionDuration }, 'BreathingTool');
        // Resume audio context if it was suspended
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
          // Debug info - stays completely local
          console.log('Audio context resumed after page visibility change');
        }
      } else if (!isVisible && isActive) {
        // Debug info - stays completely local
        console.log('Page became hidden, session continues in background');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive, breathCount, sessionDuration]); // Explicit dependencies

  // Request wake lock when session starts
  const requestWakeLock = async () => {
    if (!wakeLockSupported || wakeLockRef.current) return;

    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
      setWakeLockActive(true);
      clientLogger.info('Wake lock acquired successfully', {}, 'BreathingTool');
      
      // Listen for wake lock release
      wakeLockRef.current.addEventListener('release', () => {
        setWakeLockActive(false);
        clientLogger.warn('Wake lock was released', {}, 'BreathingTool');
      });
    } catch (error) {
      clientLogger.error('Failed to acquire wake lock', error, {}, 'BreathingTool');
    }
  };

  // Release wake lock when session stops
  const releaseWakeLock = async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        setWakeLockActive(false);
        clientLogger.info('Wake lock released successfully', {}, 'BreathingTool');
      } catch (error) {
        clientLogger.error('Failed to release wake lock', error, {}, 'BreathingTool');
      }
    }
  };

  // Cleanup wake lock on component unmount
  useEffect(() => {
    return () => {
      if (wakeLockRef.current) {
        releaseWakeLock();
      }
    };
  }, []); // No dependencies needed for cleanup

  // Start keep-alive mechanism when session starts (fallback for non-wake-lock devices)
  const startKeepAlive = () => {
    if (wakeLockSupported) return; // Only use fallback if wake lock not supported
    
    keepAliveIntervalRef.current = setInterval(() => {
      if (isActive && audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
        // Debug info - stays completely local
        console.log('Keep-alive: Audio context resumed');
      }
    }, 30000); // Every 30 seconds
    
    // Important event - log to server
    clientLogger.info('Keep-alive mechanism started (fallback for non-wake-lock devices)', {}, 'BreathingTool');
  };

  // Stop keep-alive mechanism when session stops
  const stopKeepAlive = () => {
    if (keepAliveIntervalRef.current) {
      clearInterval(keepAliveIntervalRef.current);
      keepAliveIntervalRef.current = null;
      // Debug info - stays completely local
      console.log('Keep-alive mechanism stopped');
    }
  };

  // Cleanup keep-alive on component unmount
  useEffect(() => {
    return () => {
      if (keepAliveIntervalRef.current) {
        clearInterval(keepAliveIntervalRef.current);
      }
    };
  }, []); // No dependencies needed for cleanup

  const playCompletionSound = () => {
    try {
      // Create audio context if it doesn't exist
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;
      
      // Resume audio context if it's suspended (common when page becomes hidden)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
        // Debug info - stays completely local
        console.log('Audio context resumed before playing completion sound');
      }
      
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
    
    // Debug info - stays completely local, no server requests
    console.log('Breath completed', { 
      oldBreathCount: breathCount, 
      newBreathCount, 
      sessionType, 
      sessionValue 
    });
    
    setBreathCount(newBreathCount);
    
    // Check if we've reached the target breath count
    if (sessionType === 'breaths' && sessionValue && newBreathCount >= sessionValue) {
      // This is important - log to server
      clientLogger.info('Target breath count reached, stopping session', { 
        breathCount: newBreathCount, 
        sessionValue, 
        sessionType 
      }, 'BreathingTool');
      setIsActive(false);
      // Play completion sound immediately
      playCompletionSound();
    } else {
      // Debug info - stays completely local
      console.log('Breath count updated, continuing session', { 
        breathCount: newBreathCount, 
        sessionType, 
        sessionValue 
      });
    }
  };

  // Check if we're starting the final breath cycle - called when transitioning to 'inhale'
  const checkIfStartingFinalCycle = (currentBreathCount: number) => {
    // Debug info - stays completely local
    console.log('Checking if starting final breath cycle', { 
      currentBreathCount, 
      sessionValue, 
      sessionType 
    });
    
    if (sessionType === 'breaths' && sessionValue && currentBreathCount >= sessionValue) {
      // Important event - log to server
      clientLogger.info('Final breath cycle starting', { 
        currentBreathCount, 
        sessionValue, 
        sessionType 
      }, 'BreathingTool');
      sessionEndingRef.current = true;
      return true;
    }
    
    // Debug info - stays completely local
    console.log('Not final cycle', { 
      currentBreathCount, 
      sessionValue, 
      sessionType 
    });
    return false;
  };

  const handleSessionUpdate = (duration: number) => {
    // Debug info - stays completely local (called frequently during sessions)
    console.log('Session duration updated', { 
      duration, 
      sessionType, 
      sessionValue, 
      isActive 
    });
    
    setSessionDuration(duration);
    
    // Check if session should end based on duration
    if (sessionType === 'duration' && sessionValue && duration >= sessionValue * 60) {
      // Important event - log to server
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
    // Debug info - stays completely local
    console.log('Final breath complete handler called', { 
      breathCount, 
      sessionType, 
      sessionValue, 
      sessionDuration 
    });
    
    if (sessionType === 'breaths' && sessionValue && breathCount >= sessionValue) {
      // Important event - log to server
      clientLogger.info('Playing completion sound for breath count', { 
        breathCount, 
        sessionValue, 
        sessionType 
      }, 'BreathingTool');
      playCompletionSound();
    } else if (sessionType === 'duration' && sessionValue && sessionDuration >= sessionValue * 60) {
      // Important event - log to server
      clientLogger.info('Playing completion sound for duration', { 
        sessionDuration, 
        sessionValue: sessionValue * 60, 
        sessionType 
      }, 'BreathingTool');
      playCompletionSound();
    } else {
      // Warning - log to server for debugging
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
    requestWakeLock(); // Request wake lock when session starts
    startKeepAlive(); // Start keep-alive mechanism
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
    releaseWakeLock(); // Release wake lock when session stops
    stopKeepAlive(); // Stop keep-alive mechanism
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
            onStopSession={handleStopSession}
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
            wakeLockActive={wakeLockActive}
            wakeLockSupported={wakeLockSupported}
          />
        </div>
      </div>
    </div>
  );
}
