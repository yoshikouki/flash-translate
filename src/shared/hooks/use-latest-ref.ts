import { useRef } from "react";

/**
 * Returns a ref that always contains the latest value.
 *
 * This is useful when you need to access the current value in an effect's cleanup
 * or event handlers without causing the effect to re-run when the value changes.
 *
 * Common use cases:
 * - Accessing current state in mouseup/mousedown handlers
 * - Getting latest callback in cleanup functions
 * - Avoiding stale closures in async operations
 *
 * @param value The value to keep current
 * @returns A ref object that always contains the latest value
 */
export function useLatestRef<T>(value: T): React.RefObject<T> {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}
