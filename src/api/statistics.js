import request from './axios'
import {
    mockHospitalRegistrations,
    mockAreaRegistrations,
    mockDepartmentRegistrations,
    mockDoctorRegistrations,
    mockDepartmentRanking,
    mockDoctorRanking,
    mockUserStatistics,
    mockVisitStatistics
} from '@/views/static/statistics-mock'

const USE_MOCK = false

/**
 * 获取医院总体挂号统计
 * GET /statistics/hospital/registrations
 * @param {Object} params - 查询参数
 * @param {string} params.date - 统计日期 YYYY-MM-DD
 * @param {string} params.date_range - 时间范围: today/7days/30days
 */
export async function getHospitalRegistrations(params) {
    if (USE_MOCK) {
        return Promise.resolve(mockHospitalRegistrations(params))
    }
    const response = await request({
        url: '/statistics/hospital/registrations',
        method: 'get',
        params
    })
    return response.data
}

/**
 * 获取分院区挂号统计
 * GET /statistics/areas/{area_id}/registrations
 * @param {number} areaId - 院区ID
 * @param {Object} params - 查询参数
 * @param {string} params.date - 统计日期 YYYY-MM-DD
 */
export async function getAreaRegistrations(areaId, params) {
    if (USE_MOCK) {
        return Promise.resolve(mockAreaRegistrations(areaId, params))
    }
    const response = await request({
        url: `/statistics/areas/${areaId}/registrations`,
        method: 'get',
        params
    })
    return response.data
}

/**
 * 获取科室挂号统计
 * GET /statistics/departments/{minor_dept_id}/registrations
 * @param {number} minorDeptId - 小科室ID
 * @param {Object} params - 查询参数
 * @param {string} params.date - 统计日期 YYYY-MM-DD
 * @param {string} params.date_range - 时间范围: today/7days/30days
 */
export async function getDepartmentRegistrations(minorDeptId, params) {
    if (USE_MOCK) {
        return Promise.resolve(mockDepartmentRegistrations(minorDeptId, params))
    }
    const response = await request({
        url: `/statistics/departments/${minorDeptId}/registrations`,
        method: 'get',
        params
    })
    return response.data
}

/**
 * 获取医生挂号统计
 * GET /statistics/doctors/{doctor_id}/registrations
 * @param {number} doctorId - 医生ID
 * @param {Object} params - 查询参数
 * @param {string} params.date - 统计日期 YYYY-MM-DD
 * @param {string} params.date_range - 时间范围: today/7days/30days
 */
export async function getDoctorRegistrations(doctorId, params) {
    if (USE_MOCK) {
        return Promise.resolve(mockDoctorRegistrations(doctorId, params))
    }
    const response = await request({
        url: `/statistics/doctors/${doctorId}/registrations`,
        method: 'get',
        params
    })
    return response.data
}

/**
 * 获取科室排行榜
 * GET /statistics/departments/ranking
 * @param {Object} params - 查询参数
 * @param {string} params.date - 统计日期 YYYY-MM-DD
 * @param {string} params.order_by - 排序依据: registrations/revenue
 * @param {number} params.limit - 返回数量
 */
export async function getDepartmentRanking(params) {
    if (USE_MOCK) {
        return Promise.resolve(mockDepartmentRanking(params))
    }
    const response = await request({
        url: '/statistics/departments/ranking',
        method: 'get',
        params
    })
    return response.data
}

/**
 * 获取医生排行榜
 * GET /statistics/doctors/ranking
 * @param {Object} params - 查询参数
 * @param {number} params.dept_id - 限定科室ID (可选)
 * @param {string} params.date - 统计日期 YYYY-MM-DD
 * @param {string} params.order_by - 排序依据: registrations/revenue
 * @param {number} params.limit - 返回数量
 */
export async function getDoctorRanking(params) {
    if (USE_MOCK) {
        return Promise.resolve(mockDoctorRanking(params))
    }
    const response = await request({
        url: '/statistics/doctors/ranking',
        method: 'get',
        params
    })
    return response.data
}

/**
 * 统计用户数
 * GET /statistics/users
 */
export async function getUserStatistics() {
    if (USE_MOCK) {
        return Promise.resolve(mockUserStatistics())
    }
    const response = await request({
        url: '/statistics/users',
        method: 'get'
    })
    return response.data
}

/**
 * 统计网站访问量
 * GET /statistics/visits
 * @param {Object} params - 查询参数
 * @param {number} params.compare_days - 对比天数
 */
export async function getVisitStatistics(params) {
    if (USE_MOCK) {
        return Promise.resolve(mockVisitStatistics(params))
    }
    const response = await request({
        url: '/statistics/visits',
        method: 'get',
        params
    })
    return response.data
}
