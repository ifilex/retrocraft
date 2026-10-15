export type Language = 'en' | 'es';

export type QualityLevel = 'low' | 'medium' | 'high';
export type PixelMode = 'ultra_8bit' | 'classic_16bit' | 'modern';

export interface GameSettings {
  language: Language;
  musicVolume: number;
  sfxVolume: number;
  quality: QualityLevel;
  pixelMode: PixelMode;
  crtScanlines: boolean;
  retroChiptuneMode: boolean;
  touchControls: boolean;
  cameraSensitivity: number;
  invertY: boolean;
  selectedSkin: string;
  selectedTrail: string;
}

export type ObjectType =
  | 'start'
  | 'goal'
  | 'checkpoint'
  | 'platform_normal'
  | 'platform_ice'
  | 'platform_bouncy'
  | 'platform_conveyer'
  | 'platform_collapsing'
  | 'platform_moving'
  | 'hazard_spikes'
  | 'hazard_laser'
  | 'hazard_stomper'
  | 'hazard_spinner'
  | 'collectible_gem'
  | 'collectible_key'
  | 'collectible_star'
  | 'collectible_speed'
  | 'prop_pillar'
  | 'prop_arch'
  | 'prop_ring';

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface LevelObject {
  id: string;
  type: ObjectType;
  position: Vector3D;
  rotation?: Vector3D;
  scale?: Vector3D;
  color?: string;
  properties?: {
    moveDistance?: number;
    moveSpeed?: number;
    moveAxis?: 'x' | 'y' | 'z';
    laserPeriod?: number;
    laserDuration?: number;
    bounciness?: number;
    conveyerSpeed?: number;
    scriptId?: string;
    targetId?: string;
    customName?: string;
  };
}

export type BlockTrigger = 'ON_START' | 'ON_TOUCH' | 'ON_TIMER' | 'ON_COLLECT_ALL';
export type BlockAction = 'MOVE' | 'ROTATE' | 'TOGGLE_ACTIVE' | 'PLAY_SOUND' | 'WIN_GAME' | 'TELEPORT';

export interface LogicBlock {
  id: string;
  trigger: BlockTrigger;
  triggerParam?: string; // e.g. timer seconds or objectId
  action: BlockAction;
  targetObjectId?: string;
  actionParams?: {
    axis?: 'x' | 'y' | 'z';
    amount?: number;
    speed?: number;
    soundName?: string;
    teleportPos?: Vector3D;
  };
}

export interface LevelData {
  id: string;
  title: string;
  description: string;
  author: string;
  theme: 'neon' | 'cyber' | 'crystal' | 'inferno' | 'cosmic';
  objects: LevelObject[];
  logicBlocks?: LogicBlock[];
  basicScript?: string;
  parTime?: number; // in seconds for 3-star rating
  gemTarget?: number;
  gravity?: number;
  bgGradient?: string[];
  createdAt?: string;
  likes?: number;
  plays?: number;
  rating?: number;
  userVoted?: 'like' | 'none';
}

export interface Achievement {
  id: string;
  titleEn: string;
  titleEs: string;
  descEn: string;
  descEs: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  rewardSkin?: string;
  rewardTrail?: string;
}

export interface PlayerStats {
  totalGems: number;
  levelsCompleted: number;
  starsEarned: number;
  totalDeaths: number;
  totalPlayTime: number; // in seconds
  levelsCreated: number;
}

export interface LevelRecord {
  completed: boolean;
  bestTime: number;
  gemsCollected: number;
  totalGems: number;
  stars: number; // 0 to 3
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  levelId: string;
  levelTitle: string;
  time: number;
  gems: number;
  stars: number;
  date: string;
  avatar: string;
}

export interface SkinOption {
  id: string;
  nameEn: string;
  nameEs: string;
  color: string;
  glowColor: string;
  metalness: number;
  unlocked: boolean;
  unlockRequirement: string;
}

export interface TrailOption {
  id: string;
  nameEn: string;
  nameEs: string;
  color: string;
  unlocked: boolean;
  unlockRequirement: string;
}
