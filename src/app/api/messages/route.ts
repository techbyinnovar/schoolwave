import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { getToken } from 'next-auth/jwt';

// Get all message templates (GET /api/messages)
export async function GET(req: NextRequest) {
  try {
    // You can add authentication here if needed
    const messages = await prisma.messageTemplate.findMany();
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch messages', details: (error as any)?.message }, { status: 500 });
  }
}

// Create a new message template (POST /api/messages)
export async function POST(req: NextRequest) {
  try {
    // Use NextAuth's getToken to get the session in API routes
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    if (!token || !token.sub) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    console.log('API: Incoming request body:', body);
    const { name, subject, emailHtml, emailDesign, emailImages, emailAttachments, whatsappText, whatsappImages, attachments } = body;

    // Create the template in the database
    const template = await prisma.messageTemplate.create({
      data: {
        name,
        subject,
        emailHtml,
        emailDesign, // <-- Persist emailDesign
        emailImages,
        emailAttachments,
        whatsappText,
        whatsappImages,
        createdById: token.sub as string, // token.sub contains the user ID
      },
    });

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Error creating message template:', {
      error,
      message: (error as any)?.message,
      stack: (error as any)?.stack,
    });
    return NextResponse.json({ error: 'Failed to create message template', details: (error as any)?.message }, { status: 500 });
  }
}

// Update an existing message template (PATCH /api/messages/:id)
export async function PATCH(req: NextRequest) {
  try {
    // Get all cookies for debugging
    console.log('All cookies:', Object.fromEntries(req.cookies.getAll().map(c => [c.name, c.value])));
    
    // Get the session token from cookies - try all possible cookie names
    const sessionToken = 
      req.cookies.get('next-auth.session-token')?.value || 
      req.cookies.get('__Secure-next-auth.session-token')?.value ||
      req.cookies.get('__Host-next-auth.session-token')?.value;
      
    if (!sessionToken) {
      console.error('No session token found in cookies');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Use NextAuth's getToken to get the session in API routes
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    if (!token || !token.sub) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (!token.role || token.role !== 'ADMIN') {
      console.error('Unauthorized or missing role in token', { token });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Extract ID from URL
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();
    console.error('xxxxxxxxxx', id);
    if (!id) {
      console.error('No template ID found in URL');
      return NextResponse.json({ error: 'Missing template ID' }, { status: 400 });
    }
    // Parse request data
    const data = await req.json();
    console.log('PATCH /api/messages/:id request data:', data);
    // Update the template in database
    console.log('Updating template with ID:', id);
    try {
      const rest = data;
      const template = await prisma.messageTemplate.update({
        where: { id },
        data: {
          ...rest,
          emailDesign: rest.emailDesign, // Explicitly persist emailDesign
          updatedAt: new Date(),
        },
      });
      console.log('PATCH /api/messages/:id updated template:', template);
      return NextResponse.json({ template });
    } catch (prismaError: any) {
      console.error('PATCH /api/messages/:id prisma error:', prismaError);
      if (prismaError.code === 'P2025') {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }
      throw prismaError;
    }
  } catch (error: any) {
    // Prisma not found error
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    console.error('Error updating message template:', error);
    return NextResponse.json({ error: 'Failed to update message template' }, { status: 500 });
  }
}
