
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
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching reviews:", error);
        throw error;
      }

      if (!data || data.length === 0) return [];

      const projectIds = [...new Set(data.map((r: any) => r.project_id).filter(Boolean))];
      const projectTitles: Record<string, string> = {};

      if (projectIds.length > 0) {
        const { data: projects } = await db
          .from('projects')
          .select('id, title')
          .in('id', projectIds);
        if (projects) {
          for (const p of projects) {
            projectTitles[p.id] = p.title;
          }
        }
      }

      return data.map((r: any) => ({
        ...r,
        projects: projectTitles[r.project_id] ? { title: projectTitles[r.project_id] } : null,
      }));
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return [];
    }
  },

  getReview: async (id: string): Promise<Review | null> => {
    try {
      const { data, error } = await db
        .from('reviews')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching review:", error);
        throw error;
      }

      if (!data) return null;

      if (data.project_id) {
        const { data: project } = await db
          .from('projects')
          .select('title')
          .eq('id', data.project_id)
          .maybeSingle();
        if (project) {
          data.projects = { title: project.title };
        }
      }

      return data;
    } catch (error) {
      console.error("Error fetching review:", error);
      return null;
    }
  }
};

export default reviewQueryService;
