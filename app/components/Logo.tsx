import Image from "next/image";
import Link from "next/link";

export default function Logo({
  className = "",
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className={`flex w-fit items-center gap-2 font-display italic text-white ${className}`}
    >
      <Image
        src="/logo-badge.png"
        alt=""
        width={28}
        height={28}
        className="h-7 w-7 shrink-0 rounded-full"
      />
      YOURGUESTAI
    </Link>
  );
}
