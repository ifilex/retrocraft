import React from 'react';
import {
  ArrowLeft,
  Play,
  Sparkles,
  Timer,
  Trophy,
  Lock,
  Layers,
  ChevronRight
} from 'lucide-react';
import { CAMPAIGN_LEVELS } from '../data/campaignLevels';
import { LevelData, GameSettings, LevelRecord } from '../types/game';
import { getTranslation } from '../i18n/translations';
import { soundEngine } from '../audio/soundEngine';

interface LevelSelectProps {
  settings: GameSettings;
  records: Record<string, LevelRecord>;
  onSelectLevel: (level: LevelData) => void;
  onBack: () => void;
}

export const LevelSelect: React.FC<LevelSelectProps> = ({
  settings,
  records,
  onSelectLevel,
  onBack
}) => {
  const t = getTranslation(settings.language);

  const getThemeGradient = (theme: string) => {
    if (theme === 'cyber') return 'from-blue-600/30 to-indigo-900/40 border-blue-500/40';
    if (theme === 'crystal') return 'from-purple-600/30 to-fuchsia-900/40 border-purple-500/40';
    if (theme === 'inferno') return 'from-red-600/30 to-amber-900/40 border-red-500/40';
    if (theme === 'cosmic') return 'from-violet-600/30 to-slate-900/40 border-violet-500/40';
    return 'from-cyan-600/30 to-blue-900/40 border-cyan-500/40';
  };

  const getThemeBadge = (theme: string) => {
    if (theme === 'cyber') return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    if (theme === 'crystal') return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    if (theme === 'inferno') return 'bg-red-500/20 text-red-300 border-red-500/30';
    if (theme === 'cosmic') return 'bg-violet-500/20 text-violet-300 border-violet-500/30';
    return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 flex flex-col items-center select-none">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
          <button
            id="btn-levelselect-back"
            onClick={() => {
              soundEngine.playClick();
              onBack();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.saveAndBack}</span>
          </button>

          <div className="text-right">
            <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              {t.play}
            </h1>
            <p className="text-slate-400 text-xs md:text-sm">5 Worlds of 3D Physics Platforming</p>
          </div>
        </div>

        {/* Level Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {CAMPAIGN_LEVELS.map((level, idx) => {
            const record = records[level.id];
            const isCompleted = !!record?.completed;
            const stars = record?.stars || 0;
            const bestTime = record?.bestTime;

            return (
              <div
                key={level.id}
                className={`relative group bg-slate-900/80 rounded-2xl p-5 md:p-6 border transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between shadow-xl ${getThemeGradient(
                  level.theme
                )}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-slate-400 bg-slate-950/60 px-3 py-1 rounded-lg border border-slate-800">
                      WORLD 0{idx + 1}
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getThemeBadge(level.theme)}`}>
                      {level.theme}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {level.title}
                  </h3>
                  <p className="text-slate-400 text-xs md:text-sm leading-relaxed mb-4">
                    {level.description}
                  </p>
                </div>

                <div>
                  {/* Stats & Stars */}
                  <div className="flex items-center justify-between bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 mb-4">
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3].map(s => (
                        <Sparkles
                          key={s}
                          className={`w-4 h-4 ${
                            s <= stars
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                      {bestTime ? (
                        <div className="flex items-center gap-1 text-emerald-400">
                          <Trophy className="w-3.5 h-3.5" />
                          <span>{bestTime.toFixed(2)}s</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Timer className="w-3.5 h-3.5" />
                          <span>Par: {level.parTime}s</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Play Button */}
                  <button
                    id={`btn-play-level-${level.id}`}
                    onClick={() => {
                      soundEngine.playClick();
                      onSelectLevel(level);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl transition flex items-center justify-center gap-2 shadow-lg active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>{isCompleted ? t.restart : t.playMap}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
