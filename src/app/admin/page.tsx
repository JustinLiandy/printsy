// src/app/admin/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminPage() {
  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-4 text-2xl font-bold text-slate-900">Admin</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-slate-700">Manage your base product catalog.</p>
        <div className="mt-4">
          <Link href="/admin/products">
            <Button variant="outline">Open Products</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
