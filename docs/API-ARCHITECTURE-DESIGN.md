# API Architecture Design Document

## Overview

This document defines the architecture for API communication in a React Native application using React Query (@tanstack/react-query) for data fetching, caching, and state management.

## Architecture Layers

```
┌─────────────────────────────────────────┐
│         Component Layer (UI)            │
│  - React Components                     │
│  - Screens & Views                      │
└──────────────────┬──────────────────────┘
                   │ uses hooks
┌──────────────────▼──────────────────────┐
│         Hooks Layer                     │
│  - useQuery hooks (data fetching)       │
│  - useMutation hooks (data mutation)    │
│  - React Query integration              │
└──────────────────┬──────────────────────┘
                   │ calls services
┌──────────────────▼──────────────────────┐
│         Services Layer                  │
│  - Business logic                       │
│  - Data transformation                  │
│  - API endpoint definitions             │
└──────────────────┬──────────────────────┘
                   │ uses API client
┌──────────────────▼──────────────────────┐
│         API Client Layer                │
│  - HTTP client (axios/fetch)            │
│  - Request/Response interceptors        │
│  - Authentication handling              │
│  - Error handling                       │
└──────────────────┬──────────────────────┘
                   │ HTTP requests
┌──────────────────▼──────────────────────┐
│         Backend API                     │
└─────────────────────────────────────────┘
```

---

## 1. API Client Layer

### 1.1 Purpose
- Centralized HTTP communication
- Automatic authentication token injection
- Global error handling
- Request/response transformation
- Retry logic for failed requests

### 1.2 Implementation

**File**: `src/utils/apiClient.ts`

```typescript
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_ENDPOINT } from '@env';

// Response wrapper type
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// API Client class
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_ENDPOINT,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle errors globally
    this.client.interceptors.response.use(
      (response) => response.data,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle token expiration
          await SecureStore.deleteItemAsync('authToken');
          // Navigate to login or refresh token
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): Error {
    if (error.response) {
      // Server responded with error
      const message = (error.response.data as any)?.message || 'Server error';
      return new Error(message);
    } else if (error.request) {
      // Request made but no response
      return new Error('Network error. Please check your connection.');
    } else {
      // Something else happened
      return new Error(error.message || 'An unexpected error occurred');
    }
  }

  // HTTP Methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.client.get(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.client.post(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.client.put(url, data, config);
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.client.patch(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.client.delete(url, config);
  }

  // Manual token override (for specific requests)
  async request<T = any>(config: AxiosRequestConfig & { token?: string }): Promise<ApiResponse<T>> {
    if (config.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${config.token}`,
      };
    }
    return this.client.request(config);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
```

### 1.3 Alternative: Simple Fetcher Utility

For simpler apps without axios:

**File**: `src/utils/fetcher.ts`

```typescript
import * as SecureStore from 'expo-secure-store';
import { API_ENDPOINT } from '@env';

export interface FetcherResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export async function fetcher<T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  body?: any,
  customToken?: string
): Promise<FetcherResponse<T>> {
  try {
    // Get token from secure storage
    const token = customToken || await SecureStore.getItemAsync('authToken');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_ENDPOINT}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetcher error:', error);
    throw error;
  }
}
```

---

## 2. Services Layer

### 2.1 Purpose
- Encapsulate API endpoints
- Transform request/response data
- Business logic related to API calls
- Type-safe API contracts

### 2.2 Structure

```
src/services/
├── authService.ts       # Authentication & authorization
├── userService.ts       # User profile operations
├── resourceService.ts   # Main resource/entity operations
├── collectionService.ts # Collection/list operations
├── paymentService.ts    # Payment processing (if applicable)
└── types/
    ├── auth.types.ts
    ├── user.types.ts
    └── resource.types.ts
```

### 2.3 Implementation Pattern

**File**: `src/services/authService.ts`

```typescript
import { apiClient } from '@/utils/apiClient';

// Types
export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// Service functions
export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', payload);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Login failed');
  },

  register: async (payload: RegisterPayload): Promise<void> => {
    const response = await apiClient.post('/auth/register', payload);
    if (!response.success) {
      throw new Error(response.message || 'Registration failed');
    }
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const response = await apiClient.post<{ accessToken: string }>(
      '/auth/refresh',
      { refreshToken }
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Token refresh failed');
  },
};
```

**File**: `src/services/resourceService.ts`

```typescript
import { apiClient } from '@/utils/apiClient';

export interface Resource {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface BrowseResourcesParams {
  page?: number;
  pageSize?: number;
  category?: string;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface ResourceListResponse {
  items: Resource[];
  total: number;
  page: number;
  pageSize: number;
}

export const resourceService = {
  browseResources: async (params: BrowseResourcesParams): Promise<ResourceListResponse> => {
    const response = await apiClient.get<ResourceListResponse>('/resources', {
      params,
    });
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to fetch resources');
  },

  getResourceById: async (resourceId: string): Promise<Resource> => {
    const response = await apiClient.get<Resource>(`/resources/${resourceId}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to fetch resource');
  },

  createResource: async (payload: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>): Promise<Resource> => {
    const response = await apiClient.post<Resource>('/resources', payload);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to create resource');
  },

  updateResource: async (resourceId: string, payload: Partial<Resource>): Promise<Resource> => {
    const response = await apiClient.patch<Resource>(`/resources/${resourceId}`, payload);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to update resource');
  },

  deleteResource: async (resourceId: string): Promise<void> => {
    const response = await apiClient.delete(`/resources/${resourceId}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete resource');
    }
  },
};
```

---

## 3. Hooks Layer

### 3.1 Purpose
- React Query integration
- Cache management
- Optimistic updates
- Loading & error states
- Automatic refetching

### 3.2 Structure

```
src/hooks/
├── auth/
│   ├── useLogin.ts
│   ├── useRegister.ts
│   └── useLogout.ts
├── resources/
│   ├── useResources.ts
│   ├── useResource.ts
│   ├── useCreateResource.ts
│   ├── useUpdateResource.ts
│   └── useDeleteResource.ts
├── collections/
│   ├── useCollection.ts
│   ├── useAddToCollection.ts
│   └── useRemoveFromCollection.ts
└── user/
    ├── useProfile.ts
    └── useUpdateProfile.ts
```

### 3.3 Query Hooks (Data Fetching)

**File**: `src/hooks/resources/useResources.ts`

```typescript
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { resourceService, BrowseResourcesParams, ResourceListResponse } from '@/services/resourceService';

export const useResources = (
  params?: BrowseResourcesParams,
  options?: Omit<UseQueryOptions<ResourceListResponse>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<ResourceListResponse>({
    queryKey: ['resources', params],
    queryFn: () => resourceService.browseResources(params || {}),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    ...options,
  });
};
```

**File**: `src/hooks/resources/useResource.ts`

```typescript
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { resourceService, Resource } from '@/services/resourceService';

export const useResource = (
  resourceId: string,
  options?: Omit<UseQueryOptions<Resource>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Resource>({
    queryKey: ['resource', resourceId],
    queryFn: () => resourceService.getResourceById(resourceId),
    enabled: !!resourceId, // Only run if resourceId exists
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};
```

### 3.4 Mutation Hooks (Data Modification)

**File**: `src/hooks/auth/useLogin.ts`

```typescript
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { authService, LoginPayload, LoginResponse } from '@/services/authService';
import * as SecureStore from 'expo-secure-store';

export const useLogin = (
  options?: Omit<UseMutationOptions<LoginResponse, Error, LoginPayload>, 'mutationFn'>
) => {
  return useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: authService.login,
    onSuccess: async (data) => {
      // Store token securely
      await SecureStore.setItemAsync('authToken', data.accessToken);
      await SecureStore.setItemAsync('refreshToken', data.refreshToken);
    },
    ...options,
  });
};
```

**File**: `src/hooks/collections/useAddToCollection.ts`

```typescript
import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { collectionService } from '@/services/collectionService';

interface AddToCollectionVariables {
  itemId: string;
}

export const useAddToCollection = (
  options?: Omit<UseMutationOptions<void, Error, AddToCollectionVariables>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, AddToCollectionVariables>({
    mutationFn: ({ itemId }) => collectionService.addToCollection(itemId),
    onSuccess: () => {
      // Invalidate collection queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['collection'] });
    },
    ...options,
  });
};
```

### 3.5 Advanced: Optimistic Updates

**File**: `src/hooks/collections/useRemoveFromCollection.ts`

```typescript
import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { collectionService, Collection } from '@/services/collectionService';

interface RemoveFromCollectionVariables {
  itemId: string;
}

export const useRemoveFromCollection = (
  options?: Omit<UseMutationOptions<void, Error, RemoveFromCollectionVariables>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, RemoveFromCollectionVariables>({
    mutationFn: ({ itemId }) => collectionService.removeFromCollection(itemId),
    
    // Optimistic update
    onMutate: async ({ itemId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['collection'] });

      // Snapshot previous value
      const previousCollection = queryClient.getQueryData<Collection>(['collection']);

      // Optimistically update
      if (previousCollection) {
        queryClient.setQueryData<Collection>(['collection'], {
          ...previousCollection,
          items: previousCollection.items.filter(item => item.id !== itemId),
        });
      }

      return { previousCollection };
    },

    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousCollection) {
        queryClient.setQueryData(['collection'], context.previousCollection);
      }
    },

    // Refetch after success or error
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['collection'] });
    },

    ...options,
  });
};
```

---

## 4. React Query Configuration

### 4.1 Query Client Setup

**File**: `src/config/queryClient.ts`

```typescript
import { QueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2, // Retry failed requests twice
      staleTime: 60 * 1000, // 1 minute default
      gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      onError: (error: Error) => {
        Alert.alert('Error', error.message);
      },
    },
  },
});
```

### 4.2 Provider Setup

**File**: `App.tsx`

```typescript
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/config/queryClient';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app components */}
    </QueryClientProvider>
  );
}
```

---

## 5. Caching Strategy

### 5.1 Cache Key Naming Convention

```typescript
// User data
['user']                          // Current user profile
['user', userId]                  // Specific user by ID

// Resources (main entities)
['resources']                     // All resources (no filters)
['resources', { page, category }] // Filtered resources
['resource', resourceId]          // Single resource

// Collections (lists/groups)
['collection']                    // User's collection
['collection', 'count']           // Collection item count

// Nested resources
['resource', resourceId, 'details']   // Resource details
['resource', resourceId, 'metadata']  // Resource metadata
['resource', resourceId, 'related']   // Related resources
```

### 5.2 Cache Invalidation Patterns

```typescript
// Invalidate specific query
queryClient.invalidateQueries({ queryKey: ['collection'] });

// Invalidate all queries starting with key
queryClient.invalidateQueries({ queryKey: ['resources'] });

// Invalidate exact match only
queryClient.invalidateQueries({ 
  queryKey: ['resources', { page: 1 }],
  exact: true 
});

// Remove query from cache
queryClient.removeQueries({ queryKey: ['resource', resourceId] });

// Reset all queries
queryClient.resetQueries();
```

### 5.3 Stale Time Configuration

| Data Type | Stale Time | Reasoning |
|-----------|------------|-----------|
| User profile | 5 minutes | Changes infrequently |
| Resource list | 5 minutes | Relatively static |
| Resource details | 10 minutes | Very static |
| Collection | 0 (always stale) | Needs to be fresh |
| Real-time data | 0 | Always refetch |
| Static content | Infinity | Never refetch |

---

## 6. Error Handling

### 6.1 Error Hierarchy

```typescript
// Custom error types
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network error') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AuthError extends Error {
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthError';
  }
}
```

### 6.2 Error Handling in Components

```typescript
const { data, error, isLoading, isError } = useResources();

if (isLoading) return <LoadingSpinner />;

if (isError) {
  return (
    <ErrorView 
      message={error.message}
      onRetry={() => refetch()}
    />
  );
}

return <ResourceList items={data.items} />;
```

---

## 7. Authentication Flow

### 7.1 Token Storage

```typescript
// Store tokens
await SecureStore.setItemAsync('authToken', accessToken);
await SecureStore.setItemAsync('refreshToken', refreshToken);

// Retrieve token
const token = await SecureStore.getItemAsync('authToken');

// Clear tokens
await SecureStore.deleteItemAsync('authToken');
await SecureStore.deleteItemAsync('refreshToken');
```

### 7.2 Token Refresh Strategy

```typescript
// In API client interceptor
this.client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        const { accessToken } = await authService.refreshToken(refreshToken);
        
        await SecureStore.setItemAsync('authToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        return this.client(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        await SecureStore.deleteItemAsync('authToken');
        await SecureStore.deleteItemAsync('refreshToken');
        // Navigate to login
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

---

## 8. Testing Strategy

### 8.1 Service Layer Tests

```typescript
import { authService } from '@/services/authService';
import { apiClient } from '@/utils/apiClient';

jest.mock('@/utils/apiClient');

describe('authService', () => {
  it('should login successfully', async () => {
    const mockResponse = {
      success: true,
      data: {
        accessToken: 'token123',
        user: { id: '1', email: 'test@example.com' },
      },
    };

    (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

    const result = await authService.login({
      email: 'test@example.com',
      password: 'password',
    });

    expect(result.accessToken).toBe('token123');
    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
      email: 'test@example.com',
      password: 'password',
    });
  });
});
```

### 8.2 Hook Tests

```typescript
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useResources } from '@/hooks/resources/useResources';
import { resourceService } from '@/services/resourceService';

jest.mock('@/services/resourceService');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useResources', () => {
  it('should fetch resources successfully', async () => {
    const mockResources = {
      items: [{ id: '1', title: 'Test Resource' }],
      total: 1,
    };

    (resourceService.browseResources as jest.Mock).mockResolvedValue(mockResources);

    const { result } = renderHook(() => useResources(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockResources);
  });
});
```

---

## 9. Performance Optimization

### 9.1 Prefetching

```typescript
// Prefetch resource details when hovering over resource card
const queryClient = useQueryClient();

const handleResourceHover = (resourceId: string) => {
  queryClient.prefetchQuery({
    queryKey: ['resource', resourceId],
    queryFn: () => resourceService.getResourceById(resourceId),
  });
};
```

### 9.2 Pagination

```typescript
export const useResources = (page: number) => {
  return useQuery({
    queryKey: ['resources', page],
    queryFn: () => resourceService.browseResources({ page }),
    keepPreviousData: true, // Keep old data while fetching new
  });
};
```

### 9.3 Infinite Queries

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';

export const useInfiniteResources = () => {
  return useInfiniteQuery({
    queryKey: ['resources', 'infinite'],
    queryFn: ({ pageParam = 1 }) => 
      resourceService.browseResources({ page: pageParam }),
    getNextPageParam: (lastPage) => {
      const hasMore = lastPage.page * lastPage.pageSize < lastPage.total;
      return hasMore ? lastPage.page + 1 : undefined;
    },
  });
};
```

---

## 10. Best Practices

### 10.1 Do's ✅

- **Use TypeScript** for type safety across all layers
- **Centralize API configuration** in one place
- **Use query keys consistently** following a naming convention
- **Handle errors gracefully** with user-friendly messages
- **Implement retry logic** for transient failures
- **Use optimistic updates** for better UX
- **Invalidate related queries** after mutations
- **Store sensitive data** in SecureStore
- **Test each layer** independently
- **Document API contracts** with TypeScript types

### 10.2 Don'ts ❌

- **Don't make API calls directly** from components
- **Don't store tokens** in AsyncStorage (use SecureStore)
- **Don't ignore error handling**
- **Don't use inconsistent query keys**
- **Don't fetch data on every render** (use proper stale times)
- **Don't forget to cleanup** queries when unmounting
- **Don't expose sensitive data** in logs
- **Don't mix business logic** with API calls
- **Don't hardcode API endpoints** in services
- **Don't skip TypeScript types** for API responses

---

## 11. Migration Checklist

When implementing this architecture in a new app:

- [ ] Install dependencies (`@tanstack/react-query`, `axios`, `expo-secure-store`)
- [ ] Create API client utility (`src/utils/apiClient.ts`)
- [ ] Setup Query Client configuration (`src/config/queryClient.ts`)
- [ ] Wrap app with QueryClientProvider
- [ ] Create service layer structure (`src/services/`)
- [ ] Define TypeScript types for API contracts
- [ ] Create hooks layer structure (`src/hooks/`)
- [ ] Implement authentication flow with token management
- [ ] Setup error handling and interceptors
- [ ] Configure cache invalidation patterns
- [ ] Add loading and error states to UI
- [ ] Write tests for services and hooks
- [ ] Document API endpoints and usage
- [ ] Setup environment variables for API_ENDPOINT

---

## 12. Example: Complete Feature Implementation

### Feature: Create and Update Resource

**1. Service** (`src/services/resourceService.ts`):
```typescript
export const resourceService = {
  createResource: async (payload: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>): Promise<Resource> => {
    const response = await apiClient.post<Resource>('/resources', payload);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to create resource');
  },
};
```

**2. Hook** (`src/hooks/resources/useCreateResource.ts`):
```typescript
export const useCreateResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>) => 
      resourceService.createResource(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
};
```

**3. Component** (`src/screens/ResourceFormScreen.tsx`):
```typescript
export const ResourceFormScreen = () => {
  const { data: resource, isLoading } = useResource(resourceId);
  const { mutate: createResource, isPending } = useCreateResource();

  const handleSubmit = (formData) => {
    createResource(formData, {
      onSuccess: () => {
        Alert.alert('Success', 'Resource created successfully!');
      },
      onError: (error) => {
        Alert.alert('Error', error.message);
      },
    });
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <View>
      <TextInput placeholder="Title" />
      <TextInput placeholder="Description" />
      <Button 
        title="Create Resource" 
        onPress={handleSubmit}
        disabled={isPending}
      />
    </View>
  );
};
```

---

## Conclusion

This architecture provides:
- **Separation of concerns** across layers
- **Type safety** with TypeScript
- **Automatic caching** with React Query
- **Centralized error handling**
- **Secure authentication** with token management
- **Testability** at each layer
- **Scalability** for growing applications

Follow this design to build robust, maintainable React Native applications with excellent data fetching and caching capabilities.
