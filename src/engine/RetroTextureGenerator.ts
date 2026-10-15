import * as pc from 'playcanvas';

/**
 * Procedural 8-bit Minecraft/Retro Texture Generator.
 * Generates authentic 16x16 / 32x32 pixel art textures for voxel blocks, characters, collectibles & hazards.
 * Sets FILTER_NEAREST for crisp, authentic chunky pixel rendering on modern PlayCanvas WebGL.
 */

export class RetroTextureGenerator {
  private static cache: Map<string, pc.Texture> = new Map();

  /**
   * Helper to create a PlayCanvas Texture from an HTML Canvas with nearest-neighbor filtering.
   */
  public static createTextureFromCanvas(canvas: HTMLCanvasElement, app: pc.Application): pc.Texture {
    const texture = new pc.Texture(app.graphicsDevice, {
      width: canvas.width,
      height: canvas.height,
      format: pc.PIXELFORMAT_RGBA8,
      mipmaps: false,
      minFilter: pc.FILTER_NEAREST,
      magFilter: pc.FILTER_NEAREST,
      addressU: pc.ADDRESS_REPEAT,
      addressV: pc.ADDRESS_REPEAT,
    });

    texture.setSource(canvas);
    return texture;
  }

  /**
   * Voxel Grass / Dirt Block Texture (16x16)
   * Top has rich pixelated green grass; side has dripping pixel grass onto brown soil.
   */
  public static getVoxelGrassSideTexture(app: pc.Application): pc.Texture {
    const key = 'grass_side';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d')!;

    // Dirt base
    const dirtDark = '#573d26';
    const dirtMid = '#724f33';
    const dirtLight = '#8b6241';
    const dirtSpeckle = '#422c19';

    ctx.fillStyle = dirtMid;
    ctx.fillRect(0, 0, 16, 16);

    // Random dirt pixel noise
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        const r = (x * 7 + y * 13) % 11;
        if (r === 0 || r === 1) ctx.fillStyle = dirtDark;
        else if (r === 2 || r === 3) ctx.fillStyle = dirtLight;
        else if (r === 4) ctx.fillStyle = dirtSpeckle;
        else ctx.fillStyle = dirtMid;
        ctx.fillRect(x, y, 1, 1);
      }
    }

    // Top grass layer with dripping pixel blades
    const grassTop = '#4ade80';
    const grassMid = '#22c55e';
    const grassDark = '#15803d';

    const dripPattern = [3, 4, 3, 5, 4, 3, 4, 5, 3, 4, 4, 5, 3, 4, 3, 4];
    for (let x = 0; x < 16; x++) {
      const depth = dripPattern[x % dripPattern.length];
      for (let y = 0; y < depth; y++) {
        if (y === 0) ctx.fillStyle = grassTop;
        else if (y === depth - 1) ctx.fillStyle = grassDark;
        else ctx.fillStyle = (x + y) % 2 === 0 ? grassMid : grassTop;
        ctx.fillRect(x, y, 1, 1);
      }
    }

    const tex = this.createTextureFromCanvas(canvas, app);
    this.cache.set(key, tex);
    return tex;
  }

  /**
   * Voxel Grass Top Texture (16x16)
   */
  public static getVoxelGrassTopTexture(app: pc.Application): pc.Texture {
    const key = 'grass_top';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d')!;

    const greens = ['#22c55e', '#16a34a', '#4ade80', '#15803d', '#86efac'];
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        const idx = (x * 11 + y * 17) % greens.length;
        ctx.fillStyle = greens[idx];
        ctx.fillRect(x, y, 1, 1);
      }
    }

    const tex = this.createTextureFromCanvas(canvas, app);
    this.cache.set(key, tex);
    return tex;
  }

  /**
   * Voxel Stone / Cobblestone Block Texture (16x16)
   */
  public static getVoxelCobblestoneTexture(app: pc.Application, tint = '#64748b'): pc.Texture {
    const key = 'cobble_' + tint;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d')!;

    const stones = ['#334155', '#475569', '#64748b', '#94a3b8', '#1e293b'];
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 16, 16);

    // Cobblestone patches
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        const border = (x % 4 === 0 || y % 4 === 0);
        if (border) {
          ctx.fillStyle = '#0f172a';
        } else {
          const shade = (x * 13 + y * 7 + (x >> 2) * 5) % stones.length;
          ctx.fillStyle = stones[shade];
        }
        ctx.fillRect(x, y, 1, 1);
      }
    }

    const tex = this.createTextureFromCanvas(canvas, app);
    this.cache.set(key, tex);
    return tex;
  }

  /**
   * Voxel Neon / Cyan Cyber Block Texture (16x16)
   */
  public static getVoxelCyberTexture(app: pc.Application, mainColor = '#06b6d4', glowColor = '#67e8f9'): pc.Texture {
    const key = `cyber_${mainColor}_${glowColor}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d')!;

    // Dark cyber plate
    ctx.fillStyle = '#081220';
    ctx.fillRect(0, 0, 16, 16);

    // Glowing border
    ctx.fillStyle = mainColor;
    ctx.fillRect(0, 0, 16, 1);
    ctx.fillRect(0, 15, 16, 1);
    ctx.fillRect(0, 0, 1, 16);
    ctx.fillRect(15, 0, 1, 16);

    // Inner chip circuit pattern
    ctx.fillStyle = glowColor;
    ctx.fillRect(3, 3, 2, 2);
    ctx.fillRect(11, 3, 2, 2);
    ctx.fillRect(3, 11, 2, 2);
    ctx.fillRect(11, 11, 2, 2);
    ctx.fillRect(7, 6, 2, 4);

    const tex = this.createTextureFromCanvas(canvas, app);
    this.cache.set(key, tex);
    return tex;
  }

  /**
   * Voxel Bouncy Slime / Spring Block Texture (16x16)
   */
  public static getVoxelBouncyTexture(app: pc.Application): pc.Texture {
    const key = 'bouncy_slime';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#15803d';
    ctx.fillRect(0, 0, 16, 16);

    // Slime core
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(2, 2, 12, 12);

    ctx.fillStyle = '#4ade80';
    ctx.fillRect(4, 4, 8, 8);

    ctx.fillStyle = '#bbf7d0';
    ctx.fillRect(6, 6, 4, 4);

    // Spring piston lines
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(7, 7, 2, 2);

    const tex = this.createTextureFromCanvas(canvas, app);
    this.cache.set(key, tex);
    return tex;
  }

  /**
   * Voxel Ice / Packed Glacial Texture (16x16)
   */
  public static getVoxelIceTexture(app: pc.Application): pc.Texture {
    const key = 'voxel_ice';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d')!;

    const iceBlues = ['#7dd3fc', '#38bdf8', '#0284c7', '#bae6fd', '#e0f2fe'];
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        const val = (x * 19 + y * 23) % iceBlues.length;
        ctx.fillStyle = iceBlues[val];
        ctx.fillRect(x, y, 1, 1);
      }
    }

    // Ice cracks
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(2, 4, 3, 1);
    ctx.fillRect(4, 5, 1, 4);
    ctx.fillRect(5, 8, 4, 1);
    ctx.fillRect(10, 2, 1, 5);
    ctx.fillRect(11, 7, 3, 1);

    const tex = this.createTextureFromCanvas(canvas, app);
    this.cache.set(key, tex);
    return tex;
  }

  /**
   * Voxel Conveyer Belt Texture (16x16) with 8-bit Chevron Arrows
   */
  public static getVoxelConveyerTexture(app: pc.Application): pc.Texture {
    const key = 'voxel_conveyer';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 16, 16);

    // Hazard Yellow & Black Chevrons
    const yellow = '#eab308';
    const black = '#0f172a';

    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const diag = (x + y) % 6;
        ctx.fillStyle = diag < 3 ? yellow : black;
        ctx.fillRect(x, y, 1, 1);
      }
    }

    // Border
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, 0, 16, 1);
    ctx.fillRect(0, 15, 16, 1);

    const tex = this.createTextureFromCanvas(canvas, app);
    this.cache.set(key, tex);
    return tex;
  }

  /**
   * Voxel Collapsing Brick Texture (16x16)
   */
  public static getVoxelCollapsingTexture(app: pc.Application): pc.Texture {
    const key = 'voxel_collapsing';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d')!;

    const reds = ['#991b1b', '#b91c1c', '#dc2626', '#7f1d1d', '#ef4444'];
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        const idx = (x * 7 + y * 13) % reds.length;
        ctx.fillStyle = reds[idx];
        ctx.fillRect(x, y, 1, 1);
      }
    }

    // Heavy black fracture cracks
    ctx.fillStyle = '#000000';
    ctx.fillRect(3, 1, 1, 4);
    ctx.fillRect(4, 4, 3, 1);
    ctx.fillRect(6, 5, 1, 5);
    ctx.fillRect(7, 9, 4, 1);
    ctx.fillRect(10, 10, 1, 4);
    ctx.fillRect(12, 3, 1, 5);

    const tex = this.createTextureFromCanvas(canvas, app);
    this.cache.set(key, tex);
    return tex;
  }

  /**
   * Voxel Redstone Magma / Inferno Texture (16x16)
   */
  public static getVoxelInfernoTexture(app: pc.Application): pc.Texture {
    const key = 'voxel_inferno';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d')!;

    const magma = ['#7f1d1d', '#991b1b', '#ea580c', '#f97316', '#fbbf24'];
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        const val = (x * 29 + y * 31) % magma.length;
        ctx.fillStyle = magma[val];
        ctx.fillRect(x, y, 1, 1);
      }
    }

    ctx.fillStyle = '#fef08a';
    ctx.fillRect(4, 4, 2, 2);
    ctx.fillRect(10, 8, 3, 2);
    ctx.fillRect(3, 11, 2, 2);

    const tex = this.createTextureFromCanvas(canvas, app);
    this.cache.set(key, tex);
    return tex;
  }

  /**
   * Voxel Minecraft Character Face Texture (16x16)
   * Generates classic pixel eyes, hair, skin tones & mouth.
   */
  public static getVoxelCharacterFace(app: pc.Application, skinId = 'skin_default'): pc.Texture {
    const key = 'char_face_' + skinId;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d')!;

    let skinTone = '#ffdbac';
    let hairTone = '#4a2e18';
    let eyeWhite = '#ffffff';
    let eyePupil = '#2563eb';
    let mouthTone = '#b45309';

    if (skinId === 'skin_cyber_blue') {
      skinTone = '#93c5fd';
      hairTone = '#1e3a8a';
      eyePupil = '#38bdf8';
    } else if (skinId === 'skin_neon_yellow') {
      skinTone = '#fef08a';
      hairTone = '#ca8a04';
      eyePupil = '#eab308';
    } else if (skinId === 'skin_matrix_green') {
      skinTone = '#86efac';
      hairTone = '#14532d';
      eyePupil = '#22c55e';
    } else if (skinId === 'skin_ruby_red') {
      skinTone = '#fca5a5';
      hairTone = '#7f1d1d';
      eyePupil = '#dc2626';
    } else if (skinId === 'skin_cosmic_void') {
      skinTone = '#2e1065';
      hairTone = '#581c87';
      eyePupil = '#c084fc';
      eyeWhite = '#f3e8ff';
    }

    // Base skin
    ctx.fillStyle = skinTone;
    ctx.fillRect(0, 0, 16, 16);

    // Hair at the top & sides
    ctx.fillStyle = hairTone;
    ctx.fillRect(0, 0, 16, 5);
    ctx.fillRect(0, 5, 3, 3);
    ctx.fillRect(13, 5, 3, 3);
    ctx.fillRect(4, 5, 2, 1);
    ctx.fillRect(10, 5, 2, 1);

    // Eyes
    // Left eye
    ctx.fillStyle = eyeWhite;
    ctx.fillRect(3, 7, 3, 2);
    ctx.fillStyle = eyePupil;
    ctx.fillRect(4, 7, 2, 2);

    // Right eye
    ctx.fillStyle = eyeWhite;
    ctx.fillRect(10, 7, 3, 2);
    ctx.fillStyle = eyePupil;
    ctx.fillRect(10, 7, 2, 2);

    // Nose
    ctx.fillStyle = '#e29d72';
    ctx.fillRect(7, 9, 2, 1);

    // Mouth / Beard
    ctx.fillStyle = mouthTone;
    ctx.fillRect(6, 11, 4, 1);
    ctx.fillRect(5, 12, 6, 2);

    const tex = this.createTextureFromCanvas(canvas, app);
    this.cache.set(key, tex);
    return tex;
  }

  /**
   * Voxel Character Torso Texture (16x16)
   */
  public static getVoxelCharacterTorso(app: pc.Application, shirtColor = '#06b6d4'): pc.Texture {
    const key = 'char_torso_' + shirtColor;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d')!;

    // Shirt body
    ctx.fillStyle = shirtColor;
    ctx.fillRect(0, 0, 16, 12);

    // Neckline collar
    ctx.fillStyle = '#ffdbac';
    ctx.fillRect(6, 0, 4, 3);

    // Belt
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 12, 16, 4);

    // Gold belt buckle
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(6, 12, 4, 4);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(7, 13, 2, 2);

    const tex = this.createTextureFromCanvas(canvas, app);
    this.cache.set(key, tex);
    return tex;
  }

  /**
   * Voxel Gem Texture (16x16)
   */
  public static getVoxelGemTexture(app: pc.Application, gemColor = '#06b6d4'): pc.Texture {
    const key = 'gem_tex_' + gemColor;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#083344';
    ctx.fillRect(0, 0, 16, 16);

    ctx.fillStyle = gemColor;
    ctx.fillRect(2, 2, 12, 12);

    // Facet glints
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(3, 3, 4, 4);
    ctx.fillRect(7, 3, 2, 2);

    ctx.fillStyle = '#67e8f9';
    ctx.fillRect(3, 7, 2, 6);
    ctx.fillRect(9, 9, 4, 4);

    const tex = this.createTextureFromCanvas(canvas, app);
    this.cache.set(key, tex);
    return tex;
  }
}
