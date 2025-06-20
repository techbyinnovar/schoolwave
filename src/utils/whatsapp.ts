// WhatsApp utility using waapi.api
// Docs: https://waapi.app/docs/api
import axios from 'axios';

export interface WhatsAppMessageOptions {
  to: string; // WhatsApp number in international format, e.g. +2348012345678
  message: string;
}

const WAAPI_URL = 'https://waapi.app/api/v1/messages/send';
const WAAPI_TOKEN = process.env.WAAPI_TOKEN;

if (!WAAPI_TOKEN) {
  throw new Error('WAAPI_TOKEN is not set in environment variables');
}

export async function sendWhatsAppMessage(options: WhatsAppMessageOptions): Promise<void> {
  const { to, message } = options;
  const payload = {
    to,
    message,
  };
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${WAAPI_TOKEN}`,
  };
  try {
    await axios.post(WAAPI_URL, payload, { headers });
  } catch (error: any) {
    // Log all errors with context
    console.error('[WAAPI SEND ERROR]', {
      error: error?.message || error,
      stack: error?.stack,
      payload,
      time: new Date().toISOString(),
      response: error?.response?.data,
      code: error?.code,
      config: error?.config,
    });
    throw error;
  }
}
