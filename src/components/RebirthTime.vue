<template>
  <div>
    <!-- <el-progress
    ref = "progress"
      type="circle"
      v-show="isShow"
      :stroke-width="20"
      :width="120"
      :percentage="percentage"
      :color="customColorMethod"
      :format="text"
      :style="style()"
    ></el-progress> -->
    <div id="pro">
    <!-- 内置图形：
      rect(矩形)    
      circle(圆)  
      ellipse(椭圆)   
      line(直线)   
      polyline(折线)  
      polygon(多边形)  
      path(路径)
    -->
    <!-- 内置样式
      fill(填充颜色)   
      fill-opacity(填充透明度)
      stroke(边框颜色)   
      stroke-width(边框宽度)   
      stroke-opacity(边框透明度)   
      stroke-dasharray(定义实线虚线的长度)
      stroke-dashoffset(定义实线/虚线的起点距离 路径 的起点的距离)
      transform(变换)
      filter(滤镜)(url[#滤镜id)]
    -->
    <svg style="width:300px;height:300px">
      <!-- r代表圆的半径；cx、cy代表圆心坐标；fill代表填充颜色，这里是透明 -->
      <circle r="50" cx="100" cy="100" fill="transparent" class="bg" />
      <circle
        r="50"
        cx="100"
        cy="100"
        fill="transparent"
        class="inner"
        stroke-dasharray="314"
        :stroke-dashoffset="percentage"
      />
      <!-- 上面 stroke-dasharray="314"  314是圆的周长，2πr = 2 x 3.14 x 50 -->
      <!-- 定义了实线长度为314，stroke-dashoffset可以通过动态绑定来控制 -->
    </svg>
  </div>

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
      if(this.rebirthTime <= 1){
          return 0;
      }
      let rate = this.rebirthTime / (this.rebirthTime - 1);
     // console.log(this.nowRebirthTime)
      let percentage:number = (1 - this.nowRebirthTime / this.rebirthTime) * 100;
  
      return percentage * -3.14
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
body {
  margin: 0;
  padding: 0;
}

#pro { /* 容器 */
  width: 300px;
  height: 300px;
  margin: 0 auto;
  position:absolute;
    transform:rotate(-90deg)
}

.bg {
  stroke-width: 16px; /* 设置边框宽度 */
  stroke: #fff; /* 设置边框颜色 */
}

.inner {
  stroke-width: 16px; /* 设置边框宽度 */
  stroke: #ff0000; /* 设置边框颜色 */
}
</style>
