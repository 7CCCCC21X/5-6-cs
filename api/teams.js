const TARGET_URL = "https://copyfi-api.0x.one/api/v1/events/kr-vs-jp/teams";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
  "Access-Control-Max-Age": "86400"
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate"
    }
  });
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}

export async function GET() {
  try {
    const target = new URL(TARGET_URL);
    target.searchParams.set("_t", String(Date.now()));

    const upstream = await fetch(target.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    });

    const text = await upstream.text();

    if (!upstream.ok) {
      return json({
        error: true,
        upstream_status: upstream.status,
        upstream_status_text: upstream.statusText,
        upstream_body_preview: text.slice(0, 1000)
      }, upstream.status);
    }

    return new Response(text, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": upstream.headers.get("content-type") || "application/json; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "X-Upstream-Status": String(upstream.status)
      }
    });
  } catch (err) {
    return json({
      error: true,
      message: err instanceof Error ? err.message : String(err),
      target: TARGET_URL,
      time: new Date().toISOString()
    }, 502);
  }
}
