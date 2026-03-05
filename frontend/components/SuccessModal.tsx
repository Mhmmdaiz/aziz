"use client";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export default function SuccessModal({
  isOpen,
  onClose,
  message,
}: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Background Gelap Transparan (Blur) */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      ></div>

      {/* Box Modal */}
      <div className="relative bg-white rounded-[3rem] p-12 max-w-sm w-full shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-100 transform transition-all animate-in fade-in zoom-in duration-300">
        <div className="flex flex-col items-center text-center">
          {/* Icon Ceklis Luxury */}
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-8">
            <svg
              className="w-12 h-12 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>

          <h3 className="text-3xl font-extrabold tracking-tighter mb-3">
            Confirmed!
          </h3>
          <p className="text-gray-500 mb-10 font-medium text-lg leading-relaxed">
            {message}
          </p>

          <button
            onClick={onClose}
            className="w-full bg-black text-white py-5 rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl active:scale-95 uppercase tracking-widest text-xs"
          >
            Close Notification
          </button>
        </div>
      </div>
    </div>
  );
}
