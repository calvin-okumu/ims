import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as https from 'https';

// Create axios instance with HTTPS agent that ignores certificate validation
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  }),
  timeout: 10000
});

// GET /api/persons - Fetch persons list
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageNo = searchParams.get('pageNo') || '1';
    const pageSize = searchParams.get('pageSize') || '50';
    const deptCodes = searchParams.get('deptCodes');
    const pins = searchParams.get('pins');

    // Build query parameters
    const params = new URLSearchParams({
      pageNo,
      pageSize,
    });

    if (deptCodes) params.append('deptCodes', deptCodes);
    if (pins) params.append('pins', pins);

    const apiUrl = `${process.env.NEXT_PUBLIC_ZKBIO_API_URL}/v2/person/getPersonList?${params}&access_token=${process.env.NEXT_PUBLIC_ZKBIO_API_TOKEN}`;

    console.log('Proxy API call to:', apiUrl);

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

// POST /api/persons - Create new person or fetch persons list
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if this is a person creation request (has person data) or list request (has pagination)
    if (body.pin || body.name || body.person) {
      // Person creation request
      const personData = body.person || body;

      const apiUrl = `${process.env.NEXT_PUBLIC_ZKBIO_API_URL}/person/add?access_token=${process.env.NEXT_PUBLIC_ZKBIO_API_TOKEN}`;

      console.log('Proxy API call to create person:', apiUrl, 'with data:', personData);

      const response = await axiosInstance.post(apiUrl, personData);

      console.log('Proxy API response for person creation:', response.data);

      return NextResponse.json(response.data);
    } else {
      // Persons list request
      const { pageNo = 1, pageSize = 50, deptCodes, pins } = body;

      // Build query parameters
      const params = new URLSearchParams({
        pageNo: pageNo.toString(),
        pageSize: pageSize.toString(),
      });

      if (deptCodes) params.append('deptCodes', deptCodes);
      if (pins) params.append('pins', pins);

      const apiUrl = `${process.env.NEXT_PUBLIC_ZKBIO_API_URL}/v2/person/getPersonList?${params}&access_token=${process.env.NEXT_PUBLIC_ZKBIO_API_TOKEN}`;

      console.log('Proxy API call to:', apiUrl);

      const response = await axiosInstance.post(apiUrl);

      console.log('Proxy API response:', response.data);

      return NextResponse.json(response.data);
    }
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

