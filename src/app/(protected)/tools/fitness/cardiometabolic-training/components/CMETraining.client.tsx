'use client';

import React, { useState, useCallback } from 'react';
import type { FitnessSettings } from 'lib/types/userSettings.zod';
import type { CMEActivityItem, CMEExercise } from '(protected)/tools/fitness/cardiometabolic-training/lib/types/cme.zod';
import type { CMESessionListItem } from '(protected)/tools/fitness/cardiometabolic-training/program/lib/hooks/getCMESessions';
import { getUserSettingsById } from 'lib/actions/userSettings';
import { getHeartRateZonesById } from '(protected)/user/bio/lib/actions/saveHeartRateZones';
import { saveCMESession } from '(protected)/tools/fitness/cardiometabolic-training/program/lib/actions/saveCMESession';
import { saveCMETemplate } from '(protected)/tools/fitness/cardiometabolic-training/program/lib/actions/saveCMETemplate';
import { getCMESessions, getCMESession } from '(protected)/tools/fitness/cardiometabolic-training/program/lib/hooks/getCMESessions';
import { getCMEActivityLibrary } from '(protected)/tools/fitness/lib/hooks/getCMEActivityLibrary';
import { transformDatabaseToFrontend } from '(protected)/tools/fitness/cardiometabolic-training/program/lib/actions/transformDatabaseToFrontend';
import { clientLogger } from 'lib/logging/logger.client';
import { useToast } from 'lib/toast';


// Components
import UserSelector from '(protected)/components/UserSelector';
import ProgramBrowser from '(protected)/tools/fitness/cardiometabolic-training/program/components/SessionBrowser';
import SessionSettings from '(protected)/tools/fitness/cardiometabolic-training/program/components/SessionSettings';
import ActivityList from '(protected)/tools/fitness/cardiometabolic-training/program/components/ActivityList';
import SessionSummary from '(protected)/tools/fitness/cardiometabolic-training/program/components/SessionSummary';
import AddActivityModal from '(protected)/tools/fitness/cardiometabolic-training/program/lib/modals/AddActivityModal';

export default function CardiometabolicTrainingClient({
  initialUserId,
  userId,
  fitnessSettings,
  userHeartRateZones,
  activities,
}: {
  initialUserId: number;
  userId: number;
  fitnessSettings?: FitnessSettings;
  userHeartRateZones?: any[];
  activities: CMEActivityItem[];
}) {
  const toast = useToast();
  const [selectedUserId, setSelectedUserId] = useState(userId);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedSession, setSelectedSession] = useState<CMESessionListItem | null>(null);
  const [isSessionLoaded, setIsSessionLoaded] = useState(false);
  
  // Add state to track if current session is a template
  const [isTemplateSession, setIsTemplateSession] = useState(false);

  // User preferences state - initialized from props
  const [selectedUserFitnessSettings, setSelectedUserFitnessSettings] = useState<FitnessSettings | undefined>(() => fitnessSettings);
  const [selectedUserHeartRateZones, setSelectedUserHeartRateZones] = useState<any[]>(() => userHeartRateZones || []);
  const [preferencesError, setPreferencesError] = useState<string | null>(null);
  
  // Activities state - initialize from props
  const [allActivities, setAllActivities] = useState<CMEActivityItem[]>(activities);
  

  // Session state
  const [sessionName, setSessionName] = useState('');
  const [macrocyclePhase, setMacrocyclePhase] = useState('');
  const [focusBlock, setFocusBlock] = useState('');
  const [notes, setNotes] = useState('');
  const [tierContinuumId, setTierContinuumId] = useState<number>(1); // Default to Healthy
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Template saving state
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [templateSaveError, setTemplateSaveError] = useState<string | null>(null);
  const [templateSaveSuccess, setTemplateSaveSuccess] = useState(false);

  // Activity state
  const [sessionActivities, setSessionActivities] = useState<CMEExercise[]>([]);
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<CMEExercise | null>(null);



  // Fetch user preferences when user changes
  const fetchUserPreferences = async (userId: number) => {
    try {
      setPreferencesError(null);
      const [userSettings, userHRZones] = await Promise.all([
        getUserSettingsById(userId),
        getHeartRateZonesById(userId)
      ]);
      setSelectedUserFitnessSettings(userSettings?.fitness);
      setSelectedUserHeartRateZones(userHRZones?.data || []);
    } catch (error) {
      clientLogger.error('Error fetching user preferences:', error);
      setPreferencesError('Failed to load user preferences. Using default settings.');
      setSelectedUserFitnessSettings(fitnessSettings); // Fallback
      setSelectedUserHeartRateZones(userHeartRateZones || []); // Fallback
    }
  };


  const handleUserSelect = (userId: number | null) => {
    if (userId) {
      setSelectedUserId(userId);
      setSelectedSession(null);
      setIsSessionLoaded(false);
      setIsTemplateSession(false);
      // Reset session settings when user changes
      setSessionName('');
      setMacrocyclePhase('');
      setFocusBlock('');
      setNotes('');
      setTierContinuumId(1); // Reset to Healthy
      // Reset activities when user changes
      setSessionActivities([]);
      setEditingActivity(null);
      // Fetch new user preferences
      fetchUserPreferences(userId);
    }
  };

  const handleAdminStatusChange = useCallback((isAdmin: boolean) => {
    setIsAdmin(isAdmin);
  }, []);

  const handleSessionSelect = async (session: CMESessionListItem) => {
    try {
      setSelectedSession(session);
      setIsSessionLoaded(false);
      
      // Load the session data from the database
      const { session: sessionData, activities: sessionActivities } = await getCMESession(session.cme_session_id, selectedUserId);
      
      // Transform database activities back to frontend format
      const frontendActivities = sessionActivities.map(dbActivity => 
        transformDatabaseToFrontend(dbActivity, selectedUserId)
      );
      
      // Update session settings
      setSessionName(sessionData.session_name);
      setMacrocyclePhase(sessionData.macrocycle_phase || '');
      setFocusBlock(sessionData.focus_block || '');
      setNotes(sessionData.notes || '');
      
              // Update activities
        setSessionActivities(frontendActivities);
      
      // Update template-related settings if this is a template
      if (session.templateInfo) {
        setIsTemplateSession(true);
      } else {
        setIsTemplateSession(false);
      }
      
      setIsSessionLoaded(true);
      clientLogger.info('Session loaded successfully:', { sessionName: sessionData.session_name });
      toast.success('Session loaded successfully!');
    } catch (error) {
      clientLogger.error('Error loading session:', error);
      toast.error('Error loading session: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleSessionDelete = (sessionId: number) => {
    if (selectedSession?.cme_session_id === sessionId) {
      setSelectedSession(null);
      setIsSessionLoaded(false);
    }
  };

  const handleNewSession = () => {
    setSelectedSession(null);
    setIsSessionLoaded(false);
    setIsTemplateSession(false);
    // Reset session settings for new session
    setSessionName('');
    setMacrocyclePhase('');
    setFocusBlock('');
    setNotes('');
          setTierContinuumId(1); // Reset to Healthy
          // Reset activities for new session
      setSessionActivities([]);
      setEditingActivity(null);
    // TODO: Implement new session creation logic
  };

  const handleAddActivity = (activity: CMEExercise) => {
    if (editingActivity) {
      // Update existing activity
      setSessionActivities(prev => prev.map(act => 
        act.activityId === editingActivity.activityId ? activity : act
      ));
      setEditingActivity(null);
    } else {
      // Add new activity
      setSessionActivities(prev => [...prev, activity]);
    }
    setIsAddActivityModalOpen(false);
  };

  const handleEditActivity = (activityId: number) => {
    const activityToEdit = sessionActivities.find(act => act.activityId === activityId);
    if (activityToEdit) {
      setEditingActivity(activityToEdit);
      setIsAddActivityModalOpen(true);
    }
  };

  const handleDeleteActivity = (activityId: number) => {
    setSessionActivities(prev => prev.filter(act => act.activityId !== activityId));
  };

  const handleOpenAddActivityModal = () => {
    setEditingActivity(null);
    setIsAddActivityModalOpen(true);
  };

  const handleCloseAddActivityModal = () => {
    setIsAddActivityModalOpen(false);
    setEditingActivity(null);
  };

  const handleSaveSession = async () => {
    if (!sessionName.trim()) {
      setSaveError('Session name is required');
      return;
    }

    if (sessionActivities.length === 0) {
      setSaveError('At least one activity is required');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const result = await saveCMESession({
        userId: selectedUserId,
        sessionName: sessionName.trim(),
        macrocyclePhase: macrocyclePhase || undefined,
        focusBlock: focusBlock || undefined,
        notes: notes || undefined,
        activities: sessionActivities.map(activity => ({
          ...activity,
          // Ensure all required fields are present
          activityId: activity.activityId,
          activityName: activity.activityName,
          useIntervals: activity.useIntervals,
          intervals: activity.intervals,
          notes: activity.notes,
          totalRepeatCount: activity.totalRepeatCount,
          heartRateData: activity.heartRateData,
        })),
      });

      if (result.success) {
        setSaveSuccess(true);
        toast.success(isTemplateSession ? 'Session created from template successfully!' : 'Session saved successfully!');
        // Reset template state after saving (template becomes a regular session)
        setIsTemplateSession(false);
        // Optionally reset the form or redirect
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(result.error || 'Failed to save session');
        toast.error('Error saving session: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      clientLogger.error('Error saving session:', error);
      setSaveError('An unexpected error occurred while saving');
      toast.error('Error saving session: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!sessionName.trim()) {
      setTemplateSaveError('Session name is required');
      return;
    }

    if (sessionActivities.length === 0) {
      setTemplateSaveError('At least one activity is required');
      return;
    }

    setIsSavingTemplate(true);
    setTemplateSaveError(null);
    setTemplateSaveSuccess(false);

    try {
      // Create template directly from current activity data (no need to save session first)
      const templateResult = await saveCMETemplate({
        userId: selectedUserId,
        templateName: sessionName.trim(),
        tierContinuumId: 1, // Default to Healthy
        notes: notes || undefined,
        macrocyclePhase: macrocyclePhase || undefined,
        focusBlock: focusBlock || undefined,
        activities: sessionActivities.map(activity => ({
          ...activity,
          // Ensure all required fields are present
          activityId: activity.activityId,
          activityName: activity.activityName,
          useIntervals: activity.useIntervals,
          intervals: activity.intervals,
          notes: activity.notes,
          totalRepeatCount: activity.totalRepeatCount,
          heartRateData: activity.heartRateData,
        })),
      });

      if (templateResult.success) {
        setTemplateSaveSuccess(true);
        toast.success('Template saved successfully!');
        // Reset success message after 3 seconds
        setTimeout(() => setTemplateSaveSuccess(false), 3000);
      } else {
        setTemplateSaveError(templateResult.error || 'Failed to save template');
        toast.error('Error saving template: ' + (templateResult.error || 'Unknown error'));
      }
    } catch (error) {
      clientLogger.error('Error saving template:', error);
      setTemplateSaveError('An unexpected error occurred while saving template');
      toast.error('Error saving template: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSavingTemplate(false);
    }
  };

  return (
    <>
      <div className="max-w-md">
        <UserSelector
          onUserSelect={handleUserSelect}
          currentUserId={selectedUserId}
          showAdminFeatures={true}
          onAdminStatusChange={handleAdminStatusChange}
        />
      </div>
      
      {/* Error Display */}
      {preferencesError && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ {preferencesError}
          </p>
        </div>
      )}
      
      <ProgramBrowser
        onSessionSelect={handleSessionSelect}
        currentUserId={selectedUserId}
        isAdmin={isAdmin}
        onSessionDelete={handleSessionDelete}
        newSessionHandler={handleNewSession}
        isSessionLoaded={isSessionLoaded}
      />
      <SessionSettings
        sessionName={sessionName}
        setSessionName={setSessionName}
        macrocyclePhase={macrocyclePhase}
        setMacrocyclePhase={setMacrocyclePhase}
        focusBlock={focusBlock}
        setFocusBlock={setFocusBlock}
        notes={notes}
        setNotes={setNotes}
        tierContinuumId={tierContinuumId}
        setTierContinuumId={setTierContinuumId}

        isAdmin={isAdmin}
        isLoading={false}
        isTemplateSession={isTemplateSession}

      />
             <ActivityList 
         activities={sessionActivities}
         onEditActivity={handleEditActivity}
         onDeleteActivity={handleDeleteActivity}
         userHeartRateZones={selectedUserHeartRateZones}
       />
      
      {/* Add Activity and Save Session Buttons - positioned like Resistance Training */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mt-4 touch-manipulation">
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors touch-manipulation"
            style={{ minHeight: '44px' }}
            onClick={handleOpenAddActivityModal}
            onTouchStart={(e) => e.preventDefault()}
          >
            Add Activity
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
                     {sessionActivities.length > 0 && (
            <>
              <button
                onClick={handleSaveSession}
                                 disabled={isSaving || sessionActivities.length === 0 || !sessionName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto touch-manipulation"
                style={{ minWidth: '120px', minHeight: '44px' }}
                onTouchStart={(e) => e.preventDefault()}
              >
                {isSaving ? 'Saving...' : 'Save Session'}
              </button>
              
                             {isAdmin && sessionActivities.length > 0 && (
                <button
                  onClick={handleSaveTemplate}
                                     disabled={isSavingTemplate || sessionActivities.length === 0 || !sessionName.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto touch-manipulation"
                  style={{ minWidth: '120px', minHeight: '44px' }}
                  onTouchStart={(e) => e.preventDefault()}
                >
                  {isSavingTemplate ? 'Saving...' : 'Save Template'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
       
             <SessionSummary activities={sessionActivities} />
      <AddActivityModal
        key={editingActivity?.activityId || 'new'}
        isOpen={isAddActivityModalOpen}
        onClose={handleCloseAddActivityModal}
        onAdd={handleAddActivity}
        currentUserId={selectedUserId}
        selectedUserId={selectedUserId}
        editingActivity={editingActivity}
        fitnessSettings={selectedUserFitnessSettings}
        userHeartRateZones={selectedUserHeartRateZones}
        activities={allActivities}
      />
    </>
  );
}
