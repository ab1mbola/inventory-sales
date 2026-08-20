import Spinner from './Spinner';

interface Props {
  message?: string;
}

export default function LoadingOverlay({ message = 'Processing...' }: Props) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[150]">
      <div className="bg-white border border-border rounded-2xl p-10 flex flex-col items-center gap-8 shadow-[20px_20px_0px_0px_rgba(0,0,0,0.1)] animate-in zoom-in-95 duration-300">
        <Spinner size={48} />
        <div className="text-center space-y-2">
          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.4em] italic">{message}</p>
          <div className="h-px bg-accent/20 w-12 mx-auto" />
        </div>
      </div>
    </div>
  );
}


