import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { successResponse, errorResponse, HTTP_STATUS } from '@/lib/api-utils';
import { Contract } from '@/types';

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
    const contract = db.contracts.getById(contractId);
    
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
    const contract = db.contracts.getById(contractId);
    
    if (!contract) {
      return errorResponse('Contract not found', HTTP_STATUS.NOT_FOUND);
    }
    
    const body = await request.json();
    
    // Verify client exists if client ID is being changed
    if (body.clientId && body.clientId !== contract.clientId) {
      const client = db.clients.getById(body.clientId);
      if (!client) {
        return errorResponse('Client not found', HTTP_STATUS.NOT_FOUND);
      }
    }
    
    // Update contract
    const updatedContract = db.contracts.update(
      contractId, 
      body as Partial<Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>>
    );
    
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
    const contract = db.contracts.getById(contractId);
    
    if (!contract) {
      return errorResponse('Contract not found', HTTP_STATUS.NOT_FOUND);
    }
    
    // Delete contract
    db.contracts.delete(contractId);
    
    return successResponse({ deleted: true }, 'Contract deleted successfully');
  } catch (error) {
    console.error('Error deleting contract:', error);
    return errorResponse('Failed to delete contract', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
} 