import { defineStore } from "pinia";
export const userStore = defineStore('mybtc',{
    state(){
        return{
            jichushuju:0,
            dormitoryConfig:{},
            canteenConfig:{},
            classroomConfig:{},
            libraryConfig:{},
            gymnasiumConfig:{},
            bathConfig:{},
            supermarketConfig:{},
            sumUpConfig:{},
        }
    },
    getters:{

    },
    actions:{

    }
});