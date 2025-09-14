export function handleApiError(error: unknown, defaultMsg: string = "An unknown error occurred") {
  // Optional: improve this with custom error classes if you need more detail
  if (process.env.NODE_ENV === 'development') {
    console.error("", error);
  }

  if (error instanceof Error) {
    return {
      error: true,
      message: error.message || defaultMsg,
      status: (error as any).status || 500
    };
  }

  if (typeof error === 'object' && error !== null) {
    const apiError = error as { message?: string; status?: number };
    return {
      error: true,
      message: apiError.message || defaultMsg,
      status: apiError.status || 500
    };
  }

  return {
    error: true,
    message: defaultMsg,
    status: 500
  };
}