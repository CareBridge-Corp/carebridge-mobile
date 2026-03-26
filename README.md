# CareBridge Mobile

A React Native mobile application built with Expo Router, implementing Clean Architecture principles for maintainable and scalable code.

## Features

- ✅ Clean Architecture with segment-based routing
- ✅ Authentication flow (Login/Signup)
- ✅ Protected routes
- ✅ State management with Zustand
- ✅ Server state management with TanStack Query
- ✅ Type-safe API client with Axios
- ✅ Automatic token injection and 401 handling
- ✅ Modular feature organization

## Tech Stack

- **Framework**: React Native with Expo
- **Routing**: Expo Router (file-based routing)
- **State Management**: Zustand (client state)
- **Server State**: TanStack Query (API data, caching)
- **HTTP Client**: Axios
- **Language**: TypeScript
- **Architecture**: Clean Architecture

## Project Structure

```
src/
├── app/                    # Expo Router app directory
│   ├── (auth)/            # Authentication segment
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   └── types/
│   ├── (app)/             # Main app segment
│   │   ├── index.tsx
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   └── types/
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Root redirect logic
└── shared/                # Shared infrastructure
    ├── api/               # Axios client & TanStack Query
    ├── components/        # Reusable components
    ├── hooks/             # Shared hooks
    ├── theme/             # Theme constants
    ├── types/             # Shared types
    └── utils/             # Helper functions
```

## Getting Started

### Prerequisites

- Node.js 18+ or 20+
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd carebridge-mobile
```

2. Install dependencies

```bash
npm install
```

3. Create environment file

```bash
cp .env.example .env
```

4. Update `.env` with your API URL

```
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

### Running the App

Start the development server:

```bash
npm start
```

Run on specific platform:

```bash
npm run ios      # iOS Simulator
npm run android  # Android Emulator
npm run web      # Web browser
```

## Architecture

This project follows Clean Architecture principles with clear separation of concerns:

### Layers

1. **Component Layer**: UI rendering only
2. **Hook Layer**: Business logic and state management
3. **Service Layer**: API communication
4. **Store Layer**: Client-side state (Zustand)
5. **Type Layer**: TypeScript definitions

### Data Flow

```
Component → Hook → Service → API
    ↓        ↓        ↓
  Props   State   Transform
```

### Key Patterns

- **Grouped Routes**: `(auth)` and `(app)` segments for logical separation
- **Protected Routes**: Automatic redirect based on authentication status
- **Error Handling**: Centralized error handling with Axios interceptors
- **Type Safety**: Full TypeScript coverage with strict types
- **State Management**: Zustand for client state, TanStack Query for server state

## Development

### Adding a New Feature

1. Create feature directory in appropriate segment
2. Define types in `types/index.ts`
3. Create service functions in `services/`
4. Create hooks in `hooks/`
5. Create components in `components/`
6. Create route screen file

### Code Style

- Use TypeScript for all files
- Define prop interfaces for components
- Keep components small and focused
- Use hooks for business logic
- Pure functions in services
- Descriptive variable names

### Testing

```bash
npm test              # Run tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## API Integration

The app uses Axios with automatic:

- Token injection from auth store
- 401 response handling (auto-logout)
- Error transformation to app types
- Request/response logging (dev mode)

### Example API Call

```typescript
// Service
export async function fetchData() {
  const response = await apiClient.get<ApiResponse<Data>>("/data");
  return response.data.data;
}

// Hook
export function useData() {
  return useQuery({
    queryKey: ["data"],
    queryFn: fetchData,
  });
}

// Component
export function DataComponent() {
  const { data, isLoading, error } = useData();
  // Render UI
}
```

## Environment Variables

- `EXPO_PUBLIC_API_URL`: Backend API base URL

## Troubleshooting

### Common Issues

**Issue**: App won't start

- Solution: Clear cache with `npx expo start -c`

**Issue**: TypeScript errors

- Solution: Restart TypeScript server in your IDE

**Issue**: Module not found

- Solution: Run `npm install` and restart dev server

**Issue**: Authentication not working

- Solution: Check API URL in `.env` file

## Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Submit a pull request

## License

[Your License Here]

## Documentation

- [Architecture Guide](./ARCHITECTURE.md)
- [API Documentation](./docs/API.md)
- [Component Library](./docs/COMPONENTS.md)

## Support

For issues and questions, please open a GitHub issue.
