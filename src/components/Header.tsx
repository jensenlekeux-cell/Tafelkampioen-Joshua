import React from 'react';
import { GameMode } from '../types/game';
import { Volume2, VolumeX, Award, Trophy, QrCode } from 'lucide-react';
import { calculateLevel } from '../utils/storage';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  points: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenAchievements: () => void;
  onOpenDeviceShare: () => void;
  unlockedCount: number;
  totalAchievements: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  points,
  soundEnabled,
  onToggleSound,
  onOpenAchievements,
  onOpenDeviceShare,
  unlockedCount,
  totalAchievements,
}) => {
  const levelInfo = calculateLevel(points);

  const navItems: Array<{ id: GameMode; label: string }> = [
    { id: 'oefenen', label: 'Oefenen' },
    { id: 'tijdrit', label: 'Tijdrit (60s)' },
    { id: 'overleven', label: 'Overleven' },
    { id: 'memory', label: 'Memory' },
    { id: 'diploma', label: 'Diploma' },
    { id: 'rooster', label: 'Tafelrooster' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Wordmark */}
        <button
          onClick={() => onSelectMode('oefenen')}
          className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 group focus:outline-hidden"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white font-black text-xl flex items-center justify-center shadow-xs group-hover:bg-amber-600 transition-colors">
            ×
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-amber-600 transition-colors">
              TafelKampioen
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 overflow-x-auto py-1">
          {navItems.map((item) => {
            const isActive = currentMode === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectMode(item.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Points, Sound, and Achievements */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Points & Level indicator */}
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200/80 rounded-xl px-3 py-1.5 shadow-2xs">
            <Trophy className="w-4 h-4 text-amber-600" />
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-amber-950 font-mono tabular-nums leading-none">
                {points} ptn
              </span>
              <span className="text-[10px] text-amber-700 font-medium leading-none mt-0.5">
                Niveau {levelInfo.level} · {levelInfo.title}
              </span>
            </div>
          </div>

          {/* Prestaties modal button */}
          <button
            onClick={onOpenAchievements}
            title="Bekijk prestaties en medailles"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Award className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline font-mono tabular-nums text-indigo-950">
              {unlockedCount}/{totalAchievements}
            </span>
          </button>

          {/* Device / QR share button */}
          <button
            onClick={onOpenDeviceShare}
            title="Open op elk apparaat via QR-code of web-link"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap shrink-0"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Alle Apparaten</span>
          </button>

          {/* PWA / APK Install Button */}
          <PWAInstallButton />

          {/* Sound toggle button */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Geluid dempen' : 'Geluid inschakelen'}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
            aria-label={soundEnabled ? 'Geluid aan' : 'Geluid uit'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile subnav */}
      <div className="md:hidden flex items-center gap-1 px-4 py-2 border-t border-slate-100 overflow-x-auto bg-slate-50">
        {navItems.map((item) => {
          const isActive = currentMode === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectMode(item.id)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
