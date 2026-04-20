import { User } from "@/services/types/authTypes";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import ProjectList from "./content/project-list";
import { useProjectOperations } from "@/hooks/useProjectOperations";
import {
  AdminProjectsHeader,
  ProjectTabControls,
  LoadingOverlay,
  useProjectsAdmin
} from "./projects";
import ProjectStatCards from "./projects/ProjectStatCards";

interface AdminProjectsProps {
  user: User;
}

const AdminProjects = ({ user }: AdminProjectsProps) => {
  const {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    isLoading,
    handleSearch,
    projectStats,
    refreshProjectStats
  } = useProjectsAdmin();

  const { 
    handleAddProject, 
    handleExport,
    isExporting
  } = useProjectOperations();
  
  return (
    <div className="space-y-6">
      <AdminProjectsHeader 
        onAddProject={handleAddProject} 
        onExport={handleExport}
        isExporting={isExporting}
      />
      
      <Tabs defaultValue="all" className="w-full">
        <ProjectTabControls
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
          viewMode={viewMode}
          setViewMode={setViewMode}
          counts={{
            published: projectStats.publishedProjects || 0,
            drafts: 0,
            archived: 0
          }}
        />
        
        <TabsContent value="all" className="m-0">
          <ProjectStatCards {...projectStats} />
          <div className="bg-white rounded-lg">
            <ProjectList 
              viewMode={viewMode} 
              onProjectDeleted={refreshProjectStats} 
              onPublishToggled={refreshProjectStats}
              user={user}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="published" className="m-0">
          <Card>
            <CardContent className="pt-6">
              <ProjectList 
                viewMode={viewMode} 
                filter="published"
                onProjectDeleted={refreshProjectStats}
                onPublishToggled={refreshProjectStats}  
                user={user}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="drafts" className="m-0">
          <Card>
            <CardContent className="pt-6">
              <ProjectList 
                viewMode={viewMode} 
                filter="draft"
                onProjectDeleted={refreshProjectStats}
                onPublishToggled={refreshProjectStats} 
                user={user}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="archived" className="m-0">
          <Card>
            <CardContent className="pt-6">
              <ProjectList 
                viewMode={viewMode} 
                filter="archived"
                onProjectDeleted={refreshProjectStats}
                onPublishToggled={refreshProjectStats} 
                user={user}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <LoadingOverlay isLoading={isLoading} />
    </div>
  );
};

export default AdminProjects;
