# CareBridge Mobile - Clean Architecture

## Overview

This project follows a Clean Architecture pattern with segment-based routing using Expo Router. The architecture separates concerns into distinct layers with clear dependencies flowing inward.

## Directory Structure

```
src/
├── app/
│   ├── _layout.tsx                 # Root layout with QueryClientProvider
│   ├── index.tsx                   # Root redirect logic
│   ├── (auth)/                     # Authentication segment
│   │   ├── _layout.tsx             # Auth-specific layout
│   │   ├── login.tsx               # Login screen
│   │   ├── signup.tsx              # Signup screen
│   │   ├── components/             # Auth UI components
│   │   │   ├── LoginForm.tsx
│   │   │   └── SignupForm.tsx
│   │   ├── hooks/                  # Auth business logic & queries
│   │   │   ├── useLogin.ts
│   │   │   ├── useSignup.ts
│   │   │   └── useLogout.ts
│   │   ├── services/               # Auth API calls
│   │   │   └── authService.ts
│   │   ├── store/                  # Auth state (Zustand)
│   │   │   └── authStore.ts
│   │   └── types/                  # Auth TypeScript types
│   │       └── index.ts
│   └── (app)/                      # Main application segment
│       ├── _layout.tsx             # App-specific layout
│       ├── index.tsx               # App home screen
│       ├── components/             # App UI components
│       ├── hooks/                  # App business logic & queries
│       ├── services/               # App API calls
│       ├── store/                  # App state (Zustand)
│       └── types/                  # App TypeScript types
└── shared/                         # Shared infrastructure
    ├── api/                        # Axios client & config
    │   ├── client.ts               # Configured Axios instance
    │   └── queryClient.ts          # TanStack Query client
    ├── components/                 # Reusable UI components
    │   └── ErrorMessage.tsx
    ├── hooks/                      # Shared custom hooks
    ├── theme/                      # Theme constants & utilities
    │   ├── colors.ts
    │   ├── spacing.ts
    │   └── index.ts
    ├── types/                      # Shared TypeScript types
    │   └── api.ts
    └── utils/                      # Helper functions
        ├── validation.ts
        └── index.ts
```

## Architectural Layers

### 1. Component Layer

- **Purpose**: UI rendering only, no business logic
- **Dependencies**: Can import from hooks layer and shared components
- **Restrictions**: No direct API calls, no store creation

### 2. Hook Layer

- **Purpose**: Business logic, state management, TanStack Query integration
- **Dependencies**: Can import from services layer and store layer
- **Patterns**: Custom hooks for feature logic, TanStack Query hooks for server state

### 3. Service Layer

- **Purpose**: API communication and data transformation
- **Dependencies**: Uses shared Axios client
- **Restrictions**: No React hooks, no UI logic, pure functions only

### 4. Store Layer

- **Purpose**: Client-side state management using Zustand
- **Patterns**: Zustand stores for local state, auth state, and UI state

### 5. Type Layer

- **Purpose**: TypeScript type definitions
- **Scope**: Feature-specific types stay local, cross-feature types in shared

## Key Features

### Authentication Flow

1. User submits credentials → Component calls hook
2. Hook calls service function → Service uses Axios client
3. API returns response → Service transforms to typed model
4. Hook updates Zustand store → Components re-render

### Protected Routes

- Root `index.tsx` checks authentication status
- Redirects to `/(auth)/login` if not authenticated
- Redirects to `/(app)` if authenticated

### Error Handling

- Axios interceptors handle 401 responses (auto-logout)
- Service layer transforms errors to domain-specific types
- TanStack Query manages error states
- Components display errors via ErrorMessage component

### State Management

- **Server State**: TanStack Query (API data, caching, refetching)
- **Client State**: Zustand (auth state, UI state)
- **Local State**: React useState (form inputs, UI toggles)

## Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

### TanStack Query Configuration

- Stale time: 5 minutes
- Cache time: 10 minutes
- Retry: 1 attempt
- Refetch on window focus: disabled

### Axios Configuration

- Base URL: from environment variable
- Timeout: 10 seconds
- Auto token injection via interceptor
- Auto logout on 401 responses

## Development Guidelines

### Adding a New Feature

1. Create feature directory in `(app)` or `(auth)`
2. Add types in `types/index.ts`
3. Create service functions in `services/`
4. Create hooks in `hooks/`
5. Create components in `components/`
6. Create route screen file

### Component Rules

- Components receive data via props or hooks
- No direct API calls in components
- Use TypeScript interfaces for props
- Keep components focused and small

### Hook Rules

- Hooks contain business logic
- Use TanStack Query for server state
- Use Zustand for client state
- Return data, loading states, and actions

### Service Rules

- Pure functions only
- Use shared Axios client
- Transform API responses to app types
- Handle errors appropriately

## Testing Strategy

### Unit Tests

- Test service functions with mocked Axios
- Test hooks with React Testing Library
- Test components with React Native Testing Library
- Test store actions and state updates

### Integration Tests

- Test complete user flows
- Test authentication flow
- Test protected route access
- Test error handling

## Next Steps

1. Add more authentication features (password reset, email verification)
2. Implement secure token storage (AsyncStorage or SecureStore)
3. Add more app features following the same pattern
4. Add comprehensive error boundaries
5. Implement offline support with TanStack Query
6. Add analytics and monitoring
