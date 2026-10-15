import React from 'react';
import {
  ArrowLeft,
  Volume2,
  Smartphone,
  Globe,
  Sliders,
  Tv,
  Gamepad2,
  Music
} from 'lucide-react';
import { GameSettings, QualityLevel, PixelMode } from '../types/game';
import { getTranslation } from '../i18n/translations';
import { soundEngine } from '../audio/soundEngine';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onBack: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onBack
}) => {
  const t = getTranslation(settings.language);

  const handleMusicChange = (val: number) => {
    onUpdateSettings({ musicVolume: val });
    soundEngine.setVolumes(val, settings.sfxVolume);
  };

  const handleSfxChange = (val: number) => {
    onUpdateSettings({ sfxVolume: val });
    soundEngine.setVolumes(settings.musicVolume, val);
    soundEngine.playCoin();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 flex flex-col items-center select-none font-silk">
      {settings.crtScanlines && <div className="crt-overlay absolute inset-0 pointer-events-none z-40" />}

      <div className="max-w-3xl w-full relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-slate-800">
          <button
            id="btn-settings-back"
            onClick={() => {
              soundEngine.playClick();
              onBack();
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 pixel-box-sm transition active:translate-y-0.5 text-xs font-pixel"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.saveAndBack}</span>
          </button>

          <div className="text-right">
            <h1 className="text-xl md:text-2xl font-pixel text-yellow-300 drop-shadow">
              {t.settingsTitle}
            </h1>
            <p className="text-slate-400 text-xs font-silk">8-Bit Retro & Audio Preferences</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* 8-Bit Pixel Rendering Mode (Main Retro Feature) */}
          <div className="bg-slate-900/90 pixel-box p-5 md:p-6 shadow-xl">
            <h3 className="text-sm font-pixel text-cyan-300 mb-2 flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-cyan-400" />
              <span>8-BIT RETRO PIXEL RENDERING</span>
            </h3>
            <p className="text-slate-300 text-xs mb-4">
              {settings.language === 'es'
                ? 'Controla la rasterización de píxeles y estilo voxel estilo Minecraft sobre PlayCanvas 3D.'
                : 'Controls pixel rasterization and Minecraft-style voxel graphics on top of PlayCanvas 3D.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(
                [
                  { id: 'ultra_8bit', name: '8-BIT RETRO', desc: 'Chunky 8-Bit Pixels (Authentic NES)' },
                  { id: 'classic_16bit', name: '16-BIT ARCADE', desc: 'Crisp 16-Bit Pixel Scaling' },
                  { id: 'modern', name: 'HD MODERN', desc: 'Native Smooth Resolution' }
                ] as { id: PixelMode; name: string; desc: string }[]
              ).map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => {
                    soundEngine.playClick();
                    onUpdateSettings({ pixelMode: mode.id });
                  }}
                  className={`p-4 pixel-box-sm text-left transition active:translate-y-0.5 flex flex-col justify-between ${
                    settings.pixelMode === mode.id
                      ? 'bg-cyan-400 text-slate-950 font-bold border-cyan-300 shadow-md'
                      : 'bg-slate-950/80 text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <span className="font-pixel text-xs block mb-1">{mode.name}</span>
                  <span className="text-[11px] font-silk opacity-85 leading-tight">{mode.desc}</span>
                </button>
              ))}
            </div>

            {/* CRT Scanlines Overlay Toggle */}
            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-pixel text-amber-300">
                <Tv className="w-4 h-4" />
                <span>CRT TV SCANLINES FILTER</span>
              </div>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onUpdateSettings({ crtScanlines: !settings.crtScanlines });
                }}
                className={`px-4 py-2 font-pixel text-[10px] pixel-box-sm transition active:translate-y-0.5 ${
                  settings.crtScanlines
                    ? 'bg-amber-400 text-slate-950 border-amber-300'
                    : 'bg-slate-950 text-slate-400'
                }`}
              >
                {settings.crtScanlines ? 'ACTIVE [ON]' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Audio Section (8-bit Synthesizer) */}
          <div className="bg-slate-900/90 pixel-box p-5 md:p-6 shadow-xl">
            <h3 className="text-sm font-pixel text-yellow-300 mb-4 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-yellow-400" />
              <span>CHIPTUNE AUDIO & SYNTHESIZER</span>
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2 font-pixel">
                  <span>{t.musicVol}</span>
                  <span className="text-yellow-400">{Math.round(settings.musicVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.musicVolume}
                  onChange={(e) => handleMusicChange(parseFloat(e.target.value))}
                  className="w-full h-3 bg-slate-950 pixel-box-sm appearance-none cursor-pointer accent-yellow-400"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2 font-pixel">
                  <span>{t.sfxVol}</span>
                  <span className="text-yellow-400">{Math.round(settings.sfxVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.sfxVolume}
                  onChange={(e) => handleSfxChange(parseFloat(e.target.value))}
                  className="w-full h-3 bg-slate-950 pixel-box-sm appearance-none cursor-pointer accent-yellow-400"
                />
              </div>
            </div>
          </div>

          {/* Performance & Quality */}
          <div className="bg-slate-900/90 pixel-box p-5 md:p-6 shadow-xl">
            <h3 className="text-sm font-pixel text-emerald-400 mb-2 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>{t.graphicsSettings}</span>
            </h3>
            <p className="text-slate-400 text-xs mb-4">{t.quality}</p>

            <div className="grid grid-cols-3 gap-3 font-pixel">
              {(['low', 'medium', 'high'] as QualityLevel[]).map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    soundEngine.playClick();
                    onUpdateSettings({ quality: q });
                  }}
                  className={`p-3.5 pixel-box-sm text-center text-[10px] capitalize transition active:translate-y-0.5 flex flex-col items-center justify-center gap-1 ${
                    settings.quality === q
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : 'bg-slate-950/80 text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="font-bold">{q.toUpperCase()}</span>
                  <span className="text-[9px] font-silk opacity-80">
                    {q === 'low' ? 'Max FPS' : q === 'medium' ? 'Balanced' : 'High Quality'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Language & Multiplatform Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Language */}
            <div className="bg-slate-900/90 pixel-box p-5 shadow-xl">
              <h3 className="text-xs font-pixel text-white mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>{t.language}</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 font-pixel text-[10px]">
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onUpdateSettings({ language: 'en' });
                  }}
                  className={`p-3 pixel-box-sm flex items-center justify-center gap-2 transition ${
                    settings.language === 'en'
                      ? 'bg-cyan-400 text-slate-950 border-cyan-300 font-bold'
                      : 'bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>English</span>
                </button>

                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onUpdateSettings({ language: 'es' });
                  }}
                  className={`p-3 pixel-box-sm flex items-center justify-center gap-2 transition ${
                    settings.language === 'es'
                      ? 'bg-cyan-400 text-slate-950 border-cyan-300 font-bold'
                      : 'bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Español</span>
                </button>
              </div>
            </div>

            {/* Touch Controls Toggle */}
            <div className="bg-slate-900/90 pixel-box p-5 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-pixel text-purple-300 mb-1 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-purple-400" />
                  <span>TOUCH CONTROLS</span>
                </h3>
                <p className="text-slate-400 text-xs mb-3 font-silk">{t.touchControlsToggle}</p>
              </div>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  onUpdateSettings({ touchControls: !settings.touchControls });
                }}
                className={`py-2.5 px-4 pixel-box-sm font-pixel text-[10px] flex items-center justify-between transition ${
                  settings.touchControls
                    ? 'bg-purple-600 text-white border-purple-400'
                    : 'bg-slate-950 text-slate-400'
                }`}
              >
                <span>Always On</span>
                <span>{settings.touchControls ? '[ENABLED]' : '[OFF]'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
