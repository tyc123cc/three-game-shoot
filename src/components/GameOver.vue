<template lang="">
  <div class="gameOver" >
    <!-- 做一个遮罩，使游戏胜利页面弹出时，其他按钮不可点击 -->
    <div class="background">
    <el-card shadow="always">
    <div class="OverText">游戏结束</div>
    <div class="button">
      <el-button class="nextButton" type="primary" @click="reStart()"
        >重新开始</el-button
      >
      <el-button type="primary" plain @click="back()">主菜单</el-button>
      
    </div>
    </el-card>
        </div>
  </div>
</template>
<script lang="ts">
import Confs from "@/ts/common/confs/confs";
import ConfsVar from "@/ts/common/confs/confsVar";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class GameOver extends Vue {
  @Prop({ type: Number, default: -1 }) public level!: number;

  public posY: number = 30;

  /**
   * 下一关按钮点击事件
   */
  reStart() {
    this.$emit("reStart");
  }

  /**
   * 返回主菜单按钮点击事件
   */
  back() {
    this.$emit("home");
  }
}
</script>
<style scoped>
.OverText {
  font: bolder 50px arial, sans-serif;
  color: crimson;
  margin-bottom: 30px;
}

.nextButton {
  margin-right: 30px;
}

.gameOver {
  width: 100%;
  height: 100%;
}

.el-card {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.background {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
