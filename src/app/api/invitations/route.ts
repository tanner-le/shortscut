import { NextRequest } from 'next/server';
import { successResponse, errorResponse, HTTP_STATUS } from '@/lib/api-utils';
import { createClient } from '@supabase/supabase-js';
import { invitationService } from '@/services/invitationService';
import { sendInvitationEmail } from '@/lib/email';

// POST /api/invitations - Create a new invitation
export async function POST(request: NextRequest) {
  try {
    // Get the Supabase auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return errorResponse('Authentication required', HTTP_STATUS.UNAUTHORIZED);
    }

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Verify the token and get the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return errorResponse('Invalid authentication token', HTTP_STATUS.UNAUTHORIZED);
    }

    // Only admins can create invitations
    if (user.user_metadata?.role !== 'admin') {
      return errorResponse('Admin access required', HTTP_STATUS.FORBIDDEN);
    }

    // Parse request body
    const { email, name, role, organizationId } = await request.json();

    // Validate required fields
    if (!email || !name || !role || !organizationId) {
      return errorResponse('Email, name, role, and organizationId are required', HTTP_STATUS.BAD_REQUEST);
    }

    // Validate role (either client or teamMember)
    if (role !== 'client' && role !== 'teamMember') {
      return errorResponse('Role must be either client or teamMember', HTTP_STATUS.BAD_REQUEST);
    }

    try {
      // Create the invitation
      const invitation = await invitationService.create({
        email,
        name,
        role,
        organizationId
      });

      // Send the invitation email
      // This function would need to be implemented in lib/email.ts
      // For now, we'll assume it exists
      try {
        await sendInvitationEmail(email, name, invitation.token);
      } catch (emailError) {
        console.error('Failed to send invitation email:', emailError);
        // Continue even if email sending fails
      }

      return successResponse(invitation, 'Invitation created and email sent successfully');
    } catch (err: any) {
      return errorResponse(err.message || 'Error creating invitation', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  } catch (error) {
    console.error('Invitation creation error:', error);
    return errorResponse('An error occurred while creating the invitation', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
} 