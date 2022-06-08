<template>
  <div>
    <div v-show="isShow" id="pro" :style="style()">
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
      <svg>
        <!-- r代表圆的半径；cx、cy代表圆心坐标；fill代表填充颜色，这里是透明 -->
        <circle r="50" cx="58" cy="58" fill="transparent" class="bg" />
        <circle
          r="50"
          cx="0"
          cy="0"
          fill="transparent"
          class="inner"
          stroke-dasharray="314"
          :stroke-dashoffset="percentage"
          transform="translate(58,58)rotate(-90)"
        />
        <!-- 上面 stroke-dasharray="314"  314是圆的周长，2πr = 2 x 3.14 x 50 -->
        <!-- 定义了实线长度为314，stroke-dashoffset可以通过动态绑定来控制 -->
        <text class="text" fill="white" x="58" y="65">
          {{ text() }}
        </text>
      </svg>
    </div>
  </div>
</template>
<script lang="ts">
import { ElProgress } from "node_modules/_element-ui@2.15.8@element-ui/types/progress";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class RebirthTimeProcess extends Vue {
  @Prop(Number) private nowRebirthTime!: number;

  @Prop(Number) private rebirthTime!: number;

  @Prop(Number) private originPosY!: number;

  public posY: number = 15;

  mounted() {
    //console.log(this.$refs['progress'])
    // (this.$refs['progress'] as ElProgress).rate = 0;
  }

  /**
   * 复活进度条是否显示
   */
  get isShow() {
    if (this.nowRebirthTime == 0) {
      return false;
    }
    return true;
  }

  /**
   * 计算得到当前复活进度百分比
   */
  get percentage() {
    if (this.rebirthTime <= 1) {
      return 0;
    }
    let rate = this.rebirthTime / (this.rebirthTime - 1);
    // console.log(this.nowRebirthTime)
    let percentage: number = (1 - this.nowRebirthTime / this.rebirthTime) * 100;

    return percentage * -3.14;
  }

  customColorMethod(percentage: number) {
    return "#f56c6c";
  }

  /**
   * 进度条中间文本内容
   */
  text() {
    return `${Math.ceil(this.rebirthTime - this.nowRebirthTime)} / ${
      this.rebirthTime
    } s`;
  }

  /**
   * 调整进度条位置
   */
  style(): string {
    return `top:${this.originPosY + this.posY}px`;
  }
}
</script>
<style scoped>
#pro {
  /* 容器 */
  width: 100%;
  height: 120px;
  margin: auto;
  position: absolute;
  user-select: none;
}

.text {
  font-size: 21px;

  text-anchor: middle;
  /* 文本水平居中 */
}

svg {
  width: 120px;
  height: 120px;
  margin: auto;
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
