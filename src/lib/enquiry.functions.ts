import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY = "https://connector-gateway.lovable.dev/microsoft_excel";
const FILE_PATH = "Srinivasa Home Foods/Enquiries.xlsx";

const schema = z.object({
  name: z.string().min(1).max(120),
  phone: z.string().min(6).max(20),
  email: z.string().email().max(160).optional().or(z.literal("")),
  interest: z.string().max(80).optional().or(z.literal("")),
  message: z.string().min(1).max(2000),
  source: z.string().max(60).optional(),
});

function headers() {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const connKey = process.env["MICROSOFT_EXCEL_API_KEY"];
  if (!lovableKey || !connKey) throw new Error("Excel connection is not configured");
  return {
    Authorization: `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": connKey,
    "Content-Type": "application/json",
  };
}

async function gw(path: string, init?: RequestInit) {
  const res = await fetch(`${GATEWAY}${path}`, { ...init, headers: { ...headers(), ...(init?.headers as Record<string, string>) } });
  return res;
}

async function ensureWorkbook(): Promise<string> {
  const encoded = FILE_PATH.split("/").map(encodeURIComponent).join("/");
  const found = await gw(`/me/drive/root:/${encoded}`);
  if (found.ok) {
    const item = (await found.json()) as { id: string };
    return item.id;
  }
  if (found.status !== 404) {
    throw new Error(`Excel lookup failed [${found.status}]: ${await found.text()}`);
  }
  const { ENQUIRY_TEMPLATE_B64 } = await import("./enquiry-template.server");
  const bytes = Uint8Array.from(atob(ENQUIRY_TEMPLATE_B64), (c) => c.charCodeAt(0));
  const created = await gw(`/me/drive/root:/${encoded}:/content`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
    body: bytes,
  });
  if (!created.ok) throw new Error(`Excel upload failed [${created.status}]: ${await created.text()}`);
  const item = (await created.json()) as { id: string };
  return item.id;
}

export const submitEnquiry = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const itemId = await ensureWorkbook();
    const enquiryId = `ENQ-${Date.now().toString(36).toUpperCase()}`;
    const row = [
      enquiryId,
      new Date().toISOString().replace("T", " ").slice(0, 19),
      data.name,
      data.phone,
      data.email || "",
      data.interest || "",
      data.message,
      data.source || "website",
      "New",
    ];
    const res = await gw(`/me/drive/items/${itemId}/workbook/tables/Enquiries/rows/add`, {
      method: "POST",
      body: JSON.stringify({ values: [row] }),
    });
    if (!res.ok) throw new Error(`Excel append failed [${res.status}]: ${await res.text()}`);
    return { ok: true as const, enquiryId };
  });
