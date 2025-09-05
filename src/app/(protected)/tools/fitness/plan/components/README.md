# Periodization Gantt Chart

A custom-built Gantt chart component specifically designed for fitness periodization planning, built with React and TypeScript.

## Features

### Core Functionality
- **Multi-modality visualization**: Separate rows for Resistance Training, CME, Recovery, Goals, and Events
- **Interactive editing**: Drag-and-drop phase adjustment, resize handles for duration changes
- **Horizontal scrolling**: Navigate through 12-52 week training plans
- **Real-time updates**: Immediate visual feedback for plan modifications
- **Save functionality**: Persist changes with dedicated save button

### Visual Design
- **Color-coded phases**: Different colors for each modality type
- **Volume & intensity display**: Metrics shown directly within phase bars
- **Grid alignment**: Clean week-by-week timeline structure
- **Responsive layout**: Adapts to different screen sizes

### Data Structure
- **Flexible phase system**: Support for complex training blocks with sub-phases
- **Goal integration**: Milestone dates and metric targets
- **Event tracking**: Competitions, tests, and important dates
- **Settings control**: Toggle visibility of different modality rows

## Usage

```tsx
import GanttChart from './components/GanttChart';
import { mockPlanData } from './components/MockPlanData';

function PlanPage() {
  const [plan, setPlan] = useState(mockPlanData);
  
  const handlePlanChange = (updatedPlan) => {
    setPlan(updatedPlan);
  };
  
  const handleSave = () => {
    // Save to database
  };
  
  return (
    <GanttChart 
      plan={plan} 
      onPlanChange={handlePlanChange} 
      onSave={handleSave} 
    />
  );
}
```

## Architecture

### Interfaces
- `PeriodizationPlan`: Main plan data structure
- `Phase`: Individual training phases with volume/intensity
- `Goal`: Milestone and metric targets
- `Event`: Important dates and competitions
- `PlanSettings`: Visibility and display preferences

### Key Components
- **GanttChart**: Main chart component with editing capabilities
- **MockPlanData**: Sample data for development and testing
- **Section**: Reusable container component
- **Chip**: Status indicator component

## Future Enhancements

- **Database integration**: Connect to backend for persistent storage
- **Advanced editing**: Inline editing, phase duplication, bulk operations
- **Dependency management**: Phase relationships and constraints
- **Export functionality**: PDF, image, or data export
- **Collaboration**: Multi-user editing and version control
- **Analytics**: Progress tracking and performance metrics

## Technical Notes

- Built with React hooks for state management
- Uses CSS Grid and Flexbox for layout
- Implements drag-and-drop with native HTML5 API
- Responsive design with Tailwind CSS
- TypeScript for type safety and better development experience