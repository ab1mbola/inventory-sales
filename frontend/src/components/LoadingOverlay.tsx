import Spinner from './Spinner';

interface Props {
  message?: string;
}

export default function LoadingOverlay({ message = 'Processing...' }: Props) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="bg-white border border-slate-200 rounded-3xl px-10 py-8 flex flex-col items-center gap-4 shadow-2xl">
        <Spinner size={40} />
        <p className="text-sm font-black text-slate-900 uppercase tracking-widest">{message}</p>
      </div>
    </div>
  );
}
