import Spinner from './Spinner';

interface Props {
  message?: string;
}

export default function LoadingOverlay({ message = 'Processing...' }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="bg-gray-900 border border-gray-700 rounded-xl px-8 py-6 flex flex-col items-center gap-3 shadow-2xl">
        <Spinner size={32} />
        <p className="text-sm text-gray-300">{message}</p>
      </div>
    </div>
  );
}
