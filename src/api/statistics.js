import request from './axios'
import {
    USE_MOCK,
    mockHospitalRegistrations,
    mockAreaRegistrations,
    mockDepartmentRegistrations,
    mockDoctorRegistrations,
    mockDepartmentRanking,
    mockDoctorRanking
} from '@/views/static/statistics-mock'

/**
 * 获取医院总体挂号统计
 * @param {Object} params - 查询参数
 * @param {string} params.date - 统计日期 YYYY-MM-DD
 * @param {string} params.date_range - 时间范围: today/7days/30days
 */
export function getHospitalRegistrations(params) {
    if (USE_MOCK) {
        return Promise.resolve(mockHospitalRegistrations(params))
    }
    return request({
        url: '/admin/statistics/hospital/registrations',
        method: 'get',
        params
    })
}

/**
 * 获取分院区挂号统计
 * @param {number} areaId - 院区ID
 * @param {Object} params - 查询参数
 * @param {string} params.date - 统计日期 YYYY-MM-DD
 */
export function getAreaRegistrations(areaId, params) {
    if (USE_MOCK) {
        return Promise.resolve(mockAreaRegistrations(areaId, params))
    }
    return request({
        url: `/admin/statistics/areas/${areaId}/registrations`,
        method: 'get',
        params
    })
}

/**
 * 获取科室挂号统计
 * @param {number} minorDeptId - 小科室ID
 * @param {Object} params - 查询参数
 * @param {string} params.date - 统计日期 YYYY-MM-DD
 * @param {string} params.date_range - 时间范围: today/7days/30days
 */
export function getDepartmentRegistrations(minorDeptId, params) {
    if (USE_MOCK) {
        return Promise.resolve(mockDepartmentRegistrations(minorDeptId, params))
    }
    return request({
        url: `/admin/statistics/departments/${minorDeptId}/registrations`,
        method: 'get',
        params
    })
}

/**
 * 获取医生挂号统计
 * @param {number} doctorId - 医生ID
 * @param {Object} params - 查询参数
 * @param {string} params.date - 统计日期 YYYY-MM-DD
 * @param {string} params.date_range - 时间范围: today/7days/30days
 */
export function getDoctorRegistrations(doctorId, params) {
    if (USE_MOCK) {
        return Promise.resolve(mockDoctorRegistrations(doctorId, params))
    }
    return request({
        url: `/admin/statistics/doctors/${doctorId}/registrations`,
        method: 'get',
        params
    })
}

/**
 * 获取科室排行榜
 * @param {Object} params - 查询参数
 * @param {string} params.date - 统计日期 YYYY-MM-DD
 * @param {string} params.order_by - 排序依据: registrations/revenue
 * @param {number} params.limit - 返回数量
 */
export function getDepartmentRanking(params) {
    if (USE_MOCK) {
        return Promise.resolve(mockDepartmentRanking(params))
    }
    return request({
        url: '/admin/statistics/departments/ranking',
        method: 'get',
        params
    })
}

/**
 * 获取医生排行榜
 * @param {Object} params - 查询参数
 * @param {number} params.dept_id - 限定科室ID
 * @param {string} params.date - 统计日期 YYYY-MM-DD
 * @param {string} params.order_by - 排序依据: registrations/revenue
 * @param {number} params.limit - 返回数量
 */
export function getDoctorRanking(params) {
    if (USE_MOCK) {
        return Promise.resolve(mockDoctorRanking(params))
    }
    return request({
        url: '/admin/statistics/doctors/ranking',
        method: 'get',
        params
    })
}
