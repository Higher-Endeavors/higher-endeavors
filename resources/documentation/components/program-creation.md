# Program Creation Components Documentation

## Overview
The program creation components handle the design and configuration of resistance training programs, including exercise selection, progression rules, and program settings.

## Core Components

### 1. ProgramBuilder
Location: `/app/(protected)/tools/(fitness)/resistance-training/plan/components/ProgramBuilder.tsx`

#### Purpose
- Main program creation interface
- Manages program structure
- Handles exercise organization
- Configures progression rules

#### Key Features
```typescript
/**
 * Core functionality:
 * 1. Program Structure Management
 * 2. Exercise Organization
 * 3. Progression Rules
 * 4. Volume Management
 */
export default function ProgramBuilder({
  initialProgram,
  onSave,
  userSettings
}: ProgramBuilderProps) {
  // Implementation
}
```

### 2. ProgramSettings
Location: `/app/(protected)/tools/(fitness)/resistance-training/plan/components/ProgramSettings.tsx`

#### Purpose
- Configures program parameters
- Sets progression rules
- Manages volume targets
- Handles periodization settings

#### Implementation
```typescript
const ProgramSettings: React.FC<ProgramSettingsProps> = ({
  settings,
  onSettingsChange
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue
  } = useForm<ProgramSettings>({
    resolver: zodResolver(programSettingsSchema)
  });
  // Implementation
};
```

### 3. WeekView
Location: `/app/(protected)/tools/(fitness)/resistance-training/plan/components/WeekView.tsx`

#### Purpose
- Displays weekly program structure
- Manages day organization
- Handles exercise ordering
- Supports drag-and-drop functionality

## Component Interactions

### Data Flow
```
ProgramBuilder
  ↓
├── ProgramSettings
├── WeekView
│   ├── DayView
│   │   └── ExerciseList
│   └── AddExerciseModal
└── ProgressionRules
```

### State Management
```typescript
// Program State
interface ProgramState {
  settings: ProgramSettings;
  weeks: Week[];
  currentWeek: number;
  isDirty: boolean;
}

// Actions
type ProgramAction =
  | { type: 'UPDATE_SETTINGS'; payload: ProgramSettings }
  | { type: 'ADD_EXERCISE'; payload: { week: number; day: number; exercise: Exercise } }
  | { type: 'UPDATE_EXERCISE'; payload: { week: number; day: number; index: number; exercise: Exercise } }
  | { type: 'REMOVE_EXERCISE'; payload: { week: number; day: number; index: number } };
```

## Current Issues

### 1. State Complexity
- Deep nested state structure
- Complex update patterns
- State synchronization challenges

### 2. Performance
- Large component trees
- Frequent re-renders
- Heavy computation in progression calculations

### 3. UX Challenges
- Complex drag-and-drop interactions
- Multi-week management
- Exercise organization feedback

## Best Practices

### 1. State Management
```typescript
// Use context for deep state
export const ProgramContext = createContext<{
  state: ProgramState;
  dispatch: Dispatch<ProgramAction>;
} | null>(null);

// Custom hook for program state
export const useProgramState = () => {
  const context = useContext(ProgramContext);
  if (!context) {
    throw new Error('useProgramState must be used within ProgramProvider');
  }
  return context;
};
```

### 2. Performance Optimization
```typescript
// Memoize week components
const WeekComponent = memo(({ week, index }: WeekProps) => {
  const { dispatch } = useProgramState();
  // Implementation
});

// Use virtualization for large lists
const VirtualizedWeekList = () => {
  return (
    <VirtualList
      itemCount={weeks.length}
      itemSize={150}
      renderItem={({ index, style }) => (
        <WeekComponent week={weeks[index]} style={style} />
      )}
    />
  );
};
```

### 3. Drag and Drop
```typescript
// Implement drag and drop context
const DragContext = createContext<{
  draggedExercise: Exercise | null;
  dragSource: { week: number; day: number } | null;
}>({
  draggedExercise: null,
  dragSource: null
});

// Handle drag and drop operations
const handleDrop = useCallback((target: { week: number; day: number }) => {
  if (draggedExercise && dragSource) {
    dispatch({
      type: 'MOVE_EXERCISE',
      payload: {
        exercise: draggedExercise,
        source: dragSource,
        target
      }
    });
  }
}, [draggedExercise, dragSource, dispatch]);
``` 