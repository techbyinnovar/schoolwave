import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/utils/whatsapp";

export async function POST(req: NextRequest) {
  try {
    const { to, message } = await req.json();
    if (!to || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    await sendWhatsAppMessage({ to, message });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[TestWhatsApp API ERROR]', {
      error: error?.message || error,
      stack: error?.stack,
      time: new Date().toISOString(),
      requestBody: (typeof req.json === 'function') ? undefined : req.body // Avoid double-read
    });
    return NextResponse.json({ error: error.message || "Failed to send message" }, { status: 500 });
  }
}
