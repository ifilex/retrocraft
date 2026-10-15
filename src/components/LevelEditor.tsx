import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Save,
  Upload,
  Download,
  Share2,
  Trash2,
  Plus,
  ArrowLeft,
  Code2,
  Boxes,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  LevelData,
  LevelObject,
  ObjectType,
  GameSettings,
  LogicBlock
} from '../types/game';
import { getTranslation } from '../i18n/translations';
import { PlayCanvasEditor } from '../engine/PlayCanvasEditor';
import { PlayCanvasGame } from '../engine/PlayCanvasGame';
import { GameHUD } from './GameHUD';
import { BasicScriptEngine } from '../scripting/basicInterpreter';
import { soundEngine } from '../audio/soundEngine';

interface LevelEditorProps {
  initialLevel?: LevelData;
  settings: GameSettings;
  onSave: (level: LevelData) => void;
  onPublish: (level: LevelData) => void;
  onBack: () => void;
}

const PALETTE_GROUPS: Array<{
  category: string;
  items: Array<{ type: ObjectType; labelKey: string; icon: string; color: string }>;
}> = [
  {
    category: 'Essential',
    items: [
      { type: 'start', labelKey: 'obj_start', icon: '📍', color: 'bg-blue-600' },
      { type: 'goal', labelKey: 'obj_goal', icon: '🏁', color: 'bg-amber-600' },
      { type: 'checkpoint', labelKey: 'obj_checkpoint', icon: '🚩', color: 'bg-cyan-600' }
    ]
  },
  {
    category: 'Platforms',
    items: [
      { type: 'platform_normal', labelKey: 'obj_platform_normal', icon: '🟦', color: 'bg-cyan-700' },
      { type: 'platform_ice', labelKey: 'obj_platform_ice', icon: '❄️', color: 'bg-blue-400' },
      { type: 'platform_bouncy', labelKey: 'obj_platform_bouncy', icon: '🟢', color: 'bg-emerald-600' },
      { type: 'platform_conveyer', labelKey: 'obj_platform_conveyer', icon: '⏩', color: 'bg-yellow-600' },
      { type: 'platform_collapsing', labelKey: 'obj_platform_collapsing', icon: '💥', color: 'bg-rose-700' },
      { type: 'platform_moving', labelKey: 'obj_platform_moving', icon: '↔️', color: 'bg-purple-600' }
    ]
  },
  {
    category: 'Hazards',
    items: [
      { type: 'hazard_spikes', labelKey: 'obj_hazard_spikes', icon: '🔺', color: 'bg-red-600' },
      { type: 'hazard_laser', labelKey: 'obj_hazard_laser', icon: '⚡', color: 'bg-pink-600' },
      { type: 'hazard_stomper', labelKey: 'obj_hazard_stomper', icon: '🔨', color: 'bg-orange-800' },
      { type: 'hazard_spinner', labelKey: 'obj_hazard_spinner', icon: '🌀', color: 'bg-orange-600' }
    ]
  },
  {
    category: 'Collectibles & Props',
    items: [
      { type: 'collectible_gem', labelKey: 'obj_collectible_gem', icon: '💎', color: 'bg-cyan-500' },
      { type: 'collectible_star', labelKey: 'obj_collectible_star', icon: '⭐', color: 'bg-yellow-500' },
      { type: 'collectible_speed', labelKey: 'obj_collectible_speed', icon: '🚀', color: 'bg-amber-500' },
      { type: 'prop_pillar', labelKey: 'obj_prop_pillar', icon: '🏛️', color: 'bg-slate-600' },
      { type: 'prop_arch', labelKey: 'obj_prop_arch', icon: '⛩️', color: 'bg-indigo-600' },
      { type: 'prop_ring', labelKey: 'obj_prop_ring', icon: '⭕', color: 'bg-teal-500' }
    ]
  }
];

export const LevelEditor: React.FC<LevelEditorProps> = ({
  initialLevel,
  settings,
  onSave,
  onPublish,
  onBack
}) => {
  const t = getTranslation(settings.language);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const editorEngineRef = useRef<PlayCanvasEditor | null>(null);
  const playtestGameRef = useRef<PlayCanvasGame | null>(null);

  // Level State
  const [levelData, setLevelData] = useState<LevelData>(
    initialLevel || {
      id: 'custom_' + Date.now(),
      title: 'My Custom Sandbox',
      description: 'Built with the 3D Studio and Visual Scripting.',
      author: 'Creator',
      theme: 'neon',
      objects: [
        { id: 'start_1', type: 'start', position: { x: 0, y: 1.5, z: 0 } },
        { id: 'p1', type: 'platform_normal', position: { x: 0, y: 0, z: 0 }, scale: { x: 6, y: 1, z: 6 } },
        { id: 'p2', type: 'platform_normal', position: { x: 0, y: 0, z: -10 }, scale: { x: 6, y: 1, z: 6 } },
        { id: 'gem_1', type: 'collectible_gem', position: { x: 0, y: 1.5, z: -10 } },
        { id: 'goal_1', type: 'goal', position: { x: 0, y: 1.5, z: -12 } }
      ],
      logicBlocks: [],
      basicScript: '10 REM --- CUSTOM PLATFORM LOGIC ---\n20 MOVE X 5\n30 WAIT 1.5\n40 MOVE X -5\n50 GOTO 20',
      parTime: 30,
      gemTarget: 3
    }
  );

  const [selectedObject, setSelectedObject] = useState<LevelObject | null>(null);
  const [isPlaytesting, setIsPlaytesting] = useState(false);
  const [activeTab, setActiveTab] = useState<'palette' | 'properties' | 'logic' | 'settings'>('palette');
  const [logicMode, setLogicMode] = useState<'blocks' | 'basic'>('blocks');
  const [scriptCode, setScriptCode] = useState(levelData.basicScript || '');
  const [scriptErrors, setScriptErrors] = useState<string[]>([]);
  const [scriptSuccessMsg, setScriptSuccessMsg] = useState(false);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // Playtesting HUD state
  const [gameTime, setGameTime] = useState(0);
  const [gemsCollected, setGemsCollected] = useState(0);
  const [totalGems, setTotalGems] = useState(0);
  const [speedBoostTimer, setSpeedBoostTimer] = useState(0);
  const [isGamePaused, setIsGamePaused] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [checkpointMsg, setCheckpointMsg] = useState(false);

  // Initialize Editor Engine
  useEffect(() => {
    if (!canvasRef.current || isPlaytesting) return;

    editorEngineRef.current = new PlayCanvasEditor(
      canvasRef.current,
      levelData,
      settings,
      (obj) => setSelectedObject(obj)
    );

    return () => {
      editorEngineRef.current?.destroy();
      editorEngineRef.current = null;
    };
  }, [isPlaytesting]);

  // Handle Playtest Toggle
  const startPlaytest = () => {
    if (!canvasRef.current) return;
    soundEngine.playClick();

    // Destroy editor engine
    editorEngineRef.current?.destroy();
    editorEngineRef.current = null;

    setIsPlaytesting(true);
    setHasWon(false);
    setGemsCollected(0);
    setGameTime(0);

    setTimeout(() => {
      if (!canvasRef.current) return;
      playtestGameRef.current = new PlayCanvasGame(
        canvasRef.current,
        levelData,
        settings,
        {
          onGemCollected: (c, tot) => {
            setGemsCollected(c);
            setTotalGems(tot);
          },
          onStarCollected: () => {},
          onSpeedBoost: (dur) => setSpeedBoostTimer(dur),
          onCheckpointReached: () => {
            setCheckpointMsg(true);
            setTimeout(() => setCheckpointMsg(false), 2000);
          },
          onLevelComplete: (time, gems, total) => {
            setHasWon(true);
          }
        }
      );
    }, 50);
  };

  const stopPlaytest = () => {
    soundEngine.playClick();
    playtestGameRef.current?.destroy();
    playtestGameRef.current = null;
    setIsPlaytesting(false);
  };

  // Timer updater during playtest
  useEffect(() => {
    if (!isPlaytesting) return;
    const interval = setInterval(() => {
      if (playtestGameRef.current) {
        setGameTime(playtestGameRef.current.getElapsedTime());
      }
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaytesting]);

  // Palette Add Object
  const handleAddObject = (type: ObjectType) => {
    if (!editorEngineRef.current) return;
    soundEngine.playClick();
    const newObj = editorEngineRef.current.addObject(type);
    setLevelData({ ...editorEngineRef.current.levelData });
    setSelectedObject(newObj);
    setActiveTab('properties');
  };

  // Delete Object
  const handleDeleteObject = () => {
    if (!selectedObject || !editorEngineRef.current) return;
    soundEngine.playHurt();
    editorEngineRef.current.removeObject(selectedObject.id);
    setLevelData({ ...editorEngineRef.current.levelData });
    setSelectedObject(null);
    setActiveTab('palette');
  };

  // Update Object Properties
  const handlePropertyChange = (changes: Partial<LevelObject>) => {
    if (!selectedObject || !editorEngineRef.current) return;
    editorEngineRef.current.updateSelectedObject(changes);
    const updated = { ...selectedObject, ...changes };
    setSelectedObject(updated);
    setLevelData({ ...editorEngineRef.current.levelData });
  };

  // Script validation
  const handleValidateScript = () => {
    const parse = BasicScriptEngine.parse(scriptCode);
    if (!parse.valid) {
      setScriptErrors(parse.errors);
      setScriptSuccessMsg(false);
      soundEngine.playHurt();
    } else {
      setScriptErrors([]);
      setScriptSuccessMsg(true);
      soundEngine.playVictory();
      const updatedBlocks = BasicScriptEngine.basicToBlocks(scriptCode);
      setLevelData({
        ...levelData,
        basicScript: scriptCode,
        logicBlocks: updatedBlocks
      });
      setTimeout(() => setScriptSuccessMsg(false), 3000);
    }
  };

  // Logic block changes
  const handleAddLogicBlock = () => {
    const newBlock: LogicBlock = {
      id: 'blk_' + Math.random().toString(36).substring(2, 7),
      trigger: 'ON_START',
      action: 'MOVE',
      actionParams: { axis: 'x', amount: 5, speed: 2 }
    };
    const updatedBlocks = [...(levelData.logicBlocks || []), newBlock];
    const generatedScript = BasicScriptEngine.blocksToBasic(updatedBlocks);
    setScriptCode(generatedScript);
    setLevelData({
      ...levelData,
      logicBlocks: updatedBlocks,
      basicScript: generatedScript
    });
  };

  const handleSaveLevel = () => {
    soundEngine.playVictory();
    onSave(levelData);
    setStatusNotification(t.saveLevel + ' ✓');
    setTimeout(() => setStatusNotification(null), 3000);
  };

  const handlePublishLevel = () => {
    soundEngine.playVictory();
    onPublish(levelData);
    setStatusNotification(t.publishSuccess);
    setTimeout(() => setStatusNotification(null), 3000);
  };

  const handleExportJson = () => {
    const json = JSON.stringify(levelData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${levelData.title.toLowerCase().replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string);
        if (imported.objects && Array.isArray(imported.objects)) {
          setLevelData(imported);
          if (editorEngineRef.current) {
            editorEngineRef.current.levelData = imported;
            editorEngineRef.current.rebuildAllObjects();
          }
          setStatusNotification('Imported successfully!');
          setTimeout(() => setStatusNotification(null), 3000);
        }
      } catch {
        alert('Invalid JSON file format');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 text-white flex flex-col overflow-hidden select-none">
      {/* 3D Canvas Viewport */}
      <div className="relative flex-1 w-full h-full">
        <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />

        {/* Status Notification Toast */}
        {statusNotification && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 font-bold px-6 py-2 rounded-full shadow-2xl z-50 animate-in fade-in zoom-in-95 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            {statusNotification}
          </div>
        )}

        {/* Top Control Bar */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-30 pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              id="btn-editor-back"
              onClick={() => {
                if (isPlaytesting) stopPlaytest();
                onBack();
              }}
              className="px-3.5 py-2 bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-slate-700/80 rounded-xl text-slate-300 hover:text-white flex items-center gap-1.5 transition text-xs font-bold shadow-lg active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.saveAndBack}</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs font-bold shadow-lg">
              <span className="text-cyan-400">{levelData.title}</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">{levelData.objects.length} {t.itemCount}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            {!isPlaytesting ? (
              <button
                id="btn-editor-playtest"
                onClick={startPlaytest}
                className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 text-xs tracking-wider uppercase transition"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>{t.playtest}</span>
              </button>
            ) : (
              <button
                id="btn-editor-stop-playtest"
                onClick={stopPlaytest}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black rounded-xl flex items-center gap-2 shadow-lg active:scale-95 text-xs tracking-wider uppercase transition"
              >
                <Pause className="w-4 h-4 fill-slate-950" />
                <span>{t.stopPlaytest}</span>
              </button>
            )}

            {!isPlaytesting && (
              <>
                <button
                  id="btn-editor-save"
                  onClick={handleSaveLevel}
                  className="p-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-slate-300 hover:text-white transition active:scale-95 shadow-lg"
                  title={t.saveLevel}
                >
                  <Save className="w-4 h-4 text-cyan-400" />
                </button>

                <button
                  id="btn-editor-publish"
                  onClick={handlePublishLevel}
                  className="p-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-slate-300 hover:text-white transition active:scale-95 shadow-lg"
                  title={t.publishLevel}
                >
                  <Share2 className="w-4 h-4 text-emerald-400" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Playtest HUD Overlay */}
        {isPlaytesting && playtestGameRef.current && (
          <GameHUD
            levelData={levelData}
            settings={settings}
            gameTime={gameTime}
            gemsCollected={gemsCollected}
            totalGems={totalGems}
            speedBoostTimer={speedBoostTimer}
            isPaused={isGamePaused}
            hasWon={hasWon}
            hasDied={false}
            checkpointMsg={checkpointMsg}
            onJump={() => {
              if (playtestGameRef.current) playtestGameRef.current.jumpRequested = true;
            }}
            onDash={() => {
              if (playtestGameRef.current) playtestGameRef.current.dashRequested = true;
            }}
            onMoveInput={(x, y) => {
              if (playtestGameRef.current) {
                playtestGameRef.current.inputAxes.x = x;
                playtestGameRef.current.inputAxes.y = y;
              }
            }}
            onTogglePause={() => {
              if (playtestGameRef.current) {
                setIsGamePaused(playtestGameRef.current.togglePause());
              }
            }}
            onRestart={() => {
              playtestGameRef.current?.respawnPlayer();
              setHasWon(false);
            }}
            onExit={stopPlaytest}
          />
        )}
      </div>

      {/* Bottom Editor Tool Panel (When not playtesting) */}
      {!isPlaytesting && (
        <div className="bg-slate-900 border-t border-slate-800 p-3 md:p-4 z-40 max-h-72 overflow-y-auto">
          {/* Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <button
                id="tab-editor-palette"
                onClick={() => setActiveTab('palette')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                  activeTab === 'palette'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'text-slate-400 hover:text-white bg-slate-800'
                }`}
              >
                <Boxes className="w-3.5 h-3.5" />
                {t.palette}
              </button>

              <button
                id="tab-editor-properties"
                onClick={() => setActiveTab('properties')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                  activeTab === 'properties'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'text-slate-400 hover:text-white bg-slate-800'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                {t.properties} {selectedObject ? `(${selectedObject.type.replace('_', ' ')})` : ''}
              </button>

              <button
                id="tab-editor-logic"
                onClick={() => setActiveTab('logic')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                  activeTab === 'logic'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'text-slate-400 hover:text-white bg-slate-800'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                {t.logicEditor}
              </button>

              <button
                id="tab-editor-settings"
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                  activeTab === 'settings'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'text-slate-400 hover:text-white bg-slate-800'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                {t.levelName}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportJson}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-semibold flex items-center gap-1"
                title={t.exportJson}
              >
                <Download className="w-3 h-3" />
                <span className="hidden sm:inline">{t.exportJson}</span>
              </button>

              <label className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer">
                <Upload className="w-3 h-3" />
                <span className="hidden sm:inline">{t.importJson}</span>
                <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
              </label>
            </div>
          </div>

          {/* TAB CONTENT: Palette */}
          {activeTab === 'palette' && (
            <div className="space-y-3">
              {PALETTE_GROUPS.map((group) => (
                <div key={group.category}>
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    {group.category}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <button
                        key={item.type}
                        id={`btn-add-${item.type}`}
                        onClick={() => handleAddObject(item.type)}
                        className="px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow"
                      >
                        <span>{item.icon}</span>
                        <span>{t[item.labelKey as keyof typeof t] || item.type}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB CONTENT: Properties */}
          {activeTab === 'properties' && (
            <div>
              {selectedObject ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Position */}
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-xs font-bold text-slate-400 block mb-2">{t.position}</span>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      {['x', 'y', 'z'].map((axis) => (
                        <div key={axis} className="bg-slate-900 p-1.5 rounded border border-slate-800">
                          <span className="text-slate-500 uppercase font-mono">{axis}</span>
                          <div className="text-white font-bold my-1">
                            {selectedObject.position[axis as 'x' | 'y' | 'z']}
                          </div>
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() =>
                                handlePropertyChange({
                                  position: {
                                    ...selectedObject.position,
                                    [axis]: selectedObject.position[axis as 'x' | 'y' | 'z'] - 1
                                  }
                                })
                              }
                              className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono"
                            >
                              -
                            </button>
                            <button
                              onClick={() =>
                                handlePropertyChange({
                                  position: {
                                    ...selectedObject.position,
                                    [axis]: selectedObject.position[axis as 'x' | 'y' | 'z'] + 1
                                  }
                                })
                              }
                              className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Scale */}
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-xs font-bold text-slate-400 block mb-2">{t.scale}</span>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      {['x', 'y', 'z'].map((axis) => {
                        const curScale = selectedObject.scale || { x: 1, y: 1, z: 1 };
                        return (
                          <div key={axis} className="bg-slate-900 p-1.5 rounded border border-slate-800">
                            <span className="text-slate-500 uppercase font-mono">{axis}</span>
                            <div className="text-white font-bold my-1">
                              {curScale[axis as 'x' | 'y' | 'z']}
                            </div>
                            <div className="flex justify-center gap-1">
                              <button
                                onClick={() =>
                                  handlePropertyChange({
                                    scale: {
                                      ...curScale,
                                      [axis]: Math.max(0.5, curScale[axis as 'x' | 'y' | 'z'] - 0.5)
                                    }
                                  })
                                }
                                className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono"
                              >
                                -
                              </button>
                              <button
                                onClick={() =>
                                  handlePropertyChange({
                                    scale: {
                                      ...curScale,
                                      [axis]: curScale[axis as 'x' | 'y' | 'z'] + 0.5
                                    }
                                  })
                                }
                                className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Behavior Properties */}
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-xs font-bold text-slate-400 block mb-2">{t.properties}</span>
                    {selectedObject.type === 'platform_moving' && (
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span>{t.moveAxis}</span>
                          <select
                            value={selectedObject.properties?.moveAxis || 'x'}
                            onChange={(e) =>
                              handlePropertyChange({
                                properties: {
                                  ...selectedObject.properties,
                                  moveAxis: e.target.value as 'x' | 'y' | 'z'
                                }
                              })
                            }
                            className="bg-slate-900 border border-slate-700 rounded px-2 py-1"
                          >
                            <option value="x">X</option>
                            <option value="y">Y</option>
                            <option value="z">Z</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>{t.moveDist}</span>
                          <input
                            type="number"
                            value={selectedObject.properties?.moveDistance || 5}
                            onChange={(e) =>
                              handlePropertyChange({
                                properties: {
                                  ...selectedObject.properties,
                                  moveDistance: parseFloat(e.target.value) || 1
                                }
                              })
                            }
                            className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right"
                          />
                        </div>
                      </div>
                    )}

                    {selectedObject.type === 'platform_bouncy' && (
                      <div className="flex items-center justify-between text-xs">
                        <span>{t.bounciness}</span>
                        <input
                          type="number"
                          value={selectedObject.properties?.bounciness || 20}
                          onChange={(e) =>
                            handlePropertyChange({
                              properties: {
                                ...selectedObject.properties,
                                bounciness: parseFloat(e.target.value) || 10
                              }
                            })
                          }
                          className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right"
                        />
                      </div>
                    )}

                    {selectedObject.type === 'platform_conveyer' && (
                      <div className="flex items-center justify-between text-xs">
                        <span>{t.conveyerSpeed}</span>
                        <input
                          type="number"
                          value={selectedObject.properties?.conveyerSpeed || 6}
                          onChange={(e) =>
                            handlePropertyChange({
                              properties: {
                                ...selectedObject.properties,
                                conveyerSpeed: parseFloat(e.target.value) || 2
                              }
                            })
                          }
                          className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right"
                        />
                      </div>
                    )}

                    {selectedObject.type !== 'platform_moving' &&
                      selectedObject.type !== 'platform_bouncy' &&
                      selectedObject.type !== 'platform_conveyer' && (
                        <p className="text-slate-500 text-xs italic">Standard physics entity.</p>
                      )}
                  </div>

                  {/* Delete Button */}
                  <div className="flex flex-col justify-end">
                    <button
                      id="btn-editor-delete-obj"
                      onClick={handleDeleteObject}
                      className="py-2.5 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/60 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Object</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">
                  {t.selectAnObject}
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: Logic & BASIC Scripting */}
          {activeTab === 'logic' && (
            <div>
              {/* Dual Mode Switcher */}
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => setLogicMode('blocks')}
                  className={`px-3 py-1 rounded text-xs font-bold ${
                    logicMode === 'blocks'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {t.visualBlocks}
                </button>
                <button
                  onClick={() => setLogicMode('basic')}
                  className={`px-3 py-1 rounded text-xs font-bold ${
                    logicMode === 'basic'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {t.basicScript}
                </button>
              </div>

              {logicMode === 'blocks' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-semibold">Visual Trigger-Action Rules:</span>
                    <button
                      onClick={handleAddLogicBlock}
                      className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      {t.addBlock}
                    </button>
                  </div>

                  {levelData.logicBlocks && levelData.logicBlocks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {levelData.logicBlocks.map((blk, idx) => (
                        <div
                          key={blk.id}
                          className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="bg-purple-950 text-purple-300 font-bold px-2 py-0.5 rounded border border-purple-800">
                              WHEN {blk.trigger}
                            </span>
                            <span className="text-slate-500">➔</span>
                            <span className="bg-cyan-950 text-cyan-300 font-bold px-2 py-0.5 rounded border border-cyan-800">
                              DO {blk.action} ({blk.actionParams?.axis?.toUpperCase()} +{blk.actionParams?.amount})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-xs italic py-2">
                      No visual logic blocks created yet. Click "Add Logic Block" above!
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-semibold">BASIC Code Console:</span>
                    <button
                      onClick={handleValidateScript}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow"
                    >
                      <Zap className="w-3 h-3" />
                      {t.runScript}
                    </button>
                  </div>

                  <textarea
                    value={scriptCode}
                    onChange={(e) => setScriptCode(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-950 font-mono text-xs text-emerald-400 p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                    placeholder="10 MOVE X 5&#10;20 WAIT 1.5&#10;30 MOVE X -5&#10;40 GOTO 10"
                  />

                  {scriptSuccessMsg && (
                    <div className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      BASIC Script Compiled & Applied to Level!
                    </div>
                  )}

                  {scriptErrors.length > 0 && (
                    <div className="text-xs text-rose-400 font-bold space-y-1">
                      {scriptErrors.map((err, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {err}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: Level Settings */}
          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">{t.levelName}</label>
                <input
                  type="text"
                  value={levelData.title}
                  onChange={(e) => setLevelData({ ...levelData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">{t.theme}</label>
                <select
                  value={levelData.theme}
                  onChange={(e) =>
                    setLevelData({ ...levelData, theme: e.target.value as LevelData['theme'] })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-bold"
                >
                  <option value="neon">{t.theme_neon}</option>
                  <option value="cyber">{t.theme_cyber}</option>
                  <option value="crystal">{t.theme_crystal}</option>
                  <option value="inferno">{t.theme_inferno}</option>
                  <option value="cosmic">{t.theme_cosmic}</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">{t.parTime} (sec)</label>
                <input
                  type="number"
                  value={levelData.parTime || 30}
                  onChange={(e) =>
                    setLevelData({ ...levelData, parTime: parseFloat(e.target.value) || 30 })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-bold"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
