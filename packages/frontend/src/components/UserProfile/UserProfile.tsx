/*
 * Componente UserProfile - Tarjeta de perfil del usuario
 *
 * Teacher note:
 * - Componente presentacional que muestra nivel, puntos y racha
 * - Usa useAuth() para obtener datos del usuario (no duplica estado)
 * - Usa funciones de shared/score.ts para calcular progreso de nivel
 * - CSS separado para mantener componente limpio
 *
 * Analogía: UserProfile es como una tarjeta de identificación gamificada
 * (muestra quién eres y tu progreso en el juego)
 */

import { useAuth } from "../../context/AuthContext";
import { calculateLevelProgress, pointsForNextLevel } from "@pomodorise/shared";
import LevelProgress from "./LevelProgress";
import "./UserProfile.css";

/*
 * Componente UserProfile
 *
 * @returns Tarjeta con avatar, nivel, puntos y racha del usuario
 *
 * @example
 * <UserProfile />
 *
 * Teacher note:
 * - No recibe props (obtiene datos de useAuth)
 * - Si no hay usuario autenticado, no renderiza nada
 * - Usa subcomponente LevelProgress para la barra de progreso
 */
function UserProfile() {
  const { user, isAuthenticated } = useAuth();

  /*
   * Si no hay usuario autenticado, no mostrar nada
   *
   * Teacher note:
   * - Evita errores de null reference
   * - Permite usar el componente en cualquier página sin verificar antes
   */
  if (!isAuthenticated || !user) {
    return null;
  }

  /*
   * Calcular puntos necesarios para siguiente nivel
   *
   * Teacher note:
   * - Usa función de shared para mantener lógica consistente con backend
   * - pointsForNextLevel devuelve total puntos necesarios para level+1
   */
  const nextLevelPoints = pointsForNextLevel(user.level);

  /*
   * Calcular porcentaje de progreso en nivel actual
   *
   * Teacher note:
   * - calculateLevelProgress devuleve número entre 0-100
   * - Útil para la barra de progreso visual
   */
  const levelProgressPercent = calculateLevelProgress(user.points, user.level);

  /*
   * Calcular puntos que faltan para siguiente nivel
   *
   * Teacher note:
   * - Mostrar al usuario cuánto le falta es más motivador que solo el porcentaje
   * - Math.max evita números negativos si el backend tiene inconsistencias
   */
  const pointsToNextLevel = Math.max(0, nextLevelPoints - user.points);

  return (
    <div className="user-profile">
      {/* Sección superior: avatar + info básica */}
      <div className="user-profile-header">
        <div className="user-profile-avatar">
          <span className="user-profile-avatar-text">
            {user.name?.charAt(0).toUpperCase() ||
              user.email.charAt(0).toUpperCase()}
          </span>
        </div>

        <div className="user-profile-info">
          <h2 className="user-profile-name">{user.name}</h2>
          <p className="user-profile-email">{user.email}</p>
        </div>
      </div>

      {/* Estadísticas: nivel, puntos, racha */}
      <div className="user-profile-stats">
        <div className="user-profile-stat">
          <span className="user-profile-stat-icon">
            <svg width={32} height={32} fill="var(--color-accent)">
              <use href="/icons.svg#icon-level" />
            </svg>
          </span>
          <span className="user-profile-stat-label">Nivel</span>
          <span className="user-profile-stat-value">{user.level}</span>
        </div>

        <div className="user-profile-stat">
          <span className="user-profile-stat-icon">
            <svg width={32} height={32} fill="var(--color-accent)">
              <use href="/icons.svg#icon-points" />
            </svg>
          </span>
          <span className="user-profile-stat-label">Puntos</span>
          <span className="user-profile-stat-value">{user.points}</span>
        </div>

        <div className="user-profile-stat">
          <span className="user-profile-stat-icon">
            <svg width={32} height={32} fill="var(--color-accent)">
              <use href="/icons.svg#icon-streak" />
            </svg>
          </span>
          <span className="user-profile-stat-label">Racha</span>
          <span className="user-profile-stat-value">{user.streak}</span>
        </div>
      </div>

      {/* Progreso al siguiente nivel */}
      <div className="user-profile-level-section">
        <div className="user-profile-level-header">
          <span className="user-profile-level-text">
            Nivel {user.level} → {user.level + 1}
          </span>
          <span className="user-profile-level-remaining">
            {pointsToNextLevel} pts restantes
          </span>
        </div>

        <LevelProgress
          currentPoints={user.points}
          currentLevel={user.level}
          progressPercent={levelProgressPercent}
        />
      </div>
    </div>
  );
}

export default UserProfile;
