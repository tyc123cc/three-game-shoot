<template lang="">
  <div class="gameMenu" :style="gameMenuStyle">
    <el-button
      class="pause"
      :icon="paused ? 'el-icon-video-play' : 'el-icon-video-pause'"
      type="primary"
      circle
      @click="pauseClicked()"
    ></el-button>
    <el-button
      icon="el-icon-s-home"
      type="primary"
      circle
      @click="homeClicked()"
    ></el-button>
  </div>
</template>
<script lang="ts">
import router from "@/router";
import Confs from "@/ts/common/confs/confs";
import ElementUI from "element-ui";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class GameMenu extends Vue {
  @Prop(Number) private originPosY!: number;

  public posY: number = 15;

  public hasNext: boolean = true;

  public paused: boolean = false;

  /**
   * 暂停按钮点击事件
   */
  pauseClicked() {
    // 避免UI穿透
    Confs.CLICKUI = true;
    // 暂停
    if (!this.paused) {
      Confs.PAUSED = true;
      this.paused = true;
    }
    // 继续
    else {
      Confs.PAUSED = false;
      this.paused = false;
    }
  }

  /**
   * 主菜单按钮点击事件
   */
  homeClicked() {
    // 避免UI穿透
    Confs.CLICKUI = true;
    // 暂停游戏
    Confs.PAUSED = true;
    ElementUI.MessageBox.confirm("返回主菜单界面, 是否继续?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
      showClose: true,
      beforeClose: (action, instance, done) => {
        // 避免UI穿透
        Confs.CLICKUI = true;
        done();
      },
    })
      .then(() => {
        // 恢复暂停状态
        Confs.PAUSED = false;
        // 返回主菜单
        router.push({ name: "ChooseLevel" });
      })
      .catch(() => {
        // 继续游戏
        Confs.PAUSED = false;
      });
  }

  get gameMenuStyle() {
    return `top:${this.originPosY + this.posY}px;`;
  }
}
</script>
<style scoped>
.gameMenu {
  position: absolute;
  left: 50px;
}
.pause {
  margin-right: 10px;
}
</style>
