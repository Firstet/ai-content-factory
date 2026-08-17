import { NextRequest, NextResponse } from 'next/server';

function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.password = '';
    return parsed.toString();
  } catch {
    return url;
  }
}

function getInternalApiUrl(): string {
  const url = process.env.INTERNAL_API_URL || 'http://api:3001/api';
  if (!url || url.trim() === '') {
    throw new Error('[CONFIG_ERROR] INTERNAL_API_URL environment variable is not configured.');
  }
  return url.trim();
}

async function proxyRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  let lastError: any = null;
  let lastDestination = '';

  try {
    const rawParams = await Promise.resolve(context?.params);
    const path = rawParams?.path;
    const pathString = Array.isArray(path) ? path.join('/') : (path || '');
    const searchParams = request.nextUrl.search || '';

    const canonicalInternalUrl = getInternalApiUrl();

    // Internal server-to-server proxy candidates ONLY (Docker internal DNS / local dev)
    const rawCandidates = [
      canonicalInternalUrl,
      'http://api:3001/api',
      'http://127.0.0.1:3001/api',
      'http://localhost:3001/api',
    ];

    const candidates = Array.from(
      new Set(
        rawCandidates
          .filter(Boolean)
          .map((url) => url!.trim())
          .filter((url) => url.length > 0)
      )
    );

    const headers = new Headers();
    request.headers.forEach((value, key) => {
      const keyLower = key.toLowerCase();
      if (!['host', 'content-length', 'connection', 'accept-encoding'].includes(keyLower)) {
        headers.set(key, value);
      }
    });

    let body: ArrayBuffer | undefined = undefined;
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method.toUpperCase())) {
      try {
        const buf = await request.arrayBuffer();
        if (buf && buf.byteLength > 0) {
          body = buf;
        }
      } catch {
        // Ignore empty body read errors
      }
    }

    for (const baseUrl of candidates) {
      const targetHost = baseUrl.replace(/\/$/, '');
      const destinationUrl = `${targetHost}/${pathString}${searchParams}`;
      lastDestination = destinationUrl;

      try {
        const response = await fetch(destinationUrl, {
          method: request.method,
          headers,
          body,
          cache: 'no-store',
        });

        const data = await response.arrayBuffer();

        const responseHeaders = new Headers();
        response.headers.forEach((value, key) => {
          const keyLower = key.toLowerCase();
          if (!['content-encoding', 'transfer-encoding', 'content-length'].includes(keyLower)) {
            responseHeaders.set(key, value);
          }
        });

        return new NextResponse(data, {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
        });
      } catch (err: any) {
        console.error('[AI_PROVIDER_PROXY_FETCH_FAILED]', {
          url: sanitizeUrl(destinationUrl),
          method: request.method,
          errorName: err instanceof Error ? err.name : undefined,
          errorMessage: err instanceof Error ? err.message : undefined,
          cause: err instanceof Error ? (err as any).cause : undefined,
          causeCode: (err as any)?.cause?.code,
          causeAddress: (err as any)?.cause?.address,
          causePort: (err as any)?.cause?.port,
          causeSyscall: (err as any)?.cause?.syscall,
        });
        lastError = err;
      }
    }

    throw lastError || new Error('All internal API proxy candidates failed');
  } catch (err: any) {
    const causeCode = err?.cause?.code || err?.code || 'ECONNREFUSED';

    let causeAddressPort = '';
    if (err?.cause?.address && err?.cause?.port) {
      causeAddressPort = ` ${err.cause.address}:${err.cause.port}`;
    } else if (lastDestination) {
      try {
        const parsed = new URL(lastDestination);
        causeAddressPort = ` ${parsed.host}`;
      } catch {
        causeAddressPort = ' api:3001';
      }
    } else {
      causeAddressPort = ' api:3001';
    }

    const causeDetails = `(${causeCode}${causeAddressPort})`;

    console.error('[API Proxy Fatal Error]:', {
      destination: sanitizeUrl(lastDestination),
      errorName: err?.name,
      errorMessage: err?.message,
      cause: err?.cause,
    });

    return NextResponse.json(
      {
        error: 'INTERNAL_API_UNREACHABLE',
        code: causeCode,
        message: `Unable to reach the API server ${causeDetails}. Check the API service status and try again.`,
        cause: err?.cause
          ? {
              code: err.cause.code,
              address: err.cause.address || 'api',
              port: err.cause.port || 3001,
              syscall: err.cause.syscall,
            }
          : {
              code: causeCode,
              address: 'api',
              port: 3001,
            },
      },
      { status: 502 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const OPTIONS = proxyRequest;
