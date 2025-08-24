import Image from "next/image";

type Props = {
  id: string;
  title: string;
  base_price: number;
  preview_url: string;
};

export default function DesignCard({ id, title, base_price, preview_url }: Props) {
  return (
    <a
      href={`/products/${id}`}
      className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-lg"
    >
      <div className="relative aspect-square w-full bg-gray-100">
        <Image
          src={preview_url}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="truncate text-base font-semibold text-gray-900">{title}</h3>
        <p className="mt-1 text-sm font-medium text-emerald-600">
          Rp {base_price.toLocaleString("id-ID")}
        </p>
      </div>
    </a>
  );
}
