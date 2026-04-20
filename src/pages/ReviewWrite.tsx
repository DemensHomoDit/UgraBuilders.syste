import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import reviewService from "@/services/review";
import { useNavigate } from "react-router-dom";

const ReviewWrite: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !title || !content) return;
    setIsSubmitting(true);
    try {
      await reviewService.createReview({
        author_name: name,
        author_email: email || undefined,
        title,
        content,
        rating,
        is_published: false,
      });
      alert("Спасибо! Ваш отзыв отправлен на модерацию.");
      navigate("/reviews");
    } catch (error) {
      console.error(error);
      alert("Не удалось отправить отзыв. Попробуйте позже.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-8 text-center">Оставить отзыв</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 font-medium">Ваше имя *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block mb-2 font-medium">Email (необязательно)</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block mb-2 font-medium">Заголовок отзыва *</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="block mb-2 font-medium">Текст отзыва *</label>
            <Textarea
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="rating" className="block mb-2 font-medium">Оценка *</label>
            <select
              id="rating"
              className="border border-input rounded-md h-10 px-3 w-full"
              value={rating}
              onChange={(e) => setRating(parseInt(e.target.value))}
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full bg-primary text-white hover:bg-primary/90">
            {isSubmitting ? "Отправка..." : "Отправить отзыв"}
          </Button>
        </form>
      </div>
      <Footer />
    </main>
  );
};

export default ReviewWrite; 