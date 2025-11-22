import { useState, useEffect, useCallback } from 'react';

interface UseApiOptions<T> {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    immediate?: boolean;
}

interface UseApiReturn<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
    reset: () => void;
}

export function useApi<T>(
    apiFunction: () => Promise<any>,
    options: UseApiOptions<T> = {}
): UseApiReturn<T> {
    const { onSuccess, onError, immediate = true } = options;
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(immediate);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiFunction();
            const result = response.data || response;
            setData(result);

            if (onSuccess) {
                onSuccess(result);
            }
        } catch (err) {
            const error = err instanceof Error ? err : new Error('An error occurred');
            setError(error);

            if (onError) {
                onError(error);
            }
        } finally {
            setLoading(false);
        }
    }, [apiFunction, onSuccess, onError]);

    useEffect(() => {
        if (immediate) {
            fetchData();
        }
    }, [immediate, fetchData]);

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
    }, []);

    return {
        data,
        loading,
        error,
        refetch: fetchData,
        reset,
    };
}
