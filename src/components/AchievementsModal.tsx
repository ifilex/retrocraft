import React, { useState } from 'react';
import {
  ArrowLeft,
  Trophy,
  Sparkles,
  Lock,
  CheckCircle2,
  Palette,
  Flame,
  Zap,
  Footprints,
  Hammer,
  Code,
  Heart,
  ShieldCheck
} from 'lucide-react';
import { Achievement, GameSettings, SkinOption, TrailOption } from '../types/game';
import { SKINS_LIST, TRAILS_LIST } from '../data/achievements';
import { getTranslation } from '../i18n/translations';
import { soundEngine } from '../audio/soundEngine';

interface AchievementsModalProps {
  settings: GameSettings;
  achievements: Achievement[];
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onBack: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Footprints: <Footprints className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
  Zap: <Zap className="w-5 h-5" />,
  Hammer: <Hammer className="w-5 h-5" />,
  Code: <Code className="w-5 h-5" />,
  Heart: <Heart className="w-5 h-5" />,
  ShieldCheck: <ShieldCheck className="w-5 h-5" />,
  Trophy: <Trophy className="w-5 h-5" />
};

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  settings,
  achievements,
  onUpdateSettings,
  onBack
}) => {
  const t = getTranslation(settings.language);
  const [activeTab, setActiveTab] = useState<'achievements' | 'skins' | 'trails'>('achievements');

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 flex flex-col items-center select-none">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <button
            id="btn-achievements-back"
            onClick={() => {
              soundEngine.playClick();
              onBack();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition active:scale-95 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.saveAndBack}</span>
          </button>

          <div className="text-right">
            <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">
              {t.achievements} & {t.customizeSkin}
            </h1>
            <p className="text-slate-400 text-xs">
              {unlockedCount} / {achievements.length} {t.unlocked}
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              activeTab === 'achievements'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Trophy className="w-4 h-4" />
            {t.achievements} ({unlockedCount}/{achievements.length})
          </button>

          <button
            onClick={() => setActiveTab('skins')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              activeTab === 'skins'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Palette className="w-4 h-4" />
            {t.skins}
          </button>

          <button
            onClick={() => setActiveTab('trails')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              activeTab === 'trails'
                ? 'bg-purple-500 text-slate-950 shadow-lg shadow-purple-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Flame className="w-4 h-4" />
            {t.trails}
          </button>
        </div>

        {/* TAB: Achievements */}
        {activeTab === 'achievements' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((ach) => {
              const title = settings.language === 'es' ? ach.titleEs : ach.titleEn;
              const desc = settings.language === 'es' ? ach.descEs : ach.descEn;
              const percent = Math.round((ach.progress / ach.maxProgress) * 100);

              return (
                <div
                  key={ach.id}
                  className={`p-4 md:p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                    ach.unlocked
                      ? 'bg-slate-900/90 border-amber-500/40 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-900/40 border-slate-800/80 opacity-75'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      ach.unlocked
                        ? 'bg-amber-400 text-slate-950 shadow-lg shadow-yellow-500/30'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {ICON_MAP[ach.icon] || <Trophy className="w-5 h-5" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-white text-sm">{title}</h4>
                      {ach.unlocked && (
                        <span className="text-[11px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {t.unlocked}
                        </span>
                      )}
                    </div>

                    <p className="text-slate-400 text-xs leading-relaxed mb-3">{desc}</p>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all duration-500 ${
                          ach.unlocked ? 'bg-amber-400' : 'bg-cyan-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB: Skins */}
        {activeTab === 'skins' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {SKINS_LIST.map((skin) => {
              const name = settings.language === 'es' ? skin.nameEs : skin.nameEn;
              const isSelected = settings.selectedSkin === skin.id;

              return (
                <div
                  key={skin.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500 shadow-lg shadow-cyan-500/20'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-full shadow-inner border-2 border-white/20"
                      style={{ backgroundColor: skin.color }}
                    />
                    <div>
                      <h4 className="font-bold text-white text-sm">{name}</h4>
                      <span className="text-[11px] text-slate-400">
                        {skin.unlocked ? t.unlocked : `${t.locked} ${skin.unlockRequirement}`}
                      </span>
                    </div>
                  </div>

                  <button
                    disabled={!skin.unlocked}
                    onClick={() => {
                      soundEngine.playClick();
                      onUpdateSettings({ selectedSkin: skin.id });
                    }}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition active:scale-95 ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950'
                        : skin.unlocked
                        ? 'bg-slate-800 hover:bg-slate-700 text-white'
                        : 'bg-slate-950 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    {isSelected ? 'Equipped ✓' : skin.unlocked ? 'Equip' : 'Locked'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB: Trails */}
        {activeTab === 'trails' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
            {TRAILS_LIST.map((trail) => {
              const name = settings.language === 'es' ? trail.nameEs : trail.nameEn;
              const isSelected = settings.selectedTrail === trail.id;

              return (
                <div
                  key={trail.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-purple-500 shadow-lg shadow-purple-500/20'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl shadow-lg border border-white/20 flex items-center justify-center"
                      style={{ backgroundColor: trail.color }}
                    >
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{name}</h4>
                      <span className="text-[11px] text-slate-400">
                        {trail.unlocked ? t.unlocked : `${t.locked} ${trail.unlockRequirement}`}
                      </span>
                    </div>
                  </div>

                  <button
                    disabled={!trail.unlocked}
                    onClick={() => {
                      soundEngine.playClick();
                      onUpdateSettings({ selectedTrail: trail.id });
                    }}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition active:scale-95 ${
                      isSelected
                        ? 'bg-purple-500 text-white'
                        : trail.unlocked
                        ? 'bg-slate-800 hover:bg-slate-700 text-white'
                        : 'bg-slate-950 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    {isSelected ? 'Equipped ✓' : trail.unlocked ? 'Equip' : 'Locked'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
