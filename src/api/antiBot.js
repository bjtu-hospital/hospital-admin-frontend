import request from './axios'
import { USE_MOCK, mockGetUsers, mockBanUser, mockUnbanUser, mockGetUserDetail, mockGetUserStats } from '@/views/anti-bot/mock'

/**
 * 获取用户列表
 * @param {string} user_type - 用户类型：'high_risk'=高风险用户, 'normal'=正常用户
 * @param {number} page - 页码
 * @param {number} page_size - 每页数量
 */
export const getUsers = async ({ user_type = 'normal', page = 1, page_size = 10 }) => {
    if (USE_MOCK) {
        return mockGetUsers({ user_type, page, page_size })
    }

    return request({
        url: '/api/anti-bot/users',
        method: 'get',
        params: { user_type, page, page_size }
    })
}

/**
 * 封禁用户
 * @param {number} user_id - 用户ID
 * @param {string} ban_type - 封禁类型：'register'=禁止挂号, 'login'=禁止登录, 'all'=完全封禁
 * @param {number} duration_days - 封禁时长（天），0表示永久
 * @param {string} reason - 封禁原因
 */
export const banUser = async ({ user_id, ban_type, duration_days = 0, reason = '' }) => {
    if (USE_MOCK) {
        return mockBanUser({ user_id, ban_type, duration_days, reason })
    }

    return request({
        url: '/api/anti-bot/ban',
        method: 'post',
        data: { user_id, ban_type, duration_days, reason }
    })
}

/**
 * 解除封禁
 * @param {number} user_id - 用户ID
 */
export const unbanUser = async ({ user_id }) => {
    if (USE_MOCK) {
        return mockUnbanUser({ user_id })
    }

    return request({
        url: '/api/anti-bot/unban',
        method: 'post',
        data: { user_id }
    })
}

/**
 * 获取用户详情
 * @param {number} user_id - 用户ID
 */
export const getUserDetail = async ({ user_id }) => {
    if (USE_MOCK) {
        return mockGetUserDetail({ user_id })
    }

    return request({
        url: `/api/anti-bot/users/${user_id}`,
        method: 'get'
    })
}

/**
 * 获取用户在时间范围内的行为统计
 * @param {number} user_id - 用户ID
 * @param {string} start_date - 开始时间 ISO 字符串（可选）
 * @param {string} end_date - 结束时间 ISO 字符串（可选）
 */
export const getUserStats = async ({ user_id, start_date, end_date }) => {
    if (USE_MOCK) {
        return mockGetUserStats({ user_id, start_date, end_date })
    }

    return request({
        url: `/api/anti-bot/users/${user_id}/stats`,
        method: 'get',
        params: { start_date, end_date }
    })
}
