// A simple debug utility for logging information in development
// that will be stripped out in production

const isDebugEnabled = process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development';

export const debug = {
  log: (...args: any[]) => {
    if (isDebugEnabled) {
      console.log('[DEBUG]', ...args);
    }
  },
  
  error: (...args: any[]) => {
    if (isDebugEnabled) {
      console.error('[DEBUG ERROR]', ...args);
    }
  },
  
  info: (...args: any[]) => {
    if (isDebugEnabled) {
      console.info('[DEBUG INFO]', ...args);
    }
  },
  
  warn: (...args: any[]) => {
    if (isDebugEnabled) {
      console.warn('[DEBUG WARN]', ...args);
    }
  },
  
  trace: (...args: any[]) => {
    if (isDebugEnabled) {
      console.trace('[DEBUG TRACE]', ...args);
    }
  },
  
  // Useful for inspecting large objects
  inspect: (label: string, obj: any) => {
    if (isDebugEnabled) {
      try {
        console.log(`[DEBUG INSPECT] ${label}:`, JSON.stringify(obj, null, 2));
      } catch (e) {
        console.log(`[DEBUG INSPECT] ${label}: Error stringifying object`, e);
      }
    }
  }
}; 