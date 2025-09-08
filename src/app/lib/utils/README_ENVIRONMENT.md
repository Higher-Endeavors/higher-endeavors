# Environment Detection System

This system provides visual distinction between different environments (development, QA, production) to help developers identify which version of the site they're working with.

## How it works

1. **Middleware Detection**: The middleware detects the environment based on the hostname:
   - `localhost` or `127.0.0.1` → `development`
   - `qa.higherendeavors.com` → `qa`
   - `higherendeavors.com` or `www.higherendeavors.com` → `production`

2. **Header Passing**: The environment is passed through the `x-environment` header to all pages.

3. **Context Provider**: The `EnvironmentProvider` makes environment information available throughout the app.

4. **Visual Indicators**:
   - **QA Environment**: Red banner at the top with "QA ENVIRONMENT" text and subtle diagonal stripe pattern
   - **Development Environment**: Teal banner at the top with "DEVELOPMENT" text
   - **Production Environment**: No visual indicators (clean appearance)

## Usage

### In Server Components
```typescript
import { getServerEnvironment } from '@/app/lib/utils/serverEnvironment';

export default async function MyPage() {
  const environment = await getServerEnvironment();
  // Use environment...
}
```

### In Client Components
```typescript
import { useEnvironment } from '@/app/context/EnvironmentContext';

export default function MyComponent() {
  const { environment, isQA, isDevelopment, isProduction } = useEnvironment();
  // Use environment...
}
```

### Environment Indicator Component
```typescript
import EnvironmentIndicator from '@/app/components/EnvironmentIndicator';

// Show only in non-production environments
<EnvironmentIndicator />

// Show in all environments including production
<EnvironmentIndicator showInProduction={true} />
```

## Styling

The system automatically applies CSS classes based on the environment:
- `.qa-environment` - Applied to the `<html>` element for QA
- `.dev-environment` - Applied to the `<html>` element for development
- No class for production (clean appearance)

## Customization

To modify the visual indicators, edit the CSS in `src/app/globals.css`:
- `.qa-environment::before` - QA banner styling
- `.dev-environment::before` - Development banner styling
- `.qa-environment body` - QA background pattern
