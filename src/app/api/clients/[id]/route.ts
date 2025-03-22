import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { successResponse, errorResponse, HTTP_STATUS } from '@/lib/api-utils';
import { Client } from '@/types';

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
    const client = db.clients.getById(clientId);
    
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
    const client = db.clients.getById(clientId);
    
    if (!client) {
      return errorResponse('Client not found', HTTP_STATUS.NOT_FOUND);
    }
    
    const body = await request.json();
    
    // Check for email uniqueness if email is being changed
    if (body.email && body.email !== client.email) {
      const existingClient = db.clients.getAll().find(c => c.email === body.email && c.id !== clientId);
      if (existingClient) {
        return errorResponse('Email is already in use', HTTP_STATUS.CONFLICT);
      }
    }
    
    // Update client
    const updatedClient = db.clients.update(clientId, body as Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt'>>);
    
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
    const client = db.clients.getById(clientId);
    
    if (!client) {
      return errorResponse('Client not found', HTTP_STATUS.NOT_FOUND);
    }
    
    // Check if client has any contracts
    const clientContracts = db.contracts.getByClientId(clientId);
    if (clientContracts.length > 0) {
      return errorResponse(
        'Cannot delete client with existing contracts. Please delete associated contracts first.',
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    // Delete client
    db.clients.delete(clientId);
    
    return successResponse({ deleted: true }, 'Client deleted successfully');
  } catch (error) {
    console.error('Error deleting client:', error);
    return errorResponse('Failed to delete client', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
} 