interface LevelProgressProps {
  currentPoints: number;
  currentLevel: number;
  progressPercent: number;
}

function LevelProgress({ progressPercent }: LevelProgressProps) {
  return (
    <div className="level-progress">
      <div className="level-progress-track">
        {/* Barra de progreso actual */}
        <div
          className="level-progress-fill"
          style={{ width: `${progressPercent}%` }}
        >
          {/* Mostrar porcentaje dentro de la barra si hay suficiente espacio */}
          {progressPercent > 10 && (
            <span className="level-progress-text">
              {Math.round(progressPercent)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default LevelProgress;
