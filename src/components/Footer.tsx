import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="text-xl font-extrabold">
              <span className="text-brand-500">Printsy</span>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Modern custom apparel marketplace. Design, sell, and ship with ease.
            </p>
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-900">Product</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link className="hover:text-brand-600" href="/">Catalog</Link></li>
              <li><Link className="hover:text-brand-600" href="/seller/designs/new">Sell a design</Link></li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-900">Company</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link className="hover:text-brand-600" href="#">About</Link></li>
              <li><Link className="hover:text-brand-600" href="#">Contact</Link></li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-900">Legal</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link className="hover:text-brand-600" href="#">Terms</Link></li>
              <li><Link className="hover:text-brand-600" href="#">Privacy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 text-xs text-slate-500">
          © {new Date().getFullYear()} Printsy. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
