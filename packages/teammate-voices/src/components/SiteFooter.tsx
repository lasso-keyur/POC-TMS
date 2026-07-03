import { BofaFlag } from '@/components/BrandBar'

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__left">
          <BofaFlag width={28} />
          <span className="site-footer__brand">Bank of America</span>
        </div>
        <span className="site-footer__copy">
          &copy;2025 Bank of America Corporation. All rights reserved.
        </span>
      </div>
    </footer>
  )
}
