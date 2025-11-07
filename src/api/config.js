import axios from './axios'

// 是否使用 Mock 数据
const USE_MOCK = false

// Mock 数据
let mockConfig = null
if (USE_MOCK) {
    const { config: mockConfigData } = await import('@/views/rules/config-mock.js')
    mockConfig = mockConfigData
}

/**
 * 获取系统配置
 * @returns {Promise} 返回系统配置信息
 * 
 * Response格式:
 * {
 *   code: 0,
 *   message: {
 *     registration: {                    // 挂号配置
 *       advanceBookingDays: number,      // 提前挂号天数 (1-90)
 *       sameDayDeadline: string,         // 当日挂号截止时间 HH:mm 格式
 *       noShowLimit: number,             // 爽约次数限制 (1-10)
 *       cancelHoursBefore: number,       // 退号提前时间（小时） (1-72)
 *       sameClinicInterval: number       // 同科室挂号间隔（天） (1-30)
 *     },
 *     schedule: {                        // 排班配置
 *       maxFutureDays: number,           // 最多排未来天数 (7-180)
 *       morningStart: string,            // 上午班开始时间 HH:mm
 *       morningEnd: string,              // 上午班结束时间 HH:mm
 *       afternoonStart: string,          // 下午班开始时间 HH:mm
 *       afternoonEnd: string,            // 下午班结束时间 HH:mm
 *       eveningStart: string,            // 晚班开始时间 HH:mm
 *       eveningEnd: string,              // 晚班结束时间 HH:mm
 *       consultationDuration: number,    // 单次就诊时长（分钟） (5-60)
 *       intervalTime: number             // 就诊间隔时间（分钟） (0-30)
 *     }
 *   }
 * }
 */
export const getSystemConfig = () => {
    if (USE_MOCK) {
        return Promise.resolve({
            data: {
                code: 0,
                message: mockConfig
            }
        })
    }
    return axios.get('/admin/config')
}

/**
 * 更新系统配置
 * @param {Object} config - 配置对象
 * @param {Object} config.registration - 挂号配置
 * @param {number} config.registration.advanceBookingDays - 提前挂号天数
 * @param {string} config.registration.sameDayDeadline - 当日挂号截止时间
 * @param {number} config.registration.noShowLimit - 爽约次数限制
 * @param {number} config.registration.cancelHoursBefore - 退号提前时间
 * @param {number} config.registration.sameClinicInterval - 同科室挂号间隔
 * @param {Object} config.schedule - 排班配置
 * @param {number} config.schedule.maxFutureDays - 最多排未来天数
 * @param {string} config.schedule.morningStart - 上午班开始时间
 * @param {string} config.schedule.morningEnd - 上午班结束时间
 * @param {string} config.schedule.afternoonStart - 下午班开始时间
 * @param {string} config.schedule.afternoonEnd - 下午班结束时间
 * @param {string} config.schedule.eveningStart - 晚班开始时间
 * @param {string} config.schedule.eveningEnd - 晚班结束时间
 * @param {number} config.schedule.consultationDuration - 单次就诊时长
 * @param {number} config.schedule.intervalTime - 就诊间隔时间
 * @returns {Promise} 返回更新结果
 * 
 * Response格式:
 * {
 *   code: 0,
 *   message: {
 *     detail: 'string'
 *   }
 * }
 */
export const updateSystemConfig = (config) => {
    if (USE_MOCK) {
        // 更新 mock 数据
        mockConfig = { ...mockConfig, ...config }
        return Promise.resolve({
            data: {
                code: 0,
                message: {
                    detail: '配置更新成功'
                }
            }
        })
    }
    return axios.put('/admin/config', config)
}
