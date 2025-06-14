import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/client';
import { randomInt } from 'crypto';

// POST /api/get_demo_code/referral
// Body: { agentId: string }
export async function POST(req: NextRequest) {
  const { agentId } = await req.json();
  if (!agentId) {
    return NextResponse.json({ error: 'Missing agentId' }, { status: 400 });
  }

  // Check if agent already has a referral code
  const existingAgent = await prisma.user.findUnique({ where: { id: agentId } });
  if (!existingAgent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }
  if (existingAgent.referralCode) {
    return NextResponse.json({ code: existingAgent.referralCode });
  }

  // Generate unique 6-digit code (numeric, allow leading zeros)
  let code: string;
  let exists = true;
  let attempts = 0;
  do {
    code = String(randomInt(0, 1000000)).padStart(6, '0');
    // Check for collision in User table
    exists = !!(await prisma.user.findFirst({ where: { referralCode: code } }));
    attempts++;
    if (attempts > 10) {
      return NextResponse.json({ error: 'Could not generate unique code, try again.' }, { status: 500 });
    }
  } while (exists);

  // Persist referral code on agent
  await prisma.user.update({ where: { id: agentId }, data: { referralCode: code } });
  return NextResponse.json({ code });
}
