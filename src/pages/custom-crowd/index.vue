<template>
  <div class="custom-crowd">
    <c-card>
      <h2 class="c-title mg-b20">基础信息</h2>
      <div class="basics-info mg-b15">
        <div class="input-box mg-b15">
          <label><i>*</i>用户群名称：</label>
          <el-input v-model="formData.user_group_name" placeholder="请输入用户群名称" />
        </div>
        <div class="input-box mg-b15">
          <label><i>*</i>用户群类型：</label>
          <el-select v-model="formData.user_group_type" class="m-2" placeholder="请选择用户群类型" size="large">
            <el-option :label="typeSelect.label" :value="typeSelect.value" />
          </el-select>
        </div>
        <div class="input-box mg-b15">
          <label><i>*</i>用户群说明：</label>
          <el-input v-model="formData.user_group_description" type="textarea" :rows="3" placeholder="请输入用户群说明" />
        </div>
      </div>
      <h2 class="c-title mg-b20">创建规则</h2>
      <div class="create-rule mg-b15">
        <label><i>*</i>创建规则：</label>
        <div class="container">
          <header><svg-icon icon-class="user-icon" />用户群满足以下条件</header>
          <section>
            <div style="display: flex;align-items: center;">
              <el-dropdown @command="command">
                <el-button>
                  {{ conditionTitle }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu class="dropdown-style">
                    <el-dropdown-item command="and">同时满足</el-dropdown-item>
                    <el-dropdown-item command="or">任一满足</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>

              <div class="right">
                <div class="select-box mg-b15" v-for="(model, index) in formData.group_rules" :key="index">
                  <el-tree-select v-model="formData.group_rules[index].label_id" :data="treeData" filterable>
                    <template #default="{ data: { label, type } }">
                      <span style="color: #203449;"><svg-icon :icon-class="type == 'group' ? 'wenjianjia' : 'tag'" /> {{ label }}</span>
                    </template>
                  </el-tree-select>
                  <el-select v-model="formData.group_rules[index].value" style="width: 150px;margin: 0 20px 0 14px;">
                    <el-option label="为真" :value="true" />
                    <el-option label="为假" :value="false" />
                  </el-select>
                  <el-icon v-if="formData.group_rules.length > 1" size="16" color="#B22924" @click="delCondition(index)">
                    <Delete />
                  </el-icon>
                </div>
              </div>
            </div>
            <p class="add-btn" @click="addCondition"><el-icon size="14" color="#1D538C">
                <Plus />
              </el-icon>添加条件</p>
          </section>
        </div>
      </div>

      <h2 class="c-title mg-b20">更新方式</h2>
      <div class="update-mode mg-b10 pl-10">
        <label><i>*</i>更新方式：</label>
        <div class="radio-btns" v-for="item in updateBtn" :key="item.type" :active="formData.update_way === item.type" @click="changeRadio(item.type)">
          <svg-icon :icon-class="item.icon" />
          <span>{{ item.name }}</span>
          <svg-icon class="check-icon" icon-class="check-icon" />
        </div>
      </div>
      <p class="hint mg-b40">关注群体生成后，每日凌晨00:00:00自动进行数据的计算更新。</p>

      <div class="operate-btn" style="margin-left: 114px;">
        <el-button type="primary" @click="operation('save')" v-if="formData.id">保存</el-button>
        <el-button type="primary" @click="operation('creation')" v-else>创建</el-button>
        <el-button @click="operation('estimate')">预估</el-button>
        <el-button @click="operation('cancel')">取消</el-button>
      </div>
    </c-card>
  </div>
</template>
    
<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ref, reactive, onMounted } from 'vue'
import { addGroupUser, editGroupUser, getEstimateData } from '@/api/modules/attentionGroup'
import { getTablesViews } from '@/api/modules/labelManagement'
import { Form } from './index'
import { userStore } from '@/store/user'
import { ElMessage, ElMessageBox } from 'element-plus'
const route = useRoute();
const router = useRouter()
const userInfoStore = userStore();
const formData = reactive<Form>({
  id: undefined,
  user_group_name: '',
  user_group_type: '',
  user_group_description: '',
  rule_and_or: 'and',
  group_rules: [
    {
      label_id: '',
      value: ''
    }
  ],
  update_way: '',
})
const conditionTitle = ref('同时满足')
const updateBtn = [
  {
    type: '1',
    name: '自动',
    icon: 'manual-update-icon'
  },
  {
    type: '2',
    name: '手动',
    icon: 'automatic-update-icon'
  }
]
const typeSelect = reactive({
  label: '自定义人群',
  value: '246'
})

const treeData = ref([])

const changeRadio = (type: string) => {
  formData.update_way = type;
}

const command = (val: string) => {
  formData.rule_and_or = val;
  conditionTitle.value = val == 'and' ? '同时满足' : '任一满足'
}


const addCondition = () => {
  formData.group_rules.push({
    label_id: '',
    value: '',
  })
}

const delCondition = (index: number) => {
  formData.group_rules.splice(index, 1)
}


const initTree = async () => {
  const { data } = await getTablesViews(3, '')
  data[0].id = 55555
  treeData.value = calculateLevel(data)
  console.log(treeData.value);

}

const calculateLevel = (arr: any) => {
  arr.forEach((element: any, index: number) => {
    arr[index].label = element.name;
    arr[index].value = element.id;
    if (element.children) {
      calculateLevel(element.children)
    }
  })
  return arr
}

const operation = async (type: string) => {

  if (type === 'cancel') {
    router.go(-1);
    return
  }

  if (formData.group_rules) {
    const isValid = formData.group_rules.every(obj => obj.label_id !== "" && obj.value !== "");
    if (!isValid) {
      return ElMessage({ message: '创建规则条件不能为空！', type: 'warning' })
    }
  }
  
  if (type === 'save') {
    let res = await editGroupUser(formData)
    if (res.code === 1) {
      ElMessage({
        message: res.data,
        type: 'success',
      })
      router.go(-1);
    }
  } else if (type === 'creation') {
    let res = await addGroupUser(formData)
    if (res.code === 1) {
      ElMessage({
        message: res.data,
        type: 'success',
      })
      router.go(-1);
    }
  } else {
    let params = {
      rule_and_or: formData.rule_and_or,
      group_rules: formData.group_rules
    }

    let { data } = await getEstimateData(params);
    ElMessageBox.alert(`<div>当前群体包含<span>${data.num}</span>人，在所有学生中占<span>${data.rate}</span>%</div>`, '预估人数', {
      confirmButtonText: '知道了',
      dangerouslyUseHTMLString: true,
    })
  }
}

onMounted(async () => {
  await initTree();

  if (route.query.params) {
    let params = JSON.parse(route.query.params)
    console.log(params);
    for (let key in params) {
      formData[key] = params[key]
    }
    typeSelect.label = userInfoStore.$state.groupTypeList.find(it => it.id == formData.user_group_type)?.lookup_name
    typeSelect.value = formData.user_group_type
    console.log(formData);
  }
})
</script>
    
<style lang="scss" scoped>
.custom-crowd {
  .basics-info {
    .input-box {
      display: flex;

      .el-input,
      .el-textarea {
        width: 600px;
      }
    }
  }

  .create-rule {
    display: flex;

    .container {
      width: 800px;

      header {
        font-size: 16px;
        font-family: Medium;
        color: #005DA7;
        line-height: 22px;
        padding: 8px 14px;
        background: #F0F6FA;
        border: 1px solid #DAE1E6;
        border-radius: 6px 6px 0 0;
      }

      section {
        border: 1px solid #DAE1E6;
        border-top: none;
        border-radius: 0 0 6px 6px;
        padding: 30px 40px;
        display: flex;
        flex-direction: column;

        // align-items: center;
        :deep(.el-dropdown) {
          .el-button {
            background: #E9F0FF;
            border-color: #005DA7;
            font-size: 16px;
            font-family: Medium;
            color: #005DA7;
            line-height: 22px;

            &:focus-visible {
              outline: 2px solid #005DA7;
            }
          }

        }

        .select-box {
          display: flex;
          align-items: center;

          .el-icon {
            cursor: pointer;
          }

          &:last-child {
            margin-bottom: 0;
          }
        }

        :deep(.el-dropdown) {
          margin-right: 14px;
        }

        .add-btn {
          font-size: 16px;
          font-family: Medium;
          color: #1C538B;
          line-height: 22px;
          cursor: pointer;
          width: 100px;
          margin: 20px 0 0 138px;

          .el-icon {
            margin-right: 10px;
          }
        }
      }
    }
  }

  .update-mode {
    display: flex;
    align-items: center;

    .radio-btns {
      font-size: 16px;
      font-family: Regular;
      color: #203449;
      line-height: 22px;
      padding: 8px 25px;
      background: #FFFFFF;
      border: 1px solid #EBEEF0;
      border-radius: 6px;
      margin-right: 12px;
      cursor: pointer;
      position: relative;

      .check-icon {
        position: absolute;
        bottom: 0;
        right: 0;
        margin: 0;
        color: #FFFFFF;
      }

      &:hover {
        border-color: #005DA7;
        background: #F4F7FF;
        color: #005DA7;

        .check-icon {
          color: #005DA7;
        }

        .icon-svg {
          color: #005DA7;
        }
      }

      &[active="true"] {
        border-color: #005DA7;
        background: #F4F7FF;
        color: #005DA7;

        .check-icon {
          color: #005DA7;
        }
      }

    }
  }
}

label {
  font-size: 16px;
  font-family: Medium;
  color: #9A9A9A;
  line-height: 22px;
  margin-right: 10px;

  i {
    font-style: normal;
    color: #B22924;
    margin-right: 8px;
  }
}

.hint {
  font-size: 16px;
  font-family: Regular;
  color: #203449;
  line-height: 22px;
  text-indent: 114px;
}

.pl-10 {
  padding-left: 10px;
}
</style>