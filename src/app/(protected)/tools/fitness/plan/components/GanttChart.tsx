import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import Section from '(protected)/tools/fitness/plan/components/Section';
import Chip from '(protected)/tools/fitness/plan/components/Chip';
import type { 
  PeriodizationPlan, 
  Phase, 
  SubPhase, 
  Goal, 
  Event, 
  PlanSettings 
} from '../types/periodization.zod';

interface GanttChartProps {
  plan: PeriodizationPlan;
  onPlanChange: (plan: PeriodizationPlan) => void;
}

export default function GanttChart({ plan, onPlanChange }: GanttChartProps) {
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [expandedPhase, setExpandedPhase] = useState<Phase | null>(null);
  const [expandedCMEWeek, setExpandedCMEWeek] = useState<{phaseId: string, weekNumber: number, weekVolumes: any[]} | null>(null);
  const [expandedProgram, setExpandedProgram] = useState<{phase: Phase, program: any, weekNumber: number} | null>(null);
  const [highlightedWeek, setHighlightedWeek] = useState<number | null>(null);
  const scrollRefs = useRef<(HTMLDivElement | null)[]>([]);

  const weekWidth = 60; // Width of each week column in pixels
  const rowHeight = 60; // Height of each modality row (increased to accommodate programs)
  const headerHeight = 60; // Height of the header section

  const weeks = useMemo(() => 
    Array.from({ length: plan.totalWeeks }, (_, i) => ({
      id: i,
      label: `W${i + 1}`,
      date: new Date(plan.startDate.getTime() + i * 7 * 24 * 60 * 60 * 1000),
    })), [plan.startDate, plan.totalWeeks]
  );

  const totalContentWidth = weeks.length * weekWidth;
  const maxScroll = Math.max(0, totalContentWidth - 800); // 800px visible area

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const scrollLeft = target.scrollLeft;
    setScrollPosition(scrollLeft);
    
    // Synchronize all other areas (both scrollable and non-scrollable)
    scrollRefs.current.forEach((ref) => {
      if (ref && ref !== target) {
        ref.scrollLeft = scrollLeft;
      }
    });
  }, []);

  const scrollBarRef = useRef<HTMLDivElement>(null);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    // Only handle horizontal scroll wheel and trackpad horizontal gestures
    // Vertical wheel should scroll the page normally
    if (Math.abs(e.deltaX) > 0) {
      e.preventDefault();
      e.stopPropagation();
      if (scrollBarRef.current) {
        // Use deltaX for horizontal scrolling (horizontal wheel or trackpad horizontal gesture)
        const delta = e.deltaX;
        scrollBarRef.current.scrollLeft += delta;
      }
    }
  }, []);

  const getActivityIcon = (modality: string) => {
    const icons = {
      running: '🏃',
      cycling: '🚴',
      swimming: '🏊',
      strength: '💪',
      power: '⚡',
      hypertrophy: '🏋️'
    };
    return icons[modality as keyof typeof icons] || '🏃';
  };

  const handlePhaseClick = useCallback((phase: Phase) => {
    const phaseWidth = phase.duration * weekWidth;
    const minWidthForText = 120; // Minimum width needed to display text comfortably
    
    if (phaseWidth < minWidthForText) {
      setExpandedPhase(phase);
    } else {
      setSelectedPhase(phase.id);
    }
  }, [weekWidth]);

  const handleCMEWeekClick = useCallback((phaseId: string, weekNumber: number, weekVolumes: any[]) => {
    setExpandedCMEWeek({ phaseId, weekNumber, weekVolumes });
  }, []);

  const handleProgramClick = useCallback((phase: Phase, program: any, weekNumber: number) => {
    setExpandedProgram({ phase, program, weekNumber });
  }, []);

  const handlePhaseDrag = useCallback((phaseId: string, newStartWeek: number) => {
    const updatedPhases = plan.phases.map(phase => 
      phase.id === phaseId 
        ? { ...phase, startWeek: Math.max(0, Math.min(newStartWeek, plan.totalWeeks - phase.duration)) }
        : phase
    );
    onPlanChange({ ...plan, phases: updatedPhases });
  }, [plan, onPlanChange]);

  const handlePhaseResize = useCallback((phaseId: string, newDuration: number) => {
    const updatedPhases = plan.phases.map(phase => 
      phase.id === phaseId 
        ? { ...phase, duration: Math.max(1, Math.min(newDuration, plan.totalWeeks - phase.startWeek)) }
        : phase
    );
    onPlanChange({ ...plan, phases: updatedPhases });
  }, [plan, onPlanChange]);

  const getModalityRows = () => {
    const rows = [];
    
    if (plan.settings.showResistance) {
      rows.push({
        id: 'resistance',
        name: 'Resistance',
        type: 'resistance' as const,
        phases: plan.phases.filter(p => p.type === 'resistance'),
        color: 'bg-blue-100 border-blue-300',
        textColor: 'text-blue-700',
        showPrograms: true // Special flag for resistance training
      });
    }
    
    if (plan.settings.showCME) {
      rows.push({
        id: 'cme',
        name: 'CardioMetabolic Endurance',
        type: 'cme' as const,
        phases: plan.phases.filter(p => p.type === 'cme'),
        color: 'bg-green-100 border-green-300',
        textColor: 'text-green-700',
        showPrograms: false,
        showActivities: true // Special flag for CME activity breakdown
      });
    }
    
    if (plan.settings.showRecovery) {
      rows.push({
        id: 'recovery',
        name: 'Recovery & Rest',
        type: 'recovery' as const,
        phases: plan.phases.filter(p => p.type === 'recovery'),
        color: 'bg-purple-100 border-purple-300',
        textColor: 'text-purple-700',
        showPrograms: false
      });
    }
    
    return rows;
  };

  const modalityRows = getModalityRows();

  // Calculate total number of scrollable areas
  const totalScrollableAreas = 1 + modalityRows.length + (plan.settings.showGoals ? 1 : 0) + (plan.settings.showEvents ? 1 : 0);
  
  // Initialize scroll refs array
  useEffect(() => {
    scrollRefs.current = new Array(totalScrollableAreas).fill(null);
  }, [totalScrollableAreas]);

  // Calculate and set highlighted week
  useEffect(() => {
    const now = new Date();
    
    // Get current week of the year (1-52)
    const getWeekOfYear = (date: Date) => {
      const startOfYear = new Date(date.getFullYear(), 0, 1);
      const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
      return Math.ceil((days + startOfYear.getDay() + 1) / 7);
    };
    
    const currentWeekOfYear = getWeekOfYear(now);
    const planStartWeekOfYear = getWeekOfYear(plan.startDate);
    
    // Calculate which week of the plan we're in (0-based)
    let currentPlanWeek = currentWeekOfYear - planStartWeekOfYear;
    
    // Handle year boundary crossing
    if (currentPlanWeek < 0) {
      currentPlanWeek += 52; // Add 52 weeks for next year
    }
    
    // Set highlighted week for visual indication
    if (currentPlanWeek >= 0 && currentPlanWeek < plan.totalWeeks) {
      setHighlightedWeek(currentPlanWeek);
    } else {
      setHighlightedWeek(null);
    }
  }, [plan.startDate, plan.totalWeeks]);

  // Auto-scroll to current week on mount
  useEffect(() => {
    const now = new Date();
    
    // Get current week of the year (1-52)
    const getWeekOfYear = (date: Date) => {
      const startOfYear = new Date(date.getFullYear(), 0, 1);
      const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
      return Math.ceil((days + startOfYear.getDay() + 1) / 7);
    };
    
    const currentWeekOfYear = getWeekOfYear(now);
    const planStartWeekOfYear = getWeekOfYear(plan.startDate);
    
    // Calculate which week of the plan we're in (0-based)
    let currentPlanWeek = currentWeekOfYear - planStartWeekOfYear;
    
    // Handle year boundary crossing
    if (currentPlanWeek < 0) {
      currentPlanWeek += 52; // Add 52 weeks for next year
    }
    
    console.log('Gantt Chart Auto-scroll Debug:', {
      now: now.toISOString(),
      currentWeekOfYear,
      planStartWeekOfYear,
      currentPlanWeek,
      totalWeeks: plan.totalWeeks,
      weekWidth
    });
    
    // Only scroll if current week is within the plan duration
    if (currentPlanWeek >= 0 && currentPlanWeek < plan.totalWeeks) {
      const scrollToWeek = Math.max(0, currentPlanWeek - 4); // Show current week ± 4 weeks
      const scrollPosition = scrollToWeek * weekWidth;
      
      console.log('Scrolling to:', { scrollToWeek, scrollPosition });
      
      // Scroll all areas to current week
      const scrollAll = () => {
        let scrolledCount = 0;
        scrollRefs.current.forEach((ref) => {
          if (ref) {
            ref.scrollLeft = scrollPosition;
            scrolledCount++;
          }
        });
        if (scrollBarRef.current) {
          scrollBarRef.current.scrollLeft = scrollPosition;
          scrolledCount++;
        }
        console.log('Scrolled', scrolledCount, 'areas to position', scrollPosition);
      };
      
      // Try multiple times to ensure refs are set
      scrollAll();
      setTimeout(scrollAll, 100);
      setTimeout(scrollAll, 300);
      setTimeout(scrollAll, 500);
    } else {
      console.log('Current plan week', currentPlanWeek, 'is outside plan range (0 to', plan.totalWeeks - 1, ')');
    }
  }, [plan.startDate, plan.totalWeeks, weekWidth, scrollRefs, scrollBarRef]);

  return (
    <Section 
      title="Periodization Gantt Chart" 
      subtitle="Drag phases to adjust timing; resize for duration changes"
    >
      <div className="flex flex-col gap-3">
        {/* Gantt Chart Container */}
        <div 
          className="border border-slate-200 rounded-lg bg-white overflow-hidden"
          onWheel={handleWheel}
        >
          {/* Header Row with Fixed Left Column */}
          <div className="flex">
            <div className="w-32 flex-shrink-0 border-r border-slate-200 bg-slate-50 p-3">
              <div className="text-sm font-medium text-slate-700">Timeline</div>
            </div>
            <div 
              className="w-full max-w-4xl overflow-hidden" 
              ref={(el) => { scrollRefs.current[0] = el; }}
            >
              <div className="flex" style={{ width: `${totalContentWidth}px` }}>
                {weeks.map((week) => (
                  <div 
                    key={week.id} 
                    className={`flex-shrink-0 border-r border-slate-200 ${
                      highlightedWeek === week.id ? 'bg-sky-50 border-sky-200' : ''
                    }`} 
                    style={{ width: `${weekWidth}px` }}
                  >
                    <div className={`h-12 flex items-center justify-center text-xs text-slate-600 border-b border-slate-200 ${
                      highlightedWeek === week.id 
                        ? 'bg-sky-100 border-sky-200' 
                        : 'bg-slate-50'
                    }`}>
                      <div className="text-center">
                        <div className={`font-medium ${
                          highlightedWeek === week.id ? 'text-sky-700' : 'text-slate-600'
                        }`}>
                          {week.label}
                        </div>
                        <div className={`text-xs ${
                          highlightedWeek === week.id ? 'text-sky-600' : 'text-slate-500'
                        }`}>
                          {week.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Single Scroll Bar */}
          <div className="flex border-t border-slate-200">
            <div className="w-32 flex-shrink-0 bg-slate-50"></div>
            <div 
              ref={scrollBarRef}
              className="w-full max-w-4xl overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100" 
              onScroll={handleScroll}
            >
              <div style={{ width: `${totalContentWidth}px`, height: '8px' }}></div>
            </div>
          </div>

          {/* Modality Rows */}
          {modalityRows.map((row, index) => (
            <div key={row.id} className="flex">
              <div className="w-32 flex-shrink-0 border-r border-slate-200 bg-slate-50 p-3">
                <div className={`text-sm font-medium ${row.textColor}`}>{row.name}</div>
              </div>
              <div 
                className="w-full max-w-4xl overflow-hidden" 
                ref={(el) => { scrollRefs.current[index + 1] = el; }}
                onWheel={handleWheel}
              >
                <div className="flex relative" style={{ width: `${totalContentWidth}px`, height: `${rowHeight}px` }}>
                  {/* Phase Bars */}
                  {row.phases.map((phase) => {
                    const phaseWidth = phase.duration * weekWidth;
                    const isTooSmall = phaseWidth < 120;
                    
                    return (
                      <div
                        key={phase.id}
                        className={`absolute top-1 h-8 rounded-md border-2 cursor-pointer transition-all hover:shadow-md ${
                          selectedPhase === phase.id ? 'ring-2 ring-sky-400' : ''
                        } ${isTooSmall ? 'hover:ring-2 hover:ring-amber-400' : ''} ${phase.color}`}
                        style={{
                          left: `${phase.startWeek * weekWidth}px`,
                          width: `${phase.duration * weekWidth}px`,
                        }}
                        onClick={() => handlePhaseClick(phase)}
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('phaseId', phase.id);
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const draggedPhaseId = e.dataTransfer.getData('phaseId');
                          const rect = e.currentTarget.getBoundingClientRect();
                          const newStartWeek = Math.round((e.clientX - rect.left) / weekWidth);
                          handlePhaseDrag(draggedPhaseId, newStartWeek);
                        }}
                        title={isTooSmall ? `Click to expand: ${phase.name}` : phase.name}
                      >
                        {isTooSmall ? (
                          <div className="flex items-center justify-center h-full px-1">
                            <div className="text-xs font-medium text-slate-700 truncate">
                              {phase.phaseFocus && phase.periodizationStyle 
                                ? `${phase.phaseFocus}: ${phase.periodizationStyle}`
                                : phase.name.length > 8 ? `${phase.name.substring(0, 6)}...` : phase.name}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full px-2">
                            <div className="text-xs font-medium text-slate-700 truncate">
                              {phase.phaseFocus && phase.periodizationStyle 
                                ? `${phase.phaseFocus}: ${phase.periodizationStyle}`
                                : phase.name}
                            </div>
                            {phase.phaseFocus && phase.periodizationStyle && (
                              <div className="text-xs text-slate-500 truncate">
                                {phase.name}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Resize Handles */}
                        <>
                          <div
                            className="absolute left-0 top-0 w-2 h-full bg-slate-400 cursor-ew-resize opacity-0 hover:opacity-100 transition-opacity"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              // Handle resize start
                            }}
                          />
                          <div
                            className="absolute right-0 top-0 w-2 h-full bg-slate-400 cursor-ew-resize opacity-0 hover:opacity-100 transition-opacity"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              // Handle resize end
                            }}
                          />
                        </>
                      </div>
                    );
                  })}
                  
                  {/* Weekly Programs for Resistance Training */}
                  {row.showPrograms && row.phases.map((phase) => {
                    if (!phase.programs) return null;
                    
                    return phase.programs.map((program) => {
                      return program.weeks.map((weekNumber) => {
                        const weekOffset = weekNumber - phase.startWeek;
                        if (weekOffset < 0 || weekOffset >= phase.duration) return null;
                        
                        return (
                          <div
                            key={`${phase.id}-${program.id}-week-${weekNumber}`}
                            className="absolute top-10 h-6 rounded border bg-blue-200 border-blue-400 cursor-pointer hover:bg-blue-300 transition-colors"
                            style={{
                              left: `${weekNumber * weekWidth + 2}px`,
                              width: `${weekWidth - 4}px`,
                            }}
                            onClick={() => handleProgramClick(phase, program, weekNumber)}
                            title={`Click to view Week ${weekNumber + 1} program details`}
                          >
                            <div className="flex items-center justify-center h-full px-1">
                              <div className="text-xs font-medium text-slate-700 truncate">
                                {program.name}
                              </div>
                            </div>
                          </div>
                        );
                      });
                    }).flat();
                  }).flat()}
                  
                  {/* CME Weekly Activity Breakdown */}
                  {row.showActivities && row.phases.map((phase) => {
                    if (!phase.subPhases || phase.subPhases.length === 0) return null;
                    
                    // Generate weekly volume blocks for each week in the phase
                    return Array.from({ length: phase.duration }, (_, weekOffset) => {
                      const weekNumber = phase.startWeek + weekOffset;
                      const weekVolumes = phase.subPhases!.map(sub => ({
                        modality: sub.modality,
                        volume: sub.weeklyVolumes?.[weekOffset] || sub.volume,
                        icon: getActivityIcon(sub.modality),
                        tiz: sub.weeklyTIZ?.[weekOffset] || null
                      }));
                      const weekTotal = weekVolumes.reduce((sum, wv) => sum + wv.volume, 0);
                      
                      return (
                        <div
                          key={`${phase.id}-week-${weekNumber}`}
                          className="absolute top-10 h-6 rounded border bg-green-200 border-green-400 cursor-pointer hover:bg-green-300 transition-colors hover:ring-2 hover:ring-amber-400"
                          style={{
                            left: `${weekNumber * weekWidth + 2}px`,
                            width: `${weekWidth - 4}px`,
                          }}
                          onClick={() => handleCMEWeekClick(phase.id, weekNumber, weekVolumes)}
                          title={`Click to expand: Week ${weekNumber + 1} - Total: ${weekTotal}m`}
                        >
                          <div className="flex items-center justify-center h-full px-1">
                            <div className="text-xs font-medium text-slate-700">
                              {weekTotal}m
                            </div>
                          </div>
                        </div>
                      );
                    });
                  }).flat()}
                  
                  {/* Grid Lines */}
                  {weeks.map((week) => (
                    <div
                      key={week.id}
                      className="absolute top-0 h-full border-r border-slate-100"
                      style={{ left: `${week.id * weekWidth}px` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Goals Row */}
          {plan.settings.showGoals && (
            <div className="flex">
              <div className="w-32 flex-shrink-0 border-r border-slate-200 bg-slate-50 p-3">
                <div className="text-sm font-medium text-amber-700">Goals & Milestones</div>
              </div>
              <div 
                className="w-full max-w-4xl overflow-hidden" 
                ref={(el) => { scrollRefs.current[modalityRows.length + 1] = el; }}
                onWheel={handleWheel}
              >
                <div className="flex relative" style={{ width: `${totalContentWidth}px`, height: `${rowHeight}px` }}>
                  {plan.goals.map((goal) => {
                    const goalWeek = Math.floor((goal.targetDate.getTime() - plan.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
                    return (
                      <div
                        key={goal.id}
                        className="absolute top-1 h-8 rounded-md border-2 bg-amber-100 border-amber-300 cursor-pointer"
                        style={{
                          left: `${goalWeek * weekWidth}px`,
                          width: `${weekWidth}px`,
                        }}
                        title={`${goal.name} - ${goal.targetDate.toLocaleDateString()}`}
                      >
                        <div className="flex items-center justify-center h-full px-2">
                          <div className="text-xs font-medium text-slate-700 truncate">
                            {goal.name}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Events Row */}
          {plan.settings.showEvents && (
            <div className="flex">
              <div className="w-32 flex-shrink-0 border-r border-slate-200 bg-slate-50 p-3">
                <div className="text-sm font-medium text-red-700">Events</div>
              </div>
              <div 
                className="w-full max-w-4xl overflow-hidden" 
                ref={(el) => { 
                  const goalsOffset = plan.settings.showGoals ? 1 : 0;
                  scrollRefs.current[modalityRows.length + 1 + goalsOffset] = el; 
                }}
                onWheel={handleWheel}
              >
                <div className="flex relative" style={{ width: `${totalContentWidth}px`, height: `${rowHeight}px` }}>
                  {plan.events.map((event) => {
                    const eventWeek = Math.floor((event.date.getTime() - plan.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
                    return (
                      <div
                        key={event.id}
                        className="absolute top-1 h-8 rounded-md border-2 bg-red-100 border-red-300 cursor-pointer"
                        style={{
                          left: `${eventWeek * weekWidth}px`,
                          width: `${weekWidth}px`,
                        }}
                        title={`${event.name} - ${event.date.toLocaleDateString()}`}
                      >
                        <div className="flex items-center justify-center h-full px-2">
                          <div className="text-xs font-medium text-slate-700 truncate">
                            {event.name}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scroll Indicator */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Week {Math.floor(scrollPosition / weekWidth) + 1} of {weeks.length}</span>
          <div className="flex items-center gap-2">
            <span>Scroll to navigate timeline</span>
            <div className="w-32 h-1 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-sky-400 transition-all duration-200"
                style={{ width: `${(scrollPosition / maxScroll) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Phase Details Modal */}
        {expandedPhase && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Phase Details</h3>
                <button
                  onClick={() => setExpandedPhase(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Phase Name</label>
                  <p className="text-slate-800 font-medium">{expandedPhase.name}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Duration</label>
                    <p className="text-slate-800">{expandedPhase.duration} weeks</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Start Week</label>
                    <p className="text-slate-800">Week {expandedPhase.startWeek + 1}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Volume</label>
                    <p className="text-slate-800">{expandedPhase.volume} minutes/week</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Intensity</label>
                    <p className="text-slate-800">{expandedPhase.intensity}/10</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-600">Type</label>
                  <p className="text-slate-800 capitalize">{expandedPhase.type}</p>
                </div>
                
                {expandedPhase.deload && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <span className="text-sm text-amber-700 font-medium">Deload Phase</span>
                  </div>
                )}
                
                {expandedPhase.subPhases && expandedPhase.subPhases.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-2 block">Sub-Phases</label>
                    <div className="space-y-2">
                      {expandedPhase.subPhases.map((subPhase) => (
                        <div key={subPhase.id} className="bg-slate-50 rounded-md p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700">{subPhase.name}</span>
                            <span className="text-xs text-slate-500 capitalize">{subPhase.modality}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-slate-600">{subPhase.volume}m</span>
                            <span className="text-xs text-slate-600">{subPhase.intensity}/10</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setExpandedPhase(null)}
                  className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedPhase(expandedPhase.id);
                    setExpandedPhase(null);
                  }}
                  className="px-4 py-2 text-sm bg-sky-600 hover:bg-sky-700 text-white rounded-md transition-colors"
                >
                  Edit Phase
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CME Week Details Modal */}
        {expandedCMEWeek && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Week {expandedCMEWeek.weekNumber + 1} Details</h3>
                <button
                  onClick={() => setExpandedCMEWeek(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-slate-600 mb-3">Activity Breakdown</h4>
                  <div className="space-y-3">
                    {expandedCMEWeek.weekVolumes.map((wv, index) => (
                      <div key={`${wv.modality}-${expandedCMEWeek.weekNumber}`} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{wv.icon}</span>
                          <span className="text-sm font-medium text-slate-700 capitalize">
                            {wv.modality}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-slate-800">
                          {wv.volume} minutes
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">Total Weekly Volume</span>
                      <span className="text-lg font-bold text-green-700">
                        {expandedCMEWeek.weekVolumes.reduce((sum, wv) => sum + wv.volume, 0)} minutes
                      </span>
                    </div>
                  </div>
                </div>

                {/* TIZ Breakdown */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-slate-600 mb-3">Time In Zones (TIZ)</h4>
                  <div className="space-y-3">
                    {expandedCMEWeek.weekVolumes.map((wv, index) => {
                      if (!wv.tiz) return null;
                      const totalTIZ = wv.tiz.z1 + wv.tiz.z2 + wv.tiz.z3 + wv.tiz.z4 + wv.tiz.z5;
                      
                      return (
                        <div key={`tiz-${wv.modality}-${expandedCMEWeek.weekNumber}`} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{wv.icon}</span>
                            <span className="text-sm font-medium text-slate-700 capitalize">
                              {wv.modality} Zones
                            </span>
                          </div>
                          <div className="grid grid-cols-5 gap-2 text-xs">
                            <div className="text-center">
                              <div className="text-slate-600">Z1</div>
                              <div className="font-semibold text-slate-800">{wv.tiz.z1}m</div>
                            </div>
                            <div className="text-center">
                              <div className="text-slate-600">Z2</div>
                              <div className="font-semibold text-slate-800">{wv.tiz.z2}m</div>
                            </div>
                            <div className="text-center">
                              <div className="text-slate-600">Z3</div>
                              <div className="font-semibold text-slate-800">{wv.tiz.z3}m</div>
                            </div>
                            <div className="text-center">
                              <div className="text-slate-600">Z4</div>
                              <div className="font-semibold text-slate-800">{wv.tiz.z4}m</div>
                            </div>
                            <div className="text-center">
                              <div className="text-slate-600">Z5</div>
                              <div className="font-semibold text-slate-800">{wv.tiz.z5}m</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Combined TIZ Summary */}
                  <div className="mt-4 pt-3 border-t border-slate-200">
                    <div className="text-sm font-medium text-slate-600 mb-2">Combined Zone Distribution</div>
                    <div className="grid grid-cols-5 gap-2 text-xs">
                      {(() => {
                        const combinedTIZ = expandedCMEWeek.weekVolumes.reduce((acc, wv) => {
                          if (wv.tiz) {
                            acc.z1 += wv.tiz.z1;
                            acc.z2 += wv.tiz.z2;
                            acc.z3 += wv.tiz.z3;
                            acc.z4 += wv.tiz.z4;
                            acc.z5 += wv.tiz.z5;
                          }
                          return acc;
                        }, { z1: 0, z2: 0, z3: 0, z4: 0, z5: 0 });
                        
                        const totalCombined = combinedTIZ.z1 + combinedTIZ.z2 + combinedTIZ.z3 + combinedTIZ.z4 + combinedTIZ.z5;
                        
                        return (
                          <>
                            <div className="text-center">
                              <div className="text-slate-600">Z1</div>
                              <div className="font-bold text-green-700">{combinedTIZ.z1}m</div>
                              <div className="text-slate-500">{totalCombined > 0 ? Math.round((combinedTIZ.z1 / totalCombined) * 100) : 0}%</div>
                            </div>
                            <div className="text-center">
                              <div className="text-slate-600">Z2</div>
                              <div className="font-bold text-green-700">{combinedTIZ.z2}m</div>
                              <div className="text-slate-500">{totalCombined > 0 ? Math.round((combinedTIZ.z2 / totalCombined) * 100) : 0}%</div>
                            </div>
                            <div className="text-center">
                              <div className="text-slate-600">Z3</div>
                              <div className="font-bold text-green-700">{combinedTIZ.z3}m</div>
                              <div className="text-slate-500">{totalCombined > 0 ? Math.round((combinedTIZ.z3 / totalCombined) * 100) : 0}%</div>
                            </div>
                            <div className="text-center">
                              <div className="text-slate-600">Z4</div>
                              <div className="font-bold text-green-700">{combinedTIZ.z4}m</div>
                              <div className="text-slate-500">{totalCombined > 0 ? Math.round((combinedTIZ.z4 / totalCombined) * 100) : 0}%</div>
                            </div>
                            <div className="text-center">
                              <div className="text-slate-600">Z5</div>
                              <div className="font-bold text-green-700">{combinedTIZ.z5}m</div>
                              <div className="text-slate-500">{totalCombined > 0 ? Math.round((combinedTIZ.z5 / totalCombined) * 100) : 0}%</div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-slate-500">
                  <p>This week's volume and zone distribution for your CME training activities.</p>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setExpandedCMEWeek(null)}
                  className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Program Details Modal */}
        {expandedProgram && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    Week {expandedProgram.weekNumber + 1} - Program {expandedProgram.program.name}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {expandedProgram.phase.phaseFocus}: {expandedProgram.phase.periodizationStyle}
                  </p>
                </div>
                <button
                  onClick={() => setExpandedProgram(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Training Schedule</h4>
                  <div className="space-y-2">
                    {expandedProgram.program.sessions.map((session: string, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm font-medium text-slate-700">{session}</span>
                        <span className="text-sm text-slate-600">Program {expandedProgram.program.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Program Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Program Name:</span>
                      <span className="ml-2 font-medium text-slate-700">{expandedProgram.program.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Duration:</span>
                      <span className="ml-2 font-medium text-slate-700">{expandedProgram.program.weeks.length} weeks</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Sessions/Week:</span>
                      <span className="ml-2 font-medium text-slate-700">{expandedProgram.program.sessions.length}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Phase Focus:</span>
                      <span className="ml-2 font-medium text-slate-700">{expandedProgram.phase.phaseFocus}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setExpandedProgram(null)}
                  className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement edit program functionality
                    console.log('Edit program:', expandedProgram.program);
                  }}
                  className="px-4 py-2 text-sm bg-sky-600 hover:bg-sky-700 text-white rounded-md transition-colors"
                >
                  Edit Program
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}