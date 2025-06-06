import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

import { db as prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name);
  const fileName = `${uuidv4()}${ext}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, fileName);
  fs.writeFileSync(filePath, buffer);

  // Only save file to disk, skip DB
  return NextResponse.json({
    url: `/uploads/${fileName}`,
    filename: file.name,
    mimetype: file.type,
  });
}

