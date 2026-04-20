import React from "react";
import { Star } from "lucide-react";

interface ReviewRatingProps {
  rating: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

const ReviewRating: React.FC<ReviewRatingProps> = ({
  rating,
  interactive = false,
  onChange,
  size = "sm",
}) => {
  const iconClass = sizeMap[size] || sizeMap.sm;

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${iconClass} ${
            star <= rating
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-300"
          } ${interactive ? "cursor-pointer hover:text-yellow-300 transition-colors" : ""}`}
          onClick={interactive && onChange ? () => onChange(star) : undefined}
        />
      ))}
      <span className="ml-2 text-sm text-muted-foreground">{rating}/5</span>
    </div>
  );
};

export default ReviewRating;