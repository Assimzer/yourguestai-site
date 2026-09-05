export default function PhoneMock() {
  return (
    <div className="relative mx-auto w-[280px] sm:w-[300px]">
      <div className="absolute -inset-8 bg-porch-glow blur-2xl" aria-hidden />
      <div className="relative rounded-[2.5rem] border border-night-600 bg-night-900 p-2 shadow-2xl">
        <div className="rounded-[2rem] overflow-hidden bg-night-800">
          <div className="flex items-center gap-2 bg-night-700 px-4 py-3">
            <div className="h-8 w-8 rounded-full bg-porch-500 flex items-center justify-center text-night-950 font-display text-sm">
              L
            </div>
            <div>
              <p className="text-sm font-medium text-white leading-tight">LÉO</p>
              <p className="text-[11px] text-ok leading-tight">en ligne</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 px-3 py-4 min-h-[280px]">
            <p className="self-center text-[10px] text-mist-500 mb-1">23:41</p>

            <div className="self-end max-w-[85%] rounded-2xl rounded-tr-sm bg-night-600 px-3 py-2 text-[13px] text-white">
              Bonsoir, quel est le code du portail svp ?
            </div>

            <div
              className="self-start max-w-[85%] rounded-2xl rounded-tl-sm bg-porch-500 px-3 py-2 text-[13px] text-night-950 animate-[fadeIn_0.6s_ease-out_0.3s_both]"
            >
              Bonsoir ! Le code du portail est <span className="font-mono font-medium">4752</span>. Bon retour 🌙
            </div>

            <p className="self-start text-[10px] text-mist-500 mt-0.5 ml-1">
              Répondu en moins de 30 s
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
