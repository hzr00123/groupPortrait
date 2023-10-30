import { LevelType, WarningRuleEntity } from "@/api/types/labelManagement";
import { dayjs } from "element-plus";
import './index.scss'

export default (props: { config: WarningRuleEntity }) => {
    const strategyHandle = (arr: { label: string; value: any; }[]) => {
        let message = ''
        for (const key in props.config) {
            if (Object.prototype.hasOwnProperty.call(props.config, key)) {
                const value = props.config[key];
                switch (key) {
                    case 'warning_policy_content':
                        value && arr.push({ label: '策略对象', value })
                        break;

                    case 'policy_start_time':
                    case 'policy_end_time':
                        let str = ''
                        const start = props.config['policy_start_time']
                        const end = props.config['policy_end_time']
                        if (start) str = start
                        // else str = dayjs().format('YYYY-MM-DD HH:mm:ss');
                        else str = '以标签生成时间为准';
                        if (end) str += ' ~ ' + end
                        else str += ' ~ 永久'
                        if (!arr.find(i => i.label === '策略时间')) {
                            str && arr.push({ label: '策略时间', value: str })
                        }
                        break;
                    case 'excludeTargetContent':
                        value && arr.push({ label: '排除对象', value })
                        break
                    case 'remind_person':
                        value && arr.push({ label: '提醒人员', value })
                        break
                    case 'warning_content':
                        value && arr.push({ label: '预警内容', value })
                        break
                    case 'remind_message':
                        value && arr.push({ label: '提醒消息', value })
                        break
                    case 'warning_level':
                        value && arr.push({ label: '预警等级', value })
                        break
                    case 'text_message':
                    case 'mail_message':
                    case 'official_account_message':
                        if (key === 'mail_message' && value === 1) message += '邮件; '
                        if (key === 'text_message' && value === 1) message += '短信; '
                        if (key === 'official_account_message' && value === 1) message += '公众号; '
                        break
                    case 'warning_position':
                        value && arr.push({ label: '预警位置', value })
                        break
                    default:
                        break;
                }
            }
        }
        return message
    }

    const levelRuleRender = (it: { label: any; value?: any; }, v: { level_rule: any[]; }, index: number) => {
        return (
            <>
                <section key={it.label + '-arr-' + index} constom-des>
                    <label>{it.label}</label>
                    <div>
                        <span>
                            {
                                v.level_rule.map(x => {
                                    return (
                                        <span style={{ marginRight: '15px' }}>
                                            <span style={{
                                                backgroundColor: x.color,
                                                width: '16px',
                                                height: '16px',
                                                marginBottom: '-2px',
                                                borderRadius: '4px',
                                                marginRight: '5px',
                                                display: 'inline-block'
                                            }}
                                            />
                                            <span>{x.levelInfo}</span>
                                            <span>{x.levelValueRule}</span>
                                            <span>{x.levelValue}</span>

                                        </span>
                                    )
                                })
                            }
                        </span>
                    </div>
                </section>
            </>
        )
    }

    const arr: { label: string; value: any; }[] = []
    const message = strategyHandle(arr)
    const info = props.config
    if (info.trigger_type == 1) {
        arr.push({ label: '触发时间', value: '同步后触发' })
    } else {
        let str = ''
        if (info.trigger_freq === 1) str = '每天'
        if (info.trigger_freq === 2) {
            switch (info.trigger_freq_week) {
                case '1':
                    str = '每周' + '星期天'
                    break;
                case '2':
                    str = '每周' + '星期一'
                    break;
                case '3':
                    str = '每周' + '星期二'
                    break;
                case '4':
                    str = '每周' + '星期三'
                    break;
                case '5':
                    str = '每周' + '星期四'
                    break;
                case '6':
                    str = '每周' + '星期五'
                    break;
                case '7':
                    str = '每周' + '星期六'
                    break;
                default:
                    break;
            }
        }
        if (info.trigger_freq === 3) str = '每月' + info.trigger_freq_day + '日'
        const hour = `${Number(info.trigger_freq_hour) < 10 ? '0' + info.trigger_freq_hour : info.trigger_freq_hour}`
        const minu = `${Number(info.trigger_freq_minutes) < 10 ? '0' + info.trigger_freq_minutes : info.trigger_freq_minutes}`
        str += hour + ':' + minu
        arr.push({ label: '触发时间', value: str })
    }
    arr.push({ label: '消息类型', value: message })
    return (
        <div class={'warn-info-role'}>
            {
                arr.map((it) => {
                    if (it.value instanceof Array) {
                        return it.value.map((v: { level_rule: Array<LevelType> }, index) => {
                            return levelRuleRender(it, v, index)
                        })
                    }
                    return <>
                        <section key={it.value} constom-des>
                            <label>{it.label}</label>
                            <div><span>{it.value}</span></div>
                        </section>
                    </>
                })
            }
        </div>
    )
}