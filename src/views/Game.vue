<template>
  <div id="threeCanvas">
    <game-menu :originPosY="originY"></game-menu>
    <blood
      v-for="character in characterHpInfos"
      :key="character.name"
      :current="character.hp"
      :isShow="character.isShow"
      :max="character.maxHp"
      :posX="character.screenPos.x"
      :posY="character.screenPos.y"
    ></blood>
    <rebirth-time-process
      class="rebirthTime"
      :nowRebirthTime="nowRebirthTime"
      :rebirthTime="rebirthTime"
      :originPosY="originY"
      :originPosX="rebirthTimeX()"
    ></rebirth-time-process>
    <game-process :originPosY="originY"></game-process>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import ThreeJs from "./index";
import Blood from "@/components/Blood.vue";
import RebirthTimeProcess from "@/components/RebirthTimeProcess.vue";
import GameProcess from "@/components/GameProcess.vue";
import GameMenu from "@/components/GameMenu.vue";
import { Vector2 } from "three";

@Component({
  components: {
    Blood,
    RebirthTimeProcess,
    GameProcess,
    GameMenu,
  },
})
export default class Game extends Vue {
  @Prop(String) private level!: string;

  three: ThreeJs | null = null;

  mounted() {
    let level = Number(this.level);
    if (!isNaN(level)) {
      this.three = new ThreeJs(Number.parseInt(this.level));
      console.log(this.level);
      //let options = {fullscreen:true,text:"正在拼命加载"}
      //Loading.service(options);
    }
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
</style>
