// Simple test endpoint to verify logging
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Direct console.log calls
  console.log('TEST-LOGGING: This is a test log');
  console.log('TEST-LOGGING: Object test', { test: 'value', number: 123 });
  
  // Try different console methods
  console.info('TEST-LOGGING-INFO: Info level log');
  console.warn('TEST-LOGGING-WARN: Warning level log');
  console.error('TEST-LOGGING-ERROR: Error level log');
  
  // Return success
  return NextResponse.json({ 
    success: true, 
    message: 'Test logging endpoint called, check server console for logs'
  });
}
