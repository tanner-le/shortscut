import { NextRequest } from 'next/server';
import { successResponse, errorResponse, HTTP_STATUS } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

// Helper function to get contract ID from URL
function getContractId(request: NextRequest) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  return pathParts[pathParts.length - 1];
}

// GET /api/contracts/[id] - Get contract by ID
export async function GET(request: NextRequest) {
  try {
    const contractId = getContractId(request);
    
    // Fetch contract with Prisma
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: { client: true }
    });
    
    if (!contract) {
      return errorResponse('Contract not found', HTTP_STATUS.NOT_FOUND);
    }
    
    return successResponse(contract, 'Contract retrieved successfully');
  } catch (error) {
    console.error('Error retrieving contract:', error);
    return errorResponse('Failed to retrieve contract', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// PUT /api/contracts/[id] - Update contract
export async function PUT(request: NextRequest) {
  try {
    const contractId = getContractId(request);
    
    // Check if contract exists
    const existingContract = await prisma.contract.findUnique({
      where: { id: contractId }
    });
    
    if (!existingContract) {
      return errorResponse('Contract not found', HTTP_STATUS.NOT_FOUND);
    }
    
    const body = await request.json();
    
    // Verify client exists if client ID is being changed
    if (body.clientId && body.clientId !== existingContract.clientId) {
      const client = await prisma.client.findUnique({
        where: { id: body.clientId }
      });
      
      if (!client) {
        return errorResponse('Client not found', HTTP_STATUS.NOT_FOUND);
      }
    }
    
    // Prepare update data
    const updateData: any = {};
    
    // Only include fields that are present in the request body
    if (body.title !== undefined) updateData.title = body.title;
    if (body.clientId !== undefined) updateData.clientId = body.clientId;
    if (body.packageType !== undefined) updateData.packageType = body.packageType;
    if (body.startDate !== undefined) updateData.startDate = new Date(body.startDate);
    if (body.endDate !== undefined) updateData.endDate = body.endDate ? new Date(body.endDate) : null;
    if (body.totalMonths !== undefined) updateData.totalMonths = body.totalMonths;
    if (body.syncCallDay !== undefined) updateData.syncCallDay = body.syncCallDay;
    if (body.value !== undefined) updateData.value = body.value;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.terms !== undefined) updateData.terms = body.terms;
    if (body.files !== undefined) updateData.files = body.files;
    
    // Update contract with Prisma
    const updatedContract = await prisma.contract.update({
      where: { id: contractId },
      data: updateData,
      include: { client: true }
    });
    
    return successResponse(updatedContract, 'Contract updated successfully');
  } catch (error) {
    console.error('Error updating contract:', error);
    return errorResponse('Failed to update contract', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// DELETE /api/contracts/[id] - Delete contract
export async function DELETE(request: NextRequest) {
  try {
    const contractId = getContractId(request);
    
    // Check if contract exists
    const existingContract = await prisma.contract.findUnique({
      where: { id: contractId }
    });
    
    if (!existingContract) {
      return errorResponse('Contract not found', HTTP_STATUS.NOT_FOUND);
    }
    
    // Delete contract with Prisma
    await prisma.contract.delete({
      where: { id: contractId }
    });
    
    return successResponse({ deleted: true }, 'Contract deleted successfully');
  } catch (error) {
    console.error('Error deleting contract:', error);
    return errorResponse('Failed to delete contract', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
} 