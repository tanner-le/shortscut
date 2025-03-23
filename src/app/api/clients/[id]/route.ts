import { NextRequest } from 'next/server';
import { successResponse, errorResponse, HTTP_STATUS } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

// Helper function to get client ID from URL
function getClientId(request: NextRequest) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  return pathParts[pathParts.length - 1];
}

// GET /api/clients/[id] - Get client by ID
export async function GET(request: NextRequest) {
  try {
    const clientId = getClientId(request);
    
    // Fetch client with Prisma
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: { contracts: true } // Include associated contracts
    });
    
    if (!client) {
      return errorResponse('Client not found', HTTP_STATUS.NOT_FOUND);
    }
    
    return successResponse(client, 'Client retrieved successfully');
  } catch (error) {
    console.error('Error retrieving client:', error);
    return errorResponse('Failed to retrieve client', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// PUT /api/clients/[id] - Update client
export async function PUT(request: NextRequest) {
  try {
    const clientId = getClientId(request);
    
    // Check if client exists
    const existingClient = await prisma.client.findUnique({
      where: { id: clientId }
    });
    
    if (!existingClient) {
      return errorResponse('Client not found', HTTP_STATUS.NOT_FOUND);
    }
    
    const body = await request.json();
    
    // Check for email uniqueness if email is being changed
    if (body.email && body.email !== existingClient.email) {
      const duplicateEmail = await prisma.client.findFirst({
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
    
    // Update client with Prisma
    const updatedClient = await prisma.client.update({
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
    const existingClient = await prisma.client.findUnique({
      where: { id: clientId }
    });
    
    if (!existingClient) {
      return errorResponse('Client not found', HTTP_STATUS.NOT_FOUND);
    }
    
    // Check if client has any contracts
    const clientContracts = await prisma.contract.findMany({
      where: { clientId }
    });
    
    if (clientContracts.length > 0) {
      return errorResponse(
        'Cannot delete client with existing contracts. Please delete associated contracts first.',
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    // Delete client with Prisma
    await prisma.client.delete({
      where: { id: clientId }
    });
    
    return successResponse({ deleted: true }, 'Client deleted successfully');
  } catch (error) {
    console.error('Error deleting client:', error);
    return errorResponse('Failed to delete client', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
} 