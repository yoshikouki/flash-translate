/**
 * Development-only logger utility
 * Only outputs logs when import.meta.env.DEV is true
 */

type LogLevel = "log" | "warn" | "error" | "debug" | "info";

function createLogger(prefix?: string) {
  const formatMessage = (message: string): string => {
    return prefix ? `[${prefix}] ${message}` : message;
  };

  const createLogMethod =
    (level: LogLevel) =>
    (message: string, ...args: unknown[]): void => {
      if (import.meta.env.DEV) {
        console[level](formatMessage(message), ...args);
      }
    };

  return {
    log: createLogMethod("log"),
    warn: createLogMethod("warn"),
    error: createLogMethod("error"),
    debug: createLogMethod("debug"),
    info: createLogMethod("info"),
  };
}

/**
 * Create a logger with a custom prefix
 * @example
 * const log = createPrefixedLogger("i18n");
 * log.warn("Missing translation"); // [i18n] Missing translation
 */
export function createPrefixedLogger(prefix: string) {
  return createLogger(prefix);
}
