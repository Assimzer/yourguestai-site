export default function AnimatedGradientText({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="yg-gradient-text bg-clip-text text-transparent">
      {children}
      <style>{`
        .yg-gradient-text {
          background-image: linear-gradient(90deg, #E8A33D, #F0B85C, #C7822A, #E8A33D);
          background-size: 200% auto;
          animation: ygGradientShift 6s ease infinite;
        }
        @keyframes ygGradientShift {
          0% { background-position: 0% center; }
          50% { background-position: 100% center; }
          100% { background-position: 0% center; }
        }
      `}</style>
    </span>
  );
}
