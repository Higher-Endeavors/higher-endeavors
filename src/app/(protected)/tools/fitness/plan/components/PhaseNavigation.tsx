import Link from 'next/link';
import PhasePill from '(protected)/tools/fitness/plan/components/PhasePill';

interface PhaseNavigationProps {
  currentPhase: 'plan' | 'program' | 'act' | 'analyze';
}

export default function PhaseNavigation({ currentPhase }: PhaseNavigationProps) {
  const phases = [
    { 
      key: 'plan', 
      label: 'Plan', 
      href: '/tools/cardiometabolic-training/plan',
      color: currentPhase === 'plan' ? 'bg-emerald-200' : 'bg-indigo-200',
      hint: currentPhase === 'plan' ? 'Current phase' : 'Go to Planning phase'
    },
    { 
      key: 'program', 
      label: 'Program', 
      href: '/tools/cardiometabolic-training/program',
      color: currentPhase === 'program' ? 'bg-emerald-200' : 'bg-indigo-200',
      hint: currentPhase === 'program' ? 'Current phase' : 'Go to Programming phase'
    },
    { 
      key: 'act', 
      label: 'Act', 
      href: '/tools/cardiometabolic-training/act',
      color: currentPhase === 'act' ? 'bg-emerald-200' : 'bg-indigo-200',
      hint: currentPhase === 'act' ? 'Current phase' : 'Go to Execution phase'
    },
    { 
      key: 'analyze', 
      label: 'Analyze', 
      href: '/tools/cardiometabolic-training/analyze',
      color: currentPhase === 'analyze' ? 'bg-emerald-200' : 'bg-indigo-200',
      hint: currentPhase === 'analyze' ? 'Current phase' : 'Go to Analysis phase'
    }
  ];

  return (
    <div className="flex items-center gap-2">
      {phases.map((phase) => {
        if (phase.key === currentPhase) {
          return (
            <PhasePill 
              key={phase.key}
              label={phase.label} 
              color={phase.color} 
              hint={phase.hint} 
            />
          );
        }
        
        return (
          <Link key={phase.key} href={phase.href}>
            <PhasePill 
              label={phase.label} 
              color={phase.color} 
              hint={phase.hint}
              isClickable={true}
            />
          </Link>
        );
      })}
    </div>
  );
}
