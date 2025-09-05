# Breathing Tool

A comprehensive breathing exercise tool that guides users through various breath patterns with visual and audio feedback.

## Features

### Breath Patterns
- **Box Breathing**: Classic 4-4-4-4 pattern (inhale-hold-exhale-hold)
- **Pranayama**: Customizable 1-1-2-1 pattern with adjustable multiplier
- **Custom Pattern**: User-defined timing for each breath phase

### Session Types
- **Breath Count**: Complete a specific number of breath cycles
- **Duration**: Practice for a set amount of time (1-120 minutes)
- **Open-ended**: Practice until manually stopped

### Visual Elements
- **Breathing Orb**: Animated orb that expands/contracts with breath cycles
- **Chakra Color Progression**: Orb changes colors through the 7 chakra colors
- **Progress Ring**: Visual indicator of current phase progress
- **Phase Display**: Shows current breathing phase and countdown

### Audio Guidance
- **Voice Instructions**: Browser speech synthesis guides users through each phase
- **Phase Announcements**: "Inhale", "Hold", "Exhale" spoken at appropriate intervals

## Components

### Main Page (`page.tsx`)
- Orchestrates the entire breathing session
- Manages state between components
- Handles session lifecycle

### BreathStyleSelector
- Radio button selection for breath patterns
- Custom pattern input fields
- Pranayama multiplier slider

### SessionControls
- Session type selection (breaths/duration/open)
- Session value input
- Start/stop controls

### SessionTracker
- Real-time breath count display
- Session duration timer
- Session status indicator
- Progress bar for duration sessions

### BreathingOrb
- Animated breathing orb with smooth transitions
- Chakra color progression
- Audio guidance system
- Phase progress visualization

## Usage

1. **Select Breath Pattern**: Choose between Box, Pranayama, or Custom
2. **Configure Settings**: Adjust timing for Pranayama or set custom values
3. **Set Session Type**: Choose breath count, duration, or open-ended
4. **Start Session**: Click "Start Breathing Session"
5. **Follow Guidance**: Listen to audio cues and watch the orb animation
6. **Monitor Progress**: Track breaths completed and session duration
7. **End Session**: Click "Stop Session" or let it complete automatically

## Technical Details

- Built with React and TypeScript
- Uses `requestAnimationFrame` for smooth animations
- Browser Speech Synthesis API for audio guidance
- Responsive design with Tailwind CSS
- No external dependencies beyond React

## Future Enhancements

- Settings persistence between sessions
- Pre-recorded audio files
- Additional breath patterns
- Session history and statistics
- Mobile-optimized touch interactions
- Integration with health tracking systems
