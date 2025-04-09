import { useState, useCallback } from "react";

export function useToastMessages() {
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [showErrorToast, setShowErrorToast] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [showSaveToast, setShowSaveToast] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleError = useCallback((error: Error) => {
        setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
        setShowErrorToast(true);
        setTimeout(() => setShowErrorToast(false), 3000);
      }, []);
  
    return {
      showSuccessToast, setShowSuccessToast,
      showErrorToast, setShowErrorToast,
      errorMessage, setErrorMessage,
      showSaveToast, setShowSaveToast,
      saveError, setSaveError,
      isSaving, setIsSaving
    };
  }