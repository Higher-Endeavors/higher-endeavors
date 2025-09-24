# Toast System Documentation

## Overview

The Toast system provides consistent, accessible notifications across the application for success, error, warning, and info messages.

## Features

- **Four Toast Types**: success, error, warning, info
- **Auto-dismiss**: Configurable duration (default: 5 seconds)
- **Manual dismiss**: Click the X button to close
- **Accessibility**: ARIA labels and live regions
- **Responsive**: Works on all screen sizes
- **Dark mode support**: Automatically adapts to theme
- **Animation**: Smooth slide-in from right
- **Stacking**: Multiple toasts can be displayed simultaneously
- **Max limit**: Configurable maximum number of toasts (default: 5)

## Usage

### 1. Import the hook

```tsx
import { useToast } from 'lib/toast';
```

### 2. Use in your component

```tsx
export default function MyComponent() {
  const toast = useToast();
  
  const handleSuccess = () => {
    toast.success('Operation completed successfully!');
  };
  
  const handleError = () => {
    toast.error('Something went wrong!');
  };
  
  const handleWarning = () => {
    toast.warning('Please check your input.');
  };
  
  const handleInfo = () => {
    toast.info('Here is some information.');
  };
  
  // Custom duration (in milliseconds)
  const handleLongToast = () => {
    toast.success('This will stay for 10 seconds!', 10000);
  };
  
  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handleWarning}>Show Warning</button>
      <button onClick={handleInfo}>Show Info</button>
      <button onClick={handleLongToast}>Show Long Toast</button>
    </div>
  );
}
```

## Toast Types

### Success Toast
- **Color**: Green border and icon
- **Use case**: Confirmations, successful operations
- **Example**: `toast.success('Program saved successfully!')`

### Error Toast
- **Color**: Red border and icon
- **Use case**: Error messages, failed operations
- **Example**: `toast.error('Failed to save program')`

### Warning Toast
- **Color**: Yellow border and icon
- **Use case**: Warnings, validation issues
- **Example**: `toast.warning('Please enter a program name')`

### Info Toast
- **Color**: Blue border and icon
- **Use case**: Information, tips
- **Example**: `toast.info('New program started')`

## Configuration

### Toast Duration
- **Default**: 5000ms (5 seconds)
- **Custom**: Pass duration as second parameter
- **Permanent**: Pass 0 for no auto-dismiss

```tsx
// 10 second duration
toast.success('Long message', 10000);

// No auto-dismiss
toast.info('Important info', 0);
```

### Max Toasts
The ToastProvider accepts a `maxToasts` prop to limit the number of simultaneous toasts:

```tsx
<ToastProvider maxToasts={3}>
  {children}
</ToastProvider>
```

## Implementation Details

### Context Provider
The `ToastProvider` is already added to the root layout (`src/app/layout.tsx`), so all components have access to the toast system.

### Portal Rendering
Toasts are rendered using React portals to ensure they appear above all other content and don't interfere with component layouts.

### State Management
- Uses React Context for global state
- Manages toast queue with automatic cleanup
- Handles timeouts and memory leaks properly

### Accessibility
- `role="alert"` for screen readers
- `aria-live="assertive"` for immediate announcements
- `aria-atomic="true"` for complete message reading
- Proper focus management

## Examples in Resistance Training

The Resistance Training component now uses toasts for:

- **Program Operations**: Save, update, load, delete
- **Exercise Operations**: Add, edit, remove
- **Session Operations**: Save session data
- **Template Operations**: Save as template
- **Validation**: Missing program name, no exercises

## Best Practices

1. **Be concise**: Keep messages short and clear
2. **Use appropriate types**: Match the toast type to the message content
3. **Consistent messaging**: Use similar language patterns across the app
4. **Don't overuse**: Reserve toasts for important user feedback
5. **Consider duration**: Longer messages may need longer display times

## Troubleshooting

### Toast not showing?
- Ensure component is wrapped in `ToastProvider`
- Check that `useToast()` is called within a component
- Verify no JavaScript errors in console

### Multiple toasts not stacking?
- Check `maxToasts` setting in provider
- Ensure toasts have different IDs (automatic)

### Styling issues?
- Toasts use Tailwind CSS classes
- Dark mode is automatically handled
- Check for CSS conflicts in your component
