import { Achievement, SkinOption, TrailOption } from '../types/game';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_jump',
    titleEn: 'First Steps',
    titleEs: 'Primeros Pasos',
    descEn: 'Complete your very first level.',
    descEs: 'Completa tu primer nivel.',
    icon: 'Footprints',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    rewardSkin: 'skin_cyber_blue'
  },
  {
    id: 'gem_collector_10',
    titleEn: 'Gem Enthusiast',
    titleEs: 'Entusiasta de Gemas',
    descEn: 'Collect 15 Energy Gems in total.',
    descEs: 'Recolecta 15 Gemas de Energía en total.',
    icon: 'Sparkles',
    unlocked: false,
    progress: 0,
    maxProgress: 15,
    rewardTrail: 'trail_gold'
  },
  {
    id: 'speedrunner',
    titleEn: 'Sonic Velocity',
    titleEs: 'Velocidad Sónica',
    descEn: 'Beat any level faster than its Par Time.',
    descEs: 'Supera cualquier nivel por debajo de su Tiempo Objetivo.',
    icon: 'Zap',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    rewardSkin: 'skin_neon_yellow'
  },
  {
    id: 'level_architect',
    titleEn: 'Master Architect',
    titleEs: 'Arquitecto Maestro',
    descEn: 'Create and save your first custom level in the 3D Studio.',
    descEs: 'Crea y guarda tu primer nivel personalizado en el Estudio 3D.',
    icon: 'Hammer',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    rewardTrail: 'trail_plasma_cyan'
  },
  {
    id: 'script_wizard',
    titleEn: 'Logic Hacker',
    titleEs: 'Hacker de Lógica',
    descEn: 'Use Visual Blocks or BASIC scripting in a level.',
    descEs: 'Usa Bloques Visuales o código BASIC en un nivel.',
    icon: 'Code',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    rewardSkin: 'skin_matrix_green'
  },
  {
    id: 'community_star',
    titleEn: 'Community Voter',
    titleEs: 'Votante Comunitario',
    descEn: 'Play and vote on a community map from the cloud.',
    descEs: 'Juega y vota un mapa comunitario de la nube.',
    icon: 'Heart',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    rewardSkin: 'skin_ruby_red'
  },
  {
    id: 'flawless_run',
    titleEn: 'Flawless Acrobatic',
    titleEs: 'Acróbata Impecable',
    descEn: 'Complete any level without dying once.',
    descEs: 'Completa cualquier nivel sin morir ni una sola vez.',
    icon: 'ShieldCheck',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    rewardTrail: 'trail_rainbow'
  },
  {
    id: 'campaign_conqueror',
    titleEn: 'Grand Champion',
    titleEs: 'Gran Campeón',
    descEn: 'Complete all 5 Campaign levels.',
    descEs: 'Completa los 5 niveles de la Campaña.',
    icon: 'Trophy',
    unlocked: false,
    progress: 0,
    maxProgress: 5,
    rewardSkin: 'skin_cosmic_void'
  }
];

export const SKINS_LIST: SkinOption[] = [
  {
    id: 'skin_default',
    nameEn: 'Cyber Core (Default)',
    nameEs: 'Núcleo Cyber (Predeterminado)',
    color: '#06b6d4', // Cyan
    glowColor: '#38bdf8',
    metalness: 0.7,
    unlocked: true,
    unlockRequirement: 'Default'
  },
  {
    id: 'skin_cyber_blue',
    nameEn: 'Cobalt Pulse',
    nameEs: 'Pulso de Cobalto',
    color: '#3b82f6', // Blue
    glowColor: '#60a5fa',
    metalness: 0.8,
    unlocked: false,
    unlockRequirement: 'Complete First Level'
  },
  {
    id: 'skin_neon_yellow',
    nameEn: 'Volt Lightning',
    nameEs: 'Relámpago Volt',
    color: '#eab308', // Yellow
    glowColor: '#facc15',
    metalness: 0.6,
    unlocked: false,
    unlockRequirement: 'Beat Par Time'
  },
  {
    id: 'skin_matrix_green',
    nameEn: 'Matrix Glitch',
    nameEs: 'Glitch Matrix',
    color: '#22c55e', // Green
    glowColor: '#4ade80',
    metalness: 0.5,
    unlocked: false,
    unlockRequirement: 'Use Logic Scripting'
  },
  {
    id: 'skin_ruby_red',
    nameEn: 'Crimson Plasma',
    nameEs: 'Plasma Carmesí',
    color: '#ef4444', // Red
    glowColor: '#f87171',
    metalness: 0.9,
    unlocked: false,
    unlockRequirement: 'Vote on Community Map'
  },
  {
    id: 'skin_cosmic_void',
    nameEn: 'Cosmic Singularity',
    nameEs: 'Singularidad Cósmica',
    color: '#a855f7', // Purple / Dark
    glowColor: '#d8b4fe',
    metalness: 1.0,
    unlocked: false,
    unlockRequirement: 'Complete All Campaign Levels'
  }
];

export const TRAILS_LIST: TrailOption[] = [
  {
    id: 'trail_cyan',
    nameEn: 'Cyan Sparks',
    nameEs: 'Chispas Cian',
    color: '#06b6d4',
    unlocked: true,
    unlockRequirement: 'Default'
  },
  {
    id: 'trail_gold',
    nameEn: 'Golden Stardust',
    nameEs: 'Polvo Estelar Dorado',
    color: '#f59e0b',
    unlocked: false,
    unlockRequirement: 'Collect 15 Gems'
  },
  {
    id: 'trail_plasma_cyan',
    nameEn: 'Neon Hyper-Drive',
    nameEs: 'Híper-Propulsor Neón',
    color: '#00f0ff',
    unlocked: false,
    unlockRequirement: 'Create Custom Level'
  },
  {
    id: 'trail_rainbow',
    nameEn: 'Prismatic Aurora',
    nameEs: 'Aurora Prismática',
    color: '#ec4899',
    unlocked: false,
    unlockRequirement: 'Flawless Level Run'
  }
];
