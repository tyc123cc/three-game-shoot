import Confs from "@/ts/common/confs/confs";
import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    /**
     * 当前进度
     */
    nowProcess: 0,

    /**
     * 目标进度
     */
    targetProcess: 0,

    /**
     * 当前生命
     */
    life: 0,

    /**
     * 最大生命
     */
    maxLife: 0,
  },
  mutations: {
    /**
     * 重置游戏进度
     * @param targetProcess 目标进度
     * @param maxLife 最大生命
     */
    [Confs.STORE_RESETPROCESS](state: any, { targetProcess, maxLife }) {
      state.targetProcess = targetProcess;
      state.nowProcess = 0;

      state.maxLife = maxLife;
      state.life = maxLife;
    },
    /**
     * 角色死亡
     */
    [Confs.STORE_DEATH](state: any) {
      // 生命小于0
      if (--state.life <= 0) {
        state.life = 0;
        // 生命小于0，发送游戏结束事件
        const sendEvent = new CustomEvent("gameOver", {
          detail: {},
        });
        // 发送事件
        document.dispatchEvent(sendEvent);
      }
    },

    /**
     * 增加进度
     * @param process 进度增加值，默认为1
     */
    [Confs.STORE_ADDPROCESS](state: any, process?: number) {
      // 默认进度加一
      let addProcessNumber = process ? process : 1;
      state.nowProcess += addProcessNumber;
      if (state.nowProcess >= state.targetProcess) {
        // 当前进度已达到目标进度，发送游戏胜利事件
        state.nowProcess = state.targetProcess;
        const sendEvent = new CustomEvent("gameWin", {
          detail: {},
        });
        // 发送事件
        document.dispatchEvent(sendEvent);
      }
    },
  },
  actions: {},
  modules: {},
});
