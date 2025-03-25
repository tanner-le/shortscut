import { NextRequest } from 'next/server';
import { successResponse, errorResponse, HTTP_STATUS } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { ProjectStatus } from '@/types/project';

// GET /api/projects - List all projects
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const url = new URL(request.url);
    const status = url.searchParams.get('status') as ProjectStatus | null;
    const organizationId = url.searchParams.get('organizationId');
    
    // Build filtering conditions
    const where: any = {};
    
    // Add organization filter if specified
    if (organizationId) {
      where.organizationId = organizationId;
    }
    
    // Add status filter if specified
    if (status) {
      where.status = status;
    }
    
    // Fetch projects based on filters
    const projects = await prisma.project.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        organization: {
          select: {
            name: true,
            plan: true
          }
        }
      }
    });
    
    return successResponse(projects);
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    return errorResponse(error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.title || !data.organizationId || !data.status) {
      return errorResponse('Missing required fields: title, organizationId, status', HTTP_STATUS.BAD_REQUEST);
    }
    
    // Check organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: data.organizationId }
    });
    
    if (!organization) {
      return errorResponse('Organization not found', HTTP_STATUS.NOT_FOUND);
    }
    
    // Get the current month and year
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-based month
    
    // Create first day of current month date
    const firstDay = new Date(currentYear, currentMonth, 1);
    
    // Check monthly project limit
    const monthlyProjects = await prisma.project.count({
      where: {
        organizationId: data.organizationId,
        createdAt: {
          gte: firstDay
        }
      }
    });
    
    const projectLimit = organization.plan === 'studio' ? 16 : 8;
    
    if (monthlyProjects >= projectLimit) {
      return errorResponse(
        `Monthly project limit (${projectLimit}) reached for this organization`,
        HTTP_STATUS.FORBIDDEN
      );
    }
    
    // Process input data for Prisma
    let projectData = { ...data };
    
    // Handle dates
    try {
      // Ensure startDate is set
      if (data.startDate) {
        projectData.startDate = new Date(data.startDate);
      } else {
        projectData.startDate = new Date();
      }
      
      // Only set dueDate if provided
      if (data.dueDate && data.dueDate.trim()) {
        projectData.dueDate = new Date(data.dueDate);
      }
    } catch (dateError) {
      return errorResponse('Invalid date format provided', HTTP_STATUS.BAD_REQUEST);
    }
    
    // Create project
    const project = await prisma.project.create({
      data: projectData
    });
    
    return successResponse(project, 'Project created successfully', HTTP_STATUS.CREATED);
  } catch (error: any) {
    console.error('Error creating project:', error);
    return errorResponse(error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
} 