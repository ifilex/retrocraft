import { LevelData } from '../types/game';

export const CAMPAIGN_LEVELS: LevelData[] = [
  {
    id: 'campaign_1',
    title: 'Neon Island Hop',
    description: 'Master the physics of jumping, double jumping, and momentum across floating cyber islands.',
    author: 'Studio Core',
    theme: 'neon',
    parTime: 25,
    gemTarget: 6,
    objects: [
      { id: 'start_1', type: 'start', position: { x: 0, y: 1.5, z: 0 } },
      // Platform 1
      { id: 'p1', type: 'platform_normal', position: { x: 0, y: 0, z: 0 }, scale: { x: 6, y: 1, z: 6 } },
      { id: 'gem_1', type: 'collectible_gem', position: { x: 0, y: 1.5, z: -2 } },

      // Platform 2 (Bouncy)
      { id: 'p2', type: 'platform_bouncy', position: { x: 0, y: 0, z: -10 }, scale: { x: 4, y: 1, z: 4 }, properties: { bounciness: 18 } },
      { id: 'gem_2', type: 'collectible_gem', position: { x: 0, y: 4, z: -10 } },

      // Platform 3 (Elevated)
      { id: 'p3', type: 'platform_normal', position: { x: 0, y: 5, z: -20 }, scale: { x: 6, y: 1, z: 6 } },
      { id: 'gem_3', type: 'collectible_gem', position: { x: 2, y: 6.5, z: -20 } },
      { id: 'gem_4', type: 'collectible_gem', position: { x: -2, y: 6.5, z: -20 } },

      // Checkpoint
      { id: 'cp1', type: 'checkpoint', position: { x: 0, y: 6.5, z: -22 } },

      // Platform 4 (Moving)
      {
        id: 'p4_move',
        type: 'platform_moving',
        position: { x: 0, y: 5, z: -32 },
        scale: { x: 4, y: 0.8, z: 4 },
        properties: { moveAxis: 'x', moveDistance: 6, moveSpeed: 2.5 }
      },
      { id: 'gem_5', type: 'collectible_gem', position: { x: 0, y: 6.5, z: -32 } },

      // Final Platform with Goal
      { id: 'p5', type: 'platform_normal', position: { x: 0, y: 6, z: -44 }, scale: { x: 8, y: 1, z: 8 } },
      { id: 'gem_6', type: 'collectible_star', position: { x: 0, y: 8, z: -44 } },
      { id: 'goal_1', type: 'goal', position: { x: 0, y: 7.5, z: -46 } },

      // Props
      { id: 'pillar_1', type: 'prop_pillar', position: { x: -3.5, y: 1, z: 0 }, scale: { x: 0.8, y: 3, z: 0.8 } },
      { id: 'pillar_2', type: 'prop_pillar', position: { x: 3.5, y: 1, z: 0 }, scale: { x: 0.8, y: 3, z: 0.8 } },
      { id: 'arch_1', type: 'prop_arch', position: { x: 0, y: 7, z: -42 }, scale: { x: 1.2, y: 1.2, z: 1.2 } },
    ]
  },
  {
    id: 'campaign_2',
    title: 'Cyber Velocity',
    description: 'High-speed conveyers, ice bridges, and rotating hazards test your dash reflexes.',
    author: 'Studio Core',
    theme: 'cyber',
    parTime: 32,
    gemTarget: 8,
    objects: [
      { id: 'start_2', type: 'start', position: { x: 0, y: 1.5, z: 0 } },
      { id: 'p1_c2', type: 'platform_normal', position: { x: 0, y: 0, z: 0 }, scale: { x: 5, y: 1, z: 5 } },
      
      // Speed Boost Item
      { id: 'speed_1', type: 'collectible_speed', position: { x: 0, y: 1.5, z: -1.5 } },

      // Conveyer Strip
      { id: 'p2_conv', type: 'platform_conveyer', position: { x: 0, y: 0, z: -12 }, scale: { x: 4, y: 0.8, z: 12 }, properties: { conveyerSpeed: 8 } },
      { id: 'gem_c2_1', type: 'collectible_gem', position: { x: 0, y: 1.5, z: -8 } },
      { id: 'gem_c2_2', type: 'collectible_gem', position: { x: 0, y: 1.5, z: -14 } },

      // Rotating Hazard Spinner
      { id: 'hazard_spin_1', type: 'hazard_spinner', position: { x: 0, y: 1.2, z: -12 }, properties: { moveSpeed: 2 } },

      // Middle Island with Checkpoint
      { id: 'p3_c2', type: 'platform_normal', position: { x: 0, y: 0, z: -24 }, scale: { x: 6, y: 1, z: 6 } },
      { id: 'cp2_c2', type: 'checkpoint', position: { x: 0, y: 1.5, z: -24 } },

      // Ice Bridge with Spikes
      { id: 'p4_ice', type: 'platform_ice', position: { x: 0, y: 0, z: -35 }, scale: { x: 3, y: 0.8, z: 12 } },
      { id: 'spikes_1', type: 'hazard_spikes', position: { x: -0.8, y: 0.8, z: -33 } },
      { id: 'spikes_2', type: 'hazard_spikes', position: { x: 0.8, y: 0.8, z: -37 } },
      { id: 'gem_c2_3', type: 'collectible_gem', position: { x: 0, y: 1.5, z: -35 } },

      // Moving vertical platform
      { id: 'p5_vert', type: 'platform_moving', position: { x: 0, y: 2, z: -46 }, scale: { x: 4, y: 0.8, z: 4 }, properties: { moveAxis: 'y', moveDistance: 5, moveSpeed: 2 } },
      { id: 'gem_c2_4', type: 'collectible_gem', position: { x: 0, y: 3.5, z: -46 } },

      // Goal Platform
      { id: 'p6_goal', type: 'platform_normal', position: { x: 0, y: 7, z: -56 }, scale: { x: 8, y: 1, z: 8 } },
      { id: 'star_c2', type: 'collectible_star', position: { x: 0, y: 9, z: -56 } },
      { id: 'goal_c2', type: 'goal', position: { x: 0, y: 8.5, z: -58 } },
    ]
  },
  {
    id: 'campaign_3',
    title: 'Crystal Spire',
    description: 'Ascend a towering crystalline summit with collapsing platforms and spring boosts.',
    author: 'Studio Core',
    theme: 'crystal',
    parTime: 40,
    gemTarget: 9,
    objects: [
      { id: 'start_3', type: 'start', position: { x: 0, y: 1.5, z: 0 } },
      { id: 'p1_s3', type: 'platform_normal', position: { x: 0, y: 0, z: 0 }, scale: { x: 6, y: 1, z: 6 } },

      // Collapsing steps 1 & 2
      { id: 'p_col1', type: 'platform_collapsing', position: { x: 0, y: 2, z: -7 }, scale: { x: 3, y: 0.6, z: 3 } },
      { id: 'gem_s3_1', type: 'collectible_gem', position: { x: 0, y: 3.5, z: -7 } },

      { id: 'p_col2', type: 'platform_collapsing', position: { x: 4, y: 4, z: -12 }, scale: { x: 3, y: 0.6, z: 3 } },
      { id: 'gem_s3_2', type: 'collectible_gem', position: { x: 4, y: 5.5, z: -12 } },

      // Spring Launch to Upper Level
      { id: 'p_spring', type: 'platform_bouncy', position: { x: 0, y: 5, z: -18 }, scale: { x: 4, y: 0.8, z: 4 }, properties: { bounciness: 24 } },
      { id: 'gem_s3_3', type: 'collectible_gem', position: { x: 0, y: 11, z: -18 } },

      // Checkpoint High
      { id: 'p_mid', type: 'platform_normal', position: { x: 0, y: 14, z: -26 }, scale: { x: 6, y: 1, z: 6 } },
      { id: 'cp_s3', type: 'checkpoint', position: { x: 0, y: 15.5, z: -26 } },

      // Moving platforms over the abyss
      { id: 'p_m1', type: 'platform_moving', position: { x: -6, y: 15, z: -35 }, scale: { x: 3.5, y: 0.8, z: 3.5 }, properties: { moveAxis: 'x', moveDistance: 8, moveSpeed: 2.2 } },
      { id: 'gem_s3_4', type: 'collectible_gem', position: { x: -6, y: 16.5, z: -35 } },

      { id: 'p_m2', type: 'platform_moving', position: { x: 0, y: 17, z: -44 }, scale: { x: 3.5, y: 0.8, z: 3.5 }, properties: { moveAxis: 'z', moveDistance: 6, moveSpeed: 2.5 } },
      { id: 'gem_s3_5', type: 'collectible_gem', position: { x: 0, y: 18.5, z: -44 } },

      // Spire Peak
      { id: 'p_peak', type: 'platform_normal', position: { x: 0, y: 20, z: -55 }, scale: { x: 8, y: 1.5, z: 8 } },
      { id: 'star_s3', type: 'collectible_star', position: { x: 0, y: 22.5, z: -55 } },
      { id: 'goal_s3', type: 'goal', position: { x: 0, y: 21.5, z: -57 } },

      { id: 'ring_1', type: 'prop_ring', position: { x: 0, y: 21, z: -50 } },
    ]
  },
  {
    id: 'campaign_4',
    title: 'Inferno Factory',
    description: 'Survive crushing stompers and periodic laser barriers inside the automated forge.',
    author: 'Studio Core',
    theme: 'inferno',
    parTime: 45,
    gemTarget: 10,
    objects: [
      { id: 'start_4', type: 'start', position: { x: 0, y: 1.5, z: 0 } },
      { id: 'p1_inf', type: 'platform_normal', position: { x: 0, y: 0, z: 0 }, scale: { x: 6, y: 1, z: 6 } },

      // Stomper 1
      { id: 'p2_inf', type: 'platform_normal', position: { x: 0, y: 0, z: -10 }, scale: { x: 4, y: 1, z: 8 } },
      { id: 'stomper_1', type: 'hazard_stomper', position: { x: 0, y: 3.5, z: -10 }, properties: { moveDistance: 3, moveSpeed: 3 } },
      { id: 'gem_inf_1', type: 'collectible_gem', position: { x: 0, y: 1.5, z: -10 } },

      // Laser Gate 1
      { id: 'p3_inf', type: 'platform_normal', position: { x: 0, y: 0, z: -20 }, scale: { x: 5, y: 1, z: 5 } },
      { id: 'laser_1', type: 'hazard_laser', position: { x: 0, y: 1.5, z: -20 }, properties: { laserPeriod: 3, laserDuration: 1.5 } },
      { id: 'cp_inf', type: 'checkpoint', position: { x: 2, y: 1.5, z: -20 } },

      // Conveyer with multiple stompers
      { id: 'p4_inf_conv', type: 'platform_conveyer', position: { x: 0, y: 0, z: -32 }, scale: { x: 4, y: 0.8, z: 14 }, properties: { conveyerSpeed: 7 } },
      { id: 'stomper_2', type: 'hazard_stomper', position: { x: 0, y: 3.5, z: -29 }, properties: { moveDistance: 3, moveSpeed: 3.5 } },
      { id: 'stomper_3', type: 'hazard_stomper', position: { x: 0, y: 3.5, z: -35 }, properties: { moveDistance: 3, moveSpeed: 3 } },
      { id: 'gem_inf_2', type: 'collectible_gem', position: { x: 0, y: 1.5, z: -32 } },

      // Dual Spinner Platform
      { id: 'p5_inf', type: 'platform_normal', position: { x: 0, y: 1, z: -46 }, scale: { x: 8, y: 1, z: 8 } },
      { id: 'spinner_1', type: 'hazard_spinner', position: { x: -2, y: 2.2, z: -46 }, properties: { moveSpeed: 2.5 } },
      { id: 'spinner_2', type: 'hazard_spinner', position: { x: 2, y: 2.2, z: -46 }, properties: { moveSpeed: -2.5 } },
      { id: 'gem_inf_3', type: 'collectible_gem', position: { x: 0, y: 3, z: -46 } },

      // Goal
      { id: 'p6_inf_goal', type: 'platform_normal', position: { x: 0, y: 2, z: -58 }, scale: { x: 8, y: 1, z: 8 } },
      { id: 'star_inf', type: 'collectible_star', position: { x: 0, y: 4.5, z: -58 } },
      { id: 'goal_inf', type: 'goal', position: { x: 0, y: 3.5, z: -60 } },
    ]
  },
  {
    id: 'campaign_5',
    title: 'Cosmic Nexus',
    description: 'The ultimate physics gauntlet with vanishing tiles, triple springs, and high-altitude dashing.',
    author: 'Studio Core',
    theme: 'cosmic',
    parTime: 50,
    gemTarget: 12,
    objects: [
      { id: 'start_5', type: 'start', position: { x: 0, y: 1.5, z: 0 } },
      { id: 'p1_cos', type: 'platform_normal', position: { x: 0, y: 0, z: 0 }, scale: { x: 6, y: 1, z: 6 } },

      // Triple bounce chain
      { id: 'p_b1', type: 'platform_bouncy', position: { x: 0, y: 0, z: -9 }, scale: { x: 3, y: 0.8, z: 3 }, properties: { bounciness: 20 } },
      { id: 'p_b2', type: 'platform_bouncy', position: { x: 0, y: 6, z: -18 }, scale: { x: 3, y: 0.8, z: 3 }, properties: { bounciness: 22 } },
      { id: 'p_b3', type: 'platform_bouncy', position: { x: 0, y: 12, z: -27 }, scale: { x: 3, y: 0.8, z: 3 }, properties: { bounciness: 24 } },

      { id: 'gem_cos_1', type: 'collectible_gem', position: { x: 0, y: 4, z: -9 } },
      { id: 'gem_cos_2', type: 'collectible_gem', position: { x: 0, y: 10, z: -18 } },
      { id: 'gem_cos_3', type: 'collectible_gem', position: { x: 0, y: 16, z: -27 } },

      // High Checkpoint
      { id: 'p_mid_cos', type: 'platform_normal', position: { x: 0, y: 18, z: -38 }, scale: { x: 7, y: 1, z: 7 } },
      { id: 'cp_cos', type: 'checkpoint', position: { x: 0, y: 19.5, z: -38 } },

      // Collapsing stair path
      { id: 'p_col_1', type: 'platform_collapsing', position: { x: -4, y: 19, z: -47 }, scale: { x: 2.5, y: 0.5, z: 2.5 } },
      { id: 'p_col_2', type: 'platform_collapsing', position: { x: 0, y: 20, z: -53 }, scale: { x: 2.5, y: 0.5, z: 2.5 } },
      { id: 'p_col_3', type: 'platform_collapsing', position: { x: 4, y: 21, z: -59 }, scale: { x: 2.5, y: 0.5, z: 2.5 } },

      // Fast Moving Platform
      { id: 'p_move_cos', type: 'platform_moving', position: { x: 0, y: 22, z: -68 }, scale: { x: 4, y: 0.8, z: 4 }, properties: { moveAxis: 'x', moveDistance: 10, moveSpeed: 3.5 } },
      { id: 'gem_cos_4', type: 'collectible_gem', position: { x: 0, y: 23.5, z: -68 } },

      // Final Grand Goal Sanctuary
      { id: 'p_goal_cos', type: 'platform_normal', position: { x: 0, y: 23, z: -80 }, scale: { x: 10, y: 2, z: 10 } },
      { id: 'star_cos', type: 'collectible_star', position: { x: 0, y: 26.5, z: -80 } },
      { id: 'goal_cos', type: 'goal', position: { x: 0, y: 25.5, z: -82 } },

      { id: 'ring_cos_1', type: 'prop_ring', position: { x: 0, y: 25, z: -76 } },
      { id: 'arch_cos_1', type: 'prop_arch', position: { x: 0, y: 24, z: -80 }, scale: { x: 1.5, y: 1.5, z: 1.5 } }
    ]
  }
];
