import { AnimationMixer, Group } from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import Animation from "./animation";

/**
 * 角色类
 */
export default class Character {
  /**
   * 模型的url地址
   */
  public url: string;

  public animations: Array<Animation>;

  public mixer: AnimationMixer;

  constructor(
    url: string,
    animations: Array<Animation>,
    mixer: AnimationMixer,
    onLoad: (object: Group) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (event: ErrorEvent) => void
  ) {
    this.url = url;
    this.animations = animations;
    this.mixer = mixer;
    let loader = new FBXLoader();
    loader.load(url, onLoad, onProgress, onError);
  }

  public play(nameOrIndex: number | string) {
    if (typeof nameOrIndex == "number") {
      this.playByIndex(nameOrIndex);
    } else {
      this.playByName(nameOrIndex);
    }
  }

  private playByIndex(index: number) {
      let clip = this.animations[index].animationClip
      if(clip){
        this.mixer.clipAction(clip)
      }
  }

  private playByName(name: string) {
    let clip = this.animations.filter(value=>value.name == name)[0].animationClip;
    if(clip){
        this.mixer.clipAction(clip)
      }
  }
}
