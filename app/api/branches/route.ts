import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as https from 'https';
import { Branch, BranchHierarchy } from '../../../services/branchService';

// Create axios instance with HTTPS agent that ignores certificate validation
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  }),
  timeout: 10000
});

// Build hierarchical structure from flat list
const buildHierarchy = (flatBranches: Branch[]): BranchHierarchy[] => {
  const branchMap = new Map<string, any>();
  const roots: any[] = [];

  // Convert to hierarchy objects with default values
  flatBranches.forEach(branch => {
    const hierarchyBranch = {
      ...branch,
      level: branch.level || 1,
      isActive: branch.isActive !== undefined ? branch.isActive : true,
      children: [],
      fullPath: branch.name
    };
    branchMap.set(branch.code, hierarchyBranch);
  });

  // Build parent-child relationships
  flatBranches.forEach(branch => {
    const hierarchyBranch = branchMap.get(branch.code)!;

    if (branch.parentCode && branchMap.has(branch.parentCode)) {
      const parent = branchMap.get(branch.parentCode)!;
      parent.children!.push(hierarchyBranch);
      hierarchyBranch.fullPath = `${parent.fullPath} > ${branch.name}`;
      hierarchyBranch.level = parent.level + 1;
    } else {
      hierarchyBranch.level = 1;
      roots.push(hierarchyBranch);
    }
  });

  return roots;
};

// GET /api/branches - Fetch all branches with optional hierarchy
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeHierarchy = searchParams.get('includeHierarchy') === 'true';

    const apiUrl = `${process.env.NEXT_PUBLIC_ZKBIO_API_URL}/department/getDepartmentList?pageNo=1&pageSize=1000&access_token=${process.env.NEXT_PUBLIC_ZKBIO_API_TOKEN}`;

    console.log('Proxy API call to branches:', apiUrl);

    const response = await axiosInstance.post(apiUrl);

    console.log('Branches API: Raw ZK response:', response.data);
    console.log('Branches API: includeHierarchy:', includeHierarchy);
    console.log('Branches API: response.data.code:', response.data.code);

    if (includeHierarchy && response.data.code === 0) {
      // Transform flat list to hierarchy if requested
      const flatBranches = response.data.data?.data || [];
      console.log('Branches API: Flat branches from ZK:', flatBranches);
      const branches = buildHierarchy(flatBranches);
      console.log('Branches API: Hierarchical branches:', branches);
      const result = {
        ...response.data,
        data: {
          ...response.data.data,
          data: branches
        }
      };
      console.log('Branches API: Final response:', result);
      return NextResponse.json(result);
    }

    console.log('Branches API: Returning raw response (no hierarchy)');
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Proxy API error for branches:', error);

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

// POST /api/branches - Create new branch
export async function POST(request: NextRequest) {
  try {
    const branchData = await request.json();

    const apiUrl = `${process.env.NEXT_PUBLIC_ZKBIO_API_URL}/department/add?access_token=${process.env.NEXT_PUBLIC_ZKBIO_API_TOKEN}`;

    console.log('Proxy API call to create branch:', apiUrl, 'with data:', branchData);

    const response = await axiosInstance.post(apiUrl, { department: branchData });

    console.log('Proxy API response for branch creation:', response.data);

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Proxy API error for branch creation:', error);

    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        {
          error: 'Branch creation failed',
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