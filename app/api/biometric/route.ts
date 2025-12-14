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

// PUT /api/biometric - Upload biometric template
export async function PUT(request: NextRequest) {
  try {
    const biometricData = await request.json();

    const apiUrl = `${process.env.NEXT_PUBLIC_ZKBIO_API_URL}/bioTemplate/add?access_token=${process.env.NEXT_PUBLIC_ZKBIO_API_TOKEN}`;

    console.log('Proxy API call to upload biometric template:', apiUrl, 'with data:', biometricData);

    const response = await axiosInstance.post(apiUrl, {
      apiBioTemplate: biometricData
    });

    console.log('Proxy API response for biometric template upload:', response.data);

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Proxy API error for biometric template upload:', error);

    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        {
          error: 'Biometric template upload failed',
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

// GET /api/biometric - Get biometric templates by PIN
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pin = searchParams.get('pin');

    if (!pin) {
      return NextResponse.json(
        { error: 'PIN parameter is required' },
        { status: 400 }
      );
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_ZKBIO_API_URL}/v2/bioTemplate/getFgListByPin/${pin}?access_token=${process.env.NEXT_PUBLIC_ZKBIO_API_TOKEN}`;

    console.log('Proxy API call to get biometric templates:', apiUrl);

    const response = await axiosInstance.get(apiUrl);

    console.log('Proxy API response for biometric templates:', response.data);

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Proxy API error for biometric templates:', error);

    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        {
          error: 'Failed to retrieve biometric templates',
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