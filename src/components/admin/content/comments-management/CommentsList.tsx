
import React from 'react';
import { Comment } from '@/services/comments/types';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Check, 
  X, 
  Trash2, 
  MessageSquare
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { BlogPost } from '@/services/blog/types';
import { useState, useEffect } from 'react';
import { db } from '@/integrations/db/client';

interface CommentsListProps {
  comments: Comment[];
  isLoading: boolean;
  onApprove: (commentId: string) => void;
  onReject: (commentId: string) => void;
  onDelete: (commentId: string) => void;
  showActions?: boolean;
}

const CommentsList: React.FC<CommentsListProps> = ({
  comments,
  isLoading,
  onApprove,
  onReject,
  onDelete,
  showActions = true
}) => {
  const { toast } = useToast();
  const [blogPosts, setBlogPosts] = useState<Record<string, BlogPost>>({});

  // Загружаем информацию о блогах
  useEffect(() => {
    const loadBlogPosts = async () => {
      try {
        // Получаем уникальные blog_id из комментариев
        const blogIds = [...new Set(comments.map(comment => comment.blog_id).filter(Boolean))];
        
        if (blogIds.length === 0) return;
        
        const { data, error } = await db
          .from('blog_posts')
          .select('id, title')
          .in('id', blogIds);
          
        if (error) throw error;
        
        // Преобразуем массив в объект для быстрого доступа по id
        const blogsMap = (data || []).reduce((acc, blog) => {
          acc[blog.id] = blog;
          return acc;
        }, {} as Record<string, BlogPost>);
        
        setBlogPosts(blogsMap);
      } catch (error) {
        console.error("Error loading blog posts:", error);
      }
    };
    
    loadBlogPosts();
  }, [comments]);

  // Форматирование даты
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Обрезаем текст комментария, если он слишком длинный
  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        <p className="mt-2 text-gray-500">Загрузка комментариев...</p>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="py-12 text-center bg-gray-50 rounded-lg mt-4">
        <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-3" />
        <h4 className="text-lg font-medium text-gray-900 mb-1">Комментарии отсутствуют</h4>
        <p className="text-gray-500">В данной категории нет комментариев</p>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Автор</TableHead>
            <TableHead>Комментарий</TableHead>
            <TableHead>Запись блога</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Дата</TableHead>
            {showActions && <TableHead>Действия</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {comments.map((comment) => (
            <TableRow key={comment.id}>
              <TableCell className="font-medium">
                {comment.author_name}
                {comment.author_email && (
                  <div className="text-xs text-gray-500 mt-1">
                    {comment.author_email}
                  </div>
                )}
              </TableCell>
              <TableCell>
                {truncateText(comment.content)}
                {comment.parent_id && (
                  <Badge variant="outline" className="ml-2">
                    Ответ
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {comment.blog_id && blogPosts[comment.blog_id] ? (
                  blogPosts[comment.blog_id].title
                ) : (
                  <span className="text-gray-400 italic">Блог не найден</span>
                )}
              </TableCell>
              <TableCell>
                {comment.is_approved ? (
                  <Badge className="bg-green-100 text-green-800">
                    Опубликован
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-100 text-amber-800">
                    Ожидает
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-sm">
                {formatDate(comment.created_at)}
              </TableCell>
              {showActions && (
                <TableCell>
                  <div className="flex space-x-2">
                    {!comment.is_approved && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onApprove(comment.id)}
                        title="Одобрить"
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                    {comment.is_approved && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onReject(comment.id)}
                        title="Отклонить"
                      >
                        <X className="h-4 w-4 text-amber-600" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onDelete(comment.id)}
                      title="Удалить"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CommentsList;
