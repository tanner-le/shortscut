import { NextRequest } from 'next/server';
import { successResponse, errorResponse, HTTP_STATUS } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

// GET /api/organizations/[id]/projects - Get all projects for an organization
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = params.id;
    
    if (!organizationId) {
      return errorResponse('Organization ID is required', HTTP_STATUS.BAD_REQUEST);
    }
    
    // Fetch projects for this organization
    const projects = await prisma.project.findMany({
      where: {
        organizationId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return successResponse(projects);
  } catch (error: any) {
    console.error('Error fetching organization projects:', error);
    return errorResponse(error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
} 