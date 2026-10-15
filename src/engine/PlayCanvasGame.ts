import * as pc from 'playcanvas';
import {
  LevelData,
  LevelObject,
  GameSettings,
  Vector3D,
  PixelMode
} from '../types/game';
import { soundEngine } from '../audio/soundEngine';
import { SKINS_LIST, TRAILS_LIST } from '../data/achievements';
import { RetroTextureGenerator } from './RetroTextureGenerator';

export interface GameCallbacks {
  onGemCollected?: (count: number, total: number) => void;
  onStarCollected?: () => void;
  onSpeedBoost?: (duration: number) => void;
  onCheckpointReached?: (pos: Vector3D) => void;
  onPlayerDeath?: (deaths: number) => void;
  onLevelComplete?: (time: number, gems: number, totalGems: number) => void;
  onGamePaused?: (paused: boolean) => void;
}

export class PlayCanvasGame {
  private canvas: HTMLCanvasElement;
  private app: pc.Application | null = null;
  private levelData: LevelData;
  private settings: GameSettings;
  private callbacks: GameCallbacks;

  // Entities
  private cameraEntity: pc.Entity | null = null;
  private playerEntity: pc.Entity | null = null;
  private playerModel: pc.Entity | null = null;
  private playerHead: pc.Entity | null = null;
  private playerTorso: pc.Entity | null = null;
  private playerLeftArm: pc.Entity | null = null;
  private playerRightArm: pc.Entity | null = null;
  private playerLeftLeg: pc.Entity | null = null;
  private playerRightLeg: pc.Entity | null = null;
  private playerLight: pc.Entity | null = null;
  private dirLight: pc.Entity | null = null;

  private dynamicObjects: Array<{
    entity: pc.Entity;
    data: LevelObject;
    initialPos: pc.Vec3;
    currentSpeed: number;
    direction: number;
    timer: number;
  }> = [];

  private collectibles: Array<{
    entity: pc.Entity;
    data: LevelObject;
    collected: boolean;
    initialY: number;
    type: 'gem' | 'star' | 'key' | 'speed';
  }> = [];

  private collapsingPlatforms: Array<{
    entity: pc.Entity;
    initialPos: pc.Vec3;
    timer: number;
    state: 'idle' | 'shaking' | 'falling' | 'respawning';
    respawnTimer: number;
  }> = [];

  private particlePool: Array<{
    entity: pc.Entity;
    life: number;
    maxLife: number;
    vel: pc.Vec3;
    active: boolean;
  }> = [];

  // Player Physics & Voxel Animation State
  private playerPos = new pc.Vec3(0, 2, 0);
  private playerVel = new pc.Vec3(0, 0, 0);
  private isGrounded = false;
  private jumpCount = 0;
  private maxJumps = 2;
  private dashCooldown = 0;
  private dashTimer = 0;
  private speedBoostTimer = 0;
  private spawnPoint = new pc.Vec3(0, 2, 0);
  private lastCheckpoint = new pc.Vec3(0, 2, 0);
  private currentPlatformVel = new pc.Vec3(0, 0, 0);
  private currentPlatformType = 'normal';
  private limbAnimTime = 0;

  // Input State
  public inputAxes = { x: 0, y: 0 };
  public jumpRequested = false;
  public dashRequested = false;
  public cameraYaw = 0;
  public cameraPitch = 25;
  private isDraggingCamera = false;
  private lastTouchPos = { x: 0, y: 0 };

  // Game Loop & Stats
  private isRunning = false;
  public isPaused = false;
  private gameTime = 0;
  private gemsCollected = 0;
  private totalGemsInLevel = 0;
  private deathCount = 0;
  private hasWon = false;

  constructor(
    canvas: HTMLCanvasElement,
    levelData: LevelData,
    settings: GameSettings,
    callbacks: GameCallbacks
  ) {
    this.canvas = canvas;
    this.levelData = levelData;
    this.settings = settings;
    this.callbacks = callbacks;

    this.initEngine();
  }

  private initEngine() {
    if (this.app) {
      this.app.destroy();
      this.app = null;
    }

    this.app = new pc.Application(this.canvas, {
      mouse: new pc.Mouse(this.canvas),
      touch: new pc.TouchDevice(this.canvas),
      keyboard: new pc.Keyboard(window),
      elementInput: new pc.ElementInput(this.canvas),
    });

    this.app.start();
    this.app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
    this.app.setCanvasResolution(pc.RESOLUTION_AUTO);

    // Apply 8-bit Pixel downsampling & Quality
    this.applyPixelMode(this.settings.pixelMode || 'ultra_8bit');

    this.setupSceneTheme();
    this.buildLevelGeometry();
    this.setupPlayer();
    this.setupCamera();
    this.setupParticles();
    this.setupInputListeners();

    // Start Update Loop
    this.isRunning = true;
    this.app.on('update', (dt: number) => this.onUpdate(dt));

    // Start 8-bit chiptune background music
    soundEngine.setVolumes(this.settings.musicVolume, this.settings.sfxVolume);
    const track =
      this.levelData.theme === 'inferno'
        ? 'inferno'
        : this.levelData.theme === 'cyber'
        ? 'cyber'
        : 'neon';
    soundEngine.startMusic(track);
  }

  public applyPixelMode(mode: PixelMode) {
    if (!this.app) return;
    this.settings.pixelMode = mode;

    if (mode === 'ultra_8bit') {
      // 8-bit Downsampling (e.g. 0.3x resolution scaled with nearest neighbor)
      this.app.graphicsDevice.maxPixelRatio = 0.32;
      this.canvas.classList.add('pixelated-render');
    } else if (mode === 'classic_16bit') {
      this.app.graphicsDevice.maxPixelRatio = 0.58;
      this.canvas.classList.add('pixelated-render');
    } else {
      // Modern
      this.canvas.classList.remove('pixelated-render');
      if (this.settings.quality === 'low') {
        this.app.graphicsDevice.maxPixelRatio = 0.8;
      } else if (this.settings.quality === 'medium') {
        this.app.graphicsDevice.maxPixelRatio = 1.0;
      } else {
        this.app.graphicsDevice.maxPixelRatio = Math.min(window.devicePixelRatio || 1, 2.0);
      }
    }
  }

  private setupSceneTheme() {
    if (!this.app) return;

    // Theme ambient & background colors for 8-bit aesthetic
    let ambient = new pc.Color(0.28, 0.32, 0.42);

    if (this.levelData.theme === 'cyber') {
      ambient = new pc.Color(0.22, 0.36, 0.48);
    } else if (this.levelData.theme === 'crystal') {
      ambient = new pc.Color(0.36, 0.28, 0.52);
    } else if (this.levelData.theme === 'inferno') {
      ambient = new pc.Color(0.48, 0.22, 0.18);
    } else if (this.levelData.theme === 'cosmic') {
      ambient = new pc.Color(0.32, 0.22, 0.48);
    }

    this.app.scene.ambientLight = ambient;

    // Directional Sunlight (Crisp voxel shadows)
    this.dirLight = new pc.Entity('dirLight');
    this.dirLight.addComponent('light', {
      type: 'directional',
      color: new pc.Color(1, 0.98, 0.92),
      intensity: 1.45,
      castShadows: this.settings.quality !== 'low',
      shadowDistance: 65,
      shadowResolution: this.settings.quality === 'high' ? 2048 : 1024,
      shadowBias: 0.08,
    });
    this.dirLight.setEulerAngles(50, 40, 0);
    this.app.root.addChild(this.dirLight);

    // Fill Light
    const fillLight = new pc.Entity('fillLight');
    fillLight.addComponent('light', {
      type: 'directional',
      color: new pc.Color(0.45, 0.65, 0.95),
      intensity: 0.65,
      castShadows: false,
    });
    fillLight.setEulerAngles(-35, -130, 0);
    this.app.root.addChild(fillLight);
  }

  /**
   * Helper to create 8-bit Voxel Materials with nearest-neighbor texture filtering
   */
  private createVoxelMaterial(
    texture?: pc.Texture,
    colorHex?: string,
    emissiveHex?: string,
    metalness = 0.1,
    gloss = 0.2
  ): pc.StandardMaterial {
    const mat = new pc.StandardMaterial();
    if (colorHex) {
      mat.diffuse = new pc.Color().fromString(colorHex);
    } else {
      mat.diffuse = new pc.Color(1, 1, 1);
    }

    if (texture) {
      mat.diffuseMap = texture;
      mat.diffuseMapTiling = new pc.Vec2(1, 1);
    }

    mat.useMetalness = true;
    mat.metalness = metalness;
    mat.gloss = gloss;

    if (emissiveHex) {
      mat.emissive = new pc.Color().fromString(emissiveHex);
      mat.emissiveIntensity = 0.8;
    }
    mat.update();
    return mat;
  }

  private buildLevelGeometry() {
    if (!this.app) return;

    this.dynamicObjects = [];
    this.collectibles = [];
    this.collapsingPlatforms = [];
    this.gemsCollected = 0;
    this.totalGemsInLevel = 0;

    const theme = this.levelData.theme;

    // Build Level Objects with authentic 8-bit Minecraft voxel aesthetics
    for (const obj of this.levelData.objects) {
      const pos = new pc.Vec3(obj.position.x, obj.position.y, obj.position.z);
      const rot = obj.rotation ? new pc.Vec3(obj.rotation.x, obj.rotation.y, obj.rotation.z) : new pc.Vec3(0, 0, 0);
      const scale = obj.scale ? new pc.Vec3(obj.scale.x, obj.scale.y, obj.scale.z) : new pc.Vec3(1, 1, 1);

      if (obj.type === 'start') {
        this.spawnPoint = pos.clone();
        this.lastCheckpoint = pos.clone();
        this.playerPos = pos.clone();
        this.playerPos.y += 0.8;

        // Voxel start pad (Minecraft Obsidian / Emerald base)
        const startMarker = new pc.Entity('startMarker');
        startMarker.addComponent('render', { type: 'box' });
        startMarker.setLocalPosition(pos.x, pos.y - 0.2, pos.z);
        startMarker.setLocalScale(3, 0.4, 3);
        startMarker.render!.material = this.createVoxelMaterial(
          RetroTextureGenerator.getVoxelCyberTexture(this.app, '#3b82f6', '#93c5fd'),
          '#3b82f6',
          '#60a5fa'
        );
        this.app.root.addChild(startMarker);
        continue;
      }

      if (obj.type === 'goal') {
        // Minecraft Style Goal Flag & Voxel Beacon
        const goalEntity = new pc.Entity('goal');
        goalEntity.setLocalPosition(pos.x, pos.y, pos.z);

        // Voxel Post
        const post = new pc.Entity('goalPost');
        post.addComponent('render', { type: 'box' });
        post.setLocalPosition(0, 1.8, 0);
        post.setLocalScale(0.3, 3.6, 0.3);
        post.render!.material = this.createVoxelMaterial(undefined, '#f59e0b', '#fbbf24');
        goalEntity.addChild(post);

        // Pixelated Banner
        const flag = new pc.Entity('flagBanner');
        flag.addComponent('render', { type: 'box' });
        flag.setLocalPosition(0.8, 2.8, 0);
        flag.setLocalScale(1.4, 0.9, 0.1);
        flag.render!.material = this.createVoxelMaterial(undefined, '#10b981', '#34d399');
        goalEntity.addChild(flag);

        // Glowing Emerald Base Block
        const goalBase = new pc.Entity('goalBase');
        goalBase.addComponent('render', { type: 'box' });
        goalBase.setLocalPosition(0, 0, 0);
        goalBase.setLocalScale(3, 0.6, 3);
        goalBase.render!.material = this.createVoxelMaterial(
          RetroTextureGenerator.getVoxelCyberTexture(this.app, '#10b981', '#6ee7b7'),
          '#10b981',
          '#059669'
        );
        goalEntity.addChild(goalBase);

        this.app.root.addChild(goalEntity);
        continue;
      }

      if (obj.type === 'checkpoint') {
        const cpEntity = new pc.Entity('checkpoint_' + obj.id);
        cpEntity.setLocalPosition(pos.x, pos.y, pos.z);

        // Voxel Checkpoint Pillar (Cobblestone)
        const pillar = new pc.Entity('cpPillar');
        pillar.addComponent('render', { type: 'box' });
        pillar.setLocalPosition(0, 1, 0);
        pillar.setLocalScale(0.6, 2, 0.6);
        pillar.render!.material = this.createVoxelMaterial(
          RetroTextureGenerator.getVoxelCobblestoneTexture(this.app),
          '#64748b'
        );
        cpEntity.addChild(pillar);

        // 3D Voxel Beacon Crystal on top
        const crystal = new pc.Entity('cpCrystal');
        crystal.addComponent('render', { type: 'box' });
        crystal.setLocalPosition(0, 2.4, 0);
        crystal.setLocalScale(0.7, 0.7, 0.7);
        crystal.setEulerAngles(45, 45, 0);
        crystal.render!.material = this.createVoxelMaterial(
          RetroTextureGenerator.getVoxelGemTexture(this.app, '#38bdf8'),
          '#38bdf8',
          '#0ea5e9'
        );
        cpEntity.addChild(crystal);

        this.app.root.addChild(cpEntity);
        continue;
      }

      if (obj.type.startsWith('collectible_')) {
        const item = new pc.Entity('item_' + obj.id);
        let colType: 'gem' | 'star' | 'key' | 'speed' = 'gem';

        if (obj.type === 'collectible_gem') {
          // 3D Voxel Diamond / Gem
          item.addComponent('render', { type: 'box' });
          item.setLocalScale(0.7, 0.7, 0.7);
          item.setEulerAngles(45, 45, 0);
          item.render!.material = this.createVoxelMaterial(
            RetroTextureGenerator.getVoxelGemTexture(this.app, '#06b6d4'),
            '#06b6d4',
            '#22d3ee'
          );
          colType = 'gem';
          this.totalGemsInLevel++;
        } else if (obj.type === 'collectible_star') {
          // 3D Voxel Star
          item.addComponent('render', { type: 'box' });
          item.setLocalScale(0.85, 0.85, 0.85);
          item.setEulerAngles(0, 45, 45);
          item.render!.material = this.createVoxelMaterial(
            RetroTextureGenerator.getVoxelGemTexture(this.app, '#eab308'),
            '#eab308',
            '#facc15'
          );
          colType = 'star';
        } else if (obj.type === 'collectible_speed') {
          // 3D Voxel Nitro Lightning
          item.addComponent('render', { type: 'box' });
          item.setLocalScale(0.6, 1.1, 0.6);
          item.setEulerAngles(15, 45, 15);
          item.render!.material = this.createVoxelMaterial(
            RetroTextureGenerator.getVoxelGemTexture(this.app, '#f97316'),
            '#f97316',
            '#fb923c'
          );
          colType = 'speed';
        } else {
          item.addComponent('render', { type: 'box' });
          item.setLocalScale(0.6, 0.9, 0.3);
          item.render!.material = this.createVoxelMaterial(
            RetroTextureGenerator.getVoxelGemTexture(this.app, '#ec4899'),
            '#ec4899',
            '#f472b6'
          );
          colType = 'key';
        }

        item.setLocalPosition(pos.x, pos.y, pos.z);
        this.app.root.addChild(item);
        this.collectibles.push({
          entity: item,
          data: obj,
          collected: false,
          initialY: pos.y,
          type: colType
        });
        continue;
      }

      // Platforms & Hazards in Voxel Style
      const entity = new pc.Entity(obj.id);
      entity.setLocalPosition(pos.x, pos.y, pos.z);
      entity.setEulerAngles(rot.x, rot.y, rot.z);
      entity.setLocalScale(scale.x, scale.y, scale.z);

      if (obj.type === 'platform_normal') {
        entity.addComponent('render', { type: 'box' });
        // Themed Voxel Block Texture
        const tex =
          theme === 'inferno'
            ? RetroTextureGenerator.getVoxelInfernoTexture(this.app)
            : theme === 'crystal'
            ? RetroTextureGenerator.getVoxelCyberTexture(this.app, '#9333ea', '#c084fc')
            : theme === 'cyber'
            ? RetroTextureGenerator.getVoxelCyberTexture(this.app, '#2563eb', '#60a5fa')
            : RetroTextureGenerator.getVoxelGrassSideTexture(this.app);

        entity.render!.material = this.createVoxelMaterial(tex, obj.color);
      } else if (obj.type === 'platform_ice') {
        entity.addComponent('render', { type: 'box' });
        entity.render!.material = this.createVoxelMaterial(
          RetroTextureGenerator.getVoxelIceTexture(this.app),
          '#93c5fd',
          '#bfdbfe',
          0.8,
          0.9
        );
      } else if (obj.type === 'platform_bouncy') {
        entity.addComponent('render', { type: 'box' });
        entity.render!.material = this.createVoxelMaterial(
          RetroTextureGenerator.getVoxelBouncyTexture(this.app),
          '#10b981',
          '#34d399'
        );
      } else if (obj.type === 'platform_conveyer') {
        entity.addComponent('render', { type: 'box' });
        entity.render!.material = this.createVoxelMaterial(
          RetroTextureGenerator.getVoxelConveyerTexture(this.app),
          '#f59e0b',
          '#fbbf24'
        );
      } else if (obj.type === 'platform_collapsing') {
        entity.addComponent('render', { type: 'box' });
        entity.render!.material = this.createVoxelMaterial(
          RetroTextureGenerator.getVoxelCollapsingTexture(this.app),
          '#e11d48',
          '#fb7185'
        );
        this.collapsingPlatforms.push({
          entity,
          initialPos: pos.clone(),
          timer: 0,
          state: 'idle',
          respawnTimer: 0
        });
      } else if (obj.type === 'platform_moving') {
        entity.addComponent('render', { type: 'box' });
        entity.render!.material = this.createVoxelMaterial(
          RetroTextureGenerator.getVoxelCyberTexture(this.app, '#8b5cf6', '#a78bfa'),
          '#8b5cf6',
          '#a78bfa'
        );
        this.dynamicObjects.push({
          entity,
          data: obj,
          initialPos: pos.clone(),
          currentSpeed: obj.properties?.moveSpeed || 2.5,
          direction: 1,
          timer: 0
        });
      } else if (obj.type === 'hazard_spikes') {
        // Voxel 3D Pyramid Spikes
        entity.addComponent('render', { type: 'box' });
        entity.setLocalScale(scale.x * 0.9, scale.y * 1.2, scale.z * 0.9);
        entity.setEulerAngles(45, 0, 45);
        entity.render!.material = this.createVoxelMaterial(
          RetroTextureGenerator.getVoxelCollapsingTexture(this.app),
          '#ef4444',
          '#f87171'
        );
      } else if (obj.type === 'hazard_laser') {
        // Voxel Laser Beam
        entity.addComponent('render', { type: 'box' });
        entity.setLocalScale(scale.x * 4, 0.4, 0.4);
        entity.render!.material = this.createVoxelMaterial(undefined, '#ff0055', '#ff0055');
        this.dynamicObjects.push({
          entity,
          data: obj,
          initialPos: pos.clone(),
          currentSpeed: 1,
          direction: 1,
          timer: 0
        });
      } else if (obj.type === 'hazard_stomper') {
        // Voxel Minecraft Stomper / Piston Block
        entity.addComponent('render', { type: 'box' });
        entity.setLocalScale(scale.x * 2.5, scale.y * 2, scale.z * 2.5);
        entity.render!.material = this.createVoxelMaterial(
          RetroTextureGenerator.getVoxelCobblestoneTexture(this.app, '#991b1b'),
          '#7f1d1d',
          '#b91c1c'
        );
        this.dynamicObjects.push({
          entity,
          data: obj,
          initialPos: pos.clone(),
          currentSpeed: obj.properties?.moveSpeed || 3,
          direction: 1,
          timer: 0
        });
      } else if (obj.type === 'hazard_spinner') {
        // Voxel Spinner Blades
        entity.addComponent('render', { type: 'box' });
        entity.setLocalScale(scale.x * 6, 0.4, 0.4);
        entity.render!.material = this.createVoxelMaterial(
          RetroTextureGenerator.getVoxelConveyerTexture(this.app),
          '#ea580c',
          '#f97316'
        );
        this.dynamicObjects.push({
          entity,
          data: obj,
          initialPos: pos.clone(),
          currentSpeed: obj.properties?.moveSpeed || 2,
          direction: 1,
          timer: 0
        });
      } else if (obj.type === 'prop_pillar') {
        entity.addComponent('render', { type: 'box' });
        entity.render!.material = this.createVoxelMaterial(
          RetroTextureGenerator.getVoxelCobblestoneTexture(this.app)
        );
      } else if (obj.type === 'prop_arch') {
        entity.addComponent('render', { type: 'box' });
        entity.render!.material = this.createVoxelMaterial(
          RetroTextureGenerator.getVoxelCyberTexture(this.app, '#1e293b', '#38bdf8')
        );
      } else if (obj.type === 'prop_ring') {
        entity.addComponent('render', { type: 'box' });
        entity.render!.material = this.createVoxelMaterial(
          RetroTextureGenerator.getVoxelCyberTexture(this.app, '#06b6d4', '#22d3ee')
        );
      }

      this.app.root.addChild(entity);
    }
  }

  /**
   * Builds the Minecraft / Voxel Player Model with animated head, torso, arms & legs!
   */
  private setupPlayer() {
    if (!this.app) return;

    this.playerEntity = new pc.Entity('playerRoot');
    this.playerPos = this.spawnPoint.clone();
    this.playerPos.y += 0.8;
    this.playerEntity.setLocalPosition(this.playerPos.x, this.playerPos.y, this.playerPos.z);

    // Selected Skin
    const selectedSkinId = this.settings.selectedSkin || 'skin_default';
    const skinData = SKINS_LIST.find(s => s.id === selectedSkinId) || SKINS_LIST[0];

    // Main Player Hierarchy Container
    this.playerModel = new pc.Entity('playerModel');

    // 1. Voxel Head (Cube with pixel face & hair)
    this.playerHead = new pc.Entity('playerHead');
    this.playerHead.addComponent('render', { type: 'box' });
    this.playerHead.setLocalScale(0.7, 0.7, 0.7);
    this.playerHead.setLocalPosition(0, 0.95, 0);
    this.playerHead.render!.material = this.createVoxelMaterial(
      RetroTextureGenerator.getVoxelCharacterFace(this.app, selectedSkinId),
      skinData.color
    );
    this.playerModel.addChild(this.playerHead);

    // 2. Voxel Torso (Cube with shirt & belt)
    this.playerTorso = new pc.Entity('playerTorso');
    this.playerTorso.addComponent('render', { type: 'box' });
    this.playerTorso.setLocalScale(0.75, 0.75, 0.45);
    this.playerTorso.setLocalPosition(0, 0.35, 0);
    this.playerTorso.render!.material = this.createVoxelMaterial(
      RetroTextureGenerator.getVoxelCharacterTorso(this.app, skinData.color),
      skinData.color
    );
    this.playerModel.addChild(this.playerTorso);

    // 3. Voxel Left Arm
    this.playerLeftArm = new pc.Entity('playerLeftArm');
    this.playerLeftArm.addComponent('render', { type: 'box' });
    this.playerLeftArm.setLocalScale(0.25, 0.7, 0.25);
    this.playerLeftArm.setLocalPosition(-0.52, 0.35, 0);
    this.playerLeftArm.render!.material = this.createVoxelMaterial(
      undefined,
      skinData.color
    );
    this.playerModel.addChild(this.playerLeftArm);

    // 4. Voxel Right Arm
    this.playerRightArm = new pc.Entity('playerRightArm');
    this.playerRightArm.addComponent('render', { type: 'box' });
    this.playerRightArm.setLocalScale(0.25, 0.7, 0.25);
    this.playerRightArm.setLocalPosition(0.52, 0.35, 0);
    this.playerRightArm.render!.material = this.createVoxelMaterial(
      undefined,
      skinData.color
    );
    this.playerModel.addChild(this.playerRightArm);

    // 5. Voxel Left Leg
    this.playerLeftLeg = new pc.Entity('playerLeftLeg');
    this.playerLeftLeg.addComponent('render', { type: 'box' });
    this.playerLeftLeg.setLocalScale(0.3, 0.65, 0.35);
    this.playerLeftLeg.setLocalPosition(-0.2, -0.32, 0);
    this.playerLeftLeg.render!.material = this.createVoxelMaterial(undefined, '#1e3a8a');
    this.playerModel.addChild(this.playerLeftLeg);

    // 6. Voxel Right Leg
    this.playerRightLeg = new pc.Entity('playerRightLeg');
    this.playerRightLeg.addComponent('render', { type: 'box' });
    this.playerRightLeg.setLocalScale(0.3, 0.65, 0.35);
    this.playerRightLeg.setLocalPosition(0.2, -0.32, 0);
    this.playerRightLeg.render!.material = this.createVoxelMaterial(undefined, '#1e3a8a');
    this.playerModel.addChild(this.playerRightLeg);

    // Player localized dynamic light
    this.playerLight = new pc.Entity('playerPointLight');
    this.playerLight.addComponent('light', {
      type: 'omni',
      color: new pc.Color().fromString(skinData.glowColor),
      intensity: 1.2,
      range: 8,
      castShadows: false
    });
    this.playerLight.setLocalPosition(0, 0.5, 0);

    this.playerEntity.addChild(this.playerModel);
    this.playerEntity.addChild(this.playerLight);
    this.app.root.addChild(this.playerEntity);
  }

  private setupCamera() {
    if (!this.app) return;

    this.cameraEntity = new pc.Entity('camera');
    this.cameraEntity.addComponent('camera', {
      clearColor: new pc.Color(0.06, 0.08, 0.14),
      fov: 60,
      nearClip: 0.1,
      farClip: 300,
    });

    this.updateCameraPosition(true);
    this.app.root.addChild(this.cameraEntity);
  }

  private setupParticles() {
    if (!this.app) return;

    const trailData = TRAILS_LIST.find(t => t.id === this.settings.selectedTrail) || TRAILS_LIST[0];
    const particleMat = this.createVoxelMaterial(undefined, trailData.color, trailData.color);

    this.particlePool = [];
    const poolSize = this.settings.quality === 'low' ? 15 : 35;

    for (let i = 0; i < poolSize; i++) {
      const p = new pc.Entity('trail_voxel_' + i);
      // Voxel cube particles
      p.addComponent('render', { type: 'box' });
      p.setLocalScale(0.2, 0.2, 0.2);
      p.render!.material = particleMat;
      p.enabled = false;
      this.app.root.addChild(p);

      this.particlePool.push({
        entity: p,
        life: 0,
        maxLife: 0.45,
        vel: new pc.Vec3(0, 0, 0),
        active: false
      });
    }
  }

  private emitParticle(pos: pc.Vec3, count = 1) {
    let emitted = 0;
    for (const p of this.particlePool) {
      if (!p.active) {
        p.active = true;
        p.life = 0;
        p.entity.enabled = true;
        p.entity.setLocalPosition(
          pos.x + (Math.random() - 0.5) * 0.4,
          pos.y + (Math.random() - 0.5) * 0.4,
          pos.z + (Math.random() - 0.5) * 0.4
        );
        p.vel.set(
          (Math.random() - 0.5) * 2.5,
          Math.random() * 2.0,
          (Math.random() - 0.5) * 2.5
        );
        emitted++;
        if (emitted >= count) break;
      }
    }
  }

  private setupInputListeners() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);

    // Canvas Pointer for Camera Orbit
    this.canvas.addEventListener('pointerdown', this.handlePointerDown);
    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('pointerup', this.handlePointerUp);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'KeyW' || e.code === 'ArrowUp') this.inputAxes.y = 1;
    if (e.code === 'KeyS' || e.code === 'ArrowDown') this.inputAxes.y = -1;
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.inputAxes.x = -1;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') this.inputAxes.x = 1;

    if (e.code === 'Space') {
      this.jumpRequested = true;
      e.preventDefault();
    }
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyK') {
      this.dashRequested = true;
    }
    if (e.code === 'KeyR') {
      this.respawnPlayer();
    }
    if (e.code === 'Escape' || e.code === 'KeyP') {
      this.togglePause();
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    if ((e.code === 'KeyW' || e.code === 'ArrowUp') && this.inputAxes.y > 0) this.inputAxes.y = 0;
    if ((e.code === 'KeyS' || e.code === 'ArrowDown') && this.inputAxes.y < 0) this.inputAxes.y = 0;
    if ((e.code === 'KeyA' || e.code === 'ArrowLeft') && this.inputAxes.x < 0) this.inputAxes.x = 0;
    if ((e.code === 'KeyD' || e.code === 'ArrowRight') && this.inputAxes.x > 0) this.inputAxes.x = 0;
  };

  private handlePointerDown = (e: PointerEvent) => {
    if (e.button === 0 || e.pointerType === 'touch') {
      this.isDraggingCamera = true;
      this.lastTouchPos = { x: e.clientX, y: e.clientY };
    }
  };

  private handlePointerMove = (e: PointerEvent) => {
    if (!this.isDraggingCamera) return;
    const dx = e.clientX - this.lastTouchPos.x;
    const dy = e.clientY - this.lastTouchPos.y;
    this.lastTouchPos = { x: e.clientX, y: e.clientY };

    const sensitivity = this.settings.cameraSensitivity || 1.0;
    this.cameraYaw -= dx * 0.4 * sensitivity;
    this.cameraPitch = Math.max(
      5,
      Math.min(75, this.cameraPitch + (this.settings.invertY ? -1 : 1) * dy * 0.3 * sensitivity)
    );
  };

  private handlePointerUp = () => {
    this.isDraggingCamera = false;
  };

  private pollGamepad() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[0];
    if (!gp) return;

    const deadzone = 0.15;
    const stickX = Math.abs(gp.axes[0]) > deadzone ? gp.axes[0] : 0;
    const stickY = Math.abs(gp.axes[1]) > deadzone ? -gp.axes[1] : 0;

    if (Math.abs(stickX) > 0.1 || Math.abs(stickY) > 0.1) {
      this.inputAxes.x = stickX;
      this.inputAxes.y = stickY;
    }

    const rStickX = Math.abs(gp.axes[2]) > deadzone ? gp.axes[2] : 0;
    const rStickY = Math.abs(gp.axes[3]) > deadzone ? gp.axes[3] : 0;
    if (Math.abs(rStickX) > 0.1 || Math.abs(rStickY) > 0.1) {
      this.cameraYaw -= rStickX * 2.5;
      this.cameraPitch = Math.max(5, Math.min(75, this.cameraPitch + rStickY * 2.0));
    }

    if (gp.buttons[0]?.pressed && !this.jumpRequested) {
      this.jumpRequested = true;
    }
    if (gp.buttons[1]?.pressed || gp.buttons[2]?.pressed || gp.buttons[7]?.pressed) {
      this.dashRequested = true;
    }
    if (gp.buttons[9]?.pressed) {
      this.togglePause();
    }
  }

  // --- Main Game Update Loop ---
  private onUpdate(dt: number) {
    if (!this.isRunning || this.isPaused || this.hasWon) return;

    const clampedDt = Math.min(dt, 0.05);
    this.gameTime += clampedDt;

    this.pollGamepad();
    this.updateDynamicObjects(clampedDt);
    this.updateCollapsingPlatforms(clampedDt);
    this.updateCollectibles(clampedDt);
    this.updatePlayerPhysics(clampedDt);
    this.updateVoxelLimbAnimations(clampedDt);
    this.updateCameraPosition();
    this.updateParticles(clampedDt);
    this.checkHazardCollisions();
    this.checkGoalReached();

    // Check Void Fall
    if (this.playerPos.y < -12) {
      this.respawnPlayer();
    }
  }

  private updateDynamicObjects(dt: number) {
    for (const item of this.dynamicObjects) {
      item.timer += dt;
      const data = item.data;

      if (data.type === 'platform_moving') {
        const dist = data.properties?.moveDistance || 5;
        const speed = item.currentSpeed;
        const offset = Math.sin(item.timer * speed) * dist;

        const pos = item.initialPos.clone();
        const axis = data.properties?.moveAxis || 'x';
        if (axis === 'x') pos.x += offset;
        else if (axis === 'y') pos.y += offset;
        else pos.z += offset;

        item.entity.setLocalPosition(pos.x, pos.y, pos.z);
      } else if (data.type === 'hazard_spinner') {
        const rotSpeed = (data.properties?.moveSpeed || 2) * 60;
        item.entity.rotate(0, rotSpeed * dt, 0);
      } else if (data.type === 'hazard_stomper') {
        const cycle = (item.timer * 2) % 3;
        let yOffset = 0;
        if (cycle < 0.5) {
          yOffset = -((data.properties?.moveDistance || 3) * (cycle / 0.5));
        } else if (cycle < 1.0) {
          yOffset = -(data.properties?.moveDistance || 3);
        } else {
          const t = (cycle - 1.0) / 2.0;
          yOffset = -(data.properties?.moveDistance || 3) * (1 - t);
        }
        item.entity.setLocalPosition(item.initialPos.x, item.initialPos.y + yOffset, item.initialPos.z);
      } else if (data.type === 'hazard_laser') {
        const period = data.properties?.laserPeriod || 3;
        const duration = data.properties?.laserDuration || 1.5;
        const active = (item.timer % period) < duration;
        item.entity.enabled = active;
      }
    }
  }

  private updateCollapsingPlatforms(dt: number) {
    for (const cp of this.collapsingPlatforms) {
      if (cp.state === 'shaking') {
        cp.timer += dt;
        const shake = (Math.random() - 0.5) * 0.15;
        cp.entity.setLocalPosition(cp.initialPos.x + shake, cp.initialPos.y, cp.initialPos.z + shake);

        if (cp.timer > 0.8) {
          cp.state = 'falling';
          cp.timer = 0;
        }
      } else if (cp.state === 'falling') {
        cp.timer += dt;
        const curPos = cp.entity.getLocalPosition();
        cp.entity.setLocalPosition(curPos.x, curPos.y - 12 * dt, curPos.z);

        if (cp.timer > 1.2) {
          cp.entity.enabled = false;
          cp.state = 'respawning';
          cp.respawnTimer = 2.5;
        }
      } else if (cp.state === 'respawning') {
        cp.respawnTimer -= dt;
        if (cp.respawnTimer <= 0) {
          cp.state = 'idle';
          cp.entity.enabled = true;
          cp.entity.setLocalPosition(cp.initialPos.x, cp.initialPos.y, cp.initialPos.z);
        }
      }
    }
  }

  private updateCollectibles(dt: number) {
    for (const col of this.collectibles) {
      if (col.collected) continue;

      // Bob up and down + stepped 8-bit rotation
      const rot = col.entity.getEulerAngles();
      col.entity.setEulerAngles(rot.x, rot.y + 120 * dt, rot.z);

      const floatY = col.initialY + Math.sin(this.gameTime * 3 + col.data.position.x) * 0.25;
      const cur = col.entity.getLocalPosition();
      col.entity.setLocalPosition(cur.x, floatY, cur.z);

      const p = this.playerPos;
      const dx = cur.x - p.x;
      const dy = cur.y - p.y;
      const dz = cur.z - p.z;
      const distSq = dx * dx + dy * dy + dz * dz;

      if (distSq < 2.0) {
        col.collected = true;
        col.entity.enabled = false;
        soundEngine.playCoin();
        this.emitParticle(cur, 8);

        if (col.type === 'gem') {
          this.gemsCollected++;
          this.callbacks.onGemCollected?.(this.gemsCollected, this.totalGemsInLevel);
        } else if (col.type === 'star') {
          soundEngine.playStar();
          this.callbacks.onStarCollected?.();
        } else if (col.type === 'speed') {
          this.speedBoostTimer = 6.0;
          this.callbacks.onSpeedBoost?.(6.0);
        }
      }
    }
  }

  private updatePlayerPhysics(dt: number) {
    if (!this.playerEntity) return;

    const isBoosted = this.speedBoostTimer > 0;
    if (isBoosted) this.speedBoostTimer -= dt;
    const baseMoveSpeed = isBoosted ? 16 : 10;
    const maxAccel = this.currentPlatformType === 'ice' ? 12 : 35;
    const friction = this.currentPlatformType === 'ice' ? 0.98 : 0.82;

    const rad = (this.cameraYaw * Math.PI) / 180;
    const forward = new pc.Vec3(-Math.sin(rad), 0, -Math.cos(rad));
    const right = new pc.Vec3(Math.cos(rad), 0, -Math.sin(rad));

    const moveDir = new pc.Vec3(0, 0, 0);
    moveDir.add(forward.clone().mulScalar(this.inputAxes.y));
    moveDir.add(right.clone().mulScalar(this.inputAxes.x));
    if (moveDir.length() > 1) moveDir.normalize();

    // Dash Mechanic
    if (this.dashCooldown > 0) this.dashCooldown -= dt;
    if (this.dashTimer > 0) this.dashTimer -= dt;

    if (this.dashRequested && this.dashCooldown <= 0) {
      this.dashRequested = false;
      this.dashCooldown = 1.0;
      this.dashTimer = 0.22;
      soundEngine.playDash();
      this.emitParticle(this.playerPos, 12);

      const dashDir = moveDir.length() > 0.1 ? moveDir.clone() : forward.clone();
      this.playerVel.x = dashDir.x * 26;
      this.playerVel.z = dashDir.z * 26;
      this.playerVel.y = 2.5;
    }
    this.dashRequested = false;

    // Horizontal Velocity Acceleration
    if (this.dashTimer <= 0) {
      const targetVelX = moveDir.x * baseMoveSpeed;
      const targetVelZ = moveDir.z * baseMoveSpeed;

      this.playerVel.x += (targetVelX - this.playerVel.x) * maxAccel * dt;
      this.playerVel.z += (targetVelZ - this.playerVel.z) * maxAccel * dt;

      if (this.currentPlatformVel.length() > 0) {
        this.playerVel.add(this.currentPlatformVel.clone().mulScalar(dt * 5));
      }

      if (moveDir.length() < 0.05) {
        this.playerVel.x *= friction;
        this.playerVel.z *= friction;
      }
    }

    // Jump Handling
    if (this.jumpRequested) {
      this.jumpRequested = false;
      if (this.isGrounded) {
        this.playerVel.y = 13.5;
        this.jumpCount = 1;
        this.isGrounded = false;
        soundEngine.playJump();
        this.emitParticle(this.playerPos, 6);
      } else if (this.jumpCount < this.maxJumps) {
        this.playerVel.y = 12.0;
        this.jumpCount++;
        soundEngine.playDoubleJump();
        this.emitParticle(this.playerPos, 10);
      }
    }

    // Gravity
    const gravity = this.levelData.gravity || -28;
    this.playerVel.y += gravity * dt;

    // Apply Velocity
    this.playerPos.x += this.playerVel.x * dt;
    this.playerPos.y += this.playerVel.y * dt;
    this.playerPos.z += this.playerVel.z * dt;

    // Collision Detection
    this.resolvePlatformCollisions();

    // Rotate Voxel Character Model toward movement
    if (this.playerModel && (Math.abs(this.playerVel.x) > 0.5 || Math.abs(this.playerVel.z) > 0.5)) {
      const targetAngle = (Math.atan2(this.playerVel.x, this.playerVel.z) * 180) / Math.PI;
      this.playerModel.setEulerAngles(0, targetAngle, 0);
      this.emitParticle(this.playerPos, 1);
    }

    this.playerEntity.setLocalPosition(this.playerPos.x, this.playerPos.y, this.playerPos.z);
  }

  /**
   * Minecraft Voxel Character Limb Swing and Jump Pose Animations
   */
  private updateVoxelLimbAnimations(dt: number) {
    if (!this.playerLeftArm || !this.playerRightArm || !this.playerLeftLeg || !this.playerRightLeg) return;

    const horizSpeed = Math.sqrt(this.playerVel.x * this.playerVel.x + this.playerVel.z * this.playerVel.z);

    if (this.dashTimer > 0) {
      // Dash Pose: Arms back, body forward
      this.playerLeftArm.setEulerAngles(55, 0, -10);
      this.playerRightArm.setEulerAngles(55, 0, 10);
      this.playerLeftLeg.setEulerAngles(-30, 0, 0);
      this.playerRightLeg.setEulerAngles(-30, 0, 0);
    } else if (!this.isGrounded) {
      // In Air / Jump Pose: Arms up, legs bent
      this.playerLeftArm.setEulerAngles(-120, 0, -15);
      this.playerRightArm.setEulerAngles(-120, 0, 15);
      this.playerLeftLeg.setEulerAngles(25, 0, 0);
      this.playerRightLeg.setEulerAngles(-25, 0, 0);
    } else if (horizSpeed > 0.8) {
      // Walking / Running: Alternating limb swing
      this.limbAnimTime += dt * horizSpeed * 2.8;
      const swingAngle = Math.sin(this.limbAnimTime) * 40;

      this.playerLeftArm.setEulerAngles(swingAngle, 0, 0);
      this.playerRightArm.setEulerAngles(-swingAngle, 0, 0);
      this.playerLeftLeg.setEulerAngles(-swingAngle, 0, 0);
      this.playerRightLeg.setEulerAngles(swingAngle, 0, 0);
    } else {
      // Idle Standing Pose: gentle breathing bob
      const idleBob = Math.sin(this.gameTime * 2.5) * 3;
      this.playerLeftArm.setEulerAngles(idleBob, 0, 0);
      this.playerRightArm.setEulerAngles(-idleBob, 0, 0);
      this.playerLeftLeg.setEulerAngles(0, 0, 0);
      this.playerRightLeg.setEulerAngles(0, 0, 0);
    }
  }

  private resolvePlatformCollisions() {
    this.isGrounded = false;
    this.currentPlatformVel.set(0, 0, 0);
    this.currentPlatformType = 'normal';

    const playerRadius = 0.5;
    const playerFeet = this.playerPos.y - playerRadius;

    for (const obj of this.levelData.objects) {
      if (
        !obj.type.startsWith('platform_') &&
        obj.type !== 'start' &&
        obj.type !== 'goal' &&
        obj.type !== 'checkpoint'
      ) {
        continue;
      }

      let objPos = new pc.Vec3(obj.position.x, obj.position.y, obj.position.z);
      const scale = obj.scale ? new pc.Vec3(obj.scale.x, obj.scale.y, obj.scale.z) : new pc.Vec3(1, 1, 1);

      if (obj.type === 'platform_moving') {
        const dyn = this.dynamicObjects.find(d => d.data.id === obj.id);
        if (dyn) objPos = dyn.entity.getLocalPosition();
      } else if (obj.type === 'platform_collapsing') {
        const col = this.collapsingPlatforms.find(c => c.entity.name === obj.id);
        if (col && (col.state === 'falling' || !col.entity.enabled)) continue;
        if (col) objPos = col.entity.getLocalPosition();
      }

      const halfW = scale.x / 2 + playerRadius;
      const halfH = scale.y / 2;
      const halfD = scale.z / 2 + playerRadius;

      if (
        this.playerPos.x >= objPos.x - halfW &&
        this.playerPos.x <= objPos.x + halfW &&
        this.playerPos.z >= objPos.z - halfD &&
        this.playerPos.z <= objPos.z + halfD
      ) {
        const platformTop = objPos.y + halfH;

        if (
          playerFeet <= platformTop &&
          this.playerPos.y >= platformTop &&
          this.playerVel.y <= 0.5
        ) {
          this.playerPos.y = platformTop + playerRadius;
          this.playerVel.y = 0;
          this.isGrounded = true;
          this.jumpCount = 0;

          if (obj.type === 'platform_bouncy') {
            const bounceForce = obj.properties?.bounciness || 20;
            this.playerVel.y = bounceForce;
            this.isGrounded = false;
            soundEngine.playSpring();
            this.emitParticle(this.playerPos, 10);
          } else if (obj.type === 'platform_ice') {
            this.currentPlatformType = 'ice';
          } else if (obj.type === 'platform_conveyer') {
            const speed = obj.properties?.conveyerSpeed || 6;
            this.currentPlatformVel.set(0, 0, -speed);
          } else if (obj.type === 'platform_collapsing') {
            const col = this.collapsingPlatforms.find(c => c.entity.name === obj.id);
            if (col && col.state === 'idle') {
              col.state = 'shaking';
            }
          }
        }
      }
    }

    // Check Checkpoint activation
    for (const obj of this.levelData.objects) {
      if (obj.type === 'checkpoint') {
        const dx = obj.position.x - this.playerPos.x;
        const dz = obj.position.z - this.playerPos.z;
        if (dx * dx + dz * dz < 4.0 && Math.abs(obj.position.y - this.playerPos.y) < 3.0) {
          if (
            this.lastCheckpoint.x !== obj.position.x ||
            this.lastCheckpoint.z !== obj.position.z
          ) {
            this.lastCheckpoint.set(obj.position.x, obj.position.y + 1, obj.position.z);
            soundEngine.playCheckpoint();
            this.emitParticle(this.playerPos, 15);
            this.callbacks.onCheckpointReached?.(obj.position);
          }
        }
      }
    }
  }

  private checkHazardCollisions() {
    for (const obj of this.levelData.objects) {
      if (!obj.type.startsWith('hazard_')) continue;

      let pos = new pc.Vec3(obj.position.x, obj.position.y, obj.position.z);
      let enabled = true;

      if (obj.type === 'hazard_spinner' || obj.type === 'hazard_stomper' || obj.type === 'hazard_laser') {
        const dyn = this.dynamicObjects.find(d => d.data.id === obj.id);
        if (dyn) {
          pos = dyn.entity.getLocalPosition();
          enabled = dyn.entity.enabled;
        }
      }

      if (!enabled) continue;

      const scale = obj.scale ? new pc.Vec3(obj.scale.x, obj.scale.y, obj.scale.z) : new pc.Vec3(1, 1, 1);
      const hitDist = (scale.x + scale.z) / 2;

      const dx = pos.x - this.playerPos.x;
      const dy = pos.y - this.playerPos.y;
      const dz = pos.z - this.playerPos.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < hitDist && Math.abs(dy) < 1.5) {
        this.respawnPlayer();
        break;
      }
    }
  }

  private checkGoalReached() {
    const goal = this.levelData.objects.find(o => o.type === 'goal');
    if (!goal || this.hasWon) return;

    const dx = goal.position.x - this.playerPos.x;
    const dy = goal.position.y - this.playerPos.y;
    const dz = goal.position.z - this.playerPos.z;
    const distSq = dx * dx + dz * dz;

    if (distSq < 3.5 && Math.abs(dy) < 2.5) {
      this.hasWon = true;
      soundEngine.playVictory();
      this.emitParticle(this.playerPos, 25);
      this.callbacks.onLevelComplete?.(
        Math.round(this.gameTime * 100) / 100,
        this.gemsCollected,
        this.totalGemsInLevel
      );
    }
  }

  public respawnPlayer() {
    soundEngine.playHurt();
    this.deathCount++;
    this.callbacks.onPlayerDeath?.(this.deathCount);
    this.emitParticle(this.playerPos, 15);

    this.playerPos = this.lastCheckpoint.clone();
    this.playerVel.set(0, 0, 0);
    this.jumpCount = 0;
    this.isGrounded = false;
  }

  private updateCameraPosition(instant = false) {
    if (!this.cameraEntity || !this.playerEntity) return;

    const radYaw = (this.cameraYaw * Math.PI) / 180;
    const radPitch = (this.cameraPitch * Math.PI) / 180;
    const camDist = 9.0;

    const camX = this.playerPos.x + camDist * Math.sin(radYaw) * Math.cos(radPitch);
    const camY = this.playerPos.y + camDist * Math.sin(radPitch) + 1.2;
    const camZ = this.playerPos.z + camDist * Math.cos(radYaw) * Math.cos(radPitch);

    if (instant) {
      this.cameraEntity.setLocalPosition(camX, camY, camZ);
    } else {
      const cur = this.cameraEntity.getLocalPosition();
      this.cameraEntity.setLocalPosition(
        cur.x + (camX - cur.x) * 0.12,
        cur.y + (camY - cur.y) * 0.12,
        cur.z + (camZ - cur.z) * 0.12
      );
    }

    this.cameraEntity.lookAt(this.playerPos.x, this.playerPos.y + 1.0, this.playerPos.z);
  }

  private updateParticles(dt: number) {
    for (const p of this.particlePool) {
      if (p.active) {
        p.life += dt;
        if (p.life >= p.maxLife) {
          p.active = false;
          p.entity.enabled = false;
        } else {
          const cur = p.entity.getLocalPosition();
          p.entity.setLocalPosition(
            cur.x + p.vel.x * dt,
            cur.y + p.vel.y * dt,
            cur.z + p.vel.z * dt
          );
          const s = (1 - p.life / p.maxLife) * 0.25;
          p.entity.setLocalScale(s, s, s);
        }
      }
    }
  }

  public togglePause(): boolean {
    this.isPaused = !this.isPaused;
    soundEngine.playClick();
    this.callbacks.onGamePaused?.(this.isPaused);
    return this.isPaused;
  }

  public setQuality(quality: 'low' | 'medium' | 'high') {
    this.settings.quality = quality;
    if (this.app) {
      if (this.settings.pixelMode === 'ultra_8bit') {
        this.app.graphicsDevice.maxPixelRatio = 0.32;
      } else if (this.settings.pixelMode === 'classic_16bit') {
        this.app.graphicsDevice.maxPixelRatio = 0.58;
      } else {
        if (quality === 'low') {
          this.app.graphicsDevice.maxPixelRatio = 0.8;
          if (this.dirLight) this.dirLight.light!.castShadows = false;
        } else if (quality === 'medium') {
          this.app.graphicsDevice.maxPixelRatio = 1.0;
          if (this.dirLight) this.dirLight.light!.castShadows = true;
        } else {
          this.app.graphicsDevice.maxPixelRatio = Math.min(window.devicePixelRatio || 1, 2.0);
          if (this.dirLight) this.dirLight.light!.castShadows = true;
        }
      }
    }
  }

  public getElapsedTime(): number {
    return this.gameTime;
  }

  public destroy() {
    this.isRunning = false;
    soundEngine.stopMusic();

    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.canvas.removeEventListener('pointerdown', this.handlePointerDown);
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerup', this.handlePointerUp);

    if (this.app) {
      this.app.destroy();
      this.app = null;
    }
  }
}
