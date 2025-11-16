import { useAuth } from "../../context/AuthContext";
import { calculateLevelProgress, pointsForNextLevel } from "@pomodorise/shared";
import LevelProgress from "./LevelProgress";
import "./UserProfile.css";

function UserProfile() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  const nextLevelPoints = pointsForNextLevel(user.level);

  const levelProgressPercent = calculateLevelProgress(user.points, user.level);

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
