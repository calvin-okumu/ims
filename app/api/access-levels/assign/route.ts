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

// POST /api/access-levels/assign - Assign access level to person
export async function POST(request: NextRequest) {
  try {
    const { levelIds, pin } = await request.json();

    if (!levelIds || !pin) {
      return NextResponse.json(
        { error: 'levelIds and pin are required' },
        { status: 400 }
      );
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_ZKBIO_API_URL}/accLevel/addLevelPerson?access_token=${process.env.NEXT_PUBLIC_ZKBIO_API_TOKEN}`;

    console.log('Proxy API call to assign access level:', apiUrl, 'with data:', { levelIds, pin });

    const response = await axiosInstance.post(apiUrl, null, {
      params: {
        levelIds: Array.isArray(levelIds) ? levelIds.join(',') : levelIds,
        pin: pin
      }
    });

    console.log('Proxy API response for access level assignment:', response.data);

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Proxy API error for access level assignment:', error);

    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        {
          error: 'Access level assignment failed',
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

// DELETE /api/access-levels/assign - Remove access level from person
export async function DELETE(request: NextRequest) {
  try {
    const { levelIds, pin } = await request.json();

    if (!levelIds || !pin) {
      return NextResponse.json(
        { error: 'levelIds and pin are required' },
        { status: 400 }
      );
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_ZKBIO_API_URL}/accLevel/deleteLevel?access_token=${process.env.NEXT_PUBLIC_ZKBIO_API_TOKEN}`;

    console.log('Proxy API call to remove access level:', apiUrl, 'with data:', { levelIds, pin });

    const response = await axiosInstance.post(apiUrl, null, {
      params: {
        levelIds: Array.isArray(levelIds) ? levelIds.join(',') : levelIds,
        pin: pin
      }
    });

    console.log('Proxy API response for access level removal:', response.data);

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Proxy API error for access level removal:', error);

    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        {
          error: 'Access level removal failed',
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