import { NextRequest, NextResponse } from 'next/server';

const WEBHOOK_SERVER = 'http://localhost:3001/webhook';

// GET - WhatsApp webhook verification
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Forward all query params to the Elysia server
  const params = new URLSearchParams();
  searchParams.forEach((value, key) => {
    params.append(key, value);
  });
  
  try {
    const response = await fetch(`${WEBHOOK_SERVER}?${params.toString()}`);
    const text = await response.text();
    
    return new NextResponse(text, {
      status: response.status,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error('Webhook verification error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST - WhatsApp incoming messages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(WEBHOOK_SERVER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const text = await response.text();
    
    return new NextResponse(text, {
      status: response.status,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error('Webhook POST error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
