"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import * as React from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const onLogout = async () => {
    setLoading(true);
    const supabase = supabaseBrowser();
    await supabase.auth.signOut(); // clear cookies client-side + server picks up
    router.replace("/");
    router.refresh();
  };

  return (
    <Button onClick={onLogout} disabled={loading} variant="outline">
      {loading ? "Logging out…" : "Logout"}
    </Button>
  );
}
