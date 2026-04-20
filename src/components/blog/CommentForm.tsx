
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { db } from '@/integrations/db/client';

const commentSchema = z.object({
  author_name: z.string().min(2, "Имя должно содержать не менее 2 символов"),
  author_email: z.string().email("Введите корректный email").optional().or(z.literal('')),
  content: z.string().min(5, "Комментарий должен содержать не менее 5 символов"),
});

type CommentFormValues = z.infer<typeof commentSchema>;

interface CommentFormProps {
  blogId: string;
  parentId?: string;
  onSubmitSuccess: () => void;
  onCancel?: () => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ 
  blogId, 
  parentId, 
  onSubmitSuccess,
  onCancel
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      author_name: '',
      author_email: '',
      content: '',
    },
  });

  const onSubmit = async (values: CommentFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Подготовка данных комментария
      const commentData = {
        content: values.content,
        author_name: values.author_name,
        author_email: values.author_email || undefined,
        blog_id: blogId,
        parent_id: parentId || null,
        is_approved: false // требует модерации
      };
      
      // Отправка комментария в базу данных
      const { error } = await db
        .from('comments')
        .insert(commentData);
      
      if (error) throw error;
      
      toast.success(
        "Комментарий отправлен на модерацию", 
        { description: "Он будет опубликован после проверки модератором" }
      );
      form.reset();
      onSubmitSuccess();
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast.error("Произошла ошибка при отправке комментария");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="author_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Имя *</FormLabel>
                <FormControl>
                  <Input placeholder="Ваше имя" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="author_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Ваш email (необязательно)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Комментарий *</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Текст комментария" 
                  rows={4} 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Отправка..." : "Отправить комментарий"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CommentForm;
