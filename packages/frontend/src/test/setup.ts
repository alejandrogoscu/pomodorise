import "@testing-library/jest-dom";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { vi } from "vitest";

afterEach(() => {
  cleanup();
});

global.jest = {
  useFakeTimers: () => vi.useFakeTimers(),
  clearAllTimers: () => vi.clearAllTimers(),
  advanceTimersByTime: (ms: number) => vi.advanceTimersByTime(ms),
} as any;
