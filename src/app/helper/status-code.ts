export const StatusCode = {
  OK_200: 200,
  Accepted_202: 202,
  Created_201: 201,
  InternalServerError_500: 500,
  NotFound_404: 404,
  Forbidden_403: 403,
  Unauthorized_401: 401,
  BadRequest_400: 400,
  MethodNotAllowed_405: 405,
  Validation_Error_422: 422,
} as const;

export type StatusCode = (typeof StatusCode)[keyof typeof StatusCode];
