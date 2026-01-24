// AI Pages Shared Utilities
// Common constants, functions, and data used across AI pages

// Default user and doctor IDs (TODO: get from auth context)
export const DEFAULT_USER_ID = 95;
export const DEFAULT_DOCTOR_ID = 1;

// Get user's timezone
export const getUserTimezone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone;

// Sample patient data (TODO: replace with real API data)
export const SAMPLE_PATIENTS = [
  { id: 53, name: "Mr. Maharaz", age: 52, gender: "M" },
  { id: 12, name: "Jane Smith", age: 34, gender: "F" },
  { id: 7, name: "Alice Johnson", age: 29, gender: "F" },
];

// Sample doctor data (TODO: replace with real API data)
export const SAMPLE_DOCTORS = [
  "Dr. House",
  "Dr. Watson",
  "Dr. Strange",
  "Mr Doctor",
];

// Date/Time formatting utilities
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

export const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString();
};

// File handling utilities
export const createRemoveFileHandler = (
  setFiles,
  previews,
  setPreviews = null
) => {
  return (index) => {
    // Clean up the preview URL for the file being removed (if previews exist)
    if (previews && previews[index]) {
      URL.revokeObjectURL(previews[index]);
    }

    setFiles((prev) => prev.filter((_, i) => i !== index));

    // Also clean up previews if setPreviews is provided
    if (setPreviews) {
      setPreviews((prev) => prev.filter((_, i) => i !== index));
    }
  };
};

// API base URL utility
export const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
};

// Generic history loading function
export const createHistoryLoader = (
  endpoint,
  setHistory,
  setLoadingHistory,
  userTimezone
) => {
  return async () => {
    console.log(`Loading ${endpoint} history...`);
    setLoadingHistory(true);
    try {
      const apiBaseUrl = getApiBaseUrl();
      const url = `${apiBaseUrl}/api/ai/${endpoint}/history/all`;
      console.log("Fetching from:", url);
      const response = await fetch(url, {
        headers: {
          "x-timezone": userTimezone,
        },
      });
      console.log("Response status:", response.status);
      if (response.ok) {
        const data = await response.json();
        console.log("History data received:", data.length, "items");
        setHistory(data);
      } else {
        console.error("Failed to fetch history, status:", response.status);
      }
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };
};

// Generic history item loader
export const createHistoryItemLoader = (
  endpoint,
  setSelectedHistoryItem,
  setShowHistoryModal,
  userTimezone
) => {
  return async (id) => {
    try {
      const response = await fetch(
        `${getApiBaseUrl()}/api/ai/${endpoint}/${id}`,
        {
          headers: {
            "x-timezone": userTimezone,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setSelectedHistoryItem(data);
        setShowHistoryModal(true);
      }
    } catch (error) {
      console.error("Error loading history item:", error);
    }
  };
};

// Progress animation utility
export const createProgressAnimator = (
  setProgress,
  setCurrentStep,
  setIsAnalyzing
) => {
  return (isAnalyzing) => {
    if (!isAnalyzing) {
      setProgress(0);
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 3 + 1; // Random increment between 1-4%

        // Update current step based on progress
        if (newProgress >= 25 && newProgress < 50) setCurrentStep(1);
        else if (newProgress >= 50 && newProgress < 75) setCurrentStep(2);
        else if (newProgress >= 75 && newProgress < 100) setCurrentStep(3);
        else if (newProgress >= 100) {
          setCurrentStep(4);
          clearInterval(interval);
        }

        return Math.min(newProgress, 100);
      });
    }, 200);

    return () => clearInterval(interval);
  };
};
