import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';

function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.password = '';
    return parsed.toString();
  } catch {
    return url;
  }
}

function normalizeApiBaseUrl(url: string): string {
  let cleaned = url.trim().replace(/\/+$/, '');
  if (!cleaned.endsWith('/api')) {
    cleaned = `${cleaned}/api`;
  }
  return cleaned;
}

function getInternalApiUrl(): string {
  const configuredUrl = process.env.INTERNAL_API_URL?.trim();
  if (configuredUrl) {
    return normalizeApiBaseUrl(configuredUrl);
  }
  return 'http://api:3001/api';
}

async function proxyRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  let primaryError: any = null;
  let primaryDestination = '';
  let lastError: any = null;
  let lastDestination = '';

  try {
    const rawParams = await Promise.resolve(context?.params);
    const path = rawParams?.path;
    const pathString = Array.isArray(path) ? path.join('/') : (path || '');
    const searchParams = request.nextUrl.search || '';

    const configured = getInternalApiUrl();

    // Internal server-to-server proxy candidates tried sequentially
    const rawCandidates = [
      configured,
      'http://api:3001/api',
      'http://backend:3001/api',
      'http://youtub-auto-api:3001/api',
      'http://host.docker.internal:3001/api',
      'http://172.17.0.1:3001/api',
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

    for (let i = 0; i < candidates.length; i++) {
      const baseUrl = candidates[i];
      const targetHost = baseUrl.replace(/\/$/, '');
      const destinationUrl = `${targetHost}/${pathString}${searchParams}`;
      if (i === 0) {
        primaryDestination = destinationUrl;
      }
      lastDestination = destinationUrl;

      // Retry transient container DNS / startup errors up to 3 attempts
      for (let attempt = 1; attempt <= 3; attempt++) {
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
          if (i === 0 && !primaryError) {
            primaryError = err;
          }
          lastError = err;

          const code = (err as any)?.cause?.code || (err as any)?.code || 'UNKNOWN';
          const isTransient = ['EAI_AGAIN', 'ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'FETCH_ERROR'].includes(code);

          console.warn('[AI_PROVIDER_PROXY_FETCH_ATTEMPT_FAILED]', {
            attempt,
            candidateIndex: i,
            url: sanitizeUrl(destinationUrl),
            method: request.method,
            errorName: err instanceof Error ? err.name : undefined,
            errorMessage: err instanceof Error ? err.message : undefined,
            causeCode: code,
            isTransient,
          });

          if (isTransient && attempt < 3) {
            await new Promise((resolve) => setTimeout(resolve, attempt * 350));
            continue;
          }
          break;
        }
      }
    }

    throw primaryError || lastError || new Error('All internal API proxy candidates failed');
  } catch (err: any) {
    const activeErr = primaryError || err;
    const activeDest = primaryDestination || lastDestination;

    const causeCode = activeErr?.cause?.code || activeErr?.code || 'ECONNREFUSED';

    let causeAddressPort = '';
    if (activeErr?.cause?.address && activeErr?.cause?.port) {
      causeAddressPort = ` ${activeErr.cause.address}:${activeErr.cause.port}`;
    } else if (activeDest) {
      try {
        const parsed = new URL(activeDest);
        causeAddressPort = ` ${parsed.host}`;
      } catch {
        causeAddressPort = ' api:3001';
      }
    } else {
      causeAddressPort = ' api:3001';
    }

    const causeDetails = `(${causeCode}${causeAddressPort})`;

    console.error('[API Proxy Fatal Error]:', {
      destination: sanitizeUrl(activeDest),
      errorName: activeErr?.name,
      errorMessage: activeErr?.message,
      cause: activeErr?.cause,
    });

    return NextResponse.json(
      {
        error: 'INTERNAL_API_UNREACHABLE',
        code: causeCode,
        message: `Unable to reach the API server ${causeDetails}. Check the API service status and try again.`,
        cause: activeErr?.cause
          ? {
              code: activeErr.cause.code,
              address: activeErr.cause.address || 'api',
              port: activeErr.cause.port || 3001,
              syscall: activeErr.cause.syscall,
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
