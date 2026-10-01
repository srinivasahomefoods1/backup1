import { CONTACT } from "@/data/products";

const whatsappUrl = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(
  "Hi Srinivasa Home Foods! I would like to place an enquiry/order."
)}`;

export function WhatsAppFloat() {
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-24 right-4 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-lg shadow-black/20 transition-transform duration-300 hover:scale-105 hover:shadow-xl animate-bounce-subtle sm:bottom-6 sm:right-6"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-6 w-6"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.203-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-9.758A9.997 9.997 0 0 0 2 12.002C2 17.522 6.477 22 12 22c1.715 0 3.328-.44 4.74-1.212l3.364 1.165-1.165-3.365A9.956 9.956 0 0 0 22 12.002c0-5.523-4.477-10-10-10z" />
      </svg>
      <span className="hidden text-sm font-semibold sm:inline">WhatsApp Us</span>
    </a>
  );
}
