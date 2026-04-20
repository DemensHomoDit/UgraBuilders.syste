
import { useState, useEffect } from "react";
import { db } from "@/integrations/db/client";

export const useProjectCard = (projectId: string, initialPublishState: boolean) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPublished, setIsPublished] = useState<boolean>(initialPublishState);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data } = await db.auth.getSession();
      if (data.session) {
        setIsAdmin(!!data.session);
      }
    };
    
    checkAdminStatus();
  }, []);

  useEffect(() => {
  }, [projectId, isPublished, isAdmin]);

  return {
    isAdmin,
    isPublished
  };
};
