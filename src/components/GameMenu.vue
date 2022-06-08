<template lang="">
  <div class="gameMenu" :style="gameMenuStyle">
    <el-button class="pause" icon="el-icon-video-pause" type="primary" circle></el-button>
    <el-button icon="el-icon-s-home" type="primary" circle></el-button>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class GameMenu extends Vue {
  @Prop(Number) private originPosY!: number;

  public posY: number = 15;

  public hasNext: boolean = true;

  /**
   * 下一关按钮点击事件
   */
  next() {}

  /**
   * 返回主菜单按钮点击事件
   */
  back() {}

  get gameMenuStyle() {
    return `top:${this.originPosY + this.posY}px`;
  }
}
</script>
<style scoped>
.gameMenu{
    position:absolute;
    left:50px;
}
.pause{
    margin-right: 50px;
}
</style>
