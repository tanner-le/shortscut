import { NextRequest } from 'next/server';
import { successResponse, errorResponse, HTTP_STATUS } from '@/lib/api-utils';
import { createClient } from '@supabase/supabase-js';
import { invitationService } from '@/services/invitationService';

// POST /api/invitations/complete - Complete registration with an invitation token
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { token, password, phoneNumber } = await request.json();

    // Validate required fields
    if (!token || !password) {
      return errorResponse('Token and password are required', HTTP_STATUS.BAD_REQUEST);
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

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: invitation.email,
      password,
      options: {
        data: {
          name: invitation.name,
          role: invitation.role,
          organizationId: invitation.organizationId,
          phoneNumber: phoneNumber || null
        }
      }
    });

    if (authError) {
      console.error('Error creating user:', authError);
      return errorResponse(authError.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    // Mark invitation as accepted
    await invitationService.accept(token);

    return successResponse({
      user: {
        id: authData.user!.id,
        email: authData.user!.email,
        name: invitation.name,
        role: invitation.role,
        organization: invitation.organization
      }
    }, 'Registration completed successfully');
  } catch (error) {
    console.error('Registration completion error:', error);
    return errorResponse('An error occurred during registration completion', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
} 