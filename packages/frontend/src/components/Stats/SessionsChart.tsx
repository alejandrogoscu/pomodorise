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

interface SessionsChartProps {
  data: Array<{ date: string; count: number }>;
}

function SessionsChart({ data }: SessionsChartProps) {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString("es-ES", { month: "short" });
    return `${day} ${month}`;
  };

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
        <h3 className="sessions-chart-title">Sesiones por día</h3>
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
            domain={["dataMin", (dataMax) => dataMax + 1]}
          />

          {/* Tooltip al pasar el mouse */}
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(0,0,0,0.6)",
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
