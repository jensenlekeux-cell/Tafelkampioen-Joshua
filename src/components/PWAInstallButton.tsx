import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  Download,
  Smartphone,
  Check,
  X,
  ExternalLink,
  Copy,
  CheckCheck,
  Share2,
  Sparkles,
} from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const sharedUrl = window.location.origin;

  const handleCopy = () => {
    navigator.clipboard.writeText(sharedUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrimaryInstall = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) return;
    }
    // If deferredPrompt is not active yet (e.g. on desktop or iOS), open guide modal
    setShowModal(true);
  };

  return (
    <>
      <button
        onClick={handlePrimaryInstall}
        title="Installeer TafelKampioen als app op je telefoon of computer"
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-2xs shrink-0 active:scale-95 whitespace-nowrap"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">
          {isInstalled ? 'Geïnstalleerd' : 'App Installeren (APK/PWA)'}
        </span>
        <span className="sm:hidden">App</span>
      </button>

      {/* Installation & Testing Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    TafelKampioen Testen op je Telefoon
                  </h3>
                  <p className="text-xs text-slate-500">
                    Installeer direct als Android WebAPK of download een APK
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content options */}
            <div className="space-y-4 text-xs text-slate-700">
              {/* Option 1: Direct Android Install (WebAPK) */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-[10px]">
                    1
                  </span>
                  <strong className="text-sm font-bold text-slate-900">
                    Direct installeren op Android (Aanbevolen)
                  </strong>
                </div>
                <p className="text-slate-600 mb-2 leading-relaxed">
                  Open deze app op je Android-telefoon in Chrome. Tik op het menu (drie puntjes) rechtsboven en kies <strong>&apos;App installeren&apos;</strong> of <strong>&apos;Toevoegen aan startscherm&apos;</strong>. Android maakt automatisch een echte, veilige <strong>WebAPK</strong> met eigen app-icoon en offline ondersteuning!
                </p>

                {isInstallable && (
                  <button
                    onClick={async () => {
                      await install();
                      setShowModal(false);
                    }}
                    className="w-full mt-2 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Nu Installeren op dit apparaat</span>
                  </button>
                )}
              </div>

              {/* Option 2: Test link copy */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded-full bg-slate-700 text-white font-bold flex items-center justify-center text-[10px]">
                    2
                  </span>
                  <strong className="text-sm font-bold text-slate-900">
                    Link naar je telefoon sturen
                  </strong>
                </div>
                <p className="text-slate-600 mb-2">
                  Kopieer de URL om het direct op je telefoon te openen:
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={sharedUrl}
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-[11px] font-mono text-slate-700 truncate"
                  />
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Gekopieerd!' : 'Kopiëren'}</span>
                  </button>
                </div>
              </div>

              {/* Option 3: APK Package via PWABuilder */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">
                    3
                  </span>
                  <strong className="text-sm font-bold text-slate-900">
                    Zelfstandig .APK bestand genereren
                  </strong>
                </div>
                <p className="text-slate-600 leading-relaxed mb-2">
                  Wil je een los <code>.apk</code> bestand downloaden voor sideloading of distributie in de Google Play Store? Gebruik de officiële gratis Microsoft PWABuilder:
                </p>
                <a
                  href={`https://www.pwabuilder.com?url=${encodeURIComponent(sharedUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-bold hover:underline"
                >
                  <span>Open PWABuilder voor deze app</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs transition-colors"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
