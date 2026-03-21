import type { ChartDataPoint } from '@/types/dashboard'

interface BarChartProps {
  title: string
  subtitle: string
  data: ChartDataPoint[]
}

export default function BarChart({ title, subtitle, data }: BarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value))

  return (
    <div className="bar-chart">
      <div className="bar-chart__header">
        <h3 className="bar-chart__title">{title}</h3>
        <p className="bar-chart__subtitle">{subtitle}</p>
      </div>
      <div className="bar-chart__body">
        <div className="bar-chart__bars">
          {data.map(item => (
            <div key={item.label} className="bar-chart__bar-group">
              <span className="bar-chart__value">{item.value}</span>
              <div
                className="bar-chart__bar"
                style={{
                  height: `${(item.value / maxValue) * 120}px`,
                  backgroundColor: item.color,
                }}
              />
              <span className="bar-chart__label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
