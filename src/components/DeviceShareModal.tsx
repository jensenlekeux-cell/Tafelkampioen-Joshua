import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Copy,
  CheckCheck,
  Share2,
  X,
  ExternalLink,
  QrCode,
  Sparkles,
} from 'lucide-react';

interface DeviceShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeviceShareModal: React.FC<DeviceShareModalProps> = ({ isOpen, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // In production / preview, use the shared or current URL
  const currentUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://ais-pre-vfwvviqacnq2izzayhctkr-970198415194.europe-west2.run.app';

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(currentUrl, {
        width: 240,
        margin: 2,
        color: {
          dark: '#1e293b',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Failed to generate QR code', err));
    }
  }, [isOpen, currentUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'TafelKampioen - Tafels Oefenen & Leren',
          text: 'Oefen de tafels van vermenigvuldiging (1-10) op elk apparaat!',
          url: currentUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                Openen op elk apparaat
              </h2>
              <p className="text-xs text-slate-500">
                Direct spelen in de browser · Geen app download nodig
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="overflow-y-auto py-4 space-y-4">
          {/* QR Code and Instant Scan */}
          <div className="p-4 rounded-2xl bg-linear-to-b from-amber-50/70 to-slate-50 border border-amber-200/80 text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block mb-1">
              Scan met je camera (Telefoon of Tablet)
            </span>
            <p className="text-xs text-slate-600 mb-3">
              Richt de camera van je smartphone of iPad op deze QR-code om de website meteen te openen:
            </p>

            <div className="inline-block p-3 bg-white rounded-2xl shadow-sm border border-slate-200">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR code om website direct te openen"
                  className="w-44 h-44 sm:w-48 sm:h-48 mx-auto"
                />
              ) : (
                <div className="w-44 h-44 bg-slate-100 rounded-xl flex items-center justify-center text-xs text-slate-400">
                  QR-code laden...
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center justify-center gap-3 text-[11px] text-slate-600 font-medium">
              <span>✓ iPhone & iPad</span>
              <span>·</span>
              <span>✓ Android</span>
              <span>·</span>
              <span>✓ Digibord</span>
            </div>
          </div>

          {/* Copy Link Section */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Directe Website Link:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 truncate select-all"
              />
              <button
                onClick={handleCopy}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl flex items-center gap-1.5 transition-colors text-xs shrink-0"
              >
                {copied ? (
                  <>
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Gekopieerd!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Kopiëren</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Device Capabilities Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
              <Smartphone className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
              <strong className="block text-xs text-slate-800">Telefoon</strong>
              <span className="text-[10px] text-slate-500">Grote touch-knoppen</span>
            </div>
            <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
              <Tablet className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <strong className="block text-xs text-slate-800">Tablet / iPad</strong>
              <span className="text-[10px] text-slate-500">Perfect voor de klas</span>
            </div>
            <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
              <Laptop className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <strong className="block text-xs text-slate-800">Laptop</strong>
              <span className="text-[10px] text-slate-500">Met toetsenbord</span>
            </div>
            <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
              <Monitor className="w-5 h-5 text-amber-600 mx-auto mb-1" />
              <strong className="block text-xs text-slate-800">Digibord</strong>
              <span className="text-[10px] text-slate-500">Klassikaal oefenen</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={handleNativeShare}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-600" />
            <span>Delen via app</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
};
