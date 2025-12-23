import { NextRequest, NextResponse } from 'next/server';

const fallbackAreas = [
  { AreaID: 1, Name: 'General', Description: 'General access areas' },
  { AreaID: 2, Name: 'Secure', Description: 'Secure restricted areas' },
  { AreaID: 3, Name: 'Premium', Description: 'Premium customer areas' },
  { AreaID: 4, Name: 'Executive', Description: 'Executive only areas' }
];

export async function GET(request: NextRequest) {
  try {
    // Return fallback data for now
    return NextResponse.json(fallbackAreas);
  } catch (error) {
    console.error('Error fetching areas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch areas' },
      { status: 500 }
    );
  }
}