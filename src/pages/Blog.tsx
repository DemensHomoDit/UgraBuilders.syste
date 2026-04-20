
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight } from 'lucide-react';
import { BlogPost } from '@/services/blog/types';
import blogService from '@/services/blog';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Blog: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      setIsLoading(true);
      try {
        const posts = await blogService.getBlogPosts();
        // Фильтруем только опубликованные записи для публичного просмотра
        const publishedPosts = posts.filter(post => post.is_published);
        setBlogPosts(publishedPosts);
      } catch (error) {
        console.error("Error fetching blog posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

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
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-center">Наш блог</h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-center">
            Актуальные новости, полезные советы и интересные истории из мира строительства и архитектуры
          </p>
        </header>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : blogPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden flex flex-col h-full">
                {post.cover_image && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={post.cover_image} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                    />
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(post.created_at)}
                    
                    {post.categories && (
                      <span className="ml-auto bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                        {post.categories.name}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold line-clamp-2 text-left">{post.title}</h2>
                </CardHeader>
                
                <CardContent className="flex-grow">
                  {post.summary && (
                    <p className="text-gray-600 line-clamp-3 text-left">{post.summary}</p>
                  )}
                </CardContent>
                
                <CardFooter>
                  <Button asChild className="w-full" variant="outline">
                    <Link to={`/blog/${post.id}`}>
                      Читать далее
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h2 className="text-2xl font-bold mb-2">Записей пока нет</h2>
            <p className="text-gray-600 mb-4">Скоро здесь появятся интересные статьи и новости</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Blog;
