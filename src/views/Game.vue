<template>
  <div id="threeCanvas"
       v-loading="loading"
       element-loading-text="拼命加载中..."
       element-loading-spinner="el-icon-loading"
       element-loading-background="rgba(0, 0, 0, 0.8)">
    <game-menu :originPosY="originY"></game-menu>
    <blood v-for="character in characterHpInfos"
           :key="character.name"
           :current="character.hp"
           :isShow="character.isShow"
           :max="character.maxHp"
           :posX="character.screenPos.x"
           :posY="character.screenPos.y"></blood>
    <rebirth-time-process class="rebirthTime"
                          :nowRebirthTime="nowRebirthTime"
                          :rebirthTime="rebirthTime"
                          :originPosY="originY"
                          :originPosX="rebirthTimeX()"></rebirth-time-process>
    <game-process :originPosY="originY"></game-process>
    <game-win class="gameWin"
              :level="gameLevel"
              v-show="gameWinShow"
              @next="gemeWinNext"
              @home="home"></game-win>
    <game-over class="gameWin"
               :level="gameLevel"
               v-show="gameOverShow"
               @reStart="reStart"
               @home="home">
    </game-over>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import ThreeJs from "./index";
import Blood from "@/components/Blood.vue";
import RebirthTimeProcess from "@/components/RebirthTimeProcess.vue";
import GameProcess from "@/components/GameProcess.vue";
import GameMenu from "@/components/GameMenu.vue";
import GameWin from "@/components/GameWin.vue";
import GameOver from "@/components/GameOver.vue";
import { Color, Vector2 } from "three";
import Confs from "@/ts/common/confs/confs";
import router from "@/router";
import VueRouter from "vue-router";
import { Loading } from "element-ui";
import { ElLoadingComponent } from "element-ui/types/loading";

@Component({
  components: {
    Blood,
    RebirthTimeProcess,
    GameProcess,
    GameMenu,
    GameWin,
    GameOver,
  },
})
export default class Game extends Vue {
  @Prop(String) private level!: string;

  three: ThreeJs | null = null;

  gameWinShow: boolean = false;
  gameOverShow: boolean = false;

  loading: boolean = true;

  private onGameWinEventBind: (e: Event) => void =
    this.onGameWinEvent.bind(this);
  private onGameOverEventBind: (e: Event) => void =
    this.onGameOverEvent.bind(this);

  mounted() {
    let level = Number(this.level);
    if (!isNaN(level)) {
      this.three = new ThreeJs(Number.parseInt(this.level));
      console.log("第" + (level + 1) + "关");
      // 刚加载页面时将暂停状态置为否
      Confs.PAUSED = false;
      document.addEventListener("gameWin", this.onGameWinEventBind);
      document.addEventListener("gameOver", this.onGameOverEventBind);
      // let options = {
      //   fullscreen: true,
      //   text: "正在拼命加载...",
      //   spinner: "el-icon-loading",
      //   background: "rgba(0,0,0,0.8)",
      // };
      // this.loadingInstance = Loading.service(options);
    }
  }

  @Watch("three.isLoaded")
  loaded(newVal: any, oldVal: any) {
    if (typeof newVal == "boolean") {
      this.loading = !newVal;
    }
  }

  onGameWinEvent(e: Event) {
    // 暂停游戏
    Confs.PAUSED = true;
    this.gameWinShow = true;
  }

  onGameOverEvent(e: Event) {
    // 暂停游戏
    Confs.PAUSED = true;
    this.gameOverShow = true;
  }

  beforeDestroy() {
    // 继续游戏
    Confs.PAUSED = false;
    this.three?.clear();
    this.three?.camera?.clear();
    this.three?.ambientLight?.dispose();
    document.removeEventListener("gameWin", this.onGameWinEventBind);
    this.three?.sceneRender?.renderer?.dispose();
    this.three?.sceneRender?.renderer?.forceContextLoss();
  }

  get characterHpInfos() {
    return this.three?.characterHpInfos;
  }

  get nowRebirthTime() {
    if (!this.three?.playerBuilder) {
      return 0;
    }
    return this.three.playerBuilder.nowRebirthTime;
  }

  get rebirthTime() {
    if (!this.three?.playerBuilder) {
      return 0;
    }
    return this.three.playerBuilder.rebirthTime;
  }

  get originY() {
    if (!this.three?.sceneRender?.renderer) {
      return -1000;
    }
    return 0;
    //return this.three.sceneRender.renderer.domElement.offsetTop;
  }

  get gameLevel() {
    let level = Number(this.level);
    if (isNaN(level)) {
      return -1;
    }
    return level;
  }

  getPos(name: string) {
    if (this.three) {
      let pos = this.three.characterHpInfoMap.get(name)?.screenPos;
      return pos;
    } else {
      return new Vector2(0, 0);
    }
  }

  isShow(name: string) {
    // console.log(this.characterHpInfoMap)
    if (this.three) {
      let show = this.three.characterHpInfoMap.get(name)?.isShow;
      if (show) {
        return show;
      }
    }
    return false;
  }

  // 使用函数而不是计算，因为vue无法响应宽度变化
  rebirthTimeX() {
    let left = this.three?.sceneRender?.renderer?.domElement.width;
    if (!left) {
      left = 0;
    } else {
      left = left / 2;
    }
    return left;
  }

  /**
   * 点击下一关按钮时的响应函数
   */
  gemeWinNext() {
    let level = Number(this.level);
    if (!isNaN(level)) {
      // 跳转到下一关页面
      this.$router.push({
        name: "Game",
        params: { level: (level + 1).toString() },
      });
    }
  }

  /**
   * 重新开始游戏
   */
  reStart() {
    // 游戏继续
    Confs.PAUSED = false;
    this.three?.reload();
    this.gameOverShow = false;
  }

  /**
   * 点击返回主界面时的响应函数
   */
  home() {
    // 跳转到选择关卡页面
    router.push({ name: "ChooseLevel" });
  }

  /**
   * 界面重新加载
   */
  @Watch("level")
  onWatchRouter(to: number, from: number) {
    if (this.three) {
      this.three.reload(to);
    } else {
      this.three = new ThreeJs(to);
      document.addEventListener("gameWin", this.onGameWinEventBind);
      document.addEventListener("gameOver", this.onGameOverEventBind);
    }
    Confs.PAUSED = false;
    this.gameWinShow = false;
  }
}
</script>

<style scoped>
#threeCanvas {
  height: 100%;
  width: 100%;
  overflow: hidden;
  position: relative;
}

.gameProcess {
  position: absolute;
  right: 80px;
  color: white;
  font-size: 25px;
}

.gameWin {
  position: absolute;
}
</style>
