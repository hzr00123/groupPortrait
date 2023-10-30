<template>
    <div class="c-table">
        <el-table class="el-table-style mg-b20"
        :header-cell-style="headerStyle"
        row-key="id"
        v-bind="$attrs"
        ref="tableRef"
        :size="size"
        style="width: 100%"
        @selection-change="changeSelection"
        @sort-change="changeSort">
        <slot>
            <el-table-column v-if="selection" type="selection" :reserve-selection="true" width="55" fixed="left" />
            <el-table-column v-if="indexShow" type="index" label="序号" width="80" :index="indexMethod" />
            <el-table-column v-for="item in columnList"
              show-overflow-tooltip
              :key="item.prop"
              :prop="item.prop"
              :label="item.label"
              :width="item.width"
              :fixed="item.fixed"
              :sortable="item.sortable ? item.sortable : false"
              :align="align ? align : item.align">
                <template #default="{ row, column, $index }">
                  <slot v-if="item.slot" :name="item.slot" :data="{...row, $index}" />
                  <span v-else>{{ !['', null].includes(row[item.prop!]) ? row[item.prop!] : '-' }}</span>
                </template>
            </el-table-column>
          </slot>
        </el-table>
        <el-pagination v-if="pages"
        background
        :small="size === 'small' ? true : false"
        v-model:current-page="currentPage"
        :page-size="pages!.size"
        :page-sizes="[10, 50, 100]"
        :layout="layout"
        v-model:total="pages!.total"
        @size-change="changeSize"
        @current-change="changeCurrent"
        />
    </div>
</template>

<script setup lang="ts">
import { Column, _align, _selection } from './index'
import { Pages } from '../Pagination/index'
import { ref } from 'vue'
const props = withDefaults(defineProps<{
  size?: "" | "default" | "small" | "large"
  columnList?: Column
  align?: _align
  selection?: _selection
  indexShow?: boolean
  pages?: Pages
  layout?: string
}>(), {
  layout: "total, sizes, prev, pager, next, jumper",
  size: 'default'
})



const tableRef = ref()

const headerStyle = {
    background:'#E4E7ED',
    fontSize: '16px',
    fontFamily: 'Medium',
    fontWeight: 500,
    color: '#000000',
    lineHeight: '24px'
}

const currentPage = ref(props.pages?.current || 0)
const sizePage = ref(props.pages?.size || 0)

const indexMethod = (index: number) => {
  return index + 1 + sizePage.value * (currentPage.value - 1)
}

const emits = defineEmits(['changeSize', 'changeCurrent', 'changeSelection', 'changeSort'])

const changeSelection = (val: []) => {
  emits('changeSelection', val)
}

const changeSort = (column: any) => {
  let order = column.order == 'ascending' ? 'asc' :
  column.order == 'descending' ? 'des' : null
  emits('changeSort', { prop: column.prop, order })
}

const changeSize = (val: number) => {
  emits('changeSize', val)
}
const changeCurrent = (val: number) => {
  emits('changeCurrent', val)
}

const checkSelection = (row: any, selected: boolean) => {
  // console.log('修改显示', row)
  if(row) {
    row.forEach((row: any) => {
      tableRef.value!.toggleRowSelection(row, selected)
    })
  } else {
    tableRef.value!.clearSelection();
  }
}

defineExpose({
  table: tableRef,
  checkSelection
})
</script>

<style lang="scss" scoped>
.c-table {
    :deep(.el-table-style) {
        .el-table--enable-row-hover .el-table__body tr:hover {
            /* 斑马纹 */
            /* hover */
            background-color: #F4F6F9 !important;
        }
        .el-table__row--striped .el-table__cell {
          background: #F4F6F9;
        }
        .el-table__cell {
          font-size: 16px;
          font-family: Regular;
          font-weight: 400;
          color: #203449;
          line-height: 24px;
        }
    }
  .el-pagination{
    justify-content: end;
  }
}
</style>