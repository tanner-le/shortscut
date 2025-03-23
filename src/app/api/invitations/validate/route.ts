import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse, HTTP_STATUS } from '@/lib/api-utils';
import { invitationService } from '@/services/invitationService';

// GET /api/invitations/validate - Validate an invitation token
export async function GET(request: NextRequest) {
  try {
    // Get the token from the query params
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return errorResponse('Token is required', HTTP_STATUS.BAD_REQUEST);
    }

    // Check if invitation is valid
    const isValid = await invitationService.isValid(token);
    
    if (!isValid) {
      return errorResponse('Invalid or expired invitation token', HTTP_STATUS.BAD_REQUEST);
    }

    // Get invitation details
    const invitation = await invitationService.getByToken(token);
    
    if (!invitation) {
      return errorResponse('Invitation not found', HTTP_STATUS.NOT_FOUND);
    }

    // Return the invitation details with organization info
    return successResponse({
      name: invitation.name,
      email: invitation.email,
      role: invitation.role,
      organization: {
        id: invitation.organization.id,
        name: invitation.organization.name,
        company: invitation.organization.company
      }
    });
  } catch (error) {
    console.error('Error validating invitation:', error);
    return errorResponse('An error occurred while validating the invitation', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
} 