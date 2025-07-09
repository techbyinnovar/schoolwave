// Simple test endpoint to verify API routing
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  console.log('TEST ENDPOINT HIT');
  return NextResponse.json({ success: true, message: 'Test endpoint working' });
}

export async function POST(req: NextRequest) {
  console.log('TEST POST ENDPOINT HIT');
  const data = await req.json();
  console.log('Received data:', data);
  return NextResponse.json({ success: true, message: 'Test POST endpoint working', received: data });
}
