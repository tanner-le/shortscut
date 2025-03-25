import { NextRequest } from 'next/server';
import { organizationService, OrganizationPlan } from '@/services/organizationService';
import { successResponse, errorResponse, HTTP_STATUS } from '@/lib/api-utils';

// Define types for the organization data
interface OrganizationData {
  id: string;
  code: string;
  name: string;
  company: string;
  email?: string | null;
  phone?: string | null;
  industry?: string | null;
  address?: string | null;
  plan: OrganizationPlan;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  users: any[];
  _count?: {
    users: number;
    projects: number;
  };
}

// GET /api/organizations - Get all organizations
export async function GET(request: NextRequest) {
  try {
    const organizations = await organizationService.getAll();
    
    // Transform to include user count
    const transformedOrgs = organizations.map((org: OrganizationData) => ({
      id: org.id,
      code: org.code,
      name: org.name,
      company: org.company,
      email: org.email,
      phone: org.phone,
      industry: org.industry,
      address: org.address,
      plan: org.plan,
      status: org.status,
      userCount: org._count?.users || 0,
      projectCount: org._count?.projects || 0,
      createdAt: org.createdAt.toISOString(),
      updatedAt: org.updatedAt.toISOString()
    }));

    return successResponse(transformedOrgs);
  } catch (error: any) {
    console.error('Error fetching organizations:', error);
    return errorResponse(error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// POST /api/organizations - Create a new organization
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.company || !data.email || !data.plan) {
      return errorResponse('Name, company, email and plan are required', HTTP_STATUS.BAD_REQUEST);
    }
    
    // Create organization
    const organization = await organizationService.create(data);
    
    return successResponse({
      id: organization.id,
      code: organization.code,
      name: organization.name,
      company: organization.company,
      email: organization.email,
      phone: organization.phone,
      industry: organization.industry,
      address: organization.address,
      plan: organization.plan,
      status: organization.status,
      userCount: 0,
      projectCount: 0,
      createdAt: organization.createdAt.toISOString(),
      updatedAt: organization.updatedAt.toISOString()
    }, 'Organization created successfully');
  } catch (error: any) {
    console.error('Error creating organization:', error);
    return errorResponse(error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
} 