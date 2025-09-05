// Wake Lock API TypeScript declarations
interface WakeLockSentinel extends EventTarget {
  released: boolean;
  addEventListener(type: 'release', listener: EventListener): void;
  removeEventListener(type: 'release', listener: EventListener): void;
}

interface WakeLock {
  request(type: 'screen'): Promise<WakeLockSentinel>;
}

interface Navigator {
  wakeLock?: WakeLock;
}

declare global {
  interface Navigator {
    wakeLock?: WakeLock;
  }
}
