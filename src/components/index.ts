import Card from './Card/index.vue'
import CardTree from './CardTree/index.vue'
import CardTabs from './CardTabs/index.vue'
import Title from './common/Title.vue'
import Table from './Table/index.vue'
import Button from './Button/index.vue'
import Transfer from './Transfer/index'
import TablePlus from './Table-plus';

import type { App, Component, ComputedOptions, MethodOptions } from 'vue'
interface Components {
    [k: string]: Component<any, any, any, ComputedOptions, MethodOptions>
}
const component: Components = {
    'c-card': Card,
    'c-card-tree': CardTree,
    'c-card-tabs': CardTabs,
    'c-title': Title,
    'c-table': Table,
    'c-button': Button,
    'c-transfer': Transfer,
    'c-table-plus': TablePlus
}

export default {
    install(app: App) {
        const arr = Object.keys(component)
        arr.forEach((key) => {
            app.component(key, component[key])
        })
    }
}