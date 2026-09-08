export default function FloatingWhatsAppButton() {
  return (
    <a
      href="https://wa.me/33624099289?text=Bonjour%2C%20je%20souhaite%20en%20savoir%20plus%20sur%20YourGuestAI"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Discuter sur WhatsApp"
      className="yg-whatsapp-fab fixed bottom-6 right-16 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition hover:scale-105 sm:right-20"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12.004 2C6.478 2 2 6.478 2 12.004c0 1.85.505 3.622 1.463 5.164L2 22l4.955-1.436a9.94 9.94 0 0 0 5.049 1.372h.004c5.526 0 10.004-4.478 10.004-10.004C22 6.478 17.53 2 12.004 2zm0 18.1a8.1 8.1 0 0 1-4.13-1.129l-.296-.176-3.061.888.897-2.985-.193-.307a8.096 8.096 0 0 1-1.24-4.387c0-4.477 3.645-8.122 8.127-8.122 4.477 0 8.122 3.645 8.122 8.122 0 4.478-3.645 8.096-8.226 8.096z" />
      </svg>
      <span className="yg-whatsapp-halo" aria-hidden />
      <style>{`
        .yg-whatsapp-fab {
          position: fixed;
        }
        .yg-whatsapp-halo {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background: #25D366;
          animation: ygPulseHalo 2.2s ease-out infinite;
          z-index: -1;
        }
        @keyframes ygPulseHalo {
          0% { transform: scale(1); opacity: 0.55; }
          100% { transform: scale(1.9); opacity: 0; }
        }
      `}</style>
    </a>
  );
}
