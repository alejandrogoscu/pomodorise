import "@testing-library/jest-dom";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { vi } from "vitest";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock timers globally
global.jest = {
  useFakeTimers: () => vi.useFakeTimers(),
  clearAllTimers: () => vi.clearAllTimers(),
  advanceTimersByTime: (ms: number) => vi.advanceTimersByTime(ms),
} as any;
