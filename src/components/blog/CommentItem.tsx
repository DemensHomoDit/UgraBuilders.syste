
import React, { useState } from 'react';
import { Comment } from '@/services/comments/types';
import { Button } from '@/components/ui/button';
import { MessageSquare, ThumbsUp } from 'lucide-react';
import CommentForm from './CommentForm';
import { cn } from '@/lib/utils';

interface CommentItemProps {
  comment: Comment;
  blogId: string;
  onReplySuccess: () => void;
  replies?: Comment[];
  level?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  blogId,
  onReplySuccess,
  replies = [],
  level = 0
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleReplySuccess = () => {
    setShowReplyForm(false);
    onReplySuccess();
  };

  const nestedReplies = replies.filter(reply => reply.parent_id === comment.id);
  const maxLevel = 3; // Максимальная глубина вложенности

  return (
    <div>
      <div className={cn(
        "p-4 rounded-lg border",
        level === 0 ? "bg-white" : "bg-gray-50"
      )}>
        <div className="flex items-center mb-2">
          <div className="font-semibold">{comment.author_name}</div>
          <div className="text-sm text-gray-500 ml-auto">
            {formatDate(comment.created_at)}
          </div>
        </div>
        
        <div className="text-gray-700 mb-3">{comment.content}</div>
        
        {level < maxLevel && (
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              <MessageSquare className="h-3.5 w-3.5 mr-1" />
              {showReplyForm ? "Отменить" : "Ответить"}
            </Button>
          </div>
        )}
      </div>
      
      {showReplyForm && (
        <div className="ml-6 mt-3">
          <CommentForm 
            blogId={blogId} 
            parentId={comment.id}
            onSubmitSuccess={handleReplySuccess}
            onCancel={() => setShowReplyForm(false)}
          />
        </div>
      )}
      
      {nestedReplies.length > 0 && (
        <div className={cn(
          "space-y-3 mt-3",
          level < maxLevel ? "ml-6" : "ml-0"
        )}>
          {nestedReplies.map((reply) => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              blogId={blogId} 
              onReplySuccess={onReplySuccess}
              replies={replies}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
