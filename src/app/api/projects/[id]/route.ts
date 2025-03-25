import { NextRequest } from 'next/server';
import { successResponse, errorResponse, HTTP_STATUS } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

// Helper to get project ID from URL
function getProjectId(request: NextRequest) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  return pathParts[pathParts.length - 1];
}

// GET /api/projects/[id] - Get a single project
export async function GET(request: NextRequest) {
  try {
    const projectId = getProjectId(request);
    
    if (!projectId) {
      return errorResponse('Project ID is required', HTTP_STATUS.BAD_REQUEST);
    }
    
    // Check project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        organization: {
          select: {
            name: true,
            plan: true,
            email: true,
            phone: true
          }
        }
      }
    });
    
    if (!project) {
      return errorResponse('Project not found', HTTP_STATUS.NOT_FOUND);
    }
    
    return successResponse(project);
  } catch (error: any) {
    console.error('Error fetching project:', error);
    return errorResponse(error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// PUT /api/projects/[id] - Update a project
export async function PUT(request: NextRequest) {
  try {
    const projectId = getProjectId(request);
    const data = await request.json();
    
    if (!projectId) {
      return errorResponse('Project ID is required', HTTP_STATUS.BAD_REQUEST);
    }
    
    // Check project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId }
    });
    
    if (!existingProject) {
      return errorResponse('Project not found', HTTP_STATUS.NOT_FOUND);
    }
    
    // Update project
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data
    });
    
    return successResponse(updatedProject, 'Project updated successfully');
  } catch (error: any) {
    console.error('Error updating project:', error);
    return errorResponse(error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// DELETE /api/projects/[id] - Delete a project
export async function DELETE(request: NextRequest) {
  try {
    const projectId = getProjectId(request);
    
    if (!projectId) {
      return errorResponse('Project ID is required', HTTP_STATUS.BAD_REQUEST);
    }
    
    // Check project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId }
    });
    
    if (!existingProject) {
      return errorResponse('Project not found', HTTP_STATUS.NOT_FOUND);
    }
    
    // Delete project
    await prisma.project.delete({
      where: { id: projectId }
    });
    
    return successResponse({ success: true }, 'Project deleted successfully');
  } catch (error: any) {
    console.error('Error deleting project:', error);
    return errorResponse(error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
} 