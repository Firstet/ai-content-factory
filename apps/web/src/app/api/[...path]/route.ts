import { NextRequest, NextResponse } from 'next/server';

const API_INTERNAL_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://api:3001/api';

async function proxyRequest(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathString = path ? path.join('/') : '';
  const searchParams = request.nextUrl.search;

  // Clean target URL
  const targetHost = API_INTERNAL_URL.replace(/\/$/, '');
  const destinationUrl = `${targetHost}/${pathString}${searchParams}`;

  try {
    const headers = new Headers(request.headers);
    headers.delete('host');

    const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.blob();

    const response = await fetch(destinationUrl, {
      method: request.method,
      headers,
      body,
      // @ts-ignore
      duplex: 'half',
    });

    const data = await response.arrayBuffer();

    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('transfer-encoding');

    return new NextResponse(data, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (err: any) {
    console.error(`[API Proxy Error] Failed to proxy request to ${destinationUrl}:`, err);
    return NextResponse.json(
      { message: `API Server Proxy Error: ${err.message || 'Internal connection error'}` },
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
