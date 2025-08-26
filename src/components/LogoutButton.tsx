"use client";

import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  const supabase = supabaseBrowser();

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.assign("/");
  };

  return (
    <Button onClick={logout} variant="destructive">
      Logout
    </Button>
  );
}
