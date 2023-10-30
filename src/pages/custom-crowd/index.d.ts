export interface Form {
    id?: number
    user_group_name: string
    user_group_type: string
    user_group_description: string
    rule_and_or: string
    group_rules: [
        {
            label_id?: number | string | undefined
            value?: boolean | string | undefined
        }
    ]
    update_way: string
} 