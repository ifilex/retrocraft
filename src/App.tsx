import React, { useState, useEffect, useRef } from 'react';
import {
  GameSettings,
  PlayerStats,
  LevelData,
  LevelRecord,
  Achievement,
  LeaderboardEntry
} from './types/game';
import { storage } from './data/storage';
import { CAMPAIGN_LEVELS } from './data/campaignLevels';
import { PlayCanvasGame } from './engine/PlayCanvasGame';
import { GameHUD } from './components/GameHUD';
import { MainMenu } from './components/MainMenu';
import { LevelSelect } from './components/LevelSelect';
import { LevelEditor } from './components/LevelEditor';
import { CommunityHub } from './components/CommunityHub';
import { AchievementsModal } from './components/AchievementsModal';
import { SettingsModal } from './components/SettingsModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { soundEngine } from './audio/soundEngine';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<
    'menu' | 'campaign_select' | 'playing' | 'editor' | 'community' | 'achievements' | 'settings' | 'howToPlay'
  >('menu');

  // Persistence State
  const [settings, setSettings] = useState<GameSettings>(() => storage.getSettings());
  const [stats, setStats] = useState<PlayerStats>(() => storage.getStats());
  const [records, setRecords] = useState<Record<string, LevelRecord>>(() => storage.getRecords());
  const [achievements, setAchievements] = useState<Achievement[]>(() => storage.getAchievements());
  const [customLevels, setCustomLevels] = useState<LevelData[]>(() => storage.getCustomLevels());
  const [communityLevels, setCommunityLevels] = useState<LevelData[]>(() => storage.getCommunityLevels());
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => storage.getLeaderboard());

  // Active Game State
  const [currentLevel, setCurrentLevel] = useState<LevelData | null>(null);
  const [editingLevel, setEditingLevel] = useState<LevelData | undefined>(undefined);
  const gameCanvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<PlayCanvasGame | null>(null);

  // In-Game Live HUD States
  const [gameTime, setGameTime] = useState(0);
  const [gemsCollected, setGemsCollected] = useState(0);
  const [totalGems, setTotalGems] = useState(0);
  const [speedBoostTimer, setSpeedBoostTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [checkpointMsg, setCheckpointMsg] = useState(false);
  const [achievementToast, setAchievementToast] = useState<Achievement | null>(null);

  // Initialize and persist settings
  const handleUpdateSettings = (newPartial: Partial<GameSettings>) => {
    const updated = { ...settings, ...newPartial };
    setSettings(updated);
    storage.saveSettings(updated);
    if (gameEngineRef.current && newPartial.quality) {
      gameEngineRef.current.setQuality(newPartial.quality);
    }
  };

  // Check achievements helper
  const triggerAchievement = (id: string, increment = 1) => {
    const res = storage.updateAchievement(id, increment);
    if (res) {
      setAchievements(storage.getAchievements());
      if (res.newlyUnlocked) {
        setAchievementToast(res.achievement);
        soundEngine.playVictory();
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.2 } });
        setTimeout(() => setAchievementToast(null), 4000);
      }
    }
  };

  // Launch Game Session
  const startGame = (level: LevelData) => {
    setCurrentLevel(level);
    setView('playing');
    setHasWon(false);
    setIsPaused(false);
    setGameTime(0);
    setGemsCollected(0);
    setSpeedBoostTimer(0);
  };

  // Initialize Game Canvas when in 'playing' view
  useEffect(() => {
    if (view !== 'playing' || !currentLevel || !gameCanvasRef.current) return;

    const game = new PlayCanvasGame(
      gameCanvasRef.current,
      currentLevel,
      settings,
      {
        onGemCollected: (c, tot) => {
          setGemsCollected(c);
          setTotalGems(tot);
          const updatedStats = { ...stats, totalGems: stats.totalGems + 1 };
          setStats(updatedStats);
          storage.saveStats(updatedStats);
          triggerAchievement('gem_collector_10', 1);
        },
        onStarCollected: () => {
          // bonus star
        },
        onSpeedBoost: (dur) => {
          setSpeedBoostTimer(dur);
        },
        onCheckpointReached: () => {
          setCheckpointMsg(true);
          setTimeout(() => setCheckpointMsg(false), 2200);
        },
        onPlayerDeath: () => {
          const updated = { ...stats, totalDeaths: stats.totalDeaths + 1 };
          setStats(updated);
          storage.saveStats(updated);
        },
        onLevelComplete: (time, gems, total) => {
          setHasWon(true);

          // Calculate Star Rating
          const par = currentLevel.parTime || 30;
          const stars = 1 + (time <= par ? 1 : 0) + (gems >= total && total > 0 ? 1 : 0);

          // Update Records
          const savedRec = storage.saveLevelRecord(currentLevel.id, {
            completed: true,
            bestTime: time,
            gemsCollected: gems,
            totalGems: total,
            stars
          });
          setRecords(storage.getRecords());

          // Update Stats
          const newCompletedCount = Object.keys(storage.getRecords()).length;
          const totalStars = Object.values(storage.getRecords()).reduce((acc, r) => acc + r.stars, 0);
          const updatedStats: PlayerStats = {
            ...stats,
            levelsCompleted: newCompletedCount,
            starsEarned: totalStars
          };
          setStats(updatedStats);
          storage.saveStats(updatedStats);

          // Add to local leaderboard
          storage.addLeaderboardEntry({
            playerName: 'Player 1',
            levelId: currentLevel.id,
            levelTitle: currentLevel.title,
            time,
            gems,
            stars,
            avatar: '⭐'
          });
          setLeaderboard(storage.getLeaderboard());

          // Check Achievements
          triggerAchievement('first_jump', 1);
          if (time <= par) triggerAchievement('speedrunner', 1);
          if (newCompletedCount >= 5) triggerAchievement('campaign_conqueror', 5);
        },
        onGamePaused: (p) => {
          setIsPaused(p);
        }
      }
    );

    gameEngineRef.current = game;

    // Time ticker
    const timerInterval = setInterval(() => {
      if (gameEngineRef.current) {
        setGameTime(gameEngineRef.current.getElapsedTime());
      }
    }, 50);

    return () => {
      clearInterval(timerInterval);
      game.destroy();
      gameEngineRef.current = null;
    };
  }, [view, currentLevel]);

  // Handle Next Level
  const handleNextLevel = () => {
    if (!currentLevel) return;
    const currentIndex = CAMPAIGN_LEVELS.findIndex((l) => l.id === currentLevel.id);
    if (currentIndex >= 0 && currentIndex < CAMPAIGN_LEVELS.length - 1) {
      startGame(CAMPAIGN_LEVELS[currentIndex + 1]);
    } else {
      setView('campaign_select');
    }
  };

  // Level Editor Save / Publish
  const handleSaveCustomLevel = (lvl: LevelData) => {
    const updated = storage.saveCustomLevel(lvl);
    setCustomLevels(updated);
    const updatedStats = { ...stats, levelsCreated: stats.levelsCreated + 1 };
    setStats(updatedStats);
    storage.saveStats(updatedStats);
    triggerAchievement('level_architect', 1);
    if (lvl.basicScript || (lvl.logicBlocks && lvl.logicBlocks.length > 0)) {
      triggerAchievement('script_wizard', 1);
    }
  };

  const handlePublishCustomLevel = (lvl: LevelData) => {
    handleSaveCustomLevel(lvl);
    const updatedComm = storage.publishToCommunity(lvl);
    setCommunityLevels(updatedComm);
  };

  // Vote Community Map
  const handleVoteCommunityLevel = (id: string) => {
    const updated = storage.voteCommunityLevel(id, true);
    setCommunityLevels(updated);
    triggerAchievement('community_star', 1);
  };

  return (
    <div className="relative w-full min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden">
      {/* Floating Achievement Banner */}
      {achievementToast && (
        <div className="fixed top-6 right-6 bg-amber-500 text-slate-950 px-5 py-3 rounded-2xl shadow-2xl z-50 animate-in slide-in-from-top-6 flex items-center gap-3 border-2 border-yellow-300">
          <div className="w-10 h-10 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center font-bold">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-widest font-black block">Achievement Unlocked!</span>
            <h4 className="font-black text-sm">
              {settings.language === 'es' ? achievementToast.titleEs : achievementToast.titleEn}
            </h4>
          </div>
        </div>
      )}

      {/* Main View Router */}
      {view === 'menu' && (
        <MainMenu
          settings={settings}
          stats={stats}
          onUpdateSettings={handleUpdateSettings}
          onNavigate={(target) => {
            if (target === 'campaign') setView('campaign_select');
            else if (target === 'editor') {
              setEditingLevel(undefined);
              setView('editor');
            } else if (target === 'community') setView('community');
            else if (target === 'achievements') setView('achievements');
            else if (target === 'settings') setView('settings');
            else if (target === 'howToPlay') setView('howToPlay');
          }}
        />
      )}

      {view === 'campaign_select' && (
        <LevelSelect
          settings={settings}
          records={records}
          onSelectLevel={(lvl) => startGame(lvl)}
          onBack={() => setView('menu')}
        />
      )}

      {view === 'playing' && currentLevel && (
        <div className="relative w-full h-screen overflow-hidden">
          <canvas ref={gameCanvasRef} className="w-full h-full block" />
          <GameHUD
            levelData={currentLevel}
            settings={settings}
            gameTime={gameTime}
            gemsCollected={gemsCollected}
            totalGems={totalGems}
            speedBoostTimer={speedBoostTimer}
            isPaused={isPaused}
            hasWon={hasWon}
            hasDied={false}
            checkpointMsg={checkpointMsg}
            onJump={() => {
              if (gameEngineRef.current) gameEngineRef.current.jumpRequested = true;
            }}
            onDash={() => {
              if (gameEngineRef.current) gameEngineRef.current.dashRequested = true;
            }}
            onMoveInput={(x, y) => {
              if (gameEngineRef.current) {
                gameEngineRef.current.inputAxes.x = x;
                gameEngineRef.current.inputAxes.y = y;
              }
            }}
            onTogglePause={() => {
              if (gameEngineRef.current) {
                setIsPaused(gameEngineRef.current.togglePause());
              }
            }}
            onRestart={() => {
              gameEngineRef.current?.respawnPlayer();
              setHasWon(false);
            }}
            onExit={() => {
              gameEngineRef.current?.destroy();
              setView('menu');
            }}
            onNextLevel={
              CAMPAIGN_LEVELS.some((l) => l.id === currentLevel.id) ? handleNextLevel : undefined
            }
          />
        </div>
      )}

      {view === 'editor' && (
        <LevelEditor
          initialLevel={editingLevel}
          settings={settings}
          onSave={handleSaveCustomLevel}
          onPublish={handlePublishCustomLevel}
          onBack={() => setView('menu')}
        />
      )}

      {view === 'community' && (
        <CommunityHub
          settings={settings}
          communityLevels={communityLevels}
          customLevels={customLevels}
          leaderboard={leaderboard}
          onPlayLevel={(lvl) => startGame(lvl)}
          onEditLevel={(lvl) => {
            setEditingLevel(lvl);
            setView('editor');
          }}
          onVoteLevel={handleVoteCommunityLevel}
          onCreateNew={() => {
            setEditingLevel(undefined);
            setView('editor');
          }}
          onBack={() => setView('menu')}
        />
      )}

      {view === 'achievements' && (
        <AchievementsModal
          settings={settings}
          achievements={achievements}
          onUpdateSettings={handleUpdateSettings}
          onBack={() => setView('menu')}
        />
      )}

      {view === 'settings' && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onBack={() => setView('menu')}
        />
      )}

      {view === 'howToPlay' && <HowToPlayModal settings={settings} onBack={() => setView('menu')} />}
    </div>
  );
}
