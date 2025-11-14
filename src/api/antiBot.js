import request from './axios'
import { mockGetUsers, mockBanUser, mockUnbanUser, mockGetUserDetail, mockGetUserStats } from '@/views/anti-bot/mock'

const USE_MOCK = false
/**
 * 获取用户列表（按风险/封禁状态筛选）
 * @param {string} user_type - 用户类型：'high' / 'low' / 'banned'
 * @param {number} page - 页码，默认 1
 * @param {number} page_size - 每页数量，默认 20
 */
export const getUsers = async ({ user_type, page = 1, page_size = 20 }) => {
    if (USE_MOCK) {
        return mockGetUsers({ user_type, page, page_size })
    }

    const response = await request({
        url: '/admin/anti-scalper/users',
        method: 'get',
        params: { user_type, page, page_size }
    })
    return response.data
}

/**
 * 获取用户详细信息
 * @param {number} user_id - 用户ID
 */
export const getUserDetail = async (user_id) => {
    if (USE_MOCK) {
        return mockGetUserDetail({ user_id })
    }

    const response = await request({
        url: `/admin/anti-scalper/users/${user_id}`,
        method: 'get'
    })
    return response.data
}

/**
 * 获取用户统计信息（时间范围内行为）
 * @param {number} user_id - 用户ID
 * @param {string} start_date - 开始日期，格式 YYYY-MM-DD
 * @param {string} end_date - 结束日期，格式 YYYY-MM-DD
 */
export const getUserStats = async ({ user_id, start_date, end_date }) => {
    if (USE_MOCK) {
        return mockGetUserStats({ user_id, start_date, end_date })
    }

    const response = await request({
        url: `/admin/anti-scalper/users/${user_id}/stats`,
        method: 'get',
        params: { start_date, end_date }
    })
    return response.data
}

/**
 * 封禁用户
 * SEC-004 执行用户封禁 / 覆盖更新封禁记录
 * @param {number} user_id - 用户ID
 * @param {string} ban_type - 封禁类型：'register'=禁止注册新号, 'login'=禁止登录, 'all'=全部禁止
 * @param {number} duration_days - 封禁天数（0 表示永久封禁）
 * @param {string} reason - 封禁原因（可选）
 */
export const banUser = async (user_id, { ban_type, duration_days, reason }) => {
    if (USE_MOCK) {
        return mockBanUser({ user_id, ban_type, duration_days, reason })
    }

    const response = await request({
        url: `/admin/anti-scalper/ban`,
        method: 'post',
        data: { user_id, ban_type, duration_days, reason }
    })
    return response.data
}

/**
 * 解封用户
 * SEC-005 解除用户封禁
 * @param {number} user_id - 用户ID
 * @param {string} reason - 解封原因（可选）
 */
export const unbanUser = async (user_id, { reason } = {}) => {
    if (USE_MOCK) {
        return mockUnbanUser({ user_id })
    }

    const response = await request({
        url: `/admin/anti-scalper/unban`,
        method: 'post',
        data: { user_id, reason }
    })
    return response.data
}
