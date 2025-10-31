import axios from './axios'
import {
    mockDepartments,
    mockDoctors,
    mockClinics,
    mockSchedules
} from '@/views/schedule/schedule-mock'
import { getDoctors } from './doctor'

// 是否使用 Mock 数据
const USE_MOCK = false

// ==================== 科室相关 ====================

/**
 * 获取所有小科室列表
 * @returns {Promise} 返回科室列表
 * Response: { code: 0, message: { departments: [...] } }
 */
export const getDepartments = () => {
    if (USE_MOCK) {
        return Promise.resolve({
            data: {
                code: 0,
                message: {
                    departments: mockDepartments
                }
            }
        })
    }
    return axios.get(`/admin/minor-departments/`)
}

// ==================== 医生相关 ====================

/**
 * 获取指定科室的医生列表
 * @param {number} deptId - 科室ID
 * @returns {Promise} 返回医生列表
 * Response: { code: 0, message: { doctors: [...] } }
 */
export const getDepartmentDoctors = (deptId) => {
    if (USE_MOCK) {
        return Promise.resolve({
            data: {
                code: 0,
                message: {
                    doctors: mockDoctors[deptId] || []
                }
            }
        })
    }
    // 直接使用 getDoctors 并传入 dept_id 参数
    return getDoctors(deptId)
}

// ==================== 门诊相关 ====================

/**
 * 获取指定科室的门诊列表
 * @param {number} deptId - 科室ID
 * @returns {Promise} 返回门诊列表
 * Response: { code: 0, message: { clinics: [...] } }
 */
export const getDepartmentClinics = (deptId) => {
    if (USE_MOCK) {
        return Promise.resolve({
            data: {
                code: 0,
                message: {
                    clinics: mockClinics[deptId] || []
                }
            }
        })
    }
    return axios.get('/admin/clinics', {
        params: { dept_id: deptId }
    })
}

/**
 * 创建门诊
 * @param {Object} data - 门诊数据
 * @param {number} data.minor_dept_id - 科室ID
 * @param {string} data.name - 门诊名称
 * @param {number} data.clinic_type - 门诊类型 0-普通 1-国疗 2-特需
 * @param {string} data.address - 门诊地址
 * @returns {Promise}
 * Response: { code: 0, message: { clinic_id: number, detail: string } }
 */
export const createClinic = (data) => {
    if (USE_MOCK) {
        const newClinic = {
            clinic_id: Date.now(),
            area_id: 1,
            name: data.name,
            clinic_type: data.clinic_type,
            address: data.address,
            minor_dept_id: data.minor_dept_id,
            create_time: new Date().toISOString().replace('T', ' ').slice(0, 19)
        }
        // 将新门诊添加到对应科室的门诊列表
        if (!mockClinics[data.minor_dept_id]) {
            mockClinics[data.minor_dept_id] = []
        }
        mockClinics[data.minor_dept_id].push(newClinic)

        return Promise.resolve({
            data: {
                code: 0,
                message: {
                    clinic_id: newClinic.clinic_id,
                    detail: '门诊创建成功'
                }
            }
        })
    }
    return axios.post('/admin/clinics', data)
}

// ==================== 排班相关 ====================

/**
 * 获取科室排班表（指定日期范围）
 * @param {number} deptId - 科室ID
 * @param {string} startDate - 开始日期 YYYY-MM-DD
 * @param {string} endDate - 结束日期 YYYY-MM-DD
 * @returns {Promise} 返回排班列表
 * Response: { code: 0, message: { schedules: [...] } }
 */
export const getDepartmentSchedules = (deptId, startDate, endDate) => {
    if (USE_MOCK) {
        const filtered = mockSchedules.filter(s => {
            // 简单的日期过滤逻辑
            return s.date >= startDate && s.date <= endDate
        })
        return Promise.resolve({
            data: {
                code: 0,
                message: {
                    schedules: filtered
                }
            }
        })
    }
    return axios.get(`/admin/departments/${deptId}/schedules`, {
        params: { start_date: startDate, end_date: endDate }
    })
}

/**
 * 获取医生排班表（指定日期范围）
 * @param {number} doctorId - 医生ID
 * @param {string} startDate - 开始日期 YYYY-MM-DD
 * @param {string} endDate - 结束日期 YYYY-MM-DD
 * @returns {Promise} 返回医生排班列表
 * Response: { code: 0, message: { schedules: [...] } }
 */
export const getDoctorSchedules = (doctorId, startDate, endDate) => {
    if (USE_MOCK) {
        const filtered = mockSchedules.filter(s => {
            return s.doctor_id === doctorId && s.date >= startDate && s.date <= endDate
        })
        return Promise.resolve({
            data: {
                code: 0,
                message: {
                    schedules: filtered
                }
            }
        })
    }
    return axios.get(`/admin/doctors/${doctorId}/schedules`, {
        params: { start_date: startDate, end_date: endDate }
    })
}

/**
 * 获取门诊排班表（指定日期范围）
 * @param {number} clinicId - 门诊ID
 * @param {string} startDate - 开始日期 YYYY-MM-DD
 * @param {string} endDate - 结束日期 YYYY-MM-DD
 * @returns {Promise} 返回门诊排班列表
 * Response: { code: 0, message: { schedules: [...] } }
 */
export const getClinicSchedules = (clinicId, startDate, endDate) => {
    if (USE_MOCK) {
        const filtered = mockSchedules.filter(s => {
            return s.clinic_id === clinicId && s.date >= startDate && s.date <= endDate
        })
        return Promise.resolve({
            data: {
                code: 0,
                message: {
                    schedules: filtered
                }
            }
        })
    }
    return axios.get(`/admin/clinics/${clinicId}/schedules`, {
        params: { start_date: startDate, end_date: endDate }
    })
}

/**
 * 创建排班
 * @param {Object} data - 排班数据
 * @param {number} data.doctor_id - 医生ID
 * @param {number} data.clinic_id - 门诊ID
 * @param {string} data.schedule_date - 日期 YYYY-MM-DD
 * @param {string} data.time_section - 时段：上午/下午/晚上
 * @param {string} data.slot_type - 类型：普通/专家/特需
 * @param {string} data.status - 状态：正常/停诊
 * @param {number} data.price - 价格
 * @param {number} data.total_slots - 总号源数（可选）
 * @returns {Promise}
 * Response: { code: 0, message: { schedule_id: number, detail: string } }
 */
export const createSchedule = (data) => {
    if (USE_MOCK) {
        // 查找医生和门诊信息，补充完整数据
        let doctorName = '未知医生'
        let clinicName = '未知门诊'
        let clinicType = 0

        // 查找医生名称
        for (const deptId in mockDoctors) {
            const doctor = mockDoctors[deptId].find(d => d.doctor_id === data.doctor_id)
            if (doctor) {
                doctorName = doctor.name
                break
            }
        }

        // 查找门诊信息
        for (const deptId in mockClinics) {
            const clinic = mockClinics[deptId].find(c => c.clinic_id === data.clinic_id)
            if (clinic) {
                clinicName = clinic.name
                clinicType = clinic.type
                break
            }
        }

        // 计算星期几 (兼容 schedule_date 和 date 字段)
        const dateStr = data.schedule_date || data.date
        const date = new Date(dateStr)
        const weekDays = ['日', '一', '二', '三', '四', '五', '六']
        const weekDay = weekDays[date.getDay()]

        const newSchedule = {
            schedule_id: Date.now(),
            doctor_id: data.doctor_id,
            doctor_name: doctorName,
            clinic_id: data.clinic_id,
            clinic_name: clinicName,
            clinic_type: clinicType,
            date: dateStr,
            week_day: weekDay,
            time_section: data.time_section,
            slot_type: data.slot_type,
            total_slots: data.total_slots || 20,
            remaining_slots: data.status === '停诊' ? 0 : (data.total_slots || 20),
            status: data.status,
            price: data.price,
            create_time: new Date().toISOString().replace('T', ' ').slice(0, 19)
        }

        mockSchedules.push(newSchedule)

        return Promise.resolve({
            data: {
                code: 0,
                message: {
                    schedule_id: newSchedule.schedule_id,
                    detail: '排班创建成功'
                }
            }
        })
    }
    return axios.post('/admin/schedules', data)
}

/**
 * 更新排班
 * @param {number} scheduleId - 排班ID
 * @param {Object} data - 更新的数据
 * @returns {Promise}
 * Response: { code: 0, message: { detail: string } }
 */
export const updateSchedule = (scheduleId, data) => {
    if (USE_MOCK) {
        const index = mockSchedules.findIndex(s => s.schedule_id === scheduleId)
        if (index !== -1) {
            // 如果更新了门诊，需要重新查找门诊信息
            if (data.clinic_id && data.clinic_id !== mockSchedules[index].clinic_id) {
                for (const deptId in mockClinics) {
                    const clinic = mockClinics[deptId].find(c => c.clinic_id === data.clinic_id)
                    if (clinic) {
                        data.clinic_name = clinic.name
                        data.clinic_type = clinic.type
                        break
                    }
                }
            }

            // 如果更新了日期，重新计算星期 (兼容 schedule_date 和 date 字段)
            const newDate = data.schedule_date || data.date
            if (newDate && newDate !== mockSchedules[index].date) {
                const date = new Date(newDate)
                const weekDays = ['日', '一', '二', '三', '四', '五', '六']
                data.week_day = weekDays[date.getDay()]
                data.date = newDate
            }

            // 如果状态改为停诊，将剩余号源设为0
            if (data.status === '停诊') {
                data.total_slots = 0
                data.remaining_slots = 0
            }

            mockSchedules[index] = { ...mockSchedules[index], ...data }
        }
        return Promise.resolve({
            data: {
                code: 0,
                message: {
                    detail: '排班更新成功'
                }
            }
        })
    }
    return axios.put(`/admin/schedules/${scheduleId}`, data)
}

/**
 * 删除排班
 * @param {number} scheduleId - 排班ID
 * @returns {Promise}
 * Response: { code: 0, message: { detail: string } }
 */
export const deleteSchedule = (scheduleId) => {
    if (USE_MOCK) {
        const index = mockSchedules.findIndex(s => s.schedule_id === scheduleId)
        if (index !== -1) {
            mockSchedules.splice(index, 1)
        }
        return Promise.resolve({
            data: {
                code: 0,
                message: {
                    detail: '排班删除成功'
                }
            }
        })
    }
    return axios.delete(`/admin/schedules/${scheduleId}`)
}
