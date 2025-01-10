# Tree Component Documentation

## Overview
The tree component is a client-side feature that implements a sortable, interactive tree structure. It's located in the `/src/app/(protected)/tree` directory and provides functionality for creating, managing, and interacting with hierarchical data structures. The implementation uses the `@dnd-kit` library for drag-and-drop functionality.

## Directory Structure
```
src/app/(protected)/tree/
├── components/
│   ├── TreeItem/
│   │   ├── TreeItem.tsx
│   │   ├── TreeItem.module.scss
│   │   ├── SortableTreeItem.tsx
│   │   └── AddTreeItem.tsx
│   ├── Item/
│   └── SortableTree.tsx
├── utilities/
│   ├── utilities.ts
│   ├── types.ts
│   └── keyboardCoordinates.ts
└── page.tsx
```

## Main Components

### 1. Page Component (`page.tsx`)
The main page component that serves as the entry point for the tree functionality. It:
- Uses client-side rendering
- Implements dynamic loading of the SortableTree component
- Provides a responsive layout with header and footer
- Wraps the tree component in a SessionProvider for authentication
- Includes a wrapper component for styling and positioning

### 2. SortableTree Component (`components/SortableTree.tsx`)
The core component that implements the sortable tree functionality. Features include:
- Collapsible nodes
- Visual indicators
- Add/Remove capabilities
- Dynamic sorting and reordering

Key Properties:
```typescript
interface Props {
  collapsible?: boolean;
  defaultItems?: TreeItems;
  indentationWidth?: number;
  indicator?: boolean;
  addable?: boolean;
  removable?: boolean;
}
```

### 3. TreeItem Components
Located in the `components/TreeItem/` directory:
- `TreeItem.tsx`: Base component for tree nodes
- `SortableTreeItem.tsx`: Adds drag-and-drop functionality
- `AddTreeItem.tsx`: Handles new item creation
- `TreeItem.module.scss`: Styling for tree items

## Data Structure

### Tree Item Interface
```typescript
interface TreeItem {
  id: UniqueIdentifier;
  group: number;
  order: number;
  children: TreeItem[];
}

interface FlattenedItem extends TreeItem {
  parentId: UniqueIdentifier | null;
  depth: number;
  index: number;
}
```

## Core Utilities

### Tree Manipulation Functions
Located in `utilities/utilities.ts`:

1. **Tree Structure Management**
   - `buildTree`: Converts flat items to tree structure
   - `flattenTree`: Converts tree structure to flat array
   - `findItem`: Locates items by ID
   - `findItemDeep`: Recursively searches for items

2. **Item Operations**
   - `addItem`: Adds new items to the tree
   - `removeItem`: Removes items and their children
   - `renumberItems`: Reorders items and updates group numbers

3. **Drag and Drop Utilities**
   - `getProjection`: Calculates drop positions
   - `getDragDepth`: Determines nesting level during drag
   - `getMaxDepth/getMinDepth`: Enforces nesting constraints

## Features

### 1. Drag and Drop
- Implemented using `@dnd-kit/core` and `@dnd-kit/sortable`
- Supports keyboard navigation
- Handles both vertical movement and horizontal indentation
- Provides visual feedback during drag operations

### 2. Tree Structure
- Supports unlimited nesting levels
- Maintains parent-child relationships
- Preserves order within groups
- Handles collapsible sections

### 3. State Management
- Uses React's useState for local state
- Implements optimized rendering with useMemo
- Maintains both flat and hierarchical data structures

## Usage

### Basic Implementation
```tsx
<SortableTree 
    collapsible={true}
    indicator={true}
    addable={true}
    removable={true}
    indentationWidth={50}
    defaultItems={initialItems}
/>
```

### Props Configuration
- `collapsible`: Enables node collapse/expand functionality
- `indicator`: Shows visual indicators for tree structure
- `addable`: Allows adding new nodes
- `removable`: Allows removing existing nodes
- `indentationWidth`: Sets the pixel width for each nesting level
- `defaultItems`: Initial tree structure

## Technical Details

### Performance Optimizations
1. **Memoization**
   - Flattened items are memoized using useMemo
   - Sorted IDs are cached to prevent unnecessary re-renders

2. **Event Handling**
   - Drag events are debounced and optimized
   - Uses efficient collision detection with closestCenter

3. **Accessibility**
   - Implements ARIA announcements for drag operations
   - Supports keyboard navigation
   - Provides screen reader feedback

### State Management
1. **Tree State**
   - Maintains both flat and nested representations
   - Updates are batched for performance
   - Handles complex state transitions during drag operations

2. **Drag State**
   - Tracks active item
   - Manages drag overlay
   - Handles projection calculations

## Best Practices
1. Always wrap the tree component in a SessionProvider when authentication is required
2. Use the dynamic import for the SortableTree component to ensure proper client-side rendering
3. Implement proper error boundaries and loading states
4. Consider accessibility features when customizing the tree component
5. Maintain consistent group and order numbers using renumberItems
6. Handle edge cases in drag and drop operations
7. Implement proper validation for new items

## Error Handling
1. Validates tree structure integrity
2. Handles missing or invalid items gracefully
3. Provides fallbacks for drag and drop operations
4. Implements proper cleanup on component unmount

## Customization
1. Supports custom styling through CSS modules
2. Allows custom indicators and animations
3. Configurable indentation and visual feedback
4. Extensible component structure 