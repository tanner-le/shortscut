import { NextRequest } from 'next/server';
import { successResponse, errorResponse, HTTP_STATUS } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

// Helper function to get client ID from URL
function getClientId(request: NextRequest) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const id = pathParts[pathParts.length - 1];
  console.log(`Extracted client ID from URL: ${id}`);
  return id;
}

// GET /api/clients/[id] - Get client by ID
export async function GET(request: NextRequest) {
  try {
    const clientId = getClientId(request);
    console.log(`API: Fetching client with ID: ${clientId}`);
    
    // Optionally verify authorization if needed
    const authHeader = request.headers.get('authorization');
    
    // In a real implementation, you might validate the token here
    // For now, we'll just log it
    if (authHeader) {
      console.log('API: Request includes Authorization header');
    }
    
    // Fetch client with Prisma, including related data
    const client = await prisma.organization.findUnique({
      where: { id: clientId },
      include: { 
        projects: true, // Include associated projects
        users: true, // Include all user fields
        invitations: {
          where: { status: 'pending' },
        }
      }
    });
    
    console.log('API: Raw database response:', JSON.stringify(client, null, 2));
    
    if (!client) {
      console.log(`API: Client with ID ${clientId} not found`);
      return errorResponse('Client not found', HTTP_STATUS.NOT_FOUND);
    }
    
    // Transform the client data to match the expected format
    const transformedClient = {
      ...client,
      // Ensure any missing fields are properly set
      plan: client.plan || 'creator',
      status: client.status || 'active',
      code: client.code || '12345',
      users: client.users || [],
      invitations: client.invitations || [],
      projects: client.projects || []
    };
    
    console.log(`API: Successfully retrieved client ${client.name}`);
    return successResponse(transformedClient, 'Client retrieved successfully');
  } catch (error) {
    console.error('API: Error retrieving client:', error);
    return errorResponse(
      `Failed to retrieve client: ${error instanceof Error ? error.message : 'Unknown error'}`, 
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

// PUT /api/clients/[id] - Update client
export async function PUT(request: NextRequest) {
  try {
    const clientId = getClientId(request);
    
    // Check if client exists
    const existingClient = await prisma.organization.findUnique({
      where: { id: clientId }
    });
    
    if (!existingClient) {
      return errorResponse('Client not found', HTTP_STATUS.NOT_FOUND);
    }
    
    const body = await request.json();
    
    // Check for email uniqueness if email is being changed
    if (body.email && body.email !== existingClient.email) {
      const duplicateEmail = await prisma.organization.findFirst({
        where: { 
          email: body.email,
          id: { not: clientId }
        }
      });
      
      if (duplicateEmail) {
        return errorResponse('Email is already in use', HTTP_STATUS.CONFLICT);
      }
    }
    
    // Prepare update data
    const updateData: any = {};
    
    // Only include fields that are present in the request body
    if (body.name !== undefined) updateData.name = body.name;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.company !== undefined) updateData.company = body.company;
    if (body.industry !== undefined) updateData.industry = body.industry;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.plan !== undefined) updateData.plan = body.plan;
    
    // Update client with Prisma
    const updatedClient = await prisma.organization.update({
      where: { id: clientId },
      data: updateData
    });
    
    return successResponse(updatedClient, 'Client updated successfully');
  } catch (error) {
    console.error('Error updating client:', error);
    return errorResponse('Failed to update client', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// DELETE /api/clients/[id] - Delete client
export async function DELETE(request: NextRequest) {
  try {
    const clientId = getClientId(request);
    
    // Check if client exists
    const existingClient = await prisma.organization.findUnique({
      where: { id: clientId }
    });
    
    if (!existingClient) {
      return errorResponse('Client not found', HTTP_STATUS.NOT_FOUND);
    }
    
    // Check if client has any projects
    const clientProjects = await prisma.project.findMany({
      where: { organizationId: clientId }
    });
    
    if (clientProjects.length > 0) {
      return errorResponse(
        'Cannot delete client with existing projects. Please delete associated projects first.',
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    // Delete client with Prisma
    await prisma.organization.delete({
      where: { id: clientId }
    });
    
    return successResponse({ deleted: true }, 'Client deleted successfully');
  } catch (error) {
    console.error('Error deleting client:', error);
    return errorResponse('Failed to delete client', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
} 