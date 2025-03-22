import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { successResponse, errorResponse, HTTP_STATUS } from '@/lib/api-utils';
import { Client } from '@/types';

// GET /api/clients - Get all clients
export async function GET(request: NextRequest) {
  try {
    const clients = db.clients.getAll();
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
    const existingClient = db.clients.getAll().find(client => client.email === body.email);
    if (existingClient) {
      return errorResponse('Email is already in use', HTTP_STATUS.CONFLICT);
    }
    
    // Create new client
    const newClient = db.clients.create(body as Omit<Client, 'id' | 'createdAt' | 'updatedAt'>);
    
    return successResponse(newClient, 'Client created successfully');
  } catch (error) {
    console.error('Error creating client:', error);
    return errorResponse('Failed to create client', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
} 