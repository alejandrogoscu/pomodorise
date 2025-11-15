/*
 * Componente SessionsChart - Gráfico de sesiones por día
 *
 * Teacher note:
 * - Usa Recharts para visualización de datos
 * - Componente presentacional (recibe datos por props)
 * - Responsive con ResponsiveContainer de Recharts
 * - CSS separado para estilos personalizados
 *
 * Analogía: SessionsChart es como un gráfico de ventas
 * (muestra tendencia de productividad a lo largo del tiempo)
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./SessionsChart.css";

/*
 * Props del componente SessionChart
 *
 * Teacher note:
 * - data: array de objetos { date: string, count: number }
 * - Viene directamente de UserStats.sessionsPerDay (hook useStats)
 */
interface SessionsChartProps {
  data: Array<{ date: string; count: number }>;
}

/*
 * Componente SessionsChart
 *
 * @param props - data: sesiones agrupadas por día
 * @returns Gráfico de línea con sesiones por día
 *
 * @example
 * <SessionsChart
 *   data={[
 *     { date: "2025-01-15", count: 3 },
 *     { date: "2025-01-16", count: 5 }
 *   ]}
 * />
 *
 * Teacher note:
 * - ResponsiveContainer hace que el grádico se adapte al contenedor
 * - Tooltop muestra datos al pasar el mouse
 * - XAxis formatea fechas para mejorar legibilidad
 */
function SessionsChart({ data }: SessionsChartProps) {
  /*
   * Formatear fecha para el eje x
   *
   * Teacher note:
   * - Convierte "2025-01-15" a "15 Ene"
   * - Más legible en el gráfico sin ocupar mucho espacio
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString("es-ES", { month: "short" });
    return `${day} ${month}`;
  };

  /*
   * Si no hay datos, mostrar mensaje
   *
   * Teacher note:
   * - Evita error de Recharts con array vacío
   * - Mejora UX mostrando mensaje claro
   */
  if (!data || data.length === 0) {
    return (
      <div className="sessions-chart sessions-chart-empty">
        <div className="sessions-chart-header">
          <h3 className="sessions-chart-title">📊 Sesiones por día</h3>
        </div>
        <div className="sessions-chart-empty-content">
          <p>No hay datos para mostrar</p>
          <span className="sessions-chart-empty-icon">📈</span>
        </div>
      </div>
    );
  }

  return (
    <div className="sessions-chart">
      {/* Header del gráfico */}
      <div className="sessions-chart-header">
        <h3 className="sessions-chart-title">📊 Sesiones por día</h3>
        <p className="sessions-chart-subtitle">
          Últimos {data.length} días con actividad
        </p>
      </div>

      {/* Gráfico responsive */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          {/* Grid de fondo */}
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />

          {/* Eje X (fechas) */}
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke="rgba(255,255,255,0.7)"
            style={{ fontSize: "0.875rem" }}
          />

          {/* Eje Y (Cantidad de sesiones) */}
          <YAxis
            stroke="rgba(255,255,255,0.7)"
            style={{ fontSize: "0.875rem" }}
            allowDecimals={false}
            domain={[0, (dataMax: number) => dataMax + 1]}
          />

          {/* Tooltip al pasar el mouse */}
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(0,0,0,0.3)",
              border: "none",
              borderRadius: "var(--border-radius-md)",
              boxShadow: "var(--shadow-md)",
            }}
            labelFormatter={(value) => formatDate(value as string)}
            formatter={(value: number) => [`${value} sesiones`, "Cantidad"]}
          />

          {/* Línea del gráfico */}
          <Line
            type="monotone"
            dataKey="count"
            stroke="white"
            strokeWidth={3}
            dot={{
              fill: "white",
              r: 5,
            }}
            activeDot={{
              r: 7,
              fill: "white",
              stroke: "var(--color-primary)",
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SessionsChart;
