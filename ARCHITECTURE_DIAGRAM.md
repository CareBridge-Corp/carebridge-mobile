# Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     CareBridge Mobile                        │
│                   (React Native + Expo)                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Expo Router                             │
│                   (File-based Routing)                       │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
    ┌───────────────────┐       ┌───────────────────┐
    │   (auth) Segment  │       │   (app) Segment   │
    │   Unauthenticated │       │   Authenticated   │
    └───────────────────┘       └───────────────────┘
```

## Segment Architecture

### Authentication Segment `(auth)`

```
┌─────────────────────────────────────────────────────────────┐
│                    (auth) Segment                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐  ┌─────────────┐                          │
│  │   login.tsx │  │ signup.tsx  │  ← Screens                │
│  └──────┬──────┘  └──────┬──────┘                          │
│         │                 │                                   │
│         └────────┬────────┘                                  │
│                  ▼                                            │
│         ┌─────────────────┐                                  │
│         │   Components    │  ← UI Layer                      │
│         │  - LoginForm    │                                  │
│         │  - SignupForm   │                                  │
│         └────────┬────────┘                                  │
│                  │                                            │
│                  ▼                                            │
│         ┌─────────────────┐                                  │
│         │     Hooks       │  ← Business Logic                │
│         │  - useLogin     │                                  │
│         │  - useSignup    │                                  │
│         │  - useLogout    │                                  │
│         └────────┬────────┘                                  │
│                  │                                            │
│         ┌────────┴────────┐                                  │
│         ▼                 ▼                                   │
│  ┌─────────────┐   ┌─────────────┐                          │
│  │  Services   │   │    Store    │  ← Data Layer            │
│  │ - login()   │   │ - authStore │                          │
│  │ - signup()  │   │ - token     │                          │
│  │ - logout()  │   │ - user      │                          │
│  └──────┬──────┘   └─────────────┘                          │
│         │                                                     │
│         ▼                                                     │
│  ┌─────────────┐                                             │
│  │    Types    │  ← Type Definitions                         │
│  │ - User      │                                             │
│  │ - Credentials│                                            │
│  └─────────────┘                                             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Application Segment `(app)`

```
┌─────────────────────────────────────────────────────────────┐
│                     (app) Segment                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐  ┌─────────────┐                          │
│  │  index.tsx  │  │ profile.tsx │  ← Screens (Future)       │
│  └──────┬──────┘  └──────┬──────┘                          │
│         │                 │                                   │
│         └────────┬────────┘                                  │
│                  ▼                                            │
│         ┌─────────────────┐                                  │
│         │   Components    │  ← UI Layer                      │
│         │  (Future)       │                                  │
│         └────────┬────────┘                                  │
│                  │                                            │
│                  ▼                                            │
│         ┌─────────────────┐                                  │
│         │     Hooks       │  ← Business Logic                │
│         │  (Future)       │                                  │
│         └────────┬────────┘                                  │
│                  │                                            │
│         ┌────────┴────────┐                                  │
│         ▼                 ▼                                   │
│  ┌─────────────┐   ┌─────────────┐                          │
│  │  Services   │   │    Store    │  ← Data Layer            │
│  │  (Future)   │   │  (Future)   │                          │
│  └──────┬──────┘   └─────────────┘                          │
│         │                                                     │
│         ▼                                                     │
│  ┌─────────────┐                                             │
│  │    Types    │  ← Type Definitions                         │
│  │  (Future)   │                                             │
│  └─────────────┘                                             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Shared Infrastructure

```
┌─────────────────────────────────────────────────────────────┐
│                   Shared Infrastructure                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                    API Layer                         │    │
│  │  ┌──────────────┐         ┌──────────────┐         │    │
│  │  │ Axios Client │         │ Query Client │         │    │
│  │  │ - Base URL   │         │ - Caching    │         │    │
│  │  │ - Interceptors│        │ - Refetching │         │    │
│  │  │ - Token Inject│        │ - Retry      │         │    │
│  │  └──────────────┘         └──────────────┘         │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                 Components Layer                     │    │
│  │  - ErrorMessage                                      │    │
│  │  - (Future reusable components)                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   Theme Layer                        │    │
│  │  - Colors                                            │    │
│  │  - Spacing                                           │    │
│  │  - Typography (Future)                               │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   Utils Layer                        │    │
│  │  - Validation                                        │    │
│  │  - Formatting (Future)                               │    │
│  │  - Helpers (Future)                                  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   Types Layer                        │    │
│  │  - ApiResponse<T>                                    │    │
│  │  - ApiError                                          │    │
│  │  - PaginatedResponse<T>                              │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### Authentication Flow

```
┌──────────┐
│   User   │
└────┬─────┘
     │ 1. Enter credentials
     ▼
┌─────────────────┐
│  LoginForm      │  Component Layer
│  (Component)    │
└────┬────────────┘
     │ 2. Call hook
     ▼
┌─────────────────┐
│  useLogin       │  Hook Layer
│  (Hook)         │
└────┬────────────┘
     │ 3. Call service
     ▼
┌─────────────────┐
│  authService    │  Service Layer
│  .login()       │
└────┬────────────┘
     │ 4. HTTP POST
     ▼
┌─────────────────┐
│  Axios Client   │  API Layer
│  (with token    │
│   interceptor)  │
└────┬────────────┘
     │ 5. Request
     ▼
┌─────────────────┐
│  Backend API    │  External
└────┬────────────┘
     │ 6. Response
     ▼
┌─────────────────┐
│  authService    │  Service Layer
│  (transform)    │
└────┬────────────┘
     │ 7. Return data
     ▼
┌─────────────────┐
│  useLogin       │  Hook Layer
│  (onSuccess)    │
└────┬────────────┘
     │ 8. Update store
     ▼
┌─────────────────┐
│  authStore      │  Store Layer
│  .login()       │
└────┬────────────┘
     │ 9. State change
     ▼
┌─────────────────┐
│  LoginForm      │  Component Layer
│  (re-render)    │
└────┬────────────┘
     │ 10. Navigate
     ▼
┌─────────────────┐
│  App Home       │  Screen
└─────────────────┘
```

### Protected Route Flow

```
┌──────────────┐
│  App Starts  │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│  Root Index      │
│  (index.tsx)     │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Check Auth      │
│  authStore       │
│  .isAuthenticated│
└──────┬───────────┘
       │
       ├─── Yes ──────────┐
       │                  │
       │                  ▼
       │         ┌──────────────────┐
       │         │  Navigate to     │
       │         │  /(app)          │
       │         └──────────────────┘
       │
       └─── No ───────────┐
                          │
                          ▼
                 ┌──────────────────┐
                 │  Navigate to     │
                 │  /(auth)/login   │
                 └──────────────────┘
```

### API Request with Token

```
┌──────────────┐
│  Component   │
└──────┬───────┘
       │ 1. Trigger action
       ▼
┌──────────────┐
│  Hook        │
└──────┬───────┘
       │ 2. Call service
       ▼
┌──────────────┐
│  Service     │
└──────┬───────┘
       │ 3. apiClient.get()
       ▼
┌──────────────────────┐
│  Axios Interceptor   │
│  (Request)           │
└──────┬───────────────┘
       │ 4. Get token from authStore
       │ 5. Add Authorization header
       ▼
┌──────────────┐
│  HTTP Request│
│  with token  │
└──────┬───────┘
       │ 6. Send to API
       ▼
┌──────────────┐
│  Backend API │
└──────┬───────┘
       │ 7. Response
       ▼
┌──────────────────────┐
│  Axios Interceptor   │
│  (Response)          │
└──────┬───────────────┘
       │
       ├─── 401? ─────────┐
       │                  │
       │                  ▼
       │         ┌──────────────────┐
       │         │  Trigger Logout  │
       │         │  authStore.logout│
       │         └──────────────────┘
       │
       └─── Success ──────┐
                          │
                          ▼
                 ┌──────────────────┐
                 │  Return Data     │
                 └──────────────────┘
```

## Layer Dependencies

```
┌─────────────────────────────────────────────────────────────┐
│                     Dependency Flow                          │
│                  (Dependencies flow inward)                  │
└─────────────────────────────────────────────────────────────┘

    Component Layer
         │
         │ depends on
         ▼
      Hook Layer
         │
         │ depends on
         ├──────────┬──────────┐
         ▼          ▼          ▼
    Service     Store      Types
      Layer     Layer      Layer
         │
         │ depends on
         ▼
    Shared API
      (Axios)
```

## Module Boundaries

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌─────────────────┐         ┌─────────────────┐           │
│  │  (auth) Module  │         │  (app) Module   │           │
│  │                 │         │                 │           │
│  │  - Independent  │         │  - Independent  │           │
│  │  - Self-contained│        │  - Self-contained│          │
│  │  - Own types    │         │  - Own types    │           │
│  │  - Own state    │         │  - Own state    │           │
│  └────────┬────────┘         └────────┬────────┘           │
│           │                           │                     │
│           └───────────┬───────────────┘                     │
│                       │                                      │
│                       ▼                                      │
│           ┌───────────────────────┐                         │
│           │  Shared Infrastructure│                         │
│           │                       │                         │
│           │  - API Client         │                         │
│           │  - Query Client       │                         │
│           │  - Components         │                         │
│           │  - Theme              │                         │
│           │  - Utils              │                         │
│           │  - Types              │                         │
│           └───────────────────────┘                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## State Management

```
┌─────────────────────────────────────────────────────────────┐
│                    State Management                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Server State (TanStack Query)          │    │
│  │  - API data                                         │    │
│  │  - Caching                                          │    │
│  │  - Refetching                                       │    │
│  │  - Loading states                                   │    │
│  │  - Error states                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Client State (Zustand)                 │    │
│  │  - Auth state (token, user)                         │    │
│  │  - UI state                                         │    │
│  │  - App settings                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Local State (React useState)           │    │
│  │  - Form inputs                                      │    │
│  │  - UI toggles                                       │    │
│  │  - Temporary data                                   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌──────────────┐
│  API Error   │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  Axios Interceptor   │
│  (Response)          │
└──────┬───────────────┘
       │
       ├─── 401 ──────────────┐
       │                      │
       │                      ▼
       │             ┌──────────────────┐
       │             │  Auto Logout     │
       │             │  Clear State     │
       │             │  Redirect Login  │
       │             └──────────────────┘
       │
       ├─── Other Error ──────┐
       │                      │
       │                      ▼
       │             ┌──────────────────┐
       │             │  Transform Error │
       │             │  to ApiError     │
       │             └────────┬─────────┘
       │                      │
       │                      ▼
       │             ┌──────────────────┐
       │             │  Return to       │
       │             │  Service         │
       │             └────────┬─────────┘
       │                      │
       │                      ▼
       │             ┌──────────────────┐
       │             │  Hook catches    │
       │             │  error           │
       │             └────────┬─────────┘
       │                      │
       │                      ▼
       │             ┌──────────────────┐
       │             │  Component       │
       │             │  displays error  │
       │             └──────────────────┘
       │
       └──────────────────────────────────┘
```
