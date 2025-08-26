// src/products/product-assets.tsx
"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { Button } from "@/components/ui/button";

export default function ProductAssets({ productId }: { productId: string }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const supabase = supabaseBrowser();
    setBusy(true);
    setMsg(null);

    try {
      for (const file of Array.from(files)) {
        const path = `${productId}/${crypto.randomUUID()}-${file.name}`;
        const { error } = await supabase.storage.from("base-assets").upload(path, file, {
          upsert: false,
        });
        if (error) throw error;

        // Optional: insert a row into base_product_assets if you created that table
        await supabase.from("base_product_assets").insert({
          base_product_id: productId,
          kind: "overlay", // change if you have multiple kinds
          path,
        });
      }
      setMsg("Uploaded!");
    } catch (err: any) {
      setMsg(err?.message ?? "Upload failed");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-soft">
      <div className="mb-3 font-medium">Assets</div>
      <div className="flex items-center gap-3">
        <input
          id="files"
          type="file"
          multiple
          onChange={onUpload}
          disabled={busy}
          className="block"
        />
        <Button type="button" disabled className="opacity-60">
          Upload (choose files)
        </Button>
      </div>
      {msg && <p className="mt-3 text-sm text-slate-600">{msg}</p>}
      <p className="mt-2 text-xs text-slate-500">
        Bucket: <code>base-assets</code>. We store file paths in <code>base_product_assets</code>.
      </p>
    </div>
  );
}
