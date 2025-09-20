'use client';

import { useState } from 'react';
import { FaCog, FaEye, FaEyeSlash, FaFilter, FaSearch } from 'react-icons/fa';

// Import all widget components
import CaloriesBurnedWidget from '(protected)/user/widgets/CaloriesBurnedWidget';
import CaloriesConsumedWidget from '(protected)/user/widgets/CaloriesConsumedWidget';
import CalorieDeficitWidget from '(protected)/user/widgets/CalorieDeficitWidget';
import StepsWidget from '(protected)/user/widgets/StepsWidget';
import SleepWidget from '(protected)/user/widgets/SleepWidget';
import HeartRateWidget from '(protected)/user/widgets/HeartRateWidget';
import StressLevelWidget from '(protected)/user/widgets/StressLevelWidget';
import ActiveMinutesWidget from '(protected)/user/widgets/ActiveMinutesWidget';
import BodyCompositionWidget from '(protected)/user/widgets/BodyCompositionWidget';
import MetricCard from '(protected)/user/widgets/MetricCard';
import WeeklyVolumeWidget from '(protected)/user/widgets/WeeklyCMEVolumeWidget';
import TimeInZonesWidget from '(protected)/user/widgets/TimeInZonesWidget';
import TrainingLoadWidget from '(protected)/user/widgets/TrainingLoadWidget';
import RecoveryStatusWidget from '(protected)/user/widgets/RecoveryStatusWidget';
import WorkoutIntensityWidget from '(protected)/user/widgets/WorkoutIntensityWidget';
import WeeklyGoalsWidget from '(protected)/user/widgets/WeeklyGoalsWidget';

// Widget categories and metadata
interface WidgetMetadata {
  id: string;
  name: string;
  description: string;
  pillar: 'lifestyle' | 'health' | 'nutrition' | 'fitness';
  size: 'small' | 'medium' | 'large';
  component: React.ComponentType<any>;
  isVisible: boolean;
}

const widgetMetadata: WidgetMetadata[] = [
  // Lifestyle Pillar
  {
    id: 'weekly-goals',
    name: 'Weekly Goals',
    description: 'Track progress toward weekly fitness goals',
    pillar: 'lifestyle',
    size: 'medium',
    component: WeeklyGoalsWidget,
    isVisible: true
  },

  // Health Pillar
  {
    id: 'sleep',
    name: 'Sleep Quality',
    description: 'Track sleep duration and quality metrics',
    pillar: 'health',
    size: 'small',
    component: SleepWidget,
    isVisible: true
  },
  {
    id: 'heart-rate',
    name: 'Heart Rate',
    description: 'Monitor resting heart rate and heart rate zones',
    pillar: 'health',
    size: 'small',
    component: HeartRateWidget,
    isVisible: true
  },
  {
    id: 'stress-level',
    name: 'Stress Level',
    description: 'Monitor daily stress levels and management',
    pillar: 'health',
    size: 'small',
    component: StressLevelWidget,
    isVisible: true
  },
  {
    id: 'active-minutes',
    name: 'Active Minutes',
    description: 'Track daily active minutes and movement goals',
    pillar: 'health',
    size: 'small',
    component: ActiveMinutesWidget,
    isVisible: true
  },
  {
    id: 'recovery-status',
    name: 'Recovery Status',
    description: 'Overall recovery score and factors',
    pillar: 'health',
    size: 'medium',
    component: RecoveryStatusWidget,
    isVisible: true
  },
  {
    id: 'body-composition',
    name: 'Body Composition',
    description: 'Track weight, body fat %, fat mass, and fat free mass with 4-week trends',
    pillar: 'health',
    size: 'medium',
    component: BodyCompositionWidget,
    isVisible: true
  },

  // Nutrition Pillar
  {
    id: 'calories-burned',
    name: 'Calories Burned',
    description: 'Track daily calorie expenditure with goal progress',
    pillar: 'nutrition',
    size: 'small',
    component: CaloriesBurnedWidget,
    isVisible: true
  },
  {
    id: 'calories-consumed',
    name: 'Calories Consumed',
    description: 'Track daily calorie intake with goal progress',
    pillar: 'nutrition',
    size: 'small',
    component: CaloriesConsumedWidget,
    isVisible: true
  },
  {
    id: 'calorie-deficit',
    name: 'Calorie Deficit',
    description: 'Monitor daily calorie deficit for weight management',
    pillar: 'nutrition',
    size: 'small',
    component: CalorieDeficitWidget,
    isVisible: true
  },

  // Fitness Pillar
  {
    id: 'steps',
    name: 'Daily Steps',
    description: 'Monitor daily step count and activity levels',
    pillar: 'fitness',
    size: 'small',
    component: StepsWidget,
    isVisible: true
  },
  {
    id: 'weekly-volume',
    name: 'Weekly Training Volume',
    description: 'Track planned vs actual training volume',
    pillar: 'fitness',
    size: 'medium',
    component: WeeklyVolumeWidget,
    isVisible: true
  },
  {
    id: 'time-in-zones',
    name: 'Time in Heart Rate Zones',
    description: 'Monitor time spent in different heart rate zones',
    pillar: 'fitness',
    size: 'medium',
    component: TimeInZonesWidget,
    isVisible: true
  },
  {
    id: 'training-load',
    name: 'Training Load',
    description: 'Track current vs target training load',
    pillar: 'fitness',
    size: 'medium',
    component: TrainingLoadWidget,
    isVisible: true
  },
  {
    id: 'workout-intensity',
    name: 'Workout Intensity',
    description: 'Weekly workout intensity distribution',
    pillar: 'fitness',
    size: 'medium',
    component: WorkoutIntensityWidget,
    isVisible: true
  }
];

const pillarLabels = {
  lifestyle: 'Lifestyle',
  health: 'Health',
  nutrition: 'Nutrition',
  fitness: 'Fitness'
};

// Removed size labels as they're not needed for filtering

export default function WidgetsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPillar, setSelectedPillar] = useState<string>('all');
  const [widgetVisibility, setWidgetVisibility] = useState<Record<string, boolean>>(
    widgetMetadata.reduce((acc, widget) => ({ ...acc, [widget.id]: widget.isVisible }), {})
  );

  // Filter widgets based on search and filters
  const filteredWidgets = widgetMetadata.filter(widget => {
    const matchesSearch = widget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         widget.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPillar = selectedPillar === 'all' || widget.pillar === selectedPillar;
    
    return matchesSearch && matchesPillar;
  });

  // Group widgets by pillar
  const groupedWidgets = filteredWidgets.reduce((acc, widget) => {
    if (!acc[widget.pillar]) {
      acc[widget.pillar] = [];
    }
    acc[widget.pillar].push(widget);
    return acc;
  }, {} as Record<string, WidgetMetadata[]>);

  const toggleWidgetVisibility = (widgetId: string) => {
    setWidgetVisibility(prev => ({
      ...prev,
      [widgetId]: !prev[widgetId]
    }));
  };

// Removed getSizeClasses function as size filtering is no longer needed

  return (
    <div className="min-h-screen py-4 md:py-8 mx-5">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Widget Library
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Customize your dashboard and tools with personalized widgets
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                <FaCog className="w-4 h-4" />
                Settings
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search widgets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Pillar Filter */}
            <select
              value={selectedPillar}
              onChange={(e) => setSelectedPillar(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Pillars</option>
              {Object.entries(pillarLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Widgets Grid */}
        <div className="space-y-8">
          {Object.entries(groupedWidgets).map(([pillar, widgets]) => (
            <div key={pillar} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {pillarLabels[pillar as keyof typeof pillarLabels]}
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {widgets.length} widget{widgets.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {widgets.map((widget) => {
                  const WidgetComponent = widget.component;
                  const isVisible = widgetVisibility[widget.id];
                  
                  return (
                    <div
                      key={widget.id}
                      className={`bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md ${
                        isVisible ? 'opacity-100' : 'opacity-50'
                      }`}
                    >
                      {/* Widget Header */}
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {widget.name}
                          </h3>
                          <button
                            onClick={() => toggleWidgetVisibility(widget.id)}
                            className={`p-2 rounded-md transition-colors ${
                              isVisible 
                                ? 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700' 
                                : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                            title={isVisible ? 'Hide widget' : 'Show widget'}
                          >
                            {isVisible ? <FaEye className="w-4 h-4" /> : <FaEyeSlash className="w-4 h-4" />}
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {widget.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium rounded">
                            {pillarLabels[widget.pillar as keyof typeof pillarLabels]}
                          </span>
                        </div>
                      </div>

                      {/* Widget Preview */}
                      <div className="p-4">
                        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
                          <div className="w-full">
                            <WidgetComponent />
                          </div>
                        </div>
                      </div>

                      {/* Widget Actions */}
                      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {isVisible ? 'Visible on dashboard' : 'Hidden from dashboard'}
                          </span>
                          <div className="flex items-center gap-3">
                            <button className="text-xs text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 font-medium transition-colors">
                              Customize
                            </button>
                            <button className="text-xs text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 font-medium transition-colors">
                              Learn More
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredWidgets.length === 0 && (
          <div className="text-center py-12">
            <FaFilter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No widgets found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search terms or filters to find the widgets you're looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
