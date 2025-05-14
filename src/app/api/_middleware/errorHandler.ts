/**
 * Standard error response for Next.js API routes
 */
export function handleApiError(error: any) {
  // Extend this for sentry/reporting as needed
  const isZodError = error?.issues && Array.isArray(error.issues);
  return new Response(
    JSON.stringify({
      error: isZodError
        ? error.issues.map((e: any) => e.message).join(', ')
        : error.message || 'Internal server error',
    }),
    {
      status: error.statusCode || (isZodError ? 400 : 500),
      headers: { 'Content-Type': 'application/json' },
    }
  );
}