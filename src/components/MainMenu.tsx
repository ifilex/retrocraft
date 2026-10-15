import React, { useEffect, useRef } from 'react';
import {
  Play,
  Hammer,
  Globe2,
  Trophy,
  Settings,
  HelpCircle,
  Sparkles,
  Zap,
  ChevronRight,
  Tv,
  Gamepad2
} from 'lucide-react';
import * as pc from 'playcanvas';
import { GameSettings, PlayerStats, PixelMode } from '../types/game';
import { getTranslation } from '../i18n/translations';
import { soundEngine } from '../audio/soundEngine';
import { RetroTextureGenerator } from '../engine/RetroTextureGenerator';

interface MainMenuProps {
  settings: GameSettings;
  stats: PlayerStats;
  onNavigate: (view: 'campaign' | 'editor' | 'community' | 'achievements' | 'settings' | 'howToPlay') => void;
  onUpdateSettings?: (settings: Partial<GameSettings>) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  settings,
  stats,
  onNavigate,
  onUpdateSettings
}) => {
  const t = getTranslation(settings.language);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pcAppRef = useRef<pc.Application | null>(null);

  // Background 3D rotating Minecraft/Voxel showcase in PlayCanvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const app = new pc.Application(canvasRef.current, {
      mouse: new pc.Mouse(canvasRef.current),
      touch: new pc.TouchDevice(canvasRef.current),
      elementInput: new pc.ElementInput(canvasRef.current),
    });

    app.start();
    app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
    app.setCanvasResolution(pc.RESOLUTION_AUTO);

    // Apply pixel downsampling for 8-bit aesthetic
    if (settings.pixelMode === 'ultra_8bit') {
      app.graphicsDevice.maxPixelRatio = 0.35;
      canvasRef.current.classList.add('pixelated-render');
    } else if (settings.pixelMode === 'classic_16bit') {
      app.graphicsDevice.maxPixelRatio = 0.6;
      canvasRef.current.classList.add('pixelated-render');
    } else {
      canvasRef.current.classList.remove('pixelated-render');
      app.graphicsDevice.maxPixelRatio = Math.min(window.devicePixelRatio || 1, 2.0);
    }

    app.scene.ambientLight = new pc.Color(0.3, 0.35, 0.45);

    // Camera
    const camera = new pc.Entity('menuCam');
    camera.addComponent('camera', {
      clearColor: new pc.Color(0.04, 0.05, 0.09),
      fov: 55
    });
    camera.setLocalPosition(0, 3.8, 11);
    camera.lookAt(0, 0.8, 0);
    app.root.addChild(camera);

    // Directional Voxel Sunlight
    const light = new pc.Entity('menuLight');
    light.addComponent('light', {
      type: 'directional',
      color: new pc.Color(1, 0.98, 0.9),
      intensity: 1.5
    });
    light.setEulerAngles(45, 45, 0);
    app.root.addChild(light);

    // Center Rotating Minecraft Voxel Platform
    const platform = new pc.Entity('menuPlatform');
    platform.addComponent('render', { type: 'box' });
    platform.setLocalScale(6, 1.2, 6);
    platform.setLocalPosition(0, -1, 0);

    const matPlat = new pc.StandardMaterial();
    matPlat.diffuseMap = RetroTextureGenerator.getVoxelGrassSideTexture(app);
    matPlat.useMetalness = true;
    matPlat.metalness = 0.1;
    matPlat.gloss = 0.2;
    matPlat.update();
    platform.render!.material = matPlat;
    app.root.addChild(platform);

    // Minecraft Voxel Character Model standing in center
    const characterRoot = new pc.Entity('menuCharRoot');
    characterRoot.setLocalPosition(0, 0.2, 0);

    const head = new pc.Entity('menuHead');
    head.addComponent('render', { type: 'box' });
    head.setLocalScale(0.9, 0.9, 0.9);
    head.setLocalPosition(0, 1.3, 0);
    const headMat = new pc.StandardMaterial();
    headMat.diffuseMap = RetroTextureGenerator.getVoxelCharacterFace(app, settings.selectedSkin || 'skin_default');
    headMat.update();
    head.render!.material = headMat;
    characterRoot.addChild(head);

    const torso = new pc.Entity('menuTorso');
    torso.addComponent('render', { type: 'box' });
    torso.setLocalScale(0.95, 0.9, 0.55);
    torso.setLocalPosition(0, 0.45, 0);
    const torsoMat = new pc.StandardMaterial();
    torsoMat.diffuseMap = RetroTextureGenerator.getVoxelCharacterTorso(app, '#06b6d4');
    torsoMat.update();
    torso.render!.material = torsoMat;
    characterRoot.addChild(torso);

    app.root.addChild(characterRoot);

    // Orbiting decorative 3D voxel gems
    const gems: pc.Entity[] = [];
    const colors = ['#06b6d4', '#eab308', '#ec4899', '#8b5cf6'];
    for (let i = 0; i < 4; i++) {
      const gem = new pc.Entity('menuGem_' + i);
      gem.addComponent('render', { type: 'box' });
      gem.setLocalScale(0.8, 0.8, 0.8);
      gem.setEulerAngles(45, 45, 0);

      const gemMat = new pc.StandardMaterial();
      gemMat.diffuseMap = RetroTextureGenerator.getVoxelGemTexture(app, colors[i]);
      gemMat.emissive = new pc.Color().fromString(colors[i]);
      gemMat.emissiveIntensity = 0.5;
      gemMat.update();
      gem.render!.material = gemMat;

      app.root.addChild(gem);
      gems.push(gem);
    }

    let time = 0;
    app.on('update', (dt: number) => {
      time += dt;
      platform.rotate(0, 12 * dt, 0);
      characterRoot.rotate(0, 12 * dt, 0);

      const idleBob = Math.sin(time * 3) * 0.08;
      characterRoot.setLocalPosition(0, 0.2 + idleBob, 0);

      gems.forEach((g, idx) => {
        const angle = time * 0.75 + (idx * Math.PI) / 2;
        const radius = 3.6;
        const y = Math.sin(time * 2 + idx) * 0.5 + 0.8;
        g.setLocalPosition(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
        g.rotate(35 * dt, 65 * dt, 25 * dt);
      });
    });

    pcAppRef.current = app;

    // Start 8-bit chiptune background music
    soundEngine.setVolumes(settings.musicVolume, settings.sfxVolume);
    soundEngine.startMusic('menu');

    return () => {
      app.destroy();
      pcAppRef.current = null;
    };
  }, [settings.pixelMode, settings.selectedSkin]);

  const handleNavigate = (
    view: 'campaign' | 'editor' | 'community' | 'achievements' | 'settings' | 'howToPlay'
  ) => {
    soundEngine.playClick();
    onNavigate(view);
  };

  const handleTogglePixelMode = () => {
    soundEngine.playClick();
    const nextMode: PixelMode =
      settings.pixelMode === 'ultra_8bit'
        ? 'classic_16bit'
        : settings.pixelMode === 'classic_16bit'
        ? 'modern'
        : 'ultra_8bit';
    onUpdateSettings?.({ pixelMode: nextMode });
  };

  const handleToggleScanlines = () => {
    soundEngine.playClick();
    onUpdateSettings?.({ crtScanlines: !settings.crtScanlines });
  };

  return (
    <div className="relative w-full min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 md:p-10 select-none overflow-hidden font-silk">
      {/* Optional CRT Scanlines Layer */}
      {settings.crtScanlines && <div className="crt-overlay absolute inset-0 z-30 pointer-events-none" />}

      {/* 3D Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-75 pixelated-render"
      />

      {/* Retro Dark Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/30 pointer-events-none z-10" />

      {/* Top Brand & Retro Quick Controls Bar */}
      <div className="relative z-20 flex items-center justify-between w-full max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500 pixel-box-sm flex items-center justify-center text-slate-950 font-pixel text-xs">
            8B
          </div>
          <div>
            <span className="text-[11px] font-pixel text-cyan-400 block tracking-wider">
              RETROCRAFT 3D
            </span>
            <span className="text-[10px] text-slate-400 font-silk">PlayCanvas Voxel Engine</span>
          </div>
        </div>

        {/* Retro Toggles & Player Stats */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Quick 8-Bit Pixel Mode Switcher */}
          <button
            onClick={handleTogglePixelMode}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-cyan-300 font-pixel text-[9px] pixel-box-sm transition active:translate-y-0.5"
            title="Toggle 8-bit Pixel Mode"
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span className="uppercase">
              {settings.pixelMode === 'ultra_8bit'
                ? '8-BIT'
                : settings.pixelMode === 'classic_16bit'
                ? '16-BIT'
                : 'HD'}
            </span>
          </button>

          {/* Quick CRT Scanlines Switcher */}
          <button
            onClick={handleToggleScanlines}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-pixel text-[9px] pixel-box-sm transition active:translate-y-0.5 ${
              settings.crtScanlines
                ? 'bg-amber-500 text-slate-950 border-amber-600'
                : 'bg-slate-900/90 text-slate-400 hover:text-white'
            }`}
            title="Toggle CRT Scanlines"
          >
            <Tv className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CRT</span>
          </button>

          {/* Stars & Gems */}
          <div className="flex items-center gap-3 bg-slate-900/90 px-3.5 py-1.5 pixel-box-sm text-[11px] font-pixel">
            <div className="flex items-center gap-1 text-amber-300">
              <Sparkles className="w-3.5 h-3.5 fill-amber-300" />
              <span>{stats.starsEarned}</span>
            </div>
            <div className="flex items-center gap-1 text-cyan-300">
              <span>💎</span>
              <span>{stats.totalGems}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Center Hero Banner */}
      <div className="relative z-20 max-w-6xl mx-auto w-full my-auto flex flex-col items-center md:items-start text-center md:text-left py-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-950/80 border-2 border-cyan-500 text-cyan-300 text-[10px] font-pixel uppercase mb-4 shadow">
          <Sparkles className="w-3 h-3" />
          8-Bit Voxel Platformer & Studio
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-pixel tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-cyan-300 to-white mb-4 drop-shadow-[0_4px_0_rgba(0,0,0,1)]">
          RETRO<span className="text-cyan-400">CRAFT</span>
        </h1>

        <p className="text-slate-300 text-xs sm:text-sm md:text-base max-w-lg mb-8 leading-relaxed font-silk bg-slate-950/60 p-3 pixel-box-sm">
          {settings.language === 'es'
            ? 'Plataformas 3D con estética retro de 8 bits al estilo Minecraft, física PlayCanvas, editor de niveles y chiptune auténtico.'
            : '3D retro 8-bit platformer with Minecraft voxel aesthetics, PlayCanvas physics, level studio and authentic chiptune audio.'}
        </p>

        {/* Primary Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-3xl">
          {/* Play Campaign */}
          <button
            id="btn-main-play"
            onClick={() => handleNavigate('campaign')}
            className="group p-5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 pixel-btn flex flex-col justify-between text-left"
          >
            <div className="flex items-center justify-between w-full mb-4">
              <div className="w-10 h-10 bg-slate-950 text-cyan-400 pixel-box-sm flex items-center justify-center">
                <Play className="w-5 h-5 fill-cyan-400" />
              </div>
              <ChevronRight className="w-6 h-6 opacity-80 group-hover:translate-x-1 transition-transform" />
            </div>
            <div>
              <span className="text-sm font-pixel block leading-tight mb-1">{t.play}</span>
              <span className="text-xs text-slate-900 font-bold font-silk">5 Worlds & 8-Bit Bosses</span>
            </div>
          </button>

          {/* Level Editor & BASIC */}
          <button
            id="btn-main-editor"
            onClick={() => handleNavigate('editor')}
            className="group p-5 bg-purple-600 hover:bg-purple-500 text-white pixel-btn flex flex-col justify-between text-left"
          >
            <div className="flex items-center justify-between w-full mb-4">
              <div className="w-10 h-10 bg-slate-950 text-purple-400 pixel-box-sm flex items-center justify-center">
                <Hammer className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-pixel bg-purple-950 text-purple-300 px-2 py-0.5 border border-purple-400">
                VOXEL + BASIC
              </span>
            </div>
            <div>
              <span className="text-sm font-pixel block leading-tight mb-1">{t.editor}</span>
              <span className="text-xs text-purple-200 font-silk">3D Level Studio</span>
            </div>
          </button>

          {/* Community Cloud Hub */}
          <button
            id="btn-main-community"
            onClick={() => handleNavigate('community')}
            className="group p-5 bg-emerald-600 hover:bg-emerald-500 text-white pixel-btn flex flex-col justify-between text-left"
          >
            <div className="flex items-center justify-between w-full mb-4">
              <div className="w-10 h-10 bg-slate-950 text-emerald-400 pixel-box-sm flex items-center justify-center">
                <Globe2 className="w-5 h-5" />
              </div>
              <ChevronRight className="w-6 h-6 opacity-80 group-hover:translate-x-1 transition-transform" />
            </div>
            <div>
              <span className="text-sm font-pixel block leading-tight mb-1">{t.community}</span>
              <span className="text-xs text-emerald-200 font-silk">Cloud Sharing & Ranks</span>
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Footer Navigation */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 w-full max-w-6xl mx-auto pt-4 border-t-2 border-slate-800">
        <div className="flex items-center gap-2">
          <button
            id="btn-main-achievements"
            onClick={() => handleNavigate('achievements')}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 pixel-box-sm text-[10px] font-pixel flex items-center gap-2 transition active:translate-y-0.5"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>{t.achievements}</span>
          </button>

          <button
            id="btn-main-settings"
            onClick={() => handleNavigate('settings')}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 pixel-box-sm text-[10px] font-pixel flex items-center gap-2 transition active:translate-y-0.5"
          >
            <Settings className="w-4 h-4 text-cyan-400" />
            <span>{t.settings}</span>
          </button>

          <button
            id="btn-main-howtoplay"
            onClick={() => handleNavigate('howToPlay')}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 pixel-box-sm text-[10px] font-pixel flex items-center gap-2 transition active:translate-y-0.5"
          >
            <HelpCircle className="w-4 h-4 text-purple-400" />
            <span>{t.howToPlay}</span>
          </button>
        </div>

        <div className="text-[10px] font-pixel text-slate-500 flex items-center gap-3">
          <span>8-BIT PIXEL ART</span>
          <span>•</span>
          <span>CHIPTUNE AUDIO</span>
          <span>•</span>
          <span>EN / ES</span>
        </div>
      </div>
    </div>
  );
};
