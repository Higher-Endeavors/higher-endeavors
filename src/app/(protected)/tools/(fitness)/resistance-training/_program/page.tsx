import React, { useState } from 'react';
import ProgramViewer from './ProgramViewer';
import ProgramBrowser from './ProgramBrowser';

export default function ResistanceTrainingProgramPage() {
  const [programs, setPrograms] = useState<ResistanceProgram[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<ResistanceProgram | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">Resistance Training Programs</h1>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          {selectedProgram ? (
            <ProgramViewer
              program={selectedProgram}
              onBack={() => setSelectedProgram(null)}
            />
          ) : (
            <ProgramBrowser
              programs={programs}
              onProgramSelect={setSelectedProgram}
              onProgramsChange={setPrograms}
            />
          )}
        </>
      )}
    </div>
  );
} 