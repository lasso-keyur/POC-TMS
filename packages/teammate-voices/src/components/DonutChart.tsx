import type { StatusCount } from '@/types/dashboard'

interface DonutChartProps {
  title: string
  subtitle: string
  segments: StatusCount[]
  total: number
}

export default function DonutChart({ title, subtitle, segments, total }: DonutChartProps) {
  const radius = 54
  const strokeWidth = 14
  const circumference = 2 * Math.PI * radius

  let cumulativeOffset = 0
  const segmentArcs = segments.map(segment => {
    const segmentLength = (segment.value / total) * circumference
    const offset = cumulativeOffset
    cumulativeOffset += segmentLength
    return { ...segment, segmentLength, offset }
  })

  return (
    <div className="donut-chart">
      <div className="donut-chart__header">
        <h3 className="donut-chart__title">{title}</h3>
        <p className="donut-chart__subtitle">{subtitle}</p>
      </div>
      <div className="donut-chart__body">
        <div className="donut-chart__legend">
          {segments.map(segment => (
            <div key={segment.label} className="donut-chart__legend-item">
              <span
                className="donut-chart__legend-dot"
                style={{ backgroundColor: segment.color }}
              />
              <span className="donut-chart__legend-value">{segment.value}</span>
              <span className="donut-chart__legend-label">{segment.label}</span>
            </div>
          ))}
        </div>
        <div className="donut-chart__ring">
          <svg viewBox="0 0 136 136" className="donut-chart__svg">
            {/* Background circle */}
            <circle
              cx="68"
              cy="68"
              r={radius}
              fill="none"
              stroke="#E5E5EA"
              strokeWidth={strokeWidth}
            />
            {/* Segments */}
            {segmentArcs.map(arc => (
              <circle
                key={arc.label}
                cx="68"
                cy="68"
                r={radius}
                fill="none"
                stroke={arc.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${arc.segmentLength} ${circumference - arc.segmentLength}`}
                strokeDashoffset={-arc.offset}
                strokeLinecap="butt"
                transform="rotate(-90 68 68)"
              />
            ))}
          </svg>
          <div className="donut-chart__center">
            <span className="donut-chart__center-value">{total}</span>
            <span className="donut-chart__center-label">Total</span>
          </div>
        </div>
      </div>
    </div>
  )
}
