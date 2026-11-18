// Recebe avisos de entrada/saída do grupo VIP (Sendflow ou qualquer ferramenta)
// e confirma a indicação pelo número de WhatsApp.
//
// URL: https://<projeto>.supabase.co/functions/v1/group-webhook?token=<webhook_token>
// Corpo aceito (JSON): o formato do Sendflow ou algo simples como
//   { "event": "join", "phone": "5531999999999" }
//   { "event": "leave", "phones": ["..."] }
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-token",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

// Coleta números de telefone (10 a 13 dígitos) em qualquer lugar do payload.
// IDs de grupo (120363...@g.us, 18+ dígitos) ficam de fora pelo tamanho.
function collectPhones(value: unknown, out: Set<string>) {
  if (value == null) return;
  if (typeof value === "string" || typeof value === "number") {
    const s = String(value);
    if (s.includes("@g.us")) return;
    const digits = s.replace(/\D/g, "");
    if (digits.length >= 10 && digits.length <= 13 && /^(55)?\d{10,11}$/.test(digits)) out.add(digits);
    return;
  }
  if (Array.isArray(value)) return value.forEach((v) => collectPhones(v, out));
  if (typeof value === "object") {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      // ignora campos que costumam ser IDs/datas, não telefones
      if (/(^id$|_id$|Id$|time|date|created|updated|timestamp)/i.test(k)) continue;
      collectPhones(v, out);
    }
  }
}

function detectEvent(body: Record<string, unknown>): "join" | "leave" | null {
  const raw = JSON.stringify(
    body.event ?? body.type ?? body.action ?? body.eventType ?? body.event_type ?? "",
  ).toLowerCase();
  if (/leave|left|remove|sai|exit/.test(raw)) return "leave";
  if (/join|add|entr|approved|member/.test(raw) || raw === '""') return "join";
  return null; // eventos irrelevantes (ex.: pedido de entrada criado)
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ ok: false, error: "use POST" }, 405);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const url = new URL(req.url);
  const token = url.searchParams.get("token") ?? req.headers.get("x-webhook-token") ?? "";
  const { data: secret } = await supabase.from("app_secrets").select("value").eq("key", "webhook_token").maybeSingle();
  if (!secret?.value || token !== secret.value) return json({ ok: false, error: "unauthorized" }, 401);

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "invalid json" }, 400);
  }

  const event = detectEvent(body);
  if (!event) return json({ ok: true, ignored: true });

  const phones = new Set<string>();
  collectPhones(body, phones);

  const results: unknown[] = [];
  for (const phone of phones) {
    const { data, error } = await supabase.rpc("mark_group_event", { _phone: phone, _event: event });
    results.push({ phone: phone.slice(0, 4) + "****" + phone.slice(-2), ok: !error, ...(data ?? {}) });
  }

  return json({ ok: true, event, processed: results.length, results });
});
