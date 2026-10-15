import {
  GameSettings,
  LevelRecord,
  PlayerStats,
  Achievement,
  LevelData,
  LeaderboardEntry
} from '../types/game';
import { INITIAL_ACHIEVEMENTS } from './achievements';
import { CAMPAIGN_LEVELS } from './campaignLevels';

const STORAGE_SETTINGS = 'playcanvas_platformer_settings';
const STORAGE_STATS = 'playcanvas_platformer_stats';
const STORAGE_RECORDS = 'playcanvas_platformer_records';
const STORAGE_ACHIEVEMENTS = 'playcanvas_platformer_achievements';
const STORAGE_CUSTOM_LEVELS = 'playcanvas_platformer_custom_levels';
const STORAGE_COMMUNITY_LEVELS = 'playcanvas_platformer_community_levels';
const STORAGE_LEADERBOARD = 'playcanvas_platformer_leaderboard';

const DEFAULT_SETTINGS: GameSettings = {
  language: 'es',
  musicVolume: 0.6,
  sfxVolume: 0.7,
  quality: 'high',
  pixelMode: 'ultra_8bit',
  crtScanlines: true,
  retroChiptuneMode: true,
  touchControls: false,
  cameraSensitivity: 1.0,
  invertY: false,
  selectedSkin: 'skin_default',
  selectedTrail: 'trail_cyan'
};

const DEFAULT_STATS: PlayerStats = {
  totalGems: 0,
  levelsCompleted: 0,
  starsEarned: 0,
  totalDeaths: 0,
  totalPlayTime: 0,
  levelsCreated: 0
};

const SEED_COMMUNITY_LEVELS: LevelData[] = [
  {
    id: 'comm_1',
    title: 'Neon Skyscraper Rush',
    description: 'A fast-paced parkour map made with moving vertical platforms and laser gauntlets.',
    author: 'CyberRunner99',
    theme: 'neon',
    createdAt: '2026-08-20',
    likes: 42,
    plays: 156,
    rating: 4.8,
    userVoted: 'none',
    parTime: 30,
    gemTarget: 7,
    objects: [
      { id: 's1', type: 'start', position: { x: 0, y: 1.5, z: 0 } },
      { id: 'p1', type: 'platform_normal', position: { x: 0, y: 0, z: 0 }, scale: { x: 6, y: 1, z: 6 } },
      { id: 'p2', type: 'platform_bouncy', position: { x: 0, y: 0, z: -8 }, scale: { x: 4, y: 1, z: 4 }, properties: { bounciness: 20 } },
      { id: 'g1', type: 'collectible_gem', position: { x: 0, y: 4, z: -8 } },
      { id: 'p3', type: 'platform_moving', position: { x: 0, y: 6, z: -18 }, scale: { x: 4, y: 0.8, z: 4 }, properties: { moveAxis: 'x', moveDistance: 6, moveSpeed: 3 } },
      { id: 'g2', type: 'collectible_gem', position: { x: 0, y: 7.5, z: -18 } },
      { id: 'cp1', type: 'checkpoint', position: { x: 0, y: 7, z: -26 } },
      { id: 'p4', type: 'platform_normal', position: { x: 0, y: 6, z: -26 }, scale: { x: 6, y: 1, z: 6 } },
      { id: 'p5', type: 'platform_conveyer', position: { x: 0, y: 6, z: -38 }, scale: { x: 4, y: 0.8, z: 12 }, properties: { conveyerSpeed: 7 } },
      { id: 'sp1', type: 'hazard_spinner', position: { x: 0, y: 7.2, z: -38 }, properties: { moveSpeed: 3 } },
      { id: 'g3', type: 'collectible_gem', position: { x: 0, y: 7.5, z: -34 } },
      { id: 'p6', type: 'platform_normal', position: { x: 0, y: 8, z: -50 }, scale: { x: 8, y: 1.5, z: 8 } },
      { id: 'star1', type: 'collectible_star', position: { x: 0, y: 10.5, z: -50 } },
      { id: 'goal1', type: 'goal', position: { x: 0, y: 9.5, z: -52 } }
    ]
  },
  {
    id: 'comm_2',
    title: 'Laser Labyrinth 3D',
    description: 'Precision timing is required to dodge oscillating laser traps and crumbling floorboards.',
    author: 'QuantumArchitect',
    theme: 'inferno',
    createdAt: '2026-08-22',
    likes: 68,
    plays: 230,
    rating: 4.9,
    userVoted: 'none',
    parTime: 38,
    gemTarget: 8,
    objects: [
      { id: 's1', type: 'start', position: { x: 0, y: 1.5, z: 0 } },
      { id: 'p1', type: 'platform_normal', position: { x: 0, y: 0, z: 0 }, scale: { x: 5, y: 1, z: 5 } },
      { id: 'l1', type: 'hazard_laser', position: { x: 0, y: 1.5, z: -8 }, properties: { laserPeriod: 2.5, laserDuration: 1.2 } },
      { id: 'p2', type: 'platform_normal', position: { x: 0, y: 0, z: -8 }, scale: { x: 5, y: 1, z: 5 } },
      { id: 'g1', type: 'collectible_gem', position: { x: 0, y: 1.5, z: -8 } },
      { id: 'p3_c', type: 'platform_collapsing', position: { x: 0, y: 1, z: -16 }, scale: { x: 3, y: 0.6, z: 3 } },
      { id: 'p4_c', type: 'platform_collapsing', position: { x: 0, y: 2, z: -22 }, scale: { x: 3, y: 0.6, z: 3 } },
      { id: 'cp1', type: 'checkpoint', position: { x: 0, y: 4.5, z: -30 } },
      { id: 'p5', type: 'platform_normal', position: { x: 0, y: 3, z: -30 }, scale: { x: 6, y: 1, z: 6 } },
      { id: 'stomper1', type: 'hazard_stomper', position: { x: 0, y: 6.5, z: -30 }, properties: { moveDistance: 3, moveSpeed: 3 } },
      { id: 'p6_goal', type: 'platform_normal', position: { x: 0, y: 5, z: -42 }, scale: { x: 8, y: 1, z: 8 } },
      { id: 'goal1', type: 'goal', position: { x: 0, y: 6.5, z: -44 } },
      { id: 'star1', type: 'collectible_star', position: { x: 0, y: 7.5, z: -42 } }
    ]
  },
  {
    id: 'comm_3',
    title: 'Gravity Zenith & Nitro',
    description: 'Triple speed boost chain into high-air floating rings and bouncy cosmic pads.',
    author: 'AcrobatX',
    theme: 'cosmic',
    createdAt: '2026-08-23',
    likes: 85,
    plays: 310,
    rating: 5.0,
    userVoted: 'none',
    parTime: 28,
    gemTarget: 9,
    objects: [
      { id: 's1', type: 'start', position: { x: 0, y: 1.5, z: 0 } },
      { id: 'p1', type: 'platform_normal', position: { x: 0, y: 0, z: 0 }, scale: { x: 6, y: 1, z: 6 } },
      { id: 'nitro1', type: 'collectible_speed', position: { x: 0, y: 1.5, z: -2 } },
      { id: 'p2_b', type: 'platform_bouncy', position: { x: 0, y: 0, z: -10 }, scale: { x: 4, y: 0.8, z: 4 }, properties: { bounciness: 25 } },
      { id: 'ring1', type: 'prop_ring', position: { x: 0, y: 8, z: -15 } },
      { id: 'p3_b', type: 'platform_bouncy', position: { x: 0, y: 8, z: -22 }, scale: { x: 4, y: 0.8, z: 4 }, properties: { bounciness: 24 } },
      { id: 'ring2', type: 'prop_ring', position: { x: 0, y: 16, z: -28 } },
      { id: 'p4', type: 'platform_normal', position: { x: 0, y: 18, z: -40 }, scale: { x: 8, y: 1.5, z: 8 } },
      { id: 'star1', type: 'collectible_star', position: { x: 0, y: 20.5, z: -40 } },
      { id: 'goal1', type: 'goal', position: { x: 0, y: 19.5, z: -42 } }
    ]
  }
];

const SEED_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'lb_1',
    playerName: 'HyperSonic_99',
    levelId: 'campaign_1',
    levelTitle: 'Neon Island Hop',
    time: 14.82,
    gems: 6,
    stars: 3,
    date: '2026-08-22',
    avatar: '🚀'
  },
  {
    id: 'lb_2',
    playerName: 'Valkyrie_Pro',
    levelId: 'campaign_1',
    levelTitle: 'Neon Island Hop',
    time: 16.45,
    gems: 6,
    stars: 3,
    date: '2026-08-23',
    avatar: '⚡'
  },
  {
    id: 'lb_3',
    playerName: 'PixelMaster',
    levelId: 'campaign_2',
    levelTitle: 'Cyber Velocity',
    time: 21.30,
    gems: 8,
    stars: 3,
    date: '2026-08-21',
    avatar: '🎮'
  },
  {
    id: 'lb_4',
    playerName: 'GravityKnight',
    levelId: 'campaign_3',
    levelTitle: 'Crystal Spire',
    time: 27.90,
    gems: 9,
    stars: 3,
    date: '2026-08-20',
    avatar: '💎'
  },
  {
    id: 'lb_5',
    playerName: 'ZeroLatency',
    levelId: 'campaign_4',
    levelTitle: 'Inferno Factory',
    time: 31.15,
    gems: 10,
    stars: 3,
    date: '2026-08-23',
    avatar: '🔥'
  }
];

class StorageManager {
  public getSettings(): GameSettings {
    try {
      const data = localStorage.getItem(STORAGE_SETTINGS);
      if (data) return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  }

  public saveSettings(settings: GameSettings) {
    try {
      localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }

  public getStats(): PlayerStats {
    try {
      const data = localStorage.getItem(STORAGE_STATS);
      if (data) return { ...DEFAULT_STATS, ...JSON.parse(data) };
    } catch {
      // ignore
    }
    return DEFAULT_STATS;
  }

  public saveStats(stats: PlayerStats) {
    try {
      localStorage.setItem(STORAGE_STATS, JSON.stringify(stats));
    } catch {
      // ignore
    }
  }

  public getRecords(): Record<string, LevelRecord> {
    try {
      const data = localStorage.getItem(STORAGE_RECORDS);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return {};
  }

  public saveLevelRecord(levelId: string, record: LevelRecord) {
    const records = this.getRecords();
    const existing = records[levelId];
    if (!existing || record.bestTime < existing.bestTime || record.stars > existing.stars) {
      records[levelId] = {
        completed: true,
        bestTime: existing ? Math.min(existing.bestTime, record.bestTime) : record.bestTime,
        gemsCollected: existing ? Math.max(existing.gemsCollected, record.gemsCollected) : record.gemsCollected,
        totalGems: record.totalGems,
        stars: existing ? Math.max(existing.stars, record.stars) : record.stars
      };
      try {
        localStorage.setItem(STORAGE_RECORDS, JSON.stringify(records));
      } catch {
        // ignore
      }
    }
    return records[levelId];
  }

  public getAchievements(): Achievement[] {
    try {
      const data = localStorage.getItem(STORAGE_ACHIEVEMENTS);
      if (data) {
        const stored: Achievement[] = JSON.parse(data);
        return INITIAL_ACHIEVEMENTS.map(initial => {
          const match = stored.find(s => s.id === initial.id);
          return match ? { ...initial, unlocked: match.unlocked, progress: match.progress } : initial;
        });
      }
    } catch {
      // ignore
    }
    return INITIAL_ACHIEVEMENTS;
  }

  public updateAchievement(id: string, increment = 1): { achievement: Achievement; newlyUnlocked: boolean } | null {
    const list = this.getAchievements();
    const target = list.find(a => a.id === id);
    if (!target) return null;

    const previouslyUnlocked = target.unlocked;
    target.progress = Math.min(target.maxProgress, target.progress + increment);
    if (target.progress >= target.maxProgress) {
      target.unlocked = true;
    }

    try {
      localStorage.setItem(STORAGE_ACHIEVEMENTS, JSON.stringify(list));
    } catch {
      // ignore
    }

    return {
      achievement: target,
      newlyUnlocked: !previouslyUnlocked && target.unlocked
    };
  }

  public getCustomLevels(): LevelData[] {
    try {
      const data = localStorage.getItem(STORAGE_CUSTOM_LEVELS);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return [];
  }

  public saveCustomLevel(level: LevelData): LevelData[] {
    const levels = this.getCustomLevels();
    const index = levels.findIndex(l => l.id === level.id);
    if (index >= 0) {
      levels[index] = level;
    } else {
      levels.unshift(level);
    }
    try {
      localStorage.setItem(STORAGE_CUSTOM_LEVELS, JSON.stringify(levels));
    } catch {
      // ignore
    }
    return levels;
  }

  public deleteCustomLevel(levelId: string): LevelData[] {
    const levels = this.getCustomLevels().filter(l => l.id !== levelId);
    try {
      localStorage.setItem(STORAGE_CUSTOM_LEVELS, JSON.stringify(levels));
    } catch {
      // ignore
    }
    return levels;
  }

  public getCommunityLevels(): LevelData[] {
    try {
      const data = localStorage.getItem(STORAGE_COMMUNITY_LEVELS);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return SEED_COMMUNITY_LEVELS;
  }

  public publishToCommunity(level: LevelData): LevelData[] {
    const list = this.getCommunityLevels();
    const communityEntry: LevelData = {
      ...level,
      id: 'comm_' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
      likes: 1,
      plays: 1,
      rating: 5.0,
      userVoted: 'like'
    };
    list.unshift(communityEntry);
    try {
      localStorage.setItem(STORAGE_COMMUNITY_LEVELS, JSON.stringify(list));
    } catch {
      // ignore
    }
    return list;
  }

  public voteCommunityLevel(levelId: string, isLike: boolean): LevelData[] {
    const list = this.getCommunityLevels();
    const target = list.find(l => l.id === levelId);
    if (target) {
      if (target.userVoted === (isLike ? 'like' : 'none')) {
        // Toggle off
        target.userVoted = 'none';
        target.likes = Math.max(0, (target.likes || 0) - 1);
      } else {
        target.userVoted = 'like';
        target.likes = (target.likes || 0) + 1;
      }
      try {
        localStorage.setItem(STORAGE_COMMUNITY_LEVELS, JSON.stringify(list));
      } catch {
        // ignore
      }
    }
    return list;
  }

  public getLeaderboard(): LeaderboardEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_LEADERBOARD);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return SEED_LEADERBOARD;
  }

  public addLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id' | 'date'>): LeaderboardEntry[] {
    const list = this.getLeaderboard();
    const newEntry: LeaderboardEntry = {
      ...entry,
      id: 'lb_' + Date.now(),
      date: new Date().toISOString().split('T')[0]
    };
    list.push(newEntry);
    list.sort((a, b) => a.time - b.time);
    try {
      localStorage.setItem(STORAGE_LEADERBOARD, JSON.stringify(list.slice(0, 30)));
    } catch {
      // ignore
    }
    return list;
  }
}

export const storage = new StorageManager();
