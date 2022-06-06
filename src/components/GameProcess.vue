<template lang="">
  <div class="gameProcess" :style="gameProcessStyle">
    <div class="target">进度：</div>
    <div class="life">生命：</div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class GamceProcess extends Vue {
  @Prop(Number) private originPosY!: number;

  public posY: number = 30;

  get gameProcessStyle() {
    return `top:${this.originPosY + this.posY}px`;
  }
}
</script>
<style>
.life{
  margin-top: 20px;
}
</style>
