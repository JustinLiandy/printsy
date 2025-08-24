// src/components/DesignCard.tsx
"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type Props = {
  id: string;
  title: string;
  base_price: number;
  preview_url: string;
};

export default function DesignCard({ id, title, base_price, preview_url }: Props) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      href={`/design/${id}`}
      className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-card"
    >
      <div className="relative aspect-square w-full overflow-hidden">
        <Image
          src={!imgError && preview_url ? preview_url : "/placeholder.png"}
          alt={title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          onError={() => setImgError(true)}
          priority={false}
        />
      </div>
      <div className="p-3">
        <h3 className="line-clamp-1 text-sm font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-xs text-slate-600">from Rp {base_price.toLocaleString("id-ID")}</p>
      </div>
    </Link>
  );
}
