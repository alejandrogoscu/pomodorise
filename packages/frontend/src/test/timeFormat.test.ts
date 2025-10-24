import { formatTime, calculateProgress } from "../utils/timeFormat";

describe("timeFormat", () => {
  test("debe formatear segundos a MM:SS", () => {
    expect(formatTime(0)).toBe("00:00");
    expect(formatTime(60)).toBe("01:00");
    expect(formatTime(125)).toBe("02:05");
    expect(formatTime(3599)).toBe("59:59");
  });

  test("debe calcular progreso correctamente", () => {
    expect(calculateProgress(25 * 60, 25 * 60)).toBe(0); // Inicio
    expect(calculateProgress(0, 25 * 60)).toBe(100); // Final
    expect(calculateProgress(12.5 * 60, 25 * 60)).toBe(50); // Mitad
  });
});
