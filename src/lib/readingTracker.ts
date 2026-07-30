"use client";

import {
  isPersonalizationAuthRequiredError,
  saveRecentSearch,
  trackReadingProgress,
  trackRecentView,
} from "@/lib/personalization";

export const readingTracker = {
  trackReading: async (bookId: number, progress: number) => {
    try {
      await trackReadingProgress(bookId, progress);
    } catch (error) {
      if (isPersonalizationAuthRequiredError(error)) return;
      console.error("Failed to track reading:", error);
    }
  },

  trackRecentView: async (bookId: number) => {
    try {
      await trackRecentView(bookId);
    } catch (error) {
      if (isPersonalizationAuthRequiredError(error)) return;
      console.error("Failed to track view:", error);
    }
  },

  saveSearch: async (query: string) => {
    try {
      await saveRecentSearch(query);
    } catch (error) {
      if (isPersonalizationAuthRequiredError(error)) return;
      console.error("Failed to save search:", error);
    }
  },
};
