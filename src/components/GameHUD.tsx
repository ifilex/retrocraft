import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  RotateCcw,
  Home,
  Sparkles,
  Timer,
  Zap,
  Gamepad2,
  Trophy,
  ArrowRight,
  Flag,
  Radio,
  Tv
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GameSettings, LevelData } from '../types/game';
import { getTranslation } from '../i18n/translations';
import { soundEngine } from '../audio/soundEngine';

interface GameHUDProps {
  levelData: LevelData;
  settings: GameSettings;
  gameTime: number;
  gemsCollected: number;
  totalGems: number;
  speedBoostTimer: number;
  isPaused: boolean;
  hasWon: boolean;
  hasDied: boolean;
  checkpointMsg: boolean;
  onJump: () => void;
  onDash: () => void;
  onMoveInput: (x: number, y: number) => void;
  onTogglePause: () => void;
  onRestart: () => void;
  onExit: () => void;
  onNextLevel?: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  levelData,
  settings,
  gameTime,
  gemsCollected,
  totalGems,
  speedBoostTimer,
  isPaused,
  hasWon,
  hasDied,
  checkpointMsg,
  onJump,
  onDash,
  onMoveInput,
  onTogglePause,
  onRestart,
  onExit,
  onNextLevel
}) => {
  const t = getTranslation(settings.language);
  const [isGamepadActive, setIsGamepadActive] = useState(false);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const [isDraggingJoystick, setIsDraggingJoystick] = useState(false);
  const joystickBaseRef = useRef<HTMLDivElement>(null);

  // Confetti on win
  useEffect(() => {
    if (hasWon) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [hasWon]);

  // Check Gamepad Connection
  useEffect(() => {
    const handleGpConnected = () => setIsGamepadActive(true);
    const handleGpDisconnected = () => setIsGamepadActive(false);

    window.addEventListener('gamepadconnected', handleGpConnected);
    window.addEventListener('gamepaddisconnected', handleGpDisconnected);

    const checkInterval = setInterval(() => {
      const gps = navigator.getGamepads ? navigator.getGamepads() : [];
      setIsGamepadActive(!!gps[0]);
    }, 1000);

    return () => {
      window.removeEventListener('gamepadconnected', handleGpConnected);
      window.removeEventListener('gamepaddisconnected', handleGpDisconnected);
      clearInterval(checkInterval);
    };
  }, []);

  // Touch Virtual Joystick Handler
  const handleJoystickTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDraggingJoystick(true);
    updateJoystick(e);
  };

  const updateJoystick = (e: React.TouchEvent | React.MouseEvent | TouchEvent | MouseEvent) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const maxRadius = rect.width / 2;

    const dist = Math.min(maxRadius, Math.sqrt(dx * dx + dy * dy));
    const angle = Math.atan2(dy, dx);

    const clampedX = Math.cos(angle) * dist;
    const clampedY = Math.sin(angle) * dist;

    setJoystickPos({ x: clampedX, y: clampedY });

    const normX = clampedX / maxRadius;
    const normY = -clampedY / maxRadius; // inverted for 3D forward
    onMoveInput(normX, normY);
  };

  useEffect(() => {
    if (!isDraggingJoystick) return;

    const handleMove = (e: TouchEvent | MouseEvent) => updateJoystick(e);
    const handleEnd = () => {
      setIsDraggingJoystick(false);
      setJoystickPos({ x: 0, y: 0 });
      onMoveInput(0, 0);
    };

    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleEnd);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);

    return () => {
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
    };
  }, [isDraggingJoystick]);

  // Calculate Stars for Victory
  const parTime = levelData.parTime || 30;
  const isTimePar = gameTime <= parTime;
  const isGemsComplete = gemsCollected >= (totalGems || 1);
  const starCount = (hasWon ? 1 : 0) + (isTimePar ? 1 : 0) + (isGemsComplete ? 1 : 0);

  const showTouchControls =
    settings.touchControls || 'ontouchstart' in window || window.innerWidth < 1024;

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden flex flex-col justify-between p-4 md:p-6 z-20 font-silk">
      {/* Optional CRT Scanlines Layer */}
      {settings.crtScanlines && <div className="crt-overlay absolute inset-0 z-30 pointer-events-none" />}

      {/* Top Header Bar (8-bit style) */}
      <div className="flex items-center justify-between w-full relative z-40">
        {/* Level Info & Gems */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="bg-slate-950/90 pixel-box-sm px-3.5 py-2 flex items-center gap-2.5 pointer-events-auto shadow-lg">
            <div className="w-2.5 h-2.5 bg-cyan-400 animate-pulse" />
            <div>
              <h3 className="text-yellow-300 font-pixel text-[10px] sm:text-xs tracking-wider leading-tight">
                {levelData.title}
              </h3>
              <p className="text-slate-400 text-[10px] font-silk">{levelData.author || '8-Bit World'}</p>
            </div>
          </div>

          <div className="bg-slate-950/90 pixel-box-sm px-3 py-2 flex items-center gap-1.5 pointer-events-auto shadow-lg font-pixel text-[10px] text-cyan-300">
            <span className="text-xs">💎</span>
            <span>
              {gemsCollected}/{totalGems}
            </span>
          </div>

          {speedBoostTimer > 0 && (
            <div className="bg-amber-500 text-slate-950 pixel-box-sm px-3 py-2 flex items-center gap-1 font-pixel text-[10px] animate-bounce shadow-lg">
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>NITRO {Math.ceil(speedBoostTimer)}s</span>
            </div>
          )}
        </div>

        {/* Timer & Controls */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="bg-slate-950/90 pixel-box-sm px-3.5 py-2 flex items-center gap-1.5 pointer-events-auto shadow-lg font-pixel text-xs text-white">
            <Timer className="w-3.5 h-3.5 text-amber-400" />
            <span className="tracking-wider">{gameTime.toFixed(1)}s</span>
          </div>

          {isGamepadActive && (
            <div
              className="bg-emerald-950 border-2 border-emerald-500 pixel-box-sm p-2 text-emerald-400 pointer-events-auto"
              title="Gamepad Active"
            >
              <Gamepad2 className="w-4 h-4" />
            </div>
          )}

          <button
            id="btn-hud-pause"
            onClick={() => {
              soundEngine.playClick();
              onTogglePause();
            }}
            className="bg-slate-950/90 hover:bg-slate-800 text-slate-200 pixel-box-sm p-2 pointer-events-auto transition active:translate-y-0.5 shadow-lg"
          >
            <Radio className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Checkpoint Banner */}
      {checkpointMsg && (
        <div className="self-center bg-cyan-400 text-slate-950 font-pixel px-5 py-2 pixel-box-sm text-[11px] uppercase tracking-widest animate-pulse shadow-2xl flex items-center gap-2 z-40">
          <Flag className="w-4 h-4" />
          {t.checkpoint}
        </div>
      )}

      {/* Bottom Controls Area (Touch D-Pad & 8-bit [A] / [B] Buttons) */}
      <div className="flex items-end justify-between w-full pb-2 relative z-40">
        {/* Virtual Joystick (Mobile/Touch) */}
        {showTouchControls ? (
          <div
            ref={joystickBaseRef}
            onTouchStart={handleJoystickTouchStart}
            onMouseDown={handleJoystickTouchStart}
            className="w-28 h-28 sm:w-32 sm:h-32 bg-slate-950/70 border-4 border-slate-700 pixel-box relative flex items-center justify-center pointer-events-auto touch-none shadow-2xl active:border-cyan-400 transition-colors"
          >
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 bg-cyan-400 pixel-box-sm shadow-lg absolute pointer-events-none transition-transform duration-75 flex items-center justify-center font-pixel text-[8px] text-slate-950"
              style={{
                transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`
              }}
            >
              +
            </div>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-3 bg-slate-950/80 px-4 py-2 pixel-box-sm text-[10px] font-pixel text-slate-400">
            <span className="text-yellow-300">WASD / Stick</span>: Move
            <span>•</span>
            <span className="text-cyan-300">Space / [A]</span>: Jump
            <span>•</span>
            <span className="text-amber-300">Shift / [B]</span>: Dash
          </div>
        )}

        {/* Action Buttons (Jump [A], Dash [B], Respawn) */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            id="btn-hud-respawn"
            onClick={() => {
              soundEngine.playClick();
              onRestart();
            }}
            className="w-11 h-11 bg-slate-900 hover:bg-slate-800 text-slate-300 pixel-box-sm flex items-center justify-center active:translate-y-0.5 transition shadow-lg"
            title={t.respawnDesc}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Dash [B] Button */}
          <button
            id="btn-hud-dash"
            onClick={onDash}
            className="w-14 h-14 sm:w-16 sm:h-16 bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel flex flex-col items-center justify-center active:translate-y-1 transition pixel-btn"
          >
            <span className="text-xs sm:text-sm font-bold">[B]</span>
            <span className="text-[8px] sm:text-[9px] uppercase">DASH</span>
          </button>

          {/* Jump [A] Button */}
          <button
            id="btn-hud-jump"
            onClick={onJump}
            className="w-16 h-16 sm:w-20 sm:h-20 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-pixel text-xs sm:text-sm flex flex-col items-center justify-center active:translate-y-1 transition pixel-btn"
          >
            <span className="text-sm sm:text-base font-black">[A]</span>
            <span className="text-[9px] sm:text-[10px] uppercase font-bold">JUMP</span>
          </button>
        </div>
      </div>

      {/* Pause Modal (8-Bit Retro Box) */}
      {isPaused && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 pointer-events-auto">
          <div className="bg-slate-900 pixel-box p-6 md:p-8 max-w-sm w-full text-center shadow-2xl">
            <h2 className="text-lg md:text-xl font-pixel text-yellow-300 mb-2">{t.paused}</h2>
            <p className="text-slate-400 text-xs mb-6 font-silk">{levelData.title}</p>

            <div className="space-y-3 font-pixel text-xs">
              <button
                id="btn-pause-resume"
                onClick={() => {
                  soundEngine.playClick();
                  onTogglePause();
                }}
                className="w-full py-3.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-pixel pixel-btn flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                {t.resume}
              </button>

              <button
                id="btn-pause-restart"
                onClick={() => {
                  soundEngine.playClick();
                  onRestart();
                }}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-pixel pixel-btn flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {t.restart}
              </button>

              <button
                id="btn-pause-exit"
                onClick={() => {
                  soundEngine.playClick();
                  onExit();
                }}
                className="w-full py-3 bg-red-950 hover:bg-red-900 text-red-200 font-pixel pixel-btn flex items-center justify-center gap-2"
              >
                <Home className="w-3.5 h-3.5" />
                {t.exitToMenu}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Victory Modal (8-Bit Arcade Scoreboard) */}
      {hasWon && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 pointer-events-auto">
          <div className="bg-slate-900 pixel-box p-6 md:p-8 max-w-md w-full text-center shadow-2xl">
            <div className="w-14 h-14 bg-yellow-400 text-slate-950 mx-auto flex items-center justify-center mb-4 pixel-box-sm">
              <Trophy className="w-8 h-8" />
            </div>

            <h2 className="text-xl md:text-2xl font-pixel text-yellow-300 mb-1 tracking-wider">
              {t.victory}
            </h2>
            <p className="text-cyan-400 text-xs font-pixel mb-6">{t.congratulations}</p>

            {/* Stars Rating */}
            <div className="flex justify-center gap-3 mb-6">
              {[1, 2, 3].map((starIndex) => (
                <div
                  key={starIndex}
                  className={`w-12 h-12 pixel-box-sm flex items-center justify-center transition-all ${
                    starIndex <= starCount
                      ? 'bg-amber-400 text-slate-950 scale-110 shadow-lg'
                      : 'bg-slate-950 text-slate-700'
                  }`}
                >
                  <Sparkles className="w-6 h-6 fill-current" />
                </div>
              ))}
            </div>

            {/* Stats Breakdown */}
            <div className="grid grid-cols-2 gap-3 bg-slate-950 p-4 pixel-box-sm mb-6 text-left font-pixel text-[10px]">
              <div>
                <span className="text-slate-400 block mb-1">{t.time}</span>
                <span className="text-white text-sm">{gameTime.toFixed(2)}s</span>
                <span className="text-slate-500 text-[8px] block mt-0.5">PAR: {parTime}s</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">{t.gems}</span>
                <span className="text-cyan-400 text-sm">
                  {gemsCollected}/{totalGems}
                </span>
                <span className="text-slate-500 text-[8px] block mt-0.5">
                  {isGemsComplete ? '100% CLEARED' : 'BONUS MISSED'}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3 font-pixel text-xs">
              {onNextLevel && (
                <button
                  id="btn-victory-next"
                  onClick={() => {
                    soundEngine.playClick();
                    onNextLevel();
                  }}
                  className="w-full py-3.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 pixel-btn flex items-center justify-center gap-2"
                >
                  {t.nextLevel}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <button
                id="btn-victory-restart"
                onClick={() => {
                  soundEngine.playClick();
                  onRestart();
                }}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white pixel-btn flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {t.restart}
              </button>

              <button
                id="btn-victory-exit"
                onClick={() => {
                  soundEngine.playClick();
                  onExit();
                }}
                className="w-full py-3 bg-slate-950 hover:bg-slate-800 text-slate-300 pixel-btn flex items-center justify-center gap-2"
              >
                <Home className="w-3.5 h-3.5" />
                {t.exitToMenu}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
