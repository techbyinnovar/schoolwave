import { NextRequest, NextResponse } from "next/server";
import { sendSmtpMail } from "@/utils/smtpMailer";

export async function POST(req: NextRequest) {
  console.log('[TestEmail API] Request received');
  
  try {
    const body = await req.json();
    const { to, subject, message, attachmentUrl } = body;
    
    console.log('[TestEmail API] Request parameters:', { 
      to: to ? `${to.substring(0, 4)}...` : undefined, // Log partial email for privacy
      subject: subject || 'No subject',
      messageLength: message ? message.length : 0,
      hasAttachment: Boolean(attachmentUrl)
    });
    
    if (!to || !message) {
      console.warn('[TestEmail API] Missing required fields');
      return NextResponse.json({ 
        success: false, 
        error: "Missing required fields",
        timestamp: new Date().toISOString(),
        requestInfo: { 
          hasTo: Boolean(to), 
          hasMessage: Boolean(message) 
        }
      }, { status: 400 });
    }
    
    console.log('[TestEmail API] Attempting to send email', attachmentUrl ? 'with attachment' : 'text only');
    
    try {
      let attachments = undefined;
      
      if (attachmentUrl && attachmentUrl.startsWith('http')) {
        // If there's an attachment URL, fetch it and include it as an attachment
        const response = await fetch(attachmentUrl);
        const buffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'application/octet-stream';
        
        // Extract filename from URL or use a default
        const urlParts = attachmentUrl.split('/');
        const filename = urlParts[urlParts.length - 1] || 'attachment';
        
        attachments = [{
          filename,
          content: Buffer.from(buffer),
          contentType
        }];
      }
      
      await sendSmtpMail({
        to,
        subject: subject || 'Test Email',
        html: message,
        attachments
      });
      
      console.log('[TestEmail API] Email sent successfully');
      
      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        messageInfo: {
          to: to ? `${to.substring(0, 4)}...` : undefined,
          subject: subject || 'Test Email',
          messageLength: message.length,
          hasAttachment: Boolean(attachmentUrl)
        }
      });
    } catch (emailError: any) {
      console.error('[TestEmail API] Failed to send email:', emailError);
      
      return NextResponse.json({ 
        success: false, 
        error: emailError?.message || "Failed to send email",
        timestamp: new Date().toISOString(),
        messageInfo: {
          to: to ? `${to.substring(0, 4)}...` : undefined,
          subject: subject || 'Test Email',
          messageLength: message.length
        }
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('[TestEmail API ERROR]', {
      error: error?.message || error,
      stack: error?.stack,
      time: new Date().toISOString(),
      requestBody: (typeof req.json === 'function') ? undefined : req.body // Avoid double-read
    });
    
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error", 
      message: error?.message || "Unknown error",
      timestamp: new Date().toISOString(),
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    }, { status: 500 });
  }
}
