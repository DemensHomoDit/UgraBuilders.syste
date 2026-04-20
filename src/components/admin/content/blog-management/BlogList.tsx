import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import { BlogPost } from "@/services/blog/types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import blogService from "@/services/blog";
import { BlogDeleteDialog } from "./components";
import { ReviewActions } from "../reviews-management/components";

interface BlogListProps {
  blogs: BlogPost[];
  onNewClick: () => void;
  onEditClick: (blog: BlogPost) => void;
  onBlogsChange: () => void;
  categories: { id: string; name: string }[];
}

const BlogList: React.FC<BlogListProps> = ({
  blogs,
  onNewClick,
  onEditClick,
  onBlogsChange,
  categories,
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<BlogPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (blog: BlogPost) => {
    setBlogToDelete(blog);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!blogToDelete) return;
    
    setIsDeleting(true);
    
    try {
      // Проверяем, что blogToDelete.id существует
      if (!blogToDelete.id) {
        console.error("Blog ID is undefined");
        toast.error("Невозможно удалить запись блога: ID не определен");
        setIsDeleting(false);
        setDeleteDialogOpen(false);
        setBlogToDelete(null);
        return;
      }
      
      const success = await blogService.deleteBlogPost(blogToDelete.id);
      
      if (success) {
        toast.success("Запись блога успешно удалена");
        onBlogsChange(); // Refresh the blog list
      } else {
        console.error(`Failed to delete blog post: ${blogToDelete.id}`);
        toast.error("Не удалось удалить запись блога");
      }
    } catch (error) {
      console.error("Error deleting blog post:", error);
      toast.error("Произошла ошибка при удалении записи блога");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setBlogToDelete(null);
    }
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "Без категории";
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Без категории";
  };

  const handleEditClick = (blog: BlogPost) => {
    onEditClick(blog);
  };

  // --- Workflow actions ---
  const handleSendToReview = async (blog: BlogPost) => {
    if (!blog.id) return;
    await blogService.updateBlogStatus(blog.id, 'pending');
    onBlogsChange();
  };
  const handleRevoke = async (blog: BlogPost) => {
    if (!blog.id) return;
    await blogService.updateBlogStatus(blog.id, 'draft');
    onBlogsChange();
  };
  const handleApprove = async (blog: BlogPost) => {
    if (!blog.id) return;
    await blogService.updateBlogStatus(blog.id, 'published');
    onBlogsChange();
  };
  const handleReject = async (blog: BlogPost) => {
    if (!blog.id) return;
    await blogService.updateBlogStatus(blog.id, 'rejected');
    onBlogsChange();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Записи блога</CardTitle>
          <CardDescription>
            Управляйте записями блога вашего сайта
          </CardDescription>
        </div>
        <Button onClick={onNewClick}>
          <Plus className="mr-2 h-4 w-4" /> Новая запись
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Заголовок</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead>Дата публикации</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="w-[100px]">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Записи блога не найдены
                  </TableCell>
                </TableRow>
              ) : (
                blogs.map((blog) => (
                  <TableRow key={blog.id}>
                    <TableCell className="font-medium">{blog.title}</TableCell>
                    <TableCell>{getCategoryName(blog.category_id)}</TableCell>
                    <TableCell>
                      {blog.created_at
                        ? format(new Date(blog.created_at), "dd.MM.yyyy")
                        : "Не опубликовано"}
                    </TableCell>
                    <TableCell>
                      {blog.status === 'published' ? (
                        <Badge variant="default">Опубликовано</Badge>
                      ) : blog.status === 'pending' ? (
                        <Badge variant="secondary">На модерации</Badge>
                      ) : blog.status === 'rejected' ? (
                        <Badge variant="destructive">Отклонён</Badge>
                      ) : (
                        <Badge variant="outline">Черновик</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <ReviewActions
                        review={blog as any}
                        onEditClick={() => handleEditClick(blog)}
                        onDeleteClick={() => handleDeleteClick(blog)}
                        onSendToReview={handleSendToReview}
                        onRevoke={handleRevoke}
                        onApprove={handleApprove}
                        onReject={handleReject}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <BlogDeleteDialog
        isOpen={deleteDialogOpen}
        isDeleting={isDeleting}
        blogToDelete={blogToDelete}
        onOpenChange={setDeleteDialogOpen}
        onConfirmDelete={confirmDelete}
      />
    </Card>
  );
};

export default BlogList;
