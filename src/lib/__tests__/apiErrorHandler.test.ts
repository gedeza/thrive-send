import { handleApiError } from '../apiErrorHandler';

describe('handleApiError', () => {
  it('handles standard Error objects', () => {
    const error = new Error('Test error');
    const result = handleApiError(error);
    
    expect(result).toEqual({
      error: true,
      message: 'Test error',
      status: 500
    });
  });

  it('handles custom API errors', () => {
    const apiError = {
      message: 'Not Found',
      status: 404
    };
    const result = handleApiError(apiError);
    
    expect(result).toEqual({
      error: true,
      message: 'Not Found',
      status: 404
    });
  });

  it('handles errors with custom status codes', () => {
    const error = new Error('Unauthorized');
    (error as any).status = 401;
    const result = handleApiError(error);
    
    expect(result).toEqual({
      error: true,
      message: 'Unauthorized',
      status: 401
    });
  });

  it('handles undefined errors', () => {
    const result = handleApiError(undefined);
    
    expect(result).toEqual({
      error: true,
      message: 'An unknown error occurred',
      status: 500
    });
  });

  it('handles null errors', () => {
    const result = handleApiError(null);
    
    expect(result).toEqual({
      error: true,
      message: 'An unknown error occurred',
      status: 500
    });
  });
});