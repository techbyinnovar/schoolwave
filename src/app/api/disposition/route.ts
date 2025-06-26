// REST API for Dispositions using Settings model
import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

// Settings key for storing dispositions
const DISPOSITIONS_KEY = 'dispositions';

// GET /api/disposition - get all available dispositions
export async function GET(req: NextRequest) {
  const setting = await prisma.setting.findUnique({ 
    where: { key: DISPOSITIONS_KEY } 
  });
  
  let dispositions = [];
  if (setting?.value) {
    try {
      // Parse the JSON array of dispositions
      dispositions = typeof setting.value === 'string' 
        ? JSON.parse(setting.value)
        : setting.value;
    } catch (e) {
      console.error('Error parsing dispositions:', e);
      // Return empty array if parse fails
    }
  }

  return NextResponse.json({ result: { data: dispositions } });
}

// POST /api/disposition - add a new disposition or update existing ones
export async function POST(req: NextRequest) {
  const data = await req.json();
  const { name } = data;
  
  if (!name) {
    return NextResponse.json({ error: 'Missing name' }, { status: 400 });
  }

  // Get current dispositions
  const setting = await prisma.setting.findUnique({ 
    where: { key: DISPOSITIONS_KEY } 
  });
  
  let dispositions = [];
  if (setting?.value) {
    try {
      dispositions = typeof setting.value === 'string'
        ? JSON.parse(setting.value)
        : setting.value;
    } catch (e) {
      // Start with empty array if parse fails
    }
  }

  // Add new disposition if it doesn't exist
  if (!dispositions.includes(name)) {
    dispositions.push(name);
  }

  // Update the setting
  const updatedSetting = await prisma.setting.upsert({
    where: { key: DISPOSITIONS_KEY },
    update: { value: JSON.stringify(dispositions) },
    create: { key: DISPOSITIONS_KEY, value: JSON.stringify(dispositions) },
  });

  return NextResponse.json({ 
    result: { 
      data: typeof updatedSetting.value === 'string'
        ? JSON.parse(updatedSetting.value)
        : updatedSetting.value 
    } 
  });
}

// DELETE /api/disposition - delete a disposition
export async function DELETE(req: NextRequest) {
  const data = await req.json();
  const { name } = data;
  
  if (!name) {
    return NextResponse.json({ error: 'Missing name' }, { status: 400 });
  }

  // Get current dispositions
  const setting = await prisma.setting.findUnique({ 
    where: { key: DISPOSITIONS_KEY } 
  });
  
  if (!setting?.value) {
    return NextResponse.json({ success: false, error: 'Dispositions not found' });
  }

  let dispositions = [];
  try {
    dispositions = typeof setting.value === 'string'
      ? JSON.parse(setting.value)
      : setting.value;
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Invalid dispositions data' });
  }

  // Remove the disposition
  const updatedDispositions = dispositions.filter((d: string) => d !== name);

  // Update the setting
  await prisma.setting.update({
    where: { key: DISPOSITIONS_KEY },
    data: { value: JSON.stringify(updatedDispositions) },
  });

  return NextResponse.json({ success: true });
}
