import React from 'react';
import {
  ArrowLeft,
  Gamepad2,
  Smartphone,
  Keyboard,
  Sparkles,
  Zap,
  RotateCcw,
  Flag,
  Shield,
  Layers
} from 'lucide-react';
import { GameSettings } from '../types/game';
import { getTranslation } from '../i18n/translations';
import { soundEngine } from '../audio/soundEngine';

interface HowToPlayModalProps {
  settings: GameSettings;
  onBack: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ settings, onBack }) => {
  const t = getTranslation(settings.language);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 flex flex-col items-center select-none">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
          <button
            id="btn-howtoplay-back"
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
            <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              {t.howToPlay}
            </h1>
            <p className="text-slate-400 text-xs">Physics Mechanics & Multiplatform Controls</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Keyboard & Mouse */}
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3">
                <Keyboard className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-3">Keyboard & Mouse</h3>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">{t.moveDesc}</span>
                  <span className="font-mono font-bold text-cyan-400">WASD / Arrows</span>
                </li>
                <li className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">{t.jumpDesc}</span>
                  <span className="font-mono font-bold text-cyan-400">SPACE</span>
                </li>
                <li className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">{t.dashDesc}</span>
                  <span className="font-mono font-bold text-cyan-400">SHIFT / K</span>
                </li>
                <li className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">{t.cameraDesc}</span>
                  <span className="font-mono font-bold text-cyan-400">Mouse Drag</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-400">{t.respawnDesc}</span>
                  <span className="font-mono font-bold text-cyan-400">R</span>
                </li>
              </ul>
            </div>

            {/* Gamepad / Controller */}
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-3">Gamepad Controller</h3>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">{t.moveDesc}</span>
                  <span className="font-mono font-bold text-emerald-400">Left Stick</span>
                </li>
                <li className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">{t.jumpDesc}</span>
                  <span className="font-mono font-bold text-emerald-400">A / Cross</span>
                </li>
                <li className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">{t.dashDesc}</span>
                  <span className="font-mono font-bold text-emerald-400">X / RT</span>
                </li>
                <li className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">{t.cameraDesc}</span>
                  <span className="font-mono font-bold text-emerald-400">Right Stick</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-400">{t.pauseDesc}</span>
                  <span className="font-mono font-bold text-emerald-400">Start / Menu</span>
                </li>
              </ul>
            </div>

            {/* Mobile Touch Screen */}
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-3">Touch Screen</h3>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">{t.moveDesc}</span>
                  <span className="font-mono font-bold text-purple-400">Virtual Joystick</span>
                </li>
                <li className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">{t.jumpDesc}</span>
                  <span className="font-mono font-bold text-purple-400">JUMP Button</span>
                </li>
                <li className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">{t.dashDesc}</span>
                  <span className="font-mono font-bold text-purple-400">DASH Button</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-400">{t.cameraDesc}</span>
                  <span className="font-mono font-bold text-purple-400">Swipe Screen</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Physics & Mechanics Guide */}
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>Advanced Physics Mechanics</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <h4 className="font-bold text-cyan-400 text-sm mb-1">Double Jump & Momentum</h4>
                <p className="leading-relaxed text-slate-400">
                  Perform a second jump while mid-air to gain extra height and adjust trajectory over gaps.
                </p>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <h4 className="font-bold text-amber-400 text-sm mb-1">Air Dash (Instant Burst)</h4>
                <p className="leading-relaxed text-slate-400">
                  Dash forward at lightning speed to clear huge chasms or speed past moving hazards.
                </p>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <h4 className="font-bold text-emerald-400 text-sm mb-1">Bounce Pads & Ice Physics</h4>
                <p className="leading-relaxed text-slate-400">
                  Bounce pads launch you sky-high. Ice platforms have low friction and conserve your speed!
                </p>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <h4 className="font-bold text-rose-400 text-sm mb-1">Collapsing Blocks & Lasers</h4>
                <p className="leading-relaxed text-slate-400">
                  Red platforms collapse 0.8s after contact. Time your run to bypass pulsing lasers safely.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
