/*
 * Componente LevelProgress - Barra de progreso para el nivel
 *
 * Teacher note:
 * - Subcomponente simple y reutilizable
 * - Recibe datos por props (no accede a contexto)
 * - Usa CSS para animación de progreso
 *
 * Analogía: LevelProgress es como la barra de experiencia en videojuegos
 * (muestra visualmente cuánto falta para subir de nivel)
 */
interface LevelProgressProps {
  currentPoints: number;
  currentLevel: number;
  progressPercent: number;
}

/*
 * Componente LevelProgress
 *
 * @param props - currentPoints, currentLevel, progressPercent
 * @returns Barra de progreso animada
 *
 * @example
 * <LevelProgress
 *    currentPoints={150}
 *    currentLevel={3}
 *    progressPercent={75}
 * />
 *
 * Teacher note:
 * - progressPercent debe estar entre 0-100
 * - Se puede añadir animación con CSS transition
 */
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
