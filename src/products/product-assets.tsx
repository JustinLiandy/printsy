"use client";

import * as React from "react";
// ⬇️ Rename to avoid shadowing the DOM Image constructor
import NextImage from "next/image";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AssetKind = "preview" | "overlay" | "mask";

type BaseProductAsset = {
  id: string;
  base_product_id: string;
  kind: AssetKind;
  url: string;
  width: number | null;
  height: number | null;
  created_at: string;
};

type Props = { productId: string };

export default function ProductAssets({ productId }: Props) {
  const supabase = supabaseBrowser();
  const [assets, setAssets] = React.useState<BaseProductAsset[]>([]);
  const [busyKind, setBusyKind] = React.useState<AssetKind | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const fetchAssets = React.useCallback(async () => {
    const { data, error: err } = await supabase
      .from("base_product_assets")
      .select("id, base_product_id, kind, url, width, height, created_at")
      .eq("base_product_id", productId)
      .order("created_at", { ascending: false });

    if (err) {
      setError(err.message);
      return;
    }
    setAssets(data ?? []);
  }, [productId, supabase]);

  React.useEffect(() => {
    void fetchAssets();
  }, [fetchAssets]);

  async function getImageSize(file: File): Promise<{ w: number; h: number }> {
    const url = URL.createObjectURL(file);
    try {
      const bmp = await createImageBitmap(file);
      return { w: bmp.width, h: bmp.height };
    } catch {
      // Fallback via a DOM <img> element (NOT the Next.js component)
      const img = document.createElement("img");
      const dims = await new Promise<{ w: number; h: number }>((resolve, reject) => {
        img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = () => reject(new Error("Failed to read image"));
      });
      img.src = url;
      return dims;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  const handleUpload =
    (kind: AssetKind) =>
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null);
      const file = e.currentTarget.files?.[0];
      if (!file) return;

      setBusyKind(kind);

      const bucket = "base-assets"; // match your Supabase bucket
      const safeName = file.name.toLowerCase().replace(/\s+/g, "-");
      const path = `base-products/${productId}/${kind}-${Date.now()}-${safeName}`;

      const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (upErr) {
        setBusyKind(null);
        setError(upErr.message);
        return;
      }

      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
      const publicUrl = pub?.publicUrl ?? "";

      const { w, h } = await getImageSize(file);

      const { error: insErr } = await supabase.from("base_product_assets").insert({
        base_product_id: productId,
        kind,
        url: publicUrl,
        width: w,
        height: h,
      });

      setBusyKind(null);

      if (insErr) {
        setError(insErr.message);
        return;
      }

      await fetchAssets();
      e.currentTarget.value = "";
    };

  const handleDelete = async (rowId: string) => {
    setError(null);
    const { error: delErr } = await supabase
      .from("base_product_assets")
      .delete()
      .eq("id", rowId);

    if (delErr) {
      setError(delErr.message);
      return;
    }
    await fetchAssets();
  };

  return (
    <section className="mt-10 rounded-xl border border-slate-200 bg-white p-6 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Mockup & overlay assets</h3>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {(["preview", "overlay", "mask"] as AssetKind[]).map((kind) => (
          <div key={kind} className="rounded-lg border border-slate-200 p-4">
            <Label className="mb-2 block capitalize text-slate-700">{kind}</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleUpload(kind)}
              disabled={busyKind !== null}
            />
            <p className="mt-2 text-xs text-slate-500">
              PNG recommended. Large images are fine; we store width/height.
            </p>
            <div className="mt-4 space-y-3">
              {assets
                .filter((a) => a.kind === kind)
                .map((a) => (
                  <div key={a.id} className="flex items-center gap-3">
                    <div className="relative h-16 w-16 overflow-hidden rounded-md border">
                      {/* Use plain <img> to avoid next/image sizing constraints in a tiny thumb */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={a.url} alt={`${kind} asset`} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm text-slate-700">{a.url}</div>
                      <div className="text-xs text-slate-500">
                        {a.width ?? "?"}×{a.height ?? "?"}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => void handleDelete(a.id)}>
                      Delete
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
