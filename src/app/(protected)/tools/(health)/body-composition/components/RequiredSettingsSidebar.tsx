'use client';

import { UserSettings } from '@/app/lib/types/userSettings';

interface RequiredSettingsSidebarProps {
  userSettings: UserSettings;
  showNotification: boolean;
  onDismiss: () => void;
}

export default function RequiredSettingsSidebar({
  userSettings,
  showNotification,
  onDismiss
}: RequiredSettingsSidebarProps) {
  if (!showNotification) {
    return null;
  }

  return (
    <div className="w-full lg:w-80 h-fit">
      <div className="bg-white dark:bg-[#e0e0e0] rounded-lg shadow-md p-6 lg:sticky lg:top-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Complete Your Profile</h2>
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-500"
            aria-label="Dismiss"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            To get accurate body fat calculations in the Body Composition Tracker, please complete the following information in your bio:
          </p>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <svg className="h-4 w-4 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">Date of Birth</p>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <svg className="h-4 w-4 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">Gender</p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <a
              href="/user/bio"
              className="w-full flex items-center justify-center space-x-2 rounded-md bg-purple-500 hover:bg-purple-600 py-2 px-4 text-white text-sm font-medium transition-colors"
            >
              <span>Complete Bio Information</span>
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 