import axios from 'axios';
import * as https from 'https';

// Create axios instance with SSL bypass for ZKBio API
const apiClient = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  }),
  timeout: 10000
});

export interface Branch {
  code: string;
  name: string;
  description?: string;
  parentCode?: string;
  level: number;
  isActive: boolean;
  createdAt?: string;
}

export interface BranchHierarchy extends Branch {
  children?: BranchHierarchy[];
  fullPath: string;
}

// Cached branch data with TTL
let branchCache: {
  data: BranchHierarchy[];
  timestamp: number;
  ttl: number;
} | null = null;

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Build hierarchical structure from flat list
const buildHierarchy = (flatBranches: Branch[]): BranchHierarchy[] => {
  const branchMap = new Map<string, BranchHierarchy>();
  const roots: BranchHierarchy[] = [];

  // Convert to hierarchy objects with default values
  flatBranches.forEach(branch => {
    const hierarchyBranch: BranchHierarchy = {
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

export const getBranches = async (forceRefresh = false): Promise<BranchHierarchy[]> => {
  const now = Date.now();

  // Return cached data if valid and not forcing refresh
  if (!forceRefresh && branchCache && (now - branchCache.timestamp) < CACHE_TTL) {
    return branchCache.data;
  }

  try {
    console.log('BranchService: Fetching branches from API...');
    // Use Next.js API proxy to avoid CORS issues
    const response = await fetch('/api/branches?includeHierarchy=true');
    console.log('BranchService: API response status:', response.status);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('BranchService: Raw API response:', data);

    // Handle ZKBio response format
    if (data.code === 0) {
      const branches = data.data?.data || [];
      console.log('BranchService: Processed branches:', branches);
      console.log('BranchService: Branches type:', typeof branches);
      console.log('BranchService: Branches isArray:', Array.isArray(branches));
      console.log('BranchService: Branches length:', branches.length);
      branchCache = { data: branches, timestamp: now, ttl: CACHE_TTL };
      return branches;
    }

    throw new Error(data.message || 'Failed to fetch branches');
  } catch (error) {
    console.error('BranchService: Branch fetch error:', error);
    // Return cached data on error if available
    return branchCache?.data || [];
  }
};

export const getDefaultBranch = async (): Promise<Branch | null> => {
  const branches = await getBranches();
  // Return first active branch or branch with code '1' as default
  return branches.find(b => b.isActive && b.code === '1') ||
         branches.find(b => b.isActive) ||
         null;
};

export const createBranch = async (branchData: Omit<Branch, 'level' | 'isActive'>): Promise<Branch> => {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_ZKBIO_API_URL}/department/add?access_token=${process.env.NEXT_PUBLIC_ZKBIO_API_TOKEN}`;

    const response = await apiClient.post(apiUrl, { department: branchData });

    if (response.data.code === 0) {
      // Invalidate cache to force refresh
      branchCache = null;
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to create branch');
  } catch (error) {
    console.error('Branch creation error:', error);
    throw error;
  }
};

export const getBranchByCode = async (code: string): Promise<Branch | null> => {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_ZKBIO_API_URL}/department/get/${code}?access_token=${process.env.NEXT_PUBLIC_ZKBIO_API_TOKEN}`;

    const response = await apiClient.get(apiUrl);

    if (response.data.code === 0) {
      return response.data.data;
    }

    return null;
  } catch (error) {
    console.error('Branch fetch by code error:', error);
    return null;
  }
};