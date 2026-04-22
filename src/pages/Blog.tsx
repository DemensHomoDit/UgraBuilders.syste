import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowUpRight } from 'lucide-react';
import { BlogPost } from '@/services/blog/types';
import blogService from '@/services/blog';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const all = await blogService.getBlogPosts();
        setPosts(all.filter(p => p.is_published));
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    };
    fetch();
  }, []);

  const formatDate = (d?: string | null) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-20 pb-16 md:pt-28 md:pb-20">
        <div className="max-w-[1320px] mx-auto px-5 md:px-8">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="label-tag mb-5">Блог</p>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight max-w-2xl leading-[1.08] mb-4">
              Статьи и новости
            </h1>
            <p className="text-lg text-gray-500 max-w-xl leading-relaxed">
              Актуальные новости, полезные советы и интересные истории из мира строительства и архитектуры
            </p>
          </motion.div>
        </div>
      </section>

      {/* Посты */}
      <section className="pb-20 md:pb-28">
        <div className="max-w-[1320px] mx-auto px-5 md:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-3xl h-72 animate-pulse" />
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {posts.map((post, i) => (
                <motion.div key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                >
                  <Link to={`/blog/${post.id}`} className="group block bg-white border border-gray-100/80 rounded-3xl overflow-hidden hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)] transition-all duration-300 h-full">
                    {/* Фото */}
                    {post.cover_image && (
                      <div className="h-52 overflow-hidden bg-gray-100">
                        <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                      </div>
                    )}

                    <div className="p-7">
                      {/* Мета */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Calendar size={12} />
                          {formatDate(post.created_at)}
                        </div>
                        {post.categories && (
                          <span className="bg-primary/8 text-primary text-xs font-medium px-2.5 py-1 rounded-full">
                            {post.categories.name}
                          </span>
                        )}
                      </div>

                      <h2 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary transition-colors tracking-tight">{post.title}</h2>

                      {post.summary && (
                        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-5">{post.summary}</p>
                      )}

                      <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                        Читать далее <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-3xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Статей пока нет</h2>
              <p className="text-gray-500">Скоро здесь появятся интересные материалы</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Blog;
