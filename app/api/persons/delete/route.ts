import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as https from 'https';
import { logInfo, logError } from '../../../../lib/logger';

// Create axios instance with HTTPS agent that ignores certificate validation
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  }),
  timeout: 10000
});

// POST /api/persons/delete - Delete person by PIN (personnel dismissal)
export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json();

    if (!pin) {
      return NextResponse.json(
        { error: 'PIN is required' },
        { status: 400 }
      );
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_ZKBIO_API_URL}/person/delete/${pin}?access_token=${process.env.NEXT_PUBLIC_ZKBIO_API_TOKEN}`;

    logInfo('Proxy API call to delete person', { apiUrl });

    const response = await axiosInstance.post(apiUrl);

    logInfo('Proxy API response for person deletion', { status: response.status });
  } catch (error) {
    logError('Proxy API error for person deletion', error);

    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        {
          error: 'Person deletion failed',
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