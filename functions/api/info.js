export async function onRequest(context) {
  return new Response(
    JSON.stringify(
      {
        name: "speedbench",
        version: "1.0.0",
        platform: "Cloudflare Pages",
        timestamp: new Date().toISOString(),
      },
      null,
      2
    ),
    {
      headers: {
        "content-type": "application/json;charset=UTF-8",
        "cache-control": "no-store",
      },
    }
  );
}
