import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as https from 'https';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageNo = searchParams.get('pageNo') || '1';
    const pageSize = searchParams.get('pageSize') || '50';

    const apiUrl = `${process.env.NEXT_PUBLIC_ZKBIO_API_URL}/v2/accLevel/list?pageNo=${pageNo}&pageSize=${pageSize}&access_token=${process.env.NEXT_PUBLIC_ZKBIO_API_TOKEN}`;

    console.log('Proxy API call to access levels:', apiUrl);

    // Create axios instance with HTTPS agent that ignores certificate validation
    const axiosInstance = axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      }),
      timeout: 10000
    });

    const response = await axiosInstance.get(apiUrl);

    console.log('Proxy API response for access levels:', response.data);

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Proxy API error:', error);

    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        {
          error: 'API request failed',
          status: error.response?.status,
          message: error.message,
          details: error.response?.data
        },
        { status: error.response?.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}