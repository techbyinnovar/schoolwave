import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/utils/whatsappApi";

export async function POST(req: NextRequest) {
  console.log('[TestWhatsApp API] Request received');
  
  try {
    const body = await req.json();
    const { to, message, mediaUrl } = body;
    
    console.log('[TestWhatsApp API] Request parameters:', { 
      to: to ? `${to.substring(0, 4)}...` : undefined, // Log partial phone number for privacy
      messageLength: message ? message.length : 0,
      hasMedia: Boolean(mediaUrl)
    });
    
    if (!to || !message) {
      console.warn('[TestWhatsApp API] Missing required fields');
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
    
    console.log('[TestWhatsApp API] Attempting to send WhatsApp message', mediaUrl ? 'with media' : 'text only');
    const result = await sendWhatsAppMessage(to, message, mediaUrl);
    
    if (result.success) {
      // Type guard to ensure 'data' exists on the result object before access
      if ('data' in result && result.data) {
        console.log('[TestWhatsApp API] Message sent successfully', {
          instanceId: result.data?.data?.instanceId || 'unknown'
        });

        return NextResponse.json({
          success: true,
          timestamp: new Date().toISOString(),
          data: result.data,
          messageInfo: {
            to: to ? `${to.substring(0, 4)}...` : undefined,
            messageLength: message.length,
            hasMedia: Boolean(mediaUrl)
          }
        });
      } else {
        // This handles the case where success is true but no data is returned.
        const errorMessage = 'error' in result && typeof result.error === 'string' ? result.error : 'Operation successful but no data returned.';
        console.warn(`[TestWhatsApp API] ${errorMessage}`);
        return NextResponse.json({
          success: true,
          message: errorMessage,
          timestamp: new Date().toISOString(),
        });
      }
    } else {
      console.warn('[TestWhatsApp API] Failed to send message:', result.error);
      
      return NextResponse.json({ 
        success: false, 
        error: result.error,
        timestamp: new Date().toISOString(),
        messageInfo: {
          to: to ? `${to.substring(0, 4)}...` : undefined, // Log partial phone number for privacy
          messageLength: message.length
        }
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[TestWhatsApp API ERROR]', {
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
