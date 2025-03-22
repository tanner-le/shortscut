import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { successResponse, errorResponse, HTTP_STATUS } from '@/lib/api-utils';
import { Contract } from '@/types';

// GET /api/contracts - Get all contracts
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const url = new URL(request.url);
    const clientId = url.searchParams.get('clientId');
    const status = url.searchParams.get('status');
    
    let contracts = db.contracts.getAll();
    
    // Filter by client ID if provided
    if (clientId) {
      contracts = contracts.filter(contract => contract.clientId === clientId);
    }
    
    // Filter by status if provided
    if (status) {
      contracts = contracts.filter(contract => contract.status === status);
    }
    
    return successResponse(contracts, 'Contracts retrieved successfully');
  } catch (error) {
    console.error('Error retrieving contracts:', error);
    return errorResponse('Failed to retrieve contracts', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// POST /api/contracts - Create a new contract
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Simple validation
    const requiredFields = ['title', 'clientId', 'startDate', 'value', 'status'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return errorResponse(`Missing required field: ${field}`, HTTP_STATUS.BAD_REQUEST);
      }
    }
    
    // Verify client exists
    const client = db.clients.getById(body.clientId);
    if (!client) {
      return errorResponse('Client not found', HTTP_STATUS.NOT_FOUND);
    }
    
    // Create new contract
    const newContract = db.contracts.create(body as Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>);
    
    return successResponse(newContract, 'Contract created successfully');
  } catch (error) {
    console.error('Error creating contract:', error);
    return errorResponse('Failed to create contract', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
} 