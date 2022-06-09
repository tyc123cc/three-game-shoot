<template>
  <div>
    <el-progress
      v-show="isShow"
      :stroke-width="10"
      :percentage="(current / max) * 100"
      :color="customColorMethod"
      :show-text="false"
      :style="style()"
    ></el-progress>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class Blood extends Vue {
  @Prop(Number) private current!: number;

  @Prop(Number) private max!: number;

  @Prop(Number) private posX!: number;

  @Prop(Number) private posY!: number;

  @Prop(Boolean) private isShow!: boolean;

  customColorMethod(percentage: number) {
    if (percentage < 30) {
      return "#ff0000";
    } else if (percentage < 70) {
      return "#e6a23c";
    } else {
      return "#67c23a";
    }
  }

  style(): string {
    return `top:${this.posY}px;left:${this.posX}px;`;
  }
}
</script>
<style scoped>
.el-progress {
  width: 100px;
  position: absolute;
}
</style>
