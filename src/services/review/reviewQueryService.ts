
import { db } from "@/integrations/db/client";
import { Review } from "./types";

/**
 * Service for querying reviews
 */
const reviewQueryService = {
  getReviews: async (): Promise<Review[]> => {
    try {
      const { data, error } = await db
        .from('reviews')
        .select('*, projects(title)')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return [];
    }
  },

  getReview: async (id: string): Promise<Review | null> => {
    try {
      const { data, error } = await db
        .from('reviews')
        .select('*, projects(title)')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error fetching review:", error);
      return null;
    }
  }
};

export default reviewQueryService;
