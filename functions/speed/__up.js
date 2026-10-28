export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'POST, OPTIONS',
        'access-control-allow-headers': '*',
      },
    });
  }

  // Consume and drain the incoming body
  let totalBytes = 0;
  if (context.request.body) {
    const reader = context.request.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
    }
  }

  return new Response(JSON.stringify({ status: 'ok', receivedBytes: totalBytes }), {
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*',
    },
  });
}
