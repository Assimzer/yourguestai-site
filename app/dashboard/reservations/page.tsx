import { createClient } from "@/lib/supabase/server";
import { getReservationsData } from "@/lib/reservations/getReservationsData";
import ReservationsList from "./ReservationsList";

export default async function ReservationsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const result = user
    ? await getReservationsData(supabase, user.id)
    : { ok: false as const, error: "Non authentifié", status: 401 };

  return (
    <div>
      <h1 className="font-display text-2xl text-white">Réservations</h1>
      <p className="mt-1 text-sm text-mist-400">
        Prochaines arrivées et départs, tous logements.
      </p>

      <div className="mt-8">
        <ReservationsList
          initialReservations={result.ok ? result.reservations : []}
          initialError={result.ok ? null : result.error}
        />
      </div>
    </div>
  );
}
