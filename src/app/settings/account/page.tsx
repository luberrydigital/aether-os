import { AccountSettingsClient } from "@/components/account/account-settings-client";
import { SettingsShell } from "@/components/account/settings-shell";
import { getSession } from "@/lib/auth/session";
import { dbGetUserById } from "@/lib/db/local-db";
import { redirect } from "next/navigation";

export default async function AccountSettingsPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/login");

  const user = await dbGetUserById(session.user.id);

  return (
    <SettingsShell
      activeHref="/settings/account"
      email={session.user.email}
      displayName={user?.displayName}
    >
      <AccountSettingsClient />
    </SettingsShell>
  );
}
