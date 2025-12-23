import { NextRequest, NextResponse } from 'next/server';

const fallbackReaders = [
  { ReaderID: 1, Name: 'Main Entrance', deviceSn: 'DEVICE001' },
  { ReaderID: 2, Name: 'Side Door', deviceSn: 'DEVICE001' },
  { ReaderID: 3, Name: 'Office Door', deviceSn: 'DEVICE002' }
];

export async function GET(request: NextRequest) {
  try {
    // Return fallback data for now
    return NextResponse.json(fallbackReaders);
  } catch (error) {
    console.error('Error fetching readers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch readers' },
      { status: 500 }
    );
  }
}