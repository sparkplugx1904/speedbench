export async function onRequest(context) {
  const url = new URL(context.request.url);
  const bytes = Math.min(Number(url.searchParams.get('bytes') || 25000000), 50000000);

  if (bytes === 0) {
    return new Response('OK', {
      headers: {
        'content-type': 'text/plain',
        'cache-control': 'no-store, no-cache, must-revalidate',
        'access-control-allow-origin': '*',
      },
    });
  }

  const chunkSize = 65536;
  const chunk = new Uint8Array(chunkSize);
  let remaining = bytes;

  const stream = new ReadableStream({
    pull(controller) {
      if (remaining <= 0) {
        controller.close();
        return;
      }
      const sendSize = Math.min(remaining, chunkSize);
      remaining -= sendSize;
      controller.enqueue(sendSize === chunkSize ? chunk : chunk.subarray(0, sendSize));
    },
  });

  return new Response(stream, {
    headers: {
      'content-type': 'application/octet-stream',
      'content-length': String(bytes),
      'cache-control': 'no-store, no-cache, must-revalidate',
      'access-control-allow-origin': '*',
    },
  });
}
