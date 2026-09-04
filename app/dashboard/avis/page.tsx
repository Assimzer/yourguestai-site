import AvisList from "./AvisList";

export default function AvisPage() {
  return (
    <div>
      <h1 className="font-display text-2xl text-white">Avis</h1>
      <p className="mt-1 text-sm text-mist-400">
        Notes et commentaires laissés par vos voyageurs sur LÉO après leur séjour.
      </p>

      <div className="mt-8">
        <AvisList />
      </div>
    </div>
  );
}
