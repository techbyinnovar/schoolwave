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
    
    // Add more detailed logging for attachment debugging
    if (attachmentUrl) {
      console.log('[TestEmail API] Attachment details:', {
        type: typeof attachmentUrl,
        length: attachmentUrl.length,
        starts_with: attachmentUrl.substring(0, 20) + '...',
        is_base64: attachmentUrl.startsWith('data:'),
        is_url: attachmentUrl.startsWith('http')
      });
    } else {
      console.log('[TestEmail API] No attachment URL provided');
    }
    
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
      
      if (attachmentUrl) {
        if (attachmentUrl.startsWith('data:')) {
          // Handle base64 data URL format: data:[<mediatype>][;base64],<data>
          console.log('[TestEmail API] Processing base64 attachment');
          try {
            const matches = attachmentUrl.match(/^data:([\w\/\-\.]+);base64,(.+)$/);
            
            if (matches && matches.length === 3) {
              const contentType = matches[1];
              const base64Data = matches[2];
              
              // Generate filename based on content type
              let extension = 'bin';
              if (contentType.includes('image/')) {
                extension = contentType.split('/')[1];
              } else if (contentType.includes('application/pdf')) {
                extension = 'pdf';
              }
              
              const filename = `attachment-${new Date().getTime()}.${extension}`;
              
              attachments = [{
                filename,
                content: Buffer.from(base64Data, 'base64'),
                contentType
              }];
              
              console.log(`[TestEmail API] Base64 attachment processed: ${filename} (${contentType})`);
            } else {
              console.error('[TestEmail API] Invalid base64 data URL format');
            }
          } catch (base64Error) {
            console.error('[TestEmail API] Error processing base64 attachment:', base64Error);
          }
        } else if (attachmentUrl.startsWith('http')) {
          // If there's an attachment URL, fetch it and include it as an attachment
          console.log('[TestEmail API] Fetching attachment from URL');
          try {
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
            
            console.log(`[TestEmail API] URL attachment processed: ${filename} (${contentType})`);
          } catch (fetchError) {
            console.error('[TestEmail API] Error fetching attachment from URL:', fetchError);
          }
        }
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
