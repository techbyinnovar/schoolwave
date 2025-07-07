// REST API for User CRUD
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "../../../../prisma/client";
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const role = searchParams.get('role');
  if (id) {
    const user = await prisma.user.findUnique({ where: { id }, select: { id: true, email: true, name: true, role: true, createdAt: true, referralCode: true } });
    return NextResponse.json({ user });
  }
  // Convert role string to enum if present
  const where = role ? { role: role as any } : undefined;
  const users = await prisma.user.findMany({ where, select: { id: true, email: true, name: true, role: true, createdAt: true, referralCode: true } });
  return NextResponse.json({ result: { data: users } });
}

export async function POST(req: NextRequest) {
  const data = await req.json();

  // Hash password if present
  if (data.password) {
    const saltRounds = 10;
    data.password = await bcrypt.hash(data.password, saltRounds);
  }

  if (data.id) {
    // Update existing user
    const user = await prisma.user.update({ where: { id: data.id }, data });
    return NextResponse.json({ user });
  } else {
    // Create new user
    // Generate a unique ID for the new user
    data.id = uuidv4();
    
    // If role is AGENT and no referralCode provided, auto-generate one
    if (data.role === 'AGENT' && !data.referralCode) {
      let code: string;
      let exists = true;
      let attempts = 0;
      do {
        code = String(Math.floor(100000 + Math.random() * 900000)).padStart(6, '0');
        exists = !!(await prisma.user.findFirst({ where: { referralCode: code } }));
        attempts++;
        if (attempts > 10) throw new Error('Could not generate unique referral code for agent.');
      } while (exists);
      data.referralCode = code;
    }
    
    // Add updatedAt field if it's required by the schema
    data.updatedAt = new Date();
    
    const user = await prisma.user.create({ data });
    return NextResponse.json({ user });
  }
}

export async function DELETE(req: NextRequest) {
  const data = await req.json();
  const { id } = data;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
