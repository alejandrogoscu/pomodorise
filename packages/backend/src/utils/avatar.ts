import { AVATAR_OPTIONS } from "@pomodorise/shared";

export const getRandomAvatar = (): string => {
  const randomIndex = Math.floor(Math.random() * AVATAR_OPTIONS.length);
  return AVATAR_OPTIONS[randomIndex];
};
