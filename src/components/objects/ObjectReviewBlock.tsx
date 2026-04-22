import { Star } from "lucide-react";
import { OurObjectReview } from "@/types/ourObjects";

interface ObjectReviewBlockProps {
  review: OurObjectReview;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export default function ObjectReviewBlock({ review }: ObjectReviewBlockProps) {
  const { author_name, author_title, author_image, rating, title, content } = review;
  const initials = getInitials(author_name);
  const stars = Math.min(5, Math.max(1, Math.round(rating ?? 5)));

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-8 md:p-10 shadow-sm">
      {rating != null && (
        <div className="flex items-center gap-1 mb-6" aria-label={`Рейтинг: ${stars} из 5`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={18}
              className={i < stars ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}
            />
          ))}
        </div>
      )}

      {title && (
        <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-3">{title}</h3>
      )}

      {content && (
        <p className="text-gray-600 leading-relaxed mb-8">{content}</p>
      )}

      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
          {author_image ? (
            <img src={author_image} alt={author_name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-primary font-bold text-sm">{initials}</span>
          )}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{author_name}</p>
          {author_title && (
            <p className="text-gray-400 text-xs mt-0.5">{author_title}</p>
          )}
        </div>
      </div>
    </div>
  );
}
