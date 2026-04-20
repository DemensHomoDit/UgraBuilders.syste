
import React, { useEffect, useState } from 'react';
import { Comment } from '@/services/comments/types';
import commentService from '@/services/comments';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import { MessageSquare } from 'lucide-react';

interface CommentsListProps {
  blogId: string;
}

const CommentsList: React.FC<CommentsListProps> = ({ blogId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const fetchedComments = await commentService.getComments(blogId);
      setComments(fetchedComments);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (blogId) {
      loadComments();
    }
  }, [blogId]);

  // Фильтруем комментарии верхнего уровня (без родителя)
  const rootComments = comments.filter(comment => !comment.parent_id);

  return (
    <div className="mt-10">
      <h3 className="text-2xl font-bold mb-6 flex items-center">
        <MessageSquare className="mr-2 h-5 w-5" />
        Комментарии ({comments.length})
      </h3>
      
      <div className="mb-8">
        <h4 className="text-lg font-medium mb-4">Оставить комментарий</h4>
        <CommentForm 
          blogId={blogId}
          onSubmitSuccess={loadComments}
        />
      </div>
      
      {isLoading ? (
        <div className="py-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-gray-500">Загрузка комментариев...</p>
        </div>
      ) : rootComments.length > 0 ? (
        <div className="space-y-4">
          {rootComments.map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              blogId={blogId}
              onReplySuccess={loadComments}
              replies={comments}
            />
          ))}
        </div>
      ) : (
        <div className="py-8 text-center bg-gray-50 rounded-lg">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h4 className="text-lg font-medium text-gray-900 mb-1">Нет комментариев</h4>
          <p className="text-gray-500">Будьте первым, кто оставит комментарий к этой записи!</p>
        </div>
      )}
    </div>
  );
};

export default CommentsList;
