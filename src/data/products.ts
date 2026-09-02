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
import gavvaluImg from "@/assets/bellam_gavvalu.png.asset.json";
import chegodiluImg from "@/assets/chegodilu.png.asset.json";
import pappuChekkaluImg from "@/assets/pappu_chekkalu.png.asset.json";
import sakinaluImg from "@/assets/sakinalu.png.asset.json";
import chuduvaImg from "@/assets/chuduva.png.asset.json";
import namakPareImg from "@/assets/namak_pare.png.asset.json";
import mixtureImg from "@/assets/mixture.png.asset.json";
import poornamBooreluImg from "@/assets/poornam_boorelu.png.asset.json";
import boondiLadduImg from "@/assets/boondi_laddu.png.asset.json";


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

  { id: "karappusa", name: "Karappusa", category: "snacks", prices: p(125, 250, 500) },
  { id: "chegodilu", name: "Chegodilu", category: "snacks", prices: p(125, 250, 500), image: chegodiluImg.url },
  { id: "murukulu", name: "Murukulu", category: "snacks", prices: p(100, 200, 400), image: murukuluImg.url },
  { id: "pappu-chekkalu", name: "Pappu Chekkalu", note: "Karappalu", category: "snacks", prices: p(125, 250, 500), image: pappuChekkaluImg.url },
  { id: "atukula-chuduva", name: "Atukula Chuduva", category: "snacks", prices: p(100, 200, 400), image: chuduvaImg.url },
  { id: "sakinalu", name: "Sakinalu", category: "snacks", prices: p(125, 250, 500), image: sakinaluImg.url },
  { id: "mixture", name: "Mixture", category: "snacks", prices: p(200, 400, 800), image: mixtureImg.url },
  { id: "namak-pare", name: "Namak Pare", category: "snacks", prices: p(113, 225, 450), image: namakPareImg.url },

  { id: "ragi-laddulu", name: "Ragi Laddulu", category: "sweets", prices: p(200, 400, 800), image: ladduImg.url },
  { id: "bellam-kajjikayalu", name: "Bellam Kajjikayalu", category: "sweets", prices: p(130, 260, 520), image: kajjikayaluImg.url },
  { id: "bellam-gavvalu", name: "Bellam Gavvalu", category: "sweets", prices: p(120, 240, 480), image: gavvaluImg.url },
  { id: "sunnundalu", name: "Sunnundalu", category: "sweets", prices: p(200, 400, 800), image: sunnundaImg.url },
  { id: "soft-kova-kajjikayalu", name: "Soft Kova Kajjikayalu", category: "sweets", prices: p(250, 500, 1000), image: kajjikayaluImg.url },
  { id: "crispy-poori-kova-kajjikayalu", name: "Crispy Poori Kova Kajjikayalu", category: "sweets", prices: p(200, 400, 800), image: kajjikayaluImg.url },
  { id: "poornam-boorelu", name: "Poornam Boorelu", category: "sweets", prices: p(150, 300, 600), image: poornamBooreluImg.url },
  { id: "boondi-laddo", name: "Boondi Laddo", category: "sweets", image: boondiLadduImg.url, prices: p(300, 600, 1200) },
];

export const imageFor = (c: Category) =>
  categories.find((x) => x.id === c)!.image;

export const CONTACT = {
  phone: "+91 63036 49148",
  phoneHref: "+916303649148",
  whatsapp: "916303649148",
  email: "srinivasahomefoods1@gmail.com",
  address: "Balapur, Hyderabad, Telangana 500005",
  hours: "Mon – Sat · 9:00 AM – 8:00 PM",
};

/** UPI details used for PhonePe / Google Pay / any UPI app checkout. */
export const UPI = {
  id: "srinivasahomefoods@upi",
  payeeName: "Srinivasa Home Foods",
};
