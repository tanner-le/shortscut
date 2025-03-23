import { NextRequest } from 'next/server';
import { successResponse, errorResponse, HTTP_STATUS } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

// GET /api/clients - Get all clients
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    
    // Build query filters
    const where: any = {};
    
    if (status) {
      if (status === 'active' || status === 'inactive') {
        where.status = status;
      }
    }
    
    // Fetch clients with Prisma
    const clients = await prisma.client.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    
    return successResponse(clients, 'Clients retrieved successfully');
  } catch (error) {
    console.error('Error retrieving clients:', error);
    return errorResponse('Failed to retrieve clients', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// POST /api/clients - Create a new client
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Simple validation
    const requiredFields = ['name', 'email', 'company', 'status'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return errorResponse(`Missing required field: ${field}`, HTTP_STATUS.BAD_REQUEST);
      }
    }
    
    // Check if email is already in use
    const existingClient = await prisma.client.findFirst({
      where: { email: body.email }
    });
    
    if (existingClient) {
      return errorResponse('Email is already in use', HTTP_STATUS.CONFLICT);
    }
    
    // Create new client with Prisma
    const newClient = await prisma.client.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        company: body.company,
        industry: body.industry || null,
        address: body.address || null,
        notes: body.notes || null,
        status: body.status
      }
    });
    
    return successResponse(newClient, 'Client created successfully');
  } catch (error) {
    console.error('Error creating client:', error);
    return errorResponse('Failed to create client', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
} 