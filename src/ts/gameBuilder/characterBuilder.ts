import * as THREE from "three";
import SceneRender from "../scene/sceneRender";
import BaseThree from "../common/baseThree";
import Animation from "../apis/animation";
import Character from "../apis/character";
import { Group } from "three";
import { AniEffectScope } from "../apis/enum";
import AnimationInput from "../apis/animationInput";

/**
 * 角色构建器
 */
export default class CharacterBuilder extends BaseThree {
  public characterUrl: string;

  public animationsInput: Array<AnimationInput>;

  public animations: Array<Animation> = [];

  public character: Character | null = null;

  public skinMeshIndex: number;

  public mixer: THREE.AnimationMixer | null = null;

  public scene: THREE.Scene;

  private onLoad: (object: Group) => void;
  private onProgress?: (event: ProgressEvent) => void;
  private onError?: (event: ErrorEvent) => void;

  constructor(
    characterUrl: string,
    animationsInput: Array<AnimationInput>,
    skinMeshIndex: number,
    scene: THREE.Scene,
    onLoad: (object: Group) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (event: ErrorEvent) => void
  ) {
    super();
    this.characterUrl = characterUrl;
    this.animationsInput = animationsInput;
    this.skinMeshIndex = skinMeshIndex;
    this.scene = scene;
    this.onLoad = onLoad;
    this.onProgress = onProgress;
    this.onError = onError;
    this.enable();
  }

  start(): void {
    this.loadCharacter(0);
  }

  update(): void { }

  loadCharacter(animationIndex: number) {
    if (animationIndex < this.animationsInput.length) {
      let animationInput = this.animationsInput[animationIndex];
      let animation: Animation = new Animation(
        animationInput.url,
        animationInput.name,
        animationInput.aniIndex,
        animationInput.effectScope,
        animationInput.loop,
        animationInput.weight,
        (object) => {
          if (animationInput.onLoad) {
            animationInput.onLoad(object);
          }
          this.onAnimationSuccess(object);
          this.loadCharacter(animationIndex + 1);
        }
      );
      this.animations.push(animation);
    } else {
      let character: Character = new Character(
        this.characterUrl,
        this.animations,
        this.skinMeshIndex,
        (object) => {
          this.scene.add(object);
          this.onLoad(object);
        }
      );
      this.character = character;
    }
  }

  onAnimationSuccess(object: Group) { }

  onCharacterSuccess(object: Group) { }
}
