<template>
  <div id="threeCanvas" @mousemove="onDocumentMouseDown">
    <blood
      v-for="character in characterHpInfos"
      :key="character.name"
      :current="character.hp"
      :isShow="character.isShow"
      :max="character.maxHp"
      :posX="character.screenPos.x"
      :posY="character.screenPos.y"
    ></blood>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import ThreeJs from "./index";
import * as THREE from "three";
import Blood from "@/components/Blood.vue";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { Vector2 } from "three";
import CharacterHpInfo from "@/ts/apis/characterHpInfo";
@Component({
  components: {
    Blood,
  },
})
export default class About extends Vue {
  three: ThreeJs | null = null;

  characterHpInfosMap: Map<string, CharacterHpInfo> = new Map();
  characterHpInfos: CharacterHpInfo[] = [];
  mounted() {
    this.three = new ThreeJs();
    this.characterHpInfosMap = this.three.characterHpInfoMap;
    this.characterHpInfos = this.three.characterHpInfos;
    // this.three.characterHpInfoMap.forEach((value, key, map) => {
    //   this.characterHpInfos.push(value);
    // });
  }
  onDocumentMouseDown(event: MouseEvent) {
    if (this.three) {
      // if (this.three) {
      //   this.three.characterHpInfoMap.forEach((value, key, map) => {
      //     infos.push(value);
      //   });
      // }
      // this.characterHpInfos = infos;
    }
  }

  // get characterHpInfos() {
  //   let infos: CharacterHpInfo[] = [];
  //   if (this.three) {
  //     this.three.characterHpInfoMap.forEach((value, key, map) => {
  //       infos.push(value);
  //     });
  //   }
  //   return infos;
  // }

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
}
</style>
