/**
 * 系统配置 Mock 数据
 */

export const config = {
    // 挂号相关配置
    registration: {
        advanceBookingDays: 14,      // 提前挂号天数：14天
        sameDayDeadline: '08:00',    // 当日挂号截止时间：早上8点
        noShowLimit: 3,              // 爽约次数限制：3次
        cancelHoursBefore: 24,       // 退号提前时间：24小时
        sameClinicInterval: 7        // 同科室挂号间隔：7天
    },

    // 排班管理配置
    schedule: {
        maxFutureDays: 60,           // 最多排未来60天
        morningStart: '08:00',       // 上午班开始时间
        morningEnd: '12:00',         // 上午班结束时间
        afternoonStart: '14:00',     // 下午班开始时间
        afternoonEnd: '18:00',       // 下午班结束时间
        eveningStart: '18:30',       // 晚班开始时间
        eveningEnd: '21:00',         // 晚班结束时间
        consultationDuration: 15,    // 单次就诊时长：15分钟
        intervalTime: 5              // 就诊间隔时间：5分钟
    }
}
