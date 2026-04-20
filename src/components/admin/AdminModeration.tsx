import { User } from "@/services/types/authTypes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, FileText, MessageSquare, Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import CategoryManagement from "./content/category-management";
import BlogManagement from "./content/blog-management";
import ReviewsManagement from "./content/reviews-management";
import CommentsManagement from "./content/comments-management";

interface AdminModerationProps {
  user: User;
}

const AdminModeration = ({ user }: AdminModerationProps) => {
  const [activeTab, setActiveTab] = useState("categories");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Shield className="mr-2 h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Модерация контента</h1>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="categories">Категории</TabsTrigger>
          <TabsTrigger value="blog">Блог</TabsTrigger>
          <TabsTrigger value="reviews">Отзывы</TabsTrigger>
          <TabsTrigger value="comments">Комментарии</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="mt-6">
          <CategoryManagement />
        </TabsContent>

        <TabsContent value="blog" className="mt-6">
          <BlogManagement />
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <ReviewsManagement />
        </TabsContent>

        <TabsContent value="comments" className="mt-6">
          <CommentsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminModeration;
