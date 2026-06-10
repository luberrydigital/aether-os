"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  const router = useRouter();

  async function onSignOut() {
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  }

  return (
    <Button type="button" variant="ghost" size="sm" onClick={onSignOut}>
      Sign out
    </Button>
  );
}
