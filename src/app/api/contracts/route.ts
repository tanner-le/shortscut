import { NextRequest } from 'next/server';
import { successResponse, errorResponse, HTTP_STATUS } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

// Valid contract status values
const CONTRACT_STATUSES = ['draft', 'sent', 'signed', 'active', 'completed', 'cancelled'];

// GET /api/contracts - Get all contracts
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const url = new URL(request.url);
    const clientId = url.searchParams.get('clientId');
    const status = url.searchParams.get('status');
    
    // Build query filters
    const where: any = {};
    
    if (clientId) {
      where.clientId = clientId;
    }
    
    if (status) {
      // Validate status is a valid contract status
      if (CONTRACT_STATUSES.includes(status)) {
        where.status = status;
      }
    }
    
    // Fetch contracts with Prisma
    const contracts = await prisma.contract.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { client: true } // Include client data
    });
    
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
    const requiredFields = ['title', 'clientId', 'packageType', 'startDate', 'value', 'status'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return errorResponse(`Missing required field: ${field}`, HTTP_STATUS.BAD_REQUEST);
      }
    }
    
    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: body.clientId }
    });
    
    if (!client) {
      return errorResponse('Client not found', HTTP_STATUS.NOT_FOUND);
    }
    
    // Create new contract with Prisma
    const newContract = await prisma.contract.create({
      data: {
        title: body.title,
        clientId: body.clientId,
        packageType: body.packageType,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        totalMonths: body.totalMonths || null,
        syncCallDay: body.syncCallDay || null,
        value: body.value,
        status: body.status,
        description: body.description || null,
        terms: body.terms || null,
        files: body.files || []
      },
      include: { client: true }
    });
    
    return successResponse(newContract, 'Contract created successfully');
  } catch (error) {
    console.error('Error creating contract:', error);
    return errorResponse('Failed to create contract', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
} 