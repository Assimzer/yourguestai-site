import { createClient } from "@/lib/supabase/server";
import AideForm from "./AideForm";

export default async function AidePage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      <h1 className="font-display text-2xl text-white">Aide</h1>
      <p className="mt-1 text-sm text-mist-400">
        Un problème, une question ? Contactez le support directement par email.
      </p>

      <AideForm userEmail={user?.email ?? ""} />
    </div>
  );
}
