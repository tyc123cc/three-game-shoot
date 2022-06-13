<template >
  <div class="chooseLevel">
    <div class="buttonContainer">
      <el-button type="primary"
                 v-for="(level, index) in filleNames"
                 :key="index"
                 style="width: 100px"
                 @click="chooseLevel(index)">第 {{ index + 1 }} 关</el-button>
    </div>
  </div>
</template>
<script lang="ts">
import router from "@/router";
import Confs from "@/ts/common/confs/confs";
import ConfsVar from "@/ts/common/confs/confsVar";
import { Component, Vue } from "vue-property-decorator";

@Component
export default class ChooseLevel extends Vue {
  filleNames: string[] = [];
  mounted() {
    // 设置配置值
    let confsVar: ConfsVar = require("../assets/confs/confs.json");
    Confs.setting(confsVar);

    this.filleNames = Confs.levelFiles;
  }

  /**
   * 选择关卡
   */
  chooseLevel(index: string) {
    router.push({ name: "Game", params: { level: index.toString() } });
  }
}
</script>
<style scoped>
html,
body {
  height: 100%;
}
.chooseLevel {
  width: 100%;
  height: 100%;
  background: black;
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.buttonContainer {
  margin: 0 15%;
  align-self: center;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}
.el-button {
  margin: 15px;
}
</style>