import { renderHook, act } from "@testing-library/react";
import { useTimer } from "../hooks/useTimer";
import { vi } from "vitest";

vi.useFakeTimers();

describe("useTimer", () => {
  afterEach(() => {
    vi.clearAllTimers();
  });

  test("debe inicializar con estado idle y 25 minutos", () => {
    const { result } = renderHook(() => useTimer());

    expect(result.current.status).toBe("idle");
    expect(result.current.type).toBe("work");
    expect(result.current.timeLeft).toBe(25 * 60); // 25 minutos en segundos
  });

  test("debe cambiar a running al hacer start", () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.start();
    });

    expect(result.current.status).toBe("running");
  });

  test("debe decrementar timeLeft cada segundo", () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.start();
    });

    const initialTime = result.current.timeLeft;

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.timeLeft).toBe(initialTime - 3);
  });

  test("debe pausar el timer", () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    act(() => {
      result.current.pause();
    });

    const pausedTime = result.current.timeLeft;

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.timeLeft).toBe(pausedTime);
    expect(result.current.status).toBe("paused");
  });

  test("debe resetear el timer", () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.start();
      vi.advanceTimersByTime(5000);
      result.current.reset();
    });

    expect(result.current.status).toBe("idle");
    expect(result.current.timeLeft).toBe(25 * 60); // Volver a 25 minutos
  });

  test("debe cambiar a break después de work", () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.skip();
    });

    expect(result.current.type).toBe("break");
    expect(result.current.timeLeft).toBe(5 * 60); // 5 minutos de break
    expect(result.current.completedPomodoros).toBe(1);
  });

  test("debe cambiar a long_break después de 4 pomodoros", () => {
    const { result } = renderHook(() => useTimer());

    act(() => result.current.skip()); // 1
    act(() => result.current.skip());
    act(() => result.current.skip()); // 2
    act(() => result.current.skip());
    act(() => result.current.skip()); // 3
    act(() => result.current.skip());
    act(() => result.current.skip()); // 4

    expect(result.current.type).toBe("long_break");
    expect(result.current.completedPomodoros).toBe(4);
  });
});
