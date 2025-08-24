// src/components/DesignCard.tsx
import React from "react";

export type DesignCardProps = {
  id: string;
  title: string;
  base_price: number;
  preview_url: string;
};

const DesignCard: React.FC<DesignCardProps> = ({ id, title, base_price, preview_url }) => {
  return (
    <a href={`/products/${id}`} className="block rounded-lg border hover:shadow-sm">
      <div className="aspect-square w-full overflow-hidden rounded-t-lg bg-gray-100">
        <img src={preview_url} alt={title} className="h-full w-full object-cover" />
      </div>
      <div className="p-3">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-sm opacity-70">Rp {base_price.toLocaleString("id-ID")}</div>
      </div>
    </a>
  );
};

export default DesignCard;
