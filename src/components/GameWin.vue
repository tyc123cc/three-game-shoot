<template lang="">
  <div class="gameWin" :style="gameWinStyle">
    <div class="winText">恭喜通关！</div>
    <div class="button">
      <el-button type="primary" :disabled="hasNext" @click="next()"
        >下一关</el-button
      >
      <el-button type="primary" plain @click="back()">主菜单</el-button>
    </div>
  </div>
</template>
<script lang="ts">
import store from "@/store";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class GameWin extends Vue {
  @Prop(Number) private originPosY!: number;

  public posY: number = 30;

  public hasNext: boolean = true;

  /**
   * 下一关按钮点击事件
   */
  next() {}

  /**
   * 返回主菜单按钮点击事件
   */
  back() {}

  get gameWinStyle() {
    return `top:${this.originPosY + this.posY}px`;
  }
}
</script>
<style scoped>
.life {
  margin-top: 20px;
}

.life,
.target {
  user-select: none;
}
</style>
