
import { motion } from "framer-motion";

const LoadingSpinner = () => {
  return (
    <motion.div 
      className="text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative w-12 h-12 mx-auto">
        <motion.div 
          className="absolute top-0 left-0 w-full h-full rounded-full border-t-2 border-b-2 border-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute top-0 left-0 w-full h-full rounded-full border-r-2 border-l-2 border-primary/30"
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <p className="mt-4 text-muted-foreground">Загрузка...</p>
    </motion.div>
  );
};

export default LoadingSpinner;
