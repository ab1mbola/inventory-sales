import React from 'react';
import { useDialogStore } from '../store/dialogStore';
import { AlertTriangle, HelpCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const GlobalDialog: React.FC = () => {
  const { isOpen, title, message, type, handleConfirm, handleCancel } = useDialogStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
          onClick={handleCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="tag-card bg-white w-full max-w-sm p-8 shadow-3xl flex flex-col items-center text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Icon */}
            <div className="flex items-center justify-center">
              {type === 'success' && (
                <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center text-success">
                  <CheckCircle2 size={32} />
                </div>
              )}
              {type === 'confirm' && (
                <div className="w-16 h-16 rounded-2xl bg-info/10 flex items-center justify-center text-info">
                  <HelpCircle size={32} />
                </div>
              )}
              {type === 'alert' && (
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                  <AlertTriangle size={32} />
                </div>
              )}
            </div>

            {/* Title */}
            <h2 className="text-xl font-sans font-black tracking-tight text-primary mt-6">
              {title}
            </h2>

            {/* Message */}
            <p className="text-[10px] font-bold text-muted uppercase tracking-[0.1em] mt-3 leading-relaxed max-w-[280px]">
              {message}
            </p>

            {/* Buttons */}
            <div className="flex gap-4 w-full mt-8">
              {type === 'confirm' && (
                <button
                  onClick={handleCancel}
                  className="flex-1 h-12 border border-border rounded-full text-muted hover:bg-surface hover:text-primary text-[9px] font-bold uppercase tracking-[0.2em] transition-all cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleConfirm}
                autoFocus
                className={`flex-1 h-12 rounded-full text-white text-[9px] font-bold uppercase tracking-[0.2em] transition-all cursor-pointer flex items-center justify-center ${
                  type === 'success' ? 'bg-success hover:bg-success/90 shadow-md shadow-success/10' :
                  type === 'confirm' ? 'bg-primary hover:bg-accent shadow-md shadow-primary/10' :
                  'bg-accent hover:bg-accent/90 shadow-md shadow-accent/10'
                }`}
              >
                {type === 'confirm' ? 'Confirm' : 'OK'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
