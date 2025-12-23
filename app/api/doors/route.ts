import { NextRequest, NextResponse } from 'next/server';
import apiClient from '../../../lib/apiClient';

export async function GET(request: NextRequest) {
  try {
    const response = await apiClient.get('/door/list?pageNo=1&pageSize=100');
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching doors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doors' },
      { status: 500 }
    );
  }
}