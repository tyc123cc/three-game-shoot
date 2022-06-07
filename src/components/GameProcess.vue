<template lang="">
  <div class="gameProcess" :style="gameProcessStyle">
    <div class="target">进度：{{nowProcess}} / {{targetProcess}}</div>
    <div class="life">生命：{{nowLife}} / {{maxLife}}</div>
  </div>
</template>
<script lang="ts">
import store from "@/store";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class GamceProcess extends Vue {
  @Prop(Number) private originPosY!: number;

  public posY: number = 30;

  get nowProcess(){
    return store.state.nowProcess;
  }

  get targetProcess():number{
    return store.state.targetProcess;
  }

  get nowLife(){
    return store.state.life;
  }

  get maxLife(){
    return store.state.maxLife;
  }

  get gameProcessStyle() {
    return `top:${this.originPosY + this.posY}px`;
  }
}
</script>
<style scoped>
.life{
  margin-top: 20px;
}

.life,.target{
   user-select:none; 
}
</style>
