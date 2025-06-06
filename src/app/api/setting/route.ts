import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';


// GET: /api/setting?key=signup_stage_id
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');
  if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 });
  const setting = await prisma.setting.findUnique({ where: { key } });
  let value = setting?.value ?? null;
  try {
    if (typeof value === 'string') {
      value = JSON.parse(value);
    }
  } catch {
    // If not JSON, return as string
  }
  return NextResponse.json({ value });
}

// POST: /api/setting
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { key, value } = body;
  if (!key || typeof value === 'undefined') return NextResponse.json({ error: 'Missing key or value' }, { status: 400 });
  let storeValue: string;
  try {
    // If value is an object, store as JSON string
    storeValue = typeof value === 'string' ? value : JSON.stringify(value);
  } catch {
    storeValue = String(value);
  }
  const setting = await prisma.setting.upsert({
    where: { key },
    update: { value: storeValue },
    create: { key, value: storeValue },
  });
  return NextResponse.json({ value: setting.value });
}
