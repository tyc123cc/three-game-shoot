<template>
  <div id="threeCanvas">
    <blood
      v-for="character in characterHpInfos"
      :key="character.name"
      :current="character.hp"
      :isShow="character.isShow"
      :max="character.maxHp"
      :posX="character.screenPos.x"
      :posY="character.screenPos.y"
    ></blood>
    <rebirth-time
    class="rebirthTime"
      :nowRebirthTime="nowRebirthTime"
      :rebirthTime="rebirthTime"
      :originPosY="rebirthTimeOriginY"
    ></rebirth-time>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import ThreeJs from "./index";
import * as THREE from "three";
import Blood from "@/components/Blood.vue";
import RebirthTime from "@/components/RebirthTime.vue";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { Vector2 } from "three";
import CharacterHpInfo from "@/ts/apis/characterHpInfo";
import { Loading } from "element-ui";
@Component({
  components: {
    Blood,
    RebirthTime,
  },
})
export default class About extends Vue {
  three: ThreeJs | null = null;

  mounted() {
    this.three = new ThreeJs();
   
    //let options = {fullscreen:true,text:"正在拼命加载"}
    //Loading.service(options);
  }

  get characterHpInfos() {
    console.log(this.three?.characterHpInfos)
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

  get rebirthTimeOriginY() {
    if (!this.three?.sceneRender?.renderer) {
      return -1000;
    }
    return this.three.sceneRender.renderer.domElement.offsetTop;
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
}
</script>

<style scoped>
#threeCanvas {
  height: 720px;
  width: 100%;
  overflow:hidden
}

</style>
