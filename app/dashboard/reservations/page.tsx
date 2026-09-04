import ReservationsList from "./ReservationsList";

export default function ReservationsPage() {
  return (
    <div>
      <h1 className="font-display text-2xl text-white">Réservations</h1>
      <p className="mt-1 text-sm text-mist-400">
        Prochaines arrivées et départs, tous logements.
      </p>

      <div className="mt-8">
        <ReservationsList />
      </div>
    </div>
  );
}
