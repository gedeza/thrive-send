import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Starting simple debug endpoint...');
    
    return NextResponse.json({
      success: true,
      message: 'Debug endpoint working correctly',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Debug endpoint error:', error);
    return NextResponse.json({
      error: 'Debug endpoint failed',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    console.log('🔍 POST debug endpoint...');
    
    return NextResponse.json({
      success: true,
      message: 'POST debug endpoint working'
    });
    
  } catch (error) {
    console.error('❌ POST debug endpoint error:', error);
    return NextResponse.json({
      error: 'POST debug endpoint failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}