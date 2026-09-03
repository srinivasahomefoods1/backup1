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

async function uploadTemplate(workbookPath: string): Promise<string> {
  const { ENQUIRY_TEMPLATE_B64 } = await import("./enquiry-template.server");
  const bin = atob(ENQUIRY_TEMPLATE_B64.replace(/\s/g, ""));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const created = await gw(`/me/drive/root:/${workbookPath}:/content`, {
    method: "PUT",
    headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
    body: bytes,
  });
  if (!created.ok) throw new Error(`Excel upload failed [${created.status}]: ${await created.text()}`);
  return ((await created.json()) as { id: string }).id;
}

async function ensureWorkbook(): Promise<{ itemId: string; workbookPath: string }> {
  const [folderName, workbookName] = FILE_PATH.split("/");
  if (!folderName || !workbookName) throw new Error("Invalid Excel file path");
  const folderPath = encodeURIComponent(folderName);
  const existingFolder = await gw(`/me/drive/root:/${folderPath}`);
  if (!existingFolder.ok && existingFolder.status !== 404) {
    throw new Error(`Excel folder lookup failed [${existingFolder.status}]: ${await existingFolder.text()}`);
  }
  if (existingFolder.status === 404) {
    const createdFolder = await gw("/me/drive/root/children", {
      method: "POST",
      body: JSON.stringify({ name: folderName, folder: {}, "@microsoft.graph.conflictBehavior": "fail" }),
    });
    if (!createdFolder.ok && createdFolder.status !== 409) {
      throw new Error(`Excel folder creation failed [${createdFolder.status}]: ${await createdFolder.text()}`);
    }
  }

  const workbookPath = `${folderPath}/${encodeURIComponent(workbookName)}`;
  const found = await gw(`/me/drive/root:/${workbookPath}`);
  if (found.ok) return { itemId: ((await found.json()) as { id: string }).id, workbookPath };
  if (found.status !== 404) {
    throw new Error(`Excel lookup failed [${found.status}]: ${await found.text()}`);
  }
  return { itemId: await uploadTemplate(workbookPath), workbookPath };
}

const COL_END = "I";

async function appendRow(itemId: string, row: (string | number)[]): Promise<Response> {
  const used = await gw(
    `/me/drive/items/${itemId}/workbook/worksheets('Enquiries')/usedRange(valuesOnly=true)?$select=rowCount`,
  );
  if (!used.ok) return used;
  const { rowCount } = (await used.json()) as { rowCount: number };
  const target = (rowCount || 1) + 1;
  return gw(
    `/me/drive/items/${itemId}/workbook/worksheets('Enquiries')/range(address='A${target}:${COL_END}${target}')`,
    { method: "PATCH", body: JSON.stringify({ values: [row] }) },
  );
}

export const submitEnquiry = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const { itemId, workbookPath } = await ensureWorkbook();
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

    let res = await appendRow(itemId, row);
    if (!res.ok) {
      const body = await res.text();
      // A previously written workbook can be unreadable by Excel services; replace it and retry once.
      if (body.includes("FileCorruptTryRepair") || body.includes("unsupportedWorkbook")) {
        const freshId = await uploadTemplate(workbookPath);
        res = await appendRow(freshId, row);
        if (!res.ok) throw new Error(`Excel append failed [${res.status}]: ${await res.text()}`);
      } else {
        throw new Error(`Excel append failed [${res.status}]: ${body}`);
      }
    }
    return { ok: true as const, enquiryId };
  });

