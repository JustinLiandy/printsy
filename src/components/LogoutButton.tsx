"use client";

import { Button } from "@/components/ui/button";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export default function LogoutButton() {
  async function doLogout() {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    location.href = "/";
  }
  return (
    <Button variant="outline" onClick={doLogout}>
      Logout
    </Button>
  );
}
