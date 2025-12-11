import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as https from 'https';

export async function POST(request: NextRequest) {
  try {
    const { pageNo = 1, pageSize = 50, deptCodes, pins } = await request.json();

    // Build query parameters
    const params = new URLSearchParams({
      pageNo: pageNo.toString(),
      pageSize: pageSize.toString(),
    });

    if (deptCodes) params.append('deptCodes', deptCodes);
    if (pins) params.append('pins', pins);

    const apiUrl = `${process.env.NEXT_PUBLIC_ZKBIO_API_URL}/v2/person/getPersonList?${params}&access_token=${process.env.NEXT_PUBLIC_ZKBIO_API_TOKEN}`;

    console.log('Proxy API call to:', apiUrl);

    // Create axios instance with HTTPS agent that ignores certificate validation
    const axiosInstance = axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      }),
      timeout: 10000
    });

    const response = await axiosInstance.post(apiUrl);

    console.log('Proxy API response:', response.data);

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