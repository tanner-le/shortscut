import { NextRequest } from 'next/server';
import { successResponse, errorResponse, HTTP_STATUS } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

// GET /api/clients - Get all clients (now using Organization model)
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
    
    // Fetch organizations with Prisma instead of clients
    const organizations = await prisma.organization.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            users: true
          }
        }
      }
    });
    
    // Transform to match the expected client format in the frontend
    const clients = organizations.map(org => ({
      id: org.id,
      code: org.code,
      name: org.name,
      email: org.email,
      phone: org.phone,
      company: org.company,
      industry: org.industry,
      address: org.address,
      notes: org.notes,
      status: org.status,
      userCount: org._count.users,
      plan: org.plan,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt
    }));
    
    return successResponse(clients, 'Clients retrieved successfully');
  } catch (error) {
    console.error('Error retrieving clients:', error);
    return errorResponse('Failed to retrieve clients', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// POST /api/clients - Create a new client (now using Organization model)
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

    // Check if required plan field is provided
    if (!body.plan || !['creator', 'studio'].includes(body.plan)) {
      body.plan = 'creator'; // Default to creator plan if not specified
    }
    
    // Check if email is already in use
    const existingOrganization = await prisma.organization.findFirst({
      where: { email: body.email }
    });
    
    if (existingOrganization) {
      return errorResponse('Email is already in use', HTTP_STATUS.CONFLICT);
    }
    
    // Generate a random 5-digit code
    const code = (10000 + Math.floor(Math.random() * 90000)).toString();
    
    // Create new organization with Prisma
    const newOrganization = await prisma.organization.create({
      data: {
        code,
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        company: body.company,
        industry: body.industry || null,
        address: body.address || null,
        notes: body.notes || null,
        status: body.status,
        plan: body.plan
      }
    });
    
    return successResponse(newOrganization, 'Client created successfully');
  } catch (error) {
    console.error('Error creating client:', error);
    return errorResponse('Failed to create client', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
} 