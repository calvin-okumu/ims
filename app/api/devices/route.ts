import { NextRequest, NextResponse } from 'next/server';
import apiClient from '../../../lib/apiClient';

export async function GET(request: NextRequest) {
  try {
    const response = await apiClient.get('/device/accList?pageNo=1&pageSize=100');
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching devices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch devices' },
      { status: 500 }
    );
  }
}