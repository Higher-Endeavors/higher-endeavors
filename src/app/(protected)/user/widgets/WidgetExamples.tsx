// Example usage of individual widgets throughout the site
import CaloriesBurnedWidget from '(protected)/user/widgets/CaloriesBurnedWidget';
import StepsWidget from '(protected)/user/widgets/StepsWidget';
import SleepWidget from '(protected)/user/widgets/SleepWidget';
import HeartRateWidget from '(protected)/user/widgets/HeartRateWidget';
import MetricCard from '(protected)/user/widgets/MetricCard';
import SummaryCard from '(protected)/user/widgets/SummaryCard';
import { getGarminDeviceAttribution } from 'lib/actions/userSettings';

// Example: User Dashboard with selected widgets
export async function DashboardWidgets() {
  const garminAttribution = await getGarminDeviceAttribution();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <CaloriesBurnedWidget showProgress={true} garminAttribution={garminAttribution} />
      <StepsWidget showProgress={true} garminAttribution={garminAttribution} />
      <SleepWidget garminAttribution={garminAttribution} />
      <HeartRateWidget garminAttribution={garminAttribution} />
    </div>
  );
}

// Example: Fitness Planning page with activity-focused widgets
export function FitnessWidgets() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CaloriesBurnedWidget showProgress={true} />
        <StepsWidget showProgress={true} />
        <HeartRateWidget />
      </div>
      <SummaryCard title="Today's Fitness Summary" />
    </div>
  );
}

// Example: Nutrition page with calorie-focused widgets
export function NutritionWidgets() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CaloriesBurnedWidget showProgress={true} />
        <MetricCard data={{
          id: 'calories-consumed',
          title: 'Calories Consumed',
          value: 2156,
          unit: 'kcal',
          trend: 'down',
          trendValue: '-5%',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-200'
        }} />
      </div>
    </div>
  );
}

// Example: Sleep-focused page
export function SleepWidgets() {
  return (
    <div className="space-y-4">
      <SleepWidget />
      <SummaryCard title="Sleep Analysis" />
    </div>
  );
}
