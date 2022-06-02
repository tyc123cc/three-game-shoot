<template>
  <div>
    <el-progress
    ref = "progress"
      type="circle"
      v-show="isShow"
      :stroke-width="20"
      :width="120"
      :percentage="percentage"
      :color="customColorMethod"
      :format="text"
      :style="style()"
    ></el-progress>
  </div>
</template>
<script lang="ts">
import { ElProgress } from "node_modules/_element-ui@2.15.8@element-ui/types/progress";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class RebirthTime extends Vue {
  @Prop(Number) private nowRebirthTime!: number;

  @Prop(Number) private rebirthTime!: number;

  @Prop(Number) private originPosY!: number;

  public posY: number = 0;

  mounted() {
      //console.log(this.$refs['progress'])
     // (this.$refs['progress'] as ElProgress).rate = 0;
  }

  get isShow() {
    if (this.nowRebirthTime == 0) {
      return false;
    }
    return true;
  }

  get percentage(){
      if(this.rebirthTime == 0){
          return 0;
      }
     // console.log(this.nowRebirthTime)
      let percentage:number = (this.rebirthTime - this.nowRebirthTime) / this.rebirthTime * 100
      //console.log(percentage)
      return percentage
  }

  customColorMethod(percentage: number) {
    return "#f56c6c";
  }

  text(percentage: number) {
    return `${Math.ceil(this.rebirthTime - this.nowRebirthTime)} / ${this.rebirthTime} s`;
  }

  style(): string {
    return `top:${this.originPosY + this.posY}px`;
  }
}
</script>
<style scoped>
.el-progress {
  width: 120px;
  position: absolute;
}
.el-progress ::v-deep .el-progress__text {
  font-size: 20px !important;
  color: #fff;
}
</style>
