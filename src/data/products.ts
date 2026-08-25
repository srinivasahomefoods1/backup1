import podiImg from "@/assets/podi.jpg";
import snacksImg from "@/assets/snacks.jpg";
import sweetsImg from "@/assets/sweets.jpg";
import murukuluImg from "@/assets/murukulu.jpeg.asset.json";
import ladduImg from "@/assets/laddu.jpeg.asset.json";
import sunnundaImg from "@/assets/sunnunda.jpeg.asset.json";
import karivepakuImg from "@/assets/karivepaku_podi.png.asset.json";
import vellulliImg from "@/assets/velluli_podi.png.asset.json";
import kandiImg from "@/assets/Kandi_podi.png.asset.json";
import munagakuImg from "@/assets/Munagaku_podi.png.asset.json";
import kakarakayaImg from "@/assets/kakarakaya_podi.png.asset.json";
import idlyKaramImg from "@/assets/idly_karam_podi.png.asset.json";
import putnalaImg from "@/assets/putnala_podi.png.asset.json";
import kajjikayaluImg from "@/assets/bellam_kajjikayalu.png.asset.json";

export type Category = "podi" | "snacks" | "sweets";

export interface Product {
  id: string;
  name: string;
  telugu?: string;
  category: Category;
  prices: { "250g": number; "500g": number; "1kg": number };
  note?: string;
  image?: string;
}

export const SIZES = ["250g", "500g", "1kg"] as const;
export type Size = (typeof SIZES)[number];

export const categories: {
  id: Category;
  label: string;
  blurb: string;
  image: string;
}[] = [
  {
    id: "podi",
    label: "Podulu (Podi)",
    blurb: "Stone-ground spice powders, roasted fresh in small batches.",
    image: podiImg,
  },
  {
    id: "snacks",
    label: "Savoury Snacks",
    blurb: "Crisp Andhra teatime classics, fried in clean groundnut oil.",
    image: snacksImg,
  },
  {
    id: "sweets",
    label: "Sweets",
    blurb: "Jaggery-sweetened festive favourites made the family way.",
    image: sweetsImg,
  },
];

const p = (a: number, b: number, c: number) => ({ "250g": a, "500g": b, "1kg": c });

export const products: Product[] = [
  { id: "karivepaku-podi", name: "Karivepaku Podi", telugu: "కరివేపాకు పొడి", category: "podi", prices: p(160, 260, 500), image: karivepakuImg.url },
  { id: "vellulli-podi", name: "Vellulli Podi", telugu: "వెల్లుల్లి పొడి", category: "podi", prices: p(160, 260, 500), image: vellulliImg.url },
  { id: "kandi-podi", name: "Kandi Podi", telugu: "కంది పొడి", category: "podi", prices: p(160, 260, 500), image: kandiImg.url },
  { id: "munagaku-podi", name: "Munagaku Podi", telugu: "మునగాకు పొడి", category: "podi", prices: p(160, 260, 500), image: munagakuImg.url },
  { id: "kakarakaya-podi", name: "Kakarakaya Podi", telugu: "కాకరకాయ పొడి", category: "podi", prices: p(160, 260, 500), image: kakarakayaImg.url },
  { id: "idli-karam-podi", name: "Idli Karam Podi", telugu: "ఇడ్లీ కారం పొడి", category: "podi", prices: p(160, 260, 500), image: idlyKaramImg.url },
  { id: "putnala-podi", name: "Putnala Podi", telugu: "పుట్నాల పొడి", category: "podi", prices: p(160, 260, 500), image: putnalaImg.url },

  { id: "karappusa", name: "Karappusa", category: "snacks", prices: p(100, 200, 400) },
  { id: "chegodilu", name: "Chegodilu", category: "snacks", prices: p(100, 200, 400) },
  { id: "murukulu", name: "Murukulu", category: "snacks", prices: p(100, 200, 400), image: murukuluImg.url },
  { id: "pappu-chekkalu", name: "Pappu Chekkalu", note: "Karappalu", category: "snacks", prices: p(125, 250, 500) },
  { id: "atukula-chuduva", name: "Atukula Chuduva", category: "snacks", prices: p(100, 200, 400) },
  { id: "sakinalu", name: "Sakinalu", category: "snacks", prices: p(125, 250, 500) },
  { id: "mixture", name: "Mixture", category: "snacks", prices: p(113, 225, 450) },
  { id: "namak-pare", name: "Namak Pare", category: "snacks", prices: p(100, 200, 400) },

  { id: "ragi-laddulu", name: "Ragi Laddulu", category: "sweets", prices: p(200, 400, 800), image: ladduImg.url },
  { id: "bellam-kajjikayalu", name: "Bellam Kajjikayalu", category: "sweets", prices: p(130, 260, 520), image: kajjikayaluImg.url },
  { id: "bellam-gavvalu", name: "Bellam Gavvalu", category: "sweets", prices: p(120, 240, 480) },
  { id: "sunnundalu", name: "Sunnundalu", category: "sweets", prices: p(200, 400, 800), image: sunnundaImg.url },
  { id: "kova-kajjikayalu", name: "Kova Kajjikayalu", category: "sweets", prices: p(200, 400, 800) },
  { id: "poornam-boorelu", name: "Poornam Boorelu", category: "sweets", prices: p(150, 300, 600) },
];

export const imageFor = (c: Category) =>
  categories.find((x) => x.id === c)!.image;

export const CONTACT = {
  phone: "+91 98765 43210",
  phoneHref: "+919876543210",
  whatsapp: "919876543210",
  email: "orders@srinivasahomefoods.in",
  address: "Plot 24, Vidyanagar, Hyderabad, Telangana 500044",
  hours: "Mon – Sat · 9:00 AM – 8:00 PM",
};
