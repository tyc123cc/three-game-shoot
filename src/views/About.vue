<template>
  <div id="threeCanvas">
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
  mounted() {
    new ThreeJs();
  }
}
</script>

<style scoped>
#threeCanvas {
  height: 720px;
  width: 100%;
}
</style>