import DashboardCharts from '@/components/DashboardCharts'
import SummaryOfActions from '@/components/SummaryOfActions'

export default function Dashboard() {
  return (
    <div className="dashboard">
      <h1 className="dashboard__title">Dashboard</h1>
      <DashboardCharts />
      <SummaryOfActions />
    </div>
  )
}
