import BrandBar from '@/components/BrandBar'
import NavBar from '@/components/NavBar'
import SiteFooter from '@/components/SiteFooter'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="layout">
      <BrandBar />
      <NavBar />
      <main className="layout__main">{children}</main>
      <SiteFooter />
    </div>
  )
}
