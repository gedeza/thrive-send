export function handleApiError(error: unknown, defaultMsg: string = "Internal Server Error") {
  // Optional: improve this with custom error classes if you need more detail
  if (process.env.NODE_ENV === 'development') {
    console.error("[API]", error);
  }
  if (error instanceof Error) {
    return { error: error.message || defaultMsg };
  }
  return { error: defaultMsg };
}