import Spinner from './Spinner';

interface Props {
  message?: string;
}

export default function FullPageLoader({ message = 'Loading System...' }: Props) {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[200] animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-12">
        <div className="relative">
          <Spinner size={64} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-4">
          <h2 className="text-[11px] font-bold text-primary uppercase tracking-[0.5em] italic animate-pulse">
            {message}
          </h2>
          <div className="flex items-center gap-4 opacity-20">
            <div className="h-px w-8 bg-black" />
            <span className="text-[8px] font-bold uppercase tracking-widest">Inventory v1.0</span>
            <div className="h-px w-8 bg-black" />
          </div>
        </div>
      </div>
    </div>
  );
}
