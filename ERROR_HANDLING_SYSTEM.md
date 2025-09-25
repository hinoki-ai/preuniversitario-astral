# Error Handling System

Unified error handling architecture for Preuniversitario Astral application.

## Core Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **AppError** | `lib/core/error-system.ts` | Custom error class with severity levels |
| **ErrorHandler** | `lib/core/error-system.ts` | Global error handler with logging |
| **ErrorBoundary** | `components/ErrorBoundary.tsx` | React error boundaries (page/section/component) |

## Error Handling Tools

| Tool | Usage | Pattern |
|------|-------|---------|
| **useErrorHandler** | Basic error handling | `const { handleError } = useErrorHandler()` |
| **useStandardErrorHandling** | Enhanced w/ safe methods | `useStandardErrorHandling('ComponentName')` |
| **useAsyncOperation** | Async operation handling | Automatic error wrapping |

## Higher-Order Components

| HOC | Purpose | Usage |
|-----|---------|-------|
| **withErrorBoundary** | Basic error boundary | `withErrorBoundary(Component)` |
| **withStandardErrorHandling** | Full error handling | `withStandardErrorHandling(Component)` |
| **withMinimalErrorHandling** | Lightweight fallback | `withMinimalErrorHandling(Component)` |

## Component Status

| Component | Status | Error Handling |
|-----------|--------|----------------|
| **CapsulePlayer** | ✅ Enhanced | ComponentErrorBoundary |
| **Simulator** | ✅ Enhanced | ComponentErrorBoundary |
| **Header** | ✅ Enhanced | ComponentErrorBoundary |
| **HeroSection** | ✅ Enhanced | withMinimalErrorHandling |
| **InlineQuiz** | ✅ Enhanced | useErrorHandler |
| **StudyPlanTable** | ✅ Enhanced | useErrorHandler |
| **BasicSchedule** | ✅ Enhanced | useErrorHandler |
| **TeacherPanel** | ✅ Enhanced | useErrorHandler |
| **AppSidebar** | ✅ Enhanced | ComponentErrorBoundary |
| **NavMain** | ⏳ Pending | Needs enhancement |
| **NavSecondary** | ⏳ Pending | Needs enhancement |
| **ZoomDashboard** | ✅ Enhanced | ComponentErrorBoundary |

## Error Patterns

### Component with Error Boundary

```tsx
function ComponentInternal() {
  const { safeAsyncCall } = useStandardErrorHandling('ComponentName');
  // Component logic
}

export default function Component() {
  return (
    <ComponentErrorBoundary context="ComponentName">
      <ComponentInternal />
    </ComponentErrorBoundary>
  );
}
```

### Async Operation

```tsx
const { safeAsyncCall } = useStandardErrorHandling('ComponentName');

const handleSubmit = async () => {
  const result = await safeAsyncCall(
    () => api.submitForm(data),
    'submitForm'
  );
};
```

## Error Severity Levels

| Level | User Impact | Example |
|-------|-------------|---------|
| **LOW** | Logged only | Analytics failures |
| **MEDIUM** | Toast notification | Failed data fetch |
| **HIGH** | Modal/redirect | Authentication required |
| **CRITICAL** | System failure | App crash |

## Automatic Actions

| Error Type | Action |
|------------|--------|
| **Unauthorized** | Redirect to `/sign-in` |
| **Payment Required** | Redirect to `/dashboard/plan` |
| **Network Error** | Show retry suggestions |
| **Validation Error** | Form-specific feedback |

## Implementation Guidelines

### New Components

1. Wrap with error boundary using HOCs
2. Use `useStandardErrorHandling` for internal logic
3. Implement `safeAsyncCall` for async operations

### Testing Scenarios

- Network disconnection during data fetching
- Invalid API responses
- Component rendering errors
- Authentication expiration
- Payment failures

## Monitoring

- **Current**: Console logging with structured data
- **Future**: Sentry/LogRocket integration, error analytics dashboard
