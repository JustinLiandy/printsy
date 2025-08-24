import { supabaseServer } from "@/lib/supabaseServer";
import DesignCard from "@/components/DesignCard";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Design = {
  id: string;
  title: string;
  base_price: number;
  preview_url: string | null;
  is_published: boolean;
};

export default async function Home() {
  const supabase = supabaseServer();
  const { data: designs, error } = await supabase
    .from("designs")
    .select("id,title,base_price,preview_url,is_published")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (
    <main className={`${inter.variable} mx-auto max-w-7xl px-6 py-10 font-sans`}>
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-gray-900">
        Latest Designs
      </h1>

      {!designs || designs.length === 0 ? (
        <p className="text-sm text-gray-500">No designs published yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {designs.map((d: Design) => (
            <DesignCard
              key={d.id}
              id={d.id}
              title={d.title}
              base_price={d.base_price}
              preview_url={d.preview_url || ""}
            />
          ))}
        </div>
      )}
    </main>
  );
}
