import DashboardCharts from '@/components/DashboardCharts'
import SummaryOfActions from '@/components/SummaryOfActions'
import M360Activities from '@/components/m360/M360Activities'

export default function Dashboard() {
  return (
    <div className="dashboard">
      <h1 className="dashboard__title">Dashboard</h1>
      <M360Activities />
      <DashboardCharts />
      <SummaryOfActions />
    </div>
  )
}
