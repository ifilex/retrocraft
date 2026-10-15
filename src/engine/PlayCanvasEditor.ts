import * as pc from 'playcanvas';
import {
  LevelData,
  LevelObject,
  ObjectType,
  Vector3D,
  GameSettings,
  PixelMode
} from '../types/game';
import { RetroTextureGenerator } from './RetroTextureGenerator';

export class PlayCanvasEditor {
  private canvas: HTMLCanvasElement;
  private app: pc.Application | null = null;
  public levelData: LevelData;
  private settings: GameSettings;
  private onSelectObject?: (obj: LevelObject | null) => void;

  private cameraEntity: pc.Entity | null = null;
  private gridEntity: pc.Entity | null = null;
  private objectEntities: Map<string, pc.Entity> = new Map();
  public selectedObjectId: string | null = null;
  private selectionMarker: pc.Entity | null = null;

  // Editor Camera Controls
  public cameraTarget = new pc.Vec3(0, 0, -20);
  public cameraDistance = 35;
  public cameraYaw = 45;
  public cameraPitch = 35;
  private isOrbiting = false;
  private isPanning = false;
  private lastPointerPos = { x: 0, y: 0 };

  constructor(
    canvas: HTMLCanvasElement,
    levelData: LevelData,
    settings: GameSettings,
    onSelectObject?: (obj: LevelObject | null) => void
  ) {
    this.canvas = canvas;
    this.levelData = levelData;
    this.settings = settings;
    this.onSelectObject = onSelectObject;

    this.initEditor();
  }

  private initEditor() {
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

    this.applyPixelMode(this.settings.pixelMode || 'ultra_8bit');

    this.setupLighting();
    this.setupCamera();
    this.setupGrid();
    this.setupSelectionGizmo();
    this.rebuildAllObjects();
    this.setupEventListeners();

    this.app.on('update', () => this.updateCamera());
  }

  public applyPixelMode(mode: PixelMode) {
    if (!this.app) return;
    if (mode === 'ultra_8bit') {
      this.app.graphicsDevice.maxPixelRatio = 0.45;
      this.canvas.classList.add('pixelated-render');
    } else if (mode === 'classic_16bit') {
      this.app.graphicsDevice.maxPixelRatio = 0.7;
      this.canvas.classList.add('pixelated-render');
    } else {
      this.canvas.classList.remove('pixelated-render');
      this.app.graphicsDevice.maxPixelRatio = Math.min(window.devicePixelRatio || 1, 2.0);
    }
  }

  private setupLighting() {
    if (!this.app) return;

    this.app.scene.ambientLight = new pc.Color(0.28, 0.32, 0.42);

    const light = new pc.Entity('editorLight');
    light.addComponent('light', {
      type: 'directional',
      color: new pc.Color(1, 0.98, 0.92),
      intensity: 1.4,
      castShadows: false,
    });
    light.setEulerAngles(45, 35, 0);
    this.app.root.addChild(light);

    const fillLight = new pc.Entity('fillLight');
    fillLight.addComponent('light', {
      type: 'directional',
      color: new pc.Color(0.5, 0.65, 0.9),
      intensity: 0.7,
      castShadows: false,
    });
    fillLight.setEulerAngles(-30, -145, 0);
    this.app.root.addChild(fillLight);
  }

  private setupCamera() {
    if (!this.app) return;

    this.cameraEntity = new pc.Entity('editorCamera');
    this.cameraEntity.addComponent('camera', {
      clearColor: new pc.Color(0.07, 0.09, 0.15),
      fov: 55,
      nearClip: 0.1,
      farClip: 500,
    });

    this.updateCamera();
    this.app.root.addChild(this.cameraEntity);
  }

  private setupGrid() {
    if (!this.app) return;

    this.gridEntity = new pc.Entity('gridPlane');
    this.gridEntity.addComponent('render', { type: 'plane' });
    this.gridEntity.setLocalScale(200, 1, 200);
    this.gridEntity.setLocalPosition(0, -0.05, -20);

    const gridMat = new pc.StandardMaterial();
    gridMat.diffuse = new pc.Color(0.08, 0.11, 0.18);
    gridMat.useMetalness = true;
    gridMat.metalness = 0.2;
    gridMat.gloss = 0.4;
    gridMat.update();

    this.gridEntity.render!.material = gridMat;
    this.app.root.addChild(this.gridEntity);
  }

  private setupSelectionGizmo() {
    if (!this.app) return;

    this.selectionMarker = new pc.Entity('selectionMarker');
    this.selectionMarker.addComponent('render', { type: 'box' });
    this.selectionMarker.setLocalScale(1.1, 1.1, 1.1);

    const mat = new pc.StandardMaterial();
    mat.diffuse = new pc.Color(1, 0.9, 0);
    mat.emissive = new pc.Color(1, 0.8, 0.1);
    mat.opacity = 0.45;
    mat.blendType = pc.BLEND_ADDITIVE;
    mat.update();

    this.selectionMarker.render!.material = mat;
    this.selectionMarker.enabled = false;
    this.app.root.addChild(this.selectionMarker);
  }

  private createVoxelMaterial(
    texture?: pc.Texture,
    colorHex?: string,
    emissiveHex?: string
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
    mat.metalness = 0.2;
    mat.gloss = 0.3;

    if (emissiveHex) {
      mat.emissive = new pc.Color().fromString(emissiveHex);
      mat.emissiveIntensity = 0.6;
    }
    mat.update();
    return mat;
  }

  public rebuildAllObjects() {
    if (!this.app) return;

    this.objectEntities.forEach(ent => ent.destroy());
    this.objectEntities.clear();

    for (const obj of this.levelData.objects) {
      this.createObjectEntity(obj);
    }

    this.updateSelectionMarker();
  }

  private createObjectEntity(obj: LevelObject) {
    if (!this.app) return;

    const ent = new pc.Entity('obj_' + obj.id);
    const pos = obj.position;
    const rot = obj.rotation || { x: 0, y: 0, z: 0 };
    const scale = obj.scale || { x: 1, y: 1, z: 1 };
    const theme = this.levelData.theme;

    ent.setLocalPosition(pos.x, pos.y, pos.z);
    ent.setEulerAngles(rot.x, rot.y, rot.z);
    ent.setLocalScale(scale.x, scale.y, scale.z);

    if (obj.type === 'start') {
      ent.addComponent('render', { type: 'box' });
      ent.setLocalScale(3, 0.4, 3);
      ent.render!.material = this.createVoxelMaterial(
        RetroTextureGenerator.getVoxelCyberTexture(this.app, '#3b82f6', '#93c5fd'),
        '#3b82f6',
        '#60a5fa'
      );
    } else if (obj.type === 'goal') {
      ent.addComponent('render', { type: 'box' });
      ent.setLocalScale(2.5, 3.5, 2.5);
      ent.render!.material = this.createVoxelMaterial(
        RetroTextureGenerator.getVoxelCyberTexture(this.app, '#10b981', '#6ee7b7'),
        '#10b981',
        '#34d399'
      );
    } else if (obj.type === 'checkpoint') {
      ent.addComponent('render', { type: 'box' });
      ent.setLocalScale(1.2, 2.5, 1.2);
      ent.render!.material = this.createVoxelMaterial(
        RetroTextureGenerator.getVoxelCobblestoneTexture(this.app),
        '#38bdf8',
        '#0284c7'
      );
    } else if (obj.type === 'platform_normal') {
      ent.addComponent('render', { type: 'box' });
      const tex =
        theme === 'inferno'
          ? RetroTextureGenerator.getVoxelInfernoTexture(this.app)
          : theme === 'crystal'
          ? RetroTextureGenerator.getVoxelCyberTexture(this.app, '#9333ea', '#c084fc')
          : theme === 'cyber'
          ? RetroTextureGenerator.getVoxelCyberTexture(this.app, '#2563eb', '#60a5fa')
          : RetroTextureGenerator.getVoxelGrassSideTexture(this.app);
      ent.render!.material = this.createVoxelMaterial(tex, obj.color);
    } else if (obj.type === 'platform_ice') {
      ent.addComponent('render', { type: 'box' });
      ent.render!.material = this.createVoxelMaterial(
        RetroTextureGenerator.getVoxelIceTexture(this.app),
        '#93c5fd',
        '#bfdbfe'
      );
    } else if (obj.type === 'platform_bouncy') {
      ent.addComponent('render', { type: 'box' });
      ent.render!.material = this.createVoxelMaterial(
        RetroTextureGenerator.getVoxelBouncyTexture(this.app),
        '#10b981',
        '#34d399'
      );
    } else if (obj.type === 'platform_conveyer') {
      ent.addComponent('render', { type: 'box' });
      ent.render!.material = this.createVoxelMaterial(
        RetroTextureGenerator.getVoxelConveyerTexture(this.app),
        '#f59e0b',
        '#fbbf24'
      );
    } else if (obj.type === 'platform_collapsing') {
      ent.addComponent('render', { type: 'box' });
      ent.render!.material = this.createVoxelMaterial(
        RetroTextureGenerator.getVoxelCollapsingTexture(this.app),
        '#e11d48',
        '#fb7185'
      );
    } else if (obj.type === 'platform_moving') {
      ent.addComponent('render', { type: 'box' });
      ent.render!.material = this.createVoxelMaterial(
        RetroTextureGenerator.getVoxelCyberTexture(this.app, '#8b5cf6', '#a78bfa'),
        '#8b5cf6',
        '#a78bfa'
      );
    } else if (obj.type === 'hazard_spikes') {
      ent.addComponent('render', { type: 'box' });
      ent.setEulerAngles(45, 0, 45);
      ent.render!.material = this.createVoxelMaterial(
        RetroTextureGenerator.getVoxelCollapsingTexture(this.app),
        '#ef4444',
        '#f87171'
      );
    } else if (obj.type === 'hazard_laser') {
      ent.addComponent('render', { type: 'box' });
      ent.setLocalScale(scale.x * 4, 0.4, 0.4);
      ent.render!.material = this.createVoxelMaterial(undefined, '#ff0055', '#ff0055');
    } else if (obj.type === 'hazard_stomper') {
      ent.addComponent('render', { type: 'box' });
      ent.render!.material = this.createVoxelMaterial(
        RetroTextureGenerator.getVoxelCobblestoneTexture(this.app, '#991b1b'),
        '#991b1b',
        '#dc2626'
      );
    } else if (obj.type === 'hazard_spinner') {
      ent.addComponent('render', { type: 'box' });
      ent.setLocalScale(scale.x * 5, 0.4, 0.4);
      ent.render!.material = this.createVoxelMaterial(
        RetroTextureGenerator.getVoxelConveyerTexture(this.app),
        '#ea580c',
        '#f97316'
      );
    } else if (obj.type === 'collectible_gem') {
      ent.addComponent('render', { type: 'box' });
      ent.setLocalScale(0.8, 0.8, 0.8);
      ent.setEulerAngles(45, 45, 0);
      ent.render!.material = this.createVoxelMaterial(
        RetroTextureGenerator.getVoxelGemTexture(this.app, '#06b6d4'),
        '#06b6d4',
        '#22d3ee'
      );
    } else if (obj.type === 'collectible_star') {
      ent.addComponent('render', { type: 'box' });
      ent.setLocalScale(0.9, 0.9, 0.9);
      ent.setEulerAngles(0, 45, 45);
      ent.render!.material = this.createVoxelMaterial(
        RetroTextureGenerator.getVoxelGemTexture(this.app, '#eab308'),
        '#eab308',
        '#facc15'
      );
    } else if (obj.type === 'collectible_speed') {
      ent.addComponent('render', { type: 'box' });
      ent.setLocalScale(0.7, 1.2, 0.7);
      ent.render!.material = this.createVoxelMaterial(
        RetroTextureGenerator.getVoxelGemTexture(this.app, '#f97316'),
        '#f97316',
        '#fb923c'
      );
    } else {
      ent.addComponent('render', { type: 'box' });
      ent.render!.material = this.createVoxelMaterial(
        RetroTextureGenerator.getVoxelCobblestoneTexture(this.app)
      );
    }

    this.app.root.addChild(ent);
    this.objectEntities.set(obj.id, ent);
  }

  public addObject(type: ObjectType, customPos?: Vector3D): LevelObject {
    const pos = customPos || {
      x: Math.round(this.cameraTarget.x),
      y: 1,
      z: Math.round(this.cameraTarget.z)
    };

    let scale: Vector3D = { x: 4, y: 1, z: 4 };
    if (type.startsWith('collectible_')) scale = { x: 1, y: 1, z: 1 };
    else if (type.startsWith('hazard_')) scale = { x: 1.5, y: 1.5, z: 1.5 };
    else if (type === 'start' || type === 'goal') scale = { x: 1, y: 1, z: 1 };

    const newObj: LevelObject = {
      id: 'obj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      type,
      position: pos,
      scale,
      rotation: { x: 0, y: 0, z: 0 },
      properties: {
        moveDistance: 5,
        moveSpeed: 2.5,
        moveAxis: 'x',
        bounciness: 20
      }
    };

    this.levelData.objects.push(newObj);
    this.createObjectEntity(newObj);
    this.selectObject(newObj.id);
    return newObj;
  }

  public removeObject(id: string) {
    this.levelData.objects = this.levelData.objects.filter(o => o.id !== id);
    const ent = this.objectEntities.get(id);
    if (ent) {
      ent.destroy();
      this.objectEntities.delete(id);
    }
    if (this.selectedObjectId === id) {
      this.selectObject(null);
    }
  }

  public updateSelectedObject(changes: Partial<LevelObject>) {
    if (!this.selectedObjectId) return;
    const obj = this.levelData.objects.find(o => o.id === this.selectedObjectId);
    if (!obj) return;

    Object.assign(obj, changes);

    const ent = this.objectEntities.get(obj.id);
    if (ent) {
      if (changes.position) {
        ent.setLocalPosition(changes.position.x, changes.position.y, changes.position.z);
      }
      if (changes.rotation) {
        ent.setEulerAngles(changes.rotation.x, changes.rotation.y, changes.rotation.z);
      }
      if (changes.scale) {
        ent.setLocalScale(changes.scale.x, changes.scale.y, changes.scale.z);
      }
    }
    this.updateSelectionMarker();
  }

  public selectObject(id: string | null) {
    this.selectedObjectId = id;
    const obj = id ? this.levelData.objects.find(o => o.id === id) || null : null;
    this.onSelectObject?.(obj);
    this.updateSelectionMarker();
  }

  private updateSelectionMarker() {
    if (!this.selectionMarker) return;

    if (!this.selectedObjectId) {
      this.selectionMarker.enabled = false;
      return;
    }

    const obj = this.levelData.objects.find(o => o.id === this.selectedObjectId);
    if (!obj) {
      this.selectionMarker.enabled = false;
      return;
    }

    this.selectionMarker.enabled = true;
    this.selectionMarker.setLocalPosition(obj.position.x, obj.position.y, obj.position.z);

    const scale = obj.scale || { x: 1, y: 1, z: 1 };
    this.selectionMarker.setLocalScale(scale.x + 0.4, scale.y + 0.4, scale.z + 0.4);
  }

  private updateCamera() {
    if (!this.cameraEntity) return;

    const radYaw = (this.cameraYaw * Math.PI) / 180;
    const radPitch = (this.cameraPitch * Math.PI) / 180;

    const camX = this.cameraTarget.x + this.cameraDistance * Math.sin(radYaw) * Math.cos(radPitch);
    const camY = this.cameraTarget.y + this.cameraDistance * Math.sin(radPitch);
    const camZ = this.cameraTarget.z + this.cameraDistance * Math.cos(radYaw) * Math.cos(radPitch);

    this.cameraEntity.setLocalPosition(camX, camY, camZ);
    this.cameraEntity.lookAt(this.cameraTarget.x, this.cameraTarget.y, this.cameraTarget.z);
  }

  private setupEventListeners() {
    this.canvas.addEventListener('pointerdown', this.handlePointerDown);
    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('pointerup', this.handlePointerUp);
    this.canvas.addEventListener('wheel', this.handleWheel, { passive: false });
  }

  private handlePointerDown = (e: PointerEvent) => {
    if (e.button === 0) {
      this.isOrbiting = true;
      this.lastPointerPos = { x: e.clientX, y: e.clientY };
      this.pickObjectAtScreen(e.clientX, e.clientY);
    } else if (e.button === 2 || e.button === 1) {
      this.isPanning = true;
      this.lastPointerPos = { x: e.clientX, y: e.clientY };
    }
  };

  private handlePointerMove = (e: PointerEvent) => {
    const dx = e.clientX - this.lastPointerPos.x;
    const dy = e.clientY - this.lastPointerPos.y;
    this.lastPointerPos = { x: e.clientX, y: e.clientY };

    if (this.isOrbiting) {
      this.cameraYaw -= dx * 0.4;
      this.cameraPitch = Math.max(10, Math.min(85, this.cameraPitch + dy * 0.3));
    } else if (this.isPanning) {
      const radYaw = (this.cameraYaw * Math.PI) / 180;
      const forward = new pc.Vec3(-Math.sin(radYaw), 0, -Math.cos(radYaw));
      const right = new pc.Vec3(Math.cos(radYaw), 0, -Math.sin(radYaw));

      const panSpeed = this.cameraDistance * 0.0015;
      this.cameraTarget.x -= (right.x * dx - forward.x * dy) * panSpeed;
      this.cameraTarget.z -= (right.z * dx - forward.z * dy) * panSpeed;
    }
  };

  private handlePointerUp = () => {
    this.isOrbiting = false;
    this.isPanning = false;
  };

  private handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    this.cameraDistance = Math.max(8, Math.min(120, this.cameraDistance + e.deltaY * 0.05));
  };

  private pickObjectAtScreen(clientX: number, clientY: number) {
    if (!this.cameraEntity || !this.cameraEntity.camera) return;

    const rect = this.canvas.getBoundingClientRect();
    const screenX = clientX - rect.left;
    const screenY = clientY - rect.top;

    let closestObj: LevelObject | null = null;
    let minDistance = 2.5;

    for (const obj of this.levelData.objects) {
      const worldPos = new pc.Vec3(obj.position.x, obj.position.y, obj.position.z);
      const screenPos = new pc.Vec3();
      this.cameraEntity.camera.worldToScreen(worldPos, screenPos);

      const dx = screenPos.x - screenX;
      const dy = screenPos.y - screenY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 45 && dist < minDistance * 30) {
        minDistance = dist / 30;
        closestObj = obj;
      }
    }

    if (closestObj) {
      this.selectObject(closestObj.id);
    }
  }

  public destroy() {
    this.canvas.removeEventListener('pointerdown', this.handlePointerDown);
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerup', this.handlePointerUp);
    this.canvas.removeEventListener('wheel', this.handleWheel);

    if (this.app) {
      this.app.destroy();
      this.app = null;
    }
  }
}
