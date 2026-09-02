import { jsPDF } from "jspdf";
import { CONTACT } from "@/data/products";

export interface ReceiptItem {
  name: string;
  size: string;
  qty: number;
  amount: number;
}

export interface ReceiptData {
  ref: string;
  date: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
  notes?: string;
  paymentMethod: string;
  paymentReference: string;
  paymentStatus: string;
  items: ReceiptItem[];
  total: number;
}

const rupee = (n: number) => `Rs. ${n.toLocaleString("en-IN")}`;

/** Builds the order receipt as a jsPDF document. */
export function buildReceipt(data: ReceiptData): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const left = 48;
  const right = 547;
  let y = 60;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(110, 20, 30);
  doc.text("Srinivasa Home Foods", left, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90);
  y += 16;
  doc.text(CONTACT.address, left, y);
  y += 13;
  doc.text(`${CONTACT.phone}  |  ${CONTACT.email}`, left, y);

  y += 24;
  doc.setDrawColor(200, 170, 90);
  doc.setLineWidth(1.5);
  doc.line(left, y, right, y);

  y += 28;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(30);
  doc.text("Order receipt", left, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text(`${data.ref}  ·  ${data.date}`, right, y, { align: "right" });

  y += 24;
  doc.setTextColor(30);
  doc.setFont("helvetica", "bold");
  doc.text("Billed to", left, y);
  doc.text("Payment", 320, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(70);

  const billed = [
    data.name,
    data.phone,
    ...(data.email ? [data.email] : []),
    ...doc.splitTextToSize(data.address, 230),
  ];
  const payment = [
    `Method: ${data.paymentMethod}`,
    `Status: ${data.paymentStatus}`,
    `Reference: ${data.paymentReference || "—"}`,
  ];
  let by = y + 14;
  billed.forEach((l: string) => {
    doc.text(l, left, by);
    by += 13;
  });
  let py = y + 14;
  payment.forEach((l) => {
    doc.text(l, 320, py);
    py += 13;
  });

  y = Math.max(by, py) + 16;

  // Items table
  doc.setFillColor(245, 240, 230);
  doc.rect(left, y, right - left, 22, "F");
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40);
  doc.text("Item", left + 10, y + 15);
  doc.text("Size", 320, y + 15);
  doc.text("Qty", 390, y + 15);
  doc.text("Amount", right - 10, y + 15, { align: "right" });
  y += 22;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(60);
  data.items.forEach((it) => {
    y += 20;
    doc.text(it.name, left + 10, y);
    doc.text(it.size, 320, y);
    doc.text(String(it.qty), 390, y);
    doc.text(rupee(it.amount), right - 10, y, { align: "right" });
  });

  y += 14;
  doc.setDrawColor(220);
  doc.setLineWidth(0.7);
  doc.line(left, y, right, y);
  y += 22;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(30);
  doc.text("Total", 390, y);
  doc.text(rupee(data.total), right - 10, y, { align: "right" });

  if (data.notes) {
    y += 26;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(90);
    doc.text(doc.splitTextToSize(`Notes: ${data.notes}`, right - left), left, y);
  }

  y += 40;
  doc.setFontSize(9);
  doc.setTextColor(130);
  doc.text(
    "Thank you for your order. For any questions, reply on WhatsApp or call us.",
    left,
    y,
  );

  return doc;
}

export const receiptFileName = (ref: string) => `Srinivasa-Home-Foods-${ref}.pdf`;

export function downloadReceipt(data: ReceiptData) {
  buildReceipt(data).save(receiptFileName(data.ref));
}

export function receiptBlob(data: ReceiptData): Blob {
  return buildReceipt(data).output("blob");
}

/** Share the receipt PDF through the device share sheet (WhatsApp, email, etc.). */
export async function shareReceipt(data: ReceiptData, text: string): Promise<boolean> {
  const nav = navigator as Navigator & {
    canShare?: (d: ShareData) => boolean;
    share?: (d: ShareData) => Promise<void>;
  };
  const file = new File([receiptBlob(data)], receiptFileName(data.ref), {
    type: "application/pdf",
  });
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: `Order ${data.ref}`, text });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
