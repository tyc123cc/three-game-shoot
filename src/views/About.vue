<template>
  <div id="threeCanvas"
       @mousemove="onDocumentMouseDown">
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import ThreeJs from "./index";
import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
@Component({
  components: {
    //HelloWorld,
  },
})
export default class About extends Vue {
  three: ThreeJs | null = null;
  mounted() {
    this.three = new ThreeJs();
  }
  onDocumentMouseDown(event: MouseEvent) {
    if (this.three) {
      //this.three.onDocumentMouseDown(event);
    }
  }
}
</script>

<style scoped>
#threeCanvas {
  height: 720px;
  width: 100%;
}
</style>