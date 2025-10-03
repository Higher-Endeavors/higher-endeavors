import Link from 'next/link';
import Header from 'components/Header';
import Footer from 'components/Footer';

export default function CardiometabolicTrainingDashboard() {
  const phases = [
    {
      name: 'Program',
      description: 'Design and customize your CME training sessions',
      href: '/tools/fitness/cardiometabolic-training/program',
      icon: '🏃‍♂️',
      color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
    },
    {
      name: 'Act',
      description: 'Execute your workouts with real-time tracking',
      href: '/tools/fitness/cardiometabolic-training/act',
      icon: '⚡',
      color: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
    },
    {
      name: 'Analyze',
      description: 'Review performance data and track your progress',
      href: '/tools/fitness/cardiometabolic-training/analyze',
      icon: '📊',
      color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Header />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4">CardioMetabolic Endurance Training</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-12">
          A comprehensive four-phase approach to CME training
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {phases.map((phase) => (
            <Link
              key={phase.name}
              href={phase.href}
              className={`block p-6 rounded-lg border-2 transition-all duration-200 hover:shadow-lg hover:scale-105 ${phase.color}`}
            >
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-4">{phase.icon}</span>
                <h2 className="text-2xl font-bold">{phase.name}</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {phase.description}
              </p>
            </Link>
          ))}
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
          <h3 className="text-xl font-semibold mb-4">Training Philosophy</h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Our four-phase approach ensures comprehensive development of your cardiometabolic endurance. 
            Start with planning your goals, design your program, execute with precision, and analyze your progress 
            to continuously improve your performance.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
