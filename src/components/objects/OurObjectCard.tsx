import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, MapPin } from "lucide-react";
import { OurObject } from "@/types/ourObjects";

interface OurObjectCardProps {
  object: OurObject;
  index?: number;
}

export default function OurObjectCard({ object, index = 0 }: OurObjectCardProps) {
  const { id, title, excerpt, city, cover_image } = object;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to={`/objects/${id}`} className="group block">
        {/* Image */}
        <div className="relative overflow-hidden rounded-3xl aspect-[4/3] mb-5 bg-gray-100">
          {cover_image ? (
            <img
              src={cover_image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm font-medium">Нет фото</span>
            </div>
          )}

          {/* Dark overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

          {/* City badge */}
          {city && (
            <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-md text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
              <MapPin size={11} className="text-primary/70" />
              {city}
            </div>
          )}

          {/* Arrow button on hover */}
          <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0 shadow-sm">
            <ArrowUpRight size={16} className="text-gray-800" />
          </div>
        </div>

        {/* Text */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 tracking-tight mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          {excerpt && (
            <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
              {excerpt}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
