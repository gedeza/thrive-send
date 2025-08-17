import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useServiceProvider } from '@/context/ServiceProviderContext';
import { validateCreateClient, validateUpdateClient, validateClientResponse, type CreateClientData, type UpdateClientData, type ClientResponse } from '@/lib/validation/client-validation';

export interface UseClientOperationsResult {
  // State
  isLoading: boolean;
  error: string | null;
  
  // Operations
  createClient: (data: CreateClientData) => Promise<ClientResponse | null>;
  updateClient: (id: string, data: UpdateClientData) => Promise<ClientResponse | null>;
  deleteClient: (id: string) => Promise<boolean>;
  fetchClient: (id: string) => Promise<ClientResponse | null>;
  
  // Utilities
  clearError: () => void;
  retry: () => Promise<void>;
}

export const useClientOperations = (): UseClientOperationsResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastOperation, setLastOperation] = useState<(() => Promise<void>) | null>(null);
  
  const { toast } = useToast();
  const { state: { organizationId }, refreshClients } = useServiceProvider();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retry = useCallback(async () => {
    if (lastOperation) {
      await lastOperation();
    }
  }, [lastOperation]);

  const handleError = useCallback((error: unknown, operation: string) => {
    const errorMessage = error instanceof Error ? error.message : `Failed to ${operation}`;
    setError(errorMessage);
    
    console.error(`Client operation error (${operation}):`, error);
    
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
    
    return null;
  }, [toast]);

  const createClient = useCallback(async (data: CreateClientData): Promise<ClientResponse | null> => {
    const operation = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Validate input data
        const validationResult = validateCreateClient(data);
        if (!validationResult.success) {
          throw new Error(`Validation failed: ${validationResult.error.issues.map(i => i.message).join(', ')}`);
        }

        const validatedData = validationResult.data;

        // Ensure organization ID is set
        const effectiveOrgId = validatedData.organizationId || organizationId;
        if (!effectiveOrgId) {
          throw new Error('No organization selected. Please select an organization first.');
        }

        // Prepare payload
        const payload = {
          ...validatedData,
          organizationId: effectiveOrgId,
          // Clean up optional fields
          website: validatedData.website || null,
          phone: validatedData.phone || null,
          industry: validatedData.industry || null,
          address: validatedData.address || null,
          logoUrl: validatedData.logoUrl || null,
        };

        // Make API call
        const response = await fetch('/api/service-provider/clients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.text();
          let errorMessage = `Failed to create client (${response.status})`;
          
          try {
            const parsedError = JSON.parse(errorData);
            errorMessage = parsedError.error || errorMessage;
          } catch {
            // Response isn't JSON, use status text
            errorMessage = `${errorMessage}: ${response.statusText}`;
          }
          
          throw new Error(errorMessage);
        }

        // Parse and validate response
        const responseData = await response.json();
        const validatedResponse = validateClientResponse(responseData);
        
        if (!validatedResponse.success) {
          throw new Error('Invalid response format from server');
        }

        // Success
        toast({
          title: "Success",
          description: "Client created successfully!",
        });

        // Refresh client list
        await refreshClients();

        return validatedResponse.data;

      } catch (error) {
        return handleError(error, 'create client');
      } finally {
        setIsLoading(false);
      }
    };

    setLastOperation(() => operation);
    return await operation();
  }, [organizationId, toast, refreshClients, handleError]);

  const updateClient = useCallback(async (id: string, data: UpdateClientData): Promise<ClientResponse | null> => {
    const operation = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!id) {
          throw new Error('Client ID is required for updates');
        }

        // Validate input data
        const validationResult = validateUpdateClient(data);
        if (!validationResult.success) {
          throw new Error(`Validation failed: ${validationResult.error.issues.map(i => i.message).join(', ')}`);
        }

        const validatedData = validationResult.data;

        if (!organizationId) {
          throw new Error('No organization selected');
        }

        // Prepare payload - only include fields that have values
        const payload = Object.entries(validatedData).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== '') {
            acc[key] = value === '' ? null : value;
          }
          return acc;
        }, {} as Record<string, any>);

        // Make API call
        const response = await fetch(`/api/service-provider/clients/${id}?organizationId=${organizationId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.text();
          let errorMessage = `Failed to update client (${response.status})`;
          
          try {
            const parsedError = JSON.parse(errorData);
            errorMessage = parsedError.error || errorMessage;
          } catch {
            errorMessage = `${errorMessage}: ${response.statusText}`;
          }
          
          throw new Error(errorMessage);
        }

        // Parse and validate response
        const responseData = await response.json();
        const validatedResponse = validateClientResponse(responseData);
        
        if (!validatedResponse.success) {
          throw new Error('Invalid response format from server');
        }

        // Success
        toast({
          title: "Success",
          description: "Client updated successfully!",
        });

        // Refresh client list
        await refreshClients();

        return validatedResponse.data;

      } catch (error) {
        return handleError(error, 'update client');
      } finally {
        setIsLoading(false);
      }
    };

    setLastOperation(() => operation);
    return await operation();
  }, [organizationId, toast, refreshClients, handleError]);

  const deleteClient = useCallback(async (id: string): Promise<boolean> => {
    const operation = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!id) {
          throw new Error('Client ID is required for deletion');
        }

        if (!organizationId) {
          throw new Error('No organization selected');
        }

        // Make API call
        const response = await fetch(`/api/service-provider/clients/${id}?organizationId=${organizationId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.text();
          let errorMessage = `Failed to delete client (${response.status})`;
          
          try {
            const parsedError = JSON.parse(errorData);
            errorMessage = parsedError.error || errorMessage;
          } catch {
            errorMessage = `${errorMessage}: ${response.statusText}`;
          }
          
          throw new Error(errorMessage);
        }

        // Success
        toast({
          title: "Success",
          description: "Client deleted successfully!",
        });

        // Refresh client list
        await refreshClients();

        return true;

      } catch (error) {
        handleError(error, 'delete client');
        return false;
      } finally {
        setIsLoading(false);
      }
    };

    setLastOperation(() => operation);
    return await operation();
  }, [organizationId, toast, refreshClients, handleError]);

  const fetchClient = useCallback(async (id: string): Promise<ClientResponse | null> => {
    const operation = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!id) {
          throw new Error('Client ID is required');
        }

        if (!organizationId) {
          throw new Error('No organization selected');
        }

        // Make API call
        const response = await fetch(`/api/service-provider/clients/${id}?organizationId=${organizationId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Client not found');
          }
          
          const errorData = await response.text();
          let errorMessage = `Failed to fetch client (${response.status})`;
          
          try {
            const parsedError = JSON.parse(errorData);
            errorMessage = parsedError.error || errorMessage;
          } catch {
            errorMessage = `${errorMessage}: ${response.statusText}`;
          }
          
          throw new Error(errorMessage);
        }

        // Parse and validate response
        const responseData = await response.json();
        const validatedResponse = validateClientResponse(responseData);
        
        if (!validatedResponse.success) {
          throw new Error('Invalid response format from server');
        }

        return validatedResponse.data;

      } catch (error) {
        return handleError(error, 'fetch client');
      } finally {
        setIsLoading(false);
      }
    };

    setLastOperation(() => operation);
    return await operation();
  }, [organizationId, handleError]);

  return {
    isLoading,
    error,
    createClient,
    updateClient,
    deleteClient,
    fetchClient,
    clearError,
    retry,
  };
};