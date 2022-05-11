<template>
  <div id="threeCanvas"
       @mousemove="onDocumentMouseDown">
    <blood :current="50"
           :isShow="isShow()"
           :max="100"
           :posX="getPos().x"
           :posY="getPos().y"></blood>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import ThreeJs from "./index";
import * as THREE from "three";
import Blood from "@/components/Blood.vue";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { Vector2 } from "three";
@Component({
  components: {
    Blood,
  },
})
export default class About extends Vue {
  three: ThreeJs | null = null;

  enemyPos: THREE.Vector2 = new THREE.Vector2();
  mounted() {
    this.three = new ThreeJs();
    this.enemyPos = this.three.enemyScreenPos;
  }
  onDocumentMouseDown(event: MouseEvent) {
    if (this.three) {
      //this.three.onDocumentMouseDown(event);
    }
  }

  getPos() {
    if (this.three) {
      this.enemyPos = this.three.enemyScreenPos;
      return this.three.enemyScreenPos;
    } else {
      return new Vector2(0, 0);
    }
  }

  isShow() {
    if (this.three) {
      return this.three.enemyShow;
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
