export function calculateSessionPoints(
  duration: number,
  type: "work" | "break" | "long_break",
  streak: number = 0
): number {
  const basePoints: Record<typeof type, number> = {
    work: 10,
    break: 2,
    long_break: 5,
  };

  const durationBonus = Math.floor(duration / 5);

  const streakMultiplier = Math.min(1 + streak * 0.1, 3);

  const points = (basePoints[type] + durationBonus) * streakMultiplier;

  return Math.round(points);
}

export function calculateLevel(points: number): number {
  if (points < 0) return 1;

  const level = Math.floor(Math.sqrt(points / 100)) + 1;

  return level;
}

export function pointsForNextLevel(currentLevel: number): number {
  const nextLevel = currentLevel + 1;

  const pointsNeeded = Math.pow(nextLevel - 1, 2) * 100;

  return pointsNeeded;
}

export function calculateLevelProgress(
  currentPoints: number,
  currentLevel: number
): number {
  const pointsCurrentLevel = Math.pow(currentLevel - 1, 2) * 100;
  const pointsNextLevel = pointsForNextLevel(currentLevel);

  const pointsInCurrentLevel = currentPoints - pointsCurrentLevel;
  const pointsNeededForNextLevel = pointsNextLevel - pointsCurrentLevel;

  const progress = (pointsInCurrentLevel / pointsNeededForNextLevel) * 100;

  return Math.min(Math.max(Math.round(progress), 0), 100);
}

export function shouldMaintainStreak(lastSessionDate: Date): boolean {
  const now = new Date();
  const last = new Date(lastSessionDate);

  now.setHours(0, 0, 0, 0);
  last.setHours(0, 0, 0, 0);

  const diffInDays = Math.floor(
    (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
  );

  return diffInDays <= 1;
}
