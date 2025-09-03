# Plan Phase Components

This directory contains all the components for the CME Training Plan phase. The components are organized into shared UI components and section-specific components.

## Shared UI Components

These are reusable components used throughout the Plan phase:

- **PhasePill**: Displays phase indicators with color coding and optional clickable styling
- **PhaseNavigation**: Reusable navigation component for switching between phases
- **Chip**: Small status/type indicators with different styles (neutral, warn, ok, info)
- **Section**: Container component with title, subtitle, and annotation support
- **Toggle**: Custom toggle switch component
- **Slider**: Range input with label and value display
- **ProgressRing**: Circular progress indicator
- **WeekBar**: Horizontal bar chart for weekly volume display
- **LegendItem**: Legend entry with code and description
- **DayCell**: Calendar day cell with availability and session placeholders

## Section Components

These components represent the main functional sections of the Plan phase:

### Left Control Panel (B1-B7)
- **GoalsAndTimeline** (B1): Primary event, dates, and A/B/C priorities
- **PeriodizationStyle** (B2): Training archetype and intensity distribution
- **VolumeRampDeload** (B3): Volume progression and deload settings
- **ModalityMix** (B4): Sport-specific volume distribution
- **ZoneModel** (B5): Heart rate zone model configuration
- **AvailabilityConstraints** (B6): Training windows and constraints
- **HealthGuardrails** (B7): Safety and health controls

### Center Panel (C1-C2)
- **GanttChart** (C1): Macro/meso/micro cycle visualization
- **WeeklyVolume** (C2): Weekly volume progression bars

### Right Panel (D1-D4)
- **PlanHealth** (D1): Overall plan health score and metrics
- **ConflictsWarnings** (D2): Plan conflicts and warnings
- **QuickFixes** (D3): One-click automated adjustments
- **AuditTrail** (D4): History of automated changes

### Bottom Panel (E1-E2)
- **Calendar** (E1): Weekly calendar with session placeholders
- **TIZTargets** (E2): Time in zone targets and progress

### Top Bar and Legend
- **TopBar** (A): Main navigation and controls
- **LegendNotes** (F): Component reference guide

## Usage

All components can be imported from the index file:

```typescript
import { GoalsAndTimeline, PeriodizationStyle, PhaseNavigation } from './components';
```

### Phase Navigation

The `PhaseNavigation` component provides consistent navigation between phases:

```typescript
<PhaseNavigation currentPhase="plan" />
```

This will render clickable phase pills for Program, Act, and Analyze, with the current phase (Plan) highlighted and non-clickable.

## State Management

Each component manages its own local state where appropriate. Shared state (like `deloadEvery` and `z2share`) is managed at the page level and passed down as props to components that need it.

## Styling

All components use Tailwind CSS classes and follow the existing design system. The components are designed to be responsive and work well in the grid layout of the main Plan page.
