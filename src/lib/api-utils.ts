import { NextResponse } from 'next/server';

export enum HTTP_STATUS {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
};

// Success response
export function successResponse<T>(data?: T, message?: string): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };

  return NextResponse.json(response);
}

// Error response
export function errorResponse(messageOrErrors: string | string[], statusCode: HTTP_STATUS = HTTP_STATUS.BAD_REQUEST): NextResponse {
  const response: ApiResponse = {
    success: false,
  };

  if (Array.isArray(messageOrErrors)) {
    response.errors = messageOrErrors;
    response.message = messageOrErrors[0];
  } else {
    response.message = messageOrErrors;
  }

  return NextResponse.json(response, { status: statusCode });
} 