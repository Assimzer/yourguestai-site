import Link from "next/link";

export default function SubscribeButton() {
  return (
    <Link
      href="/dashboard/compte/abonnement"
      className="inline-block rounded-xl bg-white px-4 py-2 text-sm font-medium text-night-900"
    >
      S&apos;abonner
    </Link>
  );
}
