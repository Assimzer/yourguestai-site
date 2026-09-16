export default function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: "ok" | "mist";
}) {
  return (
    <div className="rounded-2xl border border-night-600 bg-night-900 p-5">
      <p className="text-xs text-mist-400">{label}</p>
      <p
        className={`mt-2 font-display text-3xl ${
          accent === "ok" ? "text-ok" : accent === "mist" ? "text-mist-400" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
