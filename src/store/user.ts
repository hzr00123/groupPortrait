import { defineStore } from "pinia";
import { OrgType, StateType } from './index.d';
export const userStore = defineStore({
  id: "user", // id必填，且需要唯一
  state: ():StateType => {
    return {
      orgType: {
        campusOrgList: [],
        collegeOrgList: [],
        majorOrgList: [],
        gradeOrgList: [],
        classOrgList: []
      },
      groupTypeList: [],
      vsViewDirection: {
        left: false,
        right: false
      },
      seting: false, //是否切换到设置菜单
    };
  },
  getters: {
    viewDirection(state){
      return state.vsViewDirection
    },
    setingVal(state){
      return state.seting
    }
  },
  actions: {
    updateOrgType(value: OrgType) {
      this.orgType = value;
    },
    updateGroupTypeList(value: []) {
      this.groupTypeList = value;
    },
    updateVsViewDirection(type: 'left' | 'right', v: boolean){
      this.vsViewDirection[type] = v
    },
    updateSeting(v: boolean){
      this.seting = v
    }
  },
  // 开启数据缓存
  persist: {
    enabled: true,
    // 自定义 key
    strategies: [
      {
        key: "my_user",
        storage: localStorage,
        // 或者 持久化部分 state
        paths: ["orgType", 'groupTypeList', 'vsViewDirection', 'seting'],
      },
    ],
  },
});
