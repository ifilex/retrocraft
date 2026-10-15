import React, { useState } from 'react';
import {
  ArrowLeft,
  Heart,
  Play,
  Share2,
  Trophy,
  Sparkles,
  Flame,
  Clock,
  Star,
  User,
  Plus,
  Copy,
  Check,
  Filter
} from 'lucide-react';
import { LevelData, LeaderboardEntry, GameSettings } from '../types/game';
import { getTranslation } from '../i18n/translations';
import { soundEngine } from '../audio/soundEngine';

interface CommunityHubProps {
  settings: GameSettings;
  communityLevels: LevelData[];
  customLevels: LevelData[];
  leaderboard: LeaderboardEntry[];
  onPlayLevel: (level: LevelData) => void;
  onEditLevel: (level: LevelData) => void;
  onVoteLevel: (levelId: string) => void;
  onCreateNew: () => void;
  onBack: () => void;
}

export const CommunityHub: React.FC<CommunityHubProps> = ({
  settings,
  communityLevels,
  customLevels,
  leaderboard,
  onPlayLevel,
  onEditLevel,
  onVoteLevel,
  onCreateNew,
  onBack
}) => {
  const t = getTranslation(settings.language);
  const [activeTab, setActiveTab] = useState<'featured' | 'trending' | 'top' | 'mylevels' | 'leaderboard'>('featured');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getFilteredLevels = () => {
    if (activeTab === 'mylevels') return customLevels;
    if (activeTab === 'trending') return [...communityLevels].sort((a, b) => (b.plays || 0) - (a.plays || 0));
    if (activeTab === 'top') return [...communityLevels].sort((a, b) => (b.likes || 0) - (a.likes || 0));
    return communityLevels;
  };

  const handleCopyShareCode = (level: LevelData) => {
    soundEngine.playClick();
    const shareCode = btoa(unescape(encodeURIComponent(JSON.stringify(level))));
    navigator.clipboard.writeText(shareCode);
    setCopiedId(level.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 flex flex-col items-center select-none">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <button
            id="btn-community-back"
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
            <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
              {t.communityTitle}
            </h1>
            <p className="text-slate-400 text-xs">Cloud Level Sharing, Upvoting & Global Records</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setActiveTab('featured')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === 'featured'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              {t.featured}
            </button>

            <button
              onClick={() => setActiveTab('trending')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === 'trending'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Flame className="w-4 h-4" />
              {t.trending}
            </button>

            <button
              onClick={() => setActiveTab('top')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === 'top'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Star className="w-4 h-4" />
              {t.topRated}
            </button>

            <button
              onClick={() => setActiveTab('mylevels')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === 'mylevels'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <User className="w-4 h-4" />
              {t.myLevels} ({customLevels.length})
            </button>

            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === 'leaderboard'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Trophy className="w-4 h-4" />
              {t.leaderboard}
            </button>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onCreateNew();
            }}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition active:scale-95 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>{t.newLevel}</span>
          </button>
        </div>

        {/* TAB: Leaderboard */}
        {activeTab === 'leaderboard' ? (
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 md:p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>{t.leaderboard}</span>
            </h3>

            <div className="divide-y divide-slate-800">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.id}
                  className="py-3.5 flex items-center justify-between hover:bg-slate-800/40 px-3 rounded-xl transition"
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${
                        index === 0
                          ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/30'
                          : index === 1
                          ? 'bg-slate-300 text-slate-950'
                          : index === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {index + 1}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-lg">{entry.avatar}</span>
                      <div>
                        <span className="text-white font-bold text-sm block">{entry.playerName}</span>
                        <span className="text-slate-500 text-xs">{entry.levelTitle}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-right font-mono">
                    <div>
                      <span className="text-emerald-400 font-bold text-sm block">{entry.time.toFixed(2)}s</span>
                      <span className="text-slate-500 text-[11px]">{entry.date}</span>
                    </div>

                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span className="text-xs font-bold">{entry.stars}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* TAB: Level Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getFilteredLevels().map((level) => (
              <div
                key={level.id}
                className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-950/80 px-2.5 py-0.5 rounded border border-slate-800 uppercase">
                      {level.theme}
                    </span>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{level.parTime || 30}s</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1 leading-snug">{level.title}</h3>
                  <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed mb-4">
                    {level.description}
                  </p>
                </div>

                <div>
                  {/* Creator and Votes */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 mb-3 text-xs">
                    <span className="text-slate-400">
                      {t.levelBy} <strong className="text-slate-200">{level.author || 'Anonymous'}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          soundEngine.playClick();
                          onVoteLevel(level.id);
                        }}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition active:scale-90 ${
                          level.userVoted === 'like'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            level.userVoted === 'like' ? 'fill-rose-400 text-rose-400' : ''
                          }`}
                        />
                        <span>{level.likes || 0}</span>
                      </button>

                      <button
                        onClick={() => handleCopyShareCode(level)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition"
                        title="Copy Share Code"
                      >
                        {copiedId === level.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        onPlayLevel(level);
                      }}
                      className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-slate-950" />
                      <span>{t.playMap}</span>
                    </button>

                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        onEditLevel(level);
                      }}
                      className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition active:scale-95"
                    >
                      {t.editor}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
