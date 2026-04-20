
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { BlogPost } from '@/services/blog/types';
import blogService from '@/services/blog';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CommentsList from '@/components/blog/CommentsList';

const BlogPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBlogPost = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const post = await blogService.getBlogPost(id);
        if (post) {
          setBlogPost(post);
        } else {
          toast({
            title: "Запись не найдена",
            description: "Запрашиваемая запись блога не существует или была удалена",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching blog post:", error);
        toast({
          title: "Ошибка загрузки",
          description: "Не удалось загрузить запись блога",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogPost();
  }, [id, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!blogPost) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold mb-4">Запись не найдена</h1>
            <p className="mb-6">Запрашиваемая запись блога не существует или была удалена.</p>
            <Button asChild>
              <Link to="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Вернуться к блогу
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Форматирование даты
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container max-w-4xl mx-auto px-4 py-8">
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Вернуться к блогу
          </Link>
        </Button>
        
        <article>
          {blogPost.cover_image && (
            <img 
              src={blogPost.cover_image} 
              alt={blogPost.title} 
              className="w-full h-64 md:h-96 object-cover rounded-lg mb-6"
            />
          )}
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{blogPost.title}</h1>
          
          <div className="flex flex-wrap items-center text-gray-500 mb-6 gap-4">
            {blogPost.categories && (
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                {blogPost.categories.name}
              </span>
            )}
            
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(blogPost.created_at)}
            </span>
          </div>
          
          {blogPost.summary && (
            <div className="text-lg font-medium text-gray-700 mb-6 border-l-4 border-primary pl-4 py-2 bg-gray-50">
              {blogPost.summary}
            </div>
          )}
          
          <div className="prose max-w-none">
            {blogPost.content && (
              <div dangerouslySetInnerHTML={{ __html: blogPost.content.replace(/\n/g, '<br />') }} />
            )}
          </div>
          
          {blogPost.tags && blogPost.tags.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-2">Теги:</h3>
              <div className="flex flex-wrap gap-2">
                {blogPost.tags.map((tag, index) => (
                  <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Секция комментариев */}
          {id && <CommentsList blogId={id} />}
        </article>
      </main>
      
      <Footer />
    </div>
  );
};

export default BlogPostPage;
