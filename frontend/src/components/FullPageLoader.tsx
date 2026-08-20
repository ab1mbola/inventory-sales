import { motion } from 'framer-motion';

interface Props {
  message?: string;
}

export default function FullPageLoader({ message = 'Initializing Terminal...' }: Props) {
  return (
    <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center">
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Outer Ring */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-t-2 border-accent rounded-full"
        />
        {/* Inner Ring */}
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-4 border-b-2 border-primary rounded-full opacity-30"
        />
        {/* Center Logo/Icon */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
          className="font-sans text-2xl font-black"
        >
          M
        </motion.div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-center"
      >
        <h2 className="text-[10px] font-bold uppercase tracking-[0.5em] text-primary animate-pulse">
          {message}
        </h2>
        <div className="mt-4 flex justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              className="w-1 h-1 bg-accent rounded-full"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}


