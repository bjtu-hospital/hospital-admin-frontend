

// 生成某个范围内的随机日期 ISO 字符串
const randomDateInPastDays = (days = 120) => {
    const offset = Math.floor(Math.random() * days * 24 * 60 * 60 * 1000)
    return new Date(Date.now() - offset).toISOString()
}

// 将总次数分配到若干随机日期，生成活动日志
const generateActivities = (registerCount = 0, cancelCount = 0, days = 120) => {
    const logs = []
    for (let i = 0; i < registerCount; i++) {
        logs.push({ action: 'register', time: randomDateInPastDays(days) })
    }
    for (let i = 0; i < cancelCount; i++) {
        logs.push({ action: 'cancel', time: randomDateInPastDays(days) })
    }
    // 按时间排序（新到旧）
    logs.sort((a, b) => new Date(b.time) - new Date(a.time))
    return logs
}

// 生成模拟高风险用户数据
const generateHighRiskUsers = () => {
    const riskLevels = ['高危', '中危']
    const banStatuses = ['未封禁', '禁止挂号', '禁止登录', '完全封禁']
    const reasons = [
        '频繁取消挂号',
        '恶意占用号源',
        '账号异常登录',
        '疑似黄牛账号',
        '多次违规操作',
        '系统检测异常'
    ]

    return Array.from({ length: 48 }, (_, i) => ({
        user_id: 1000 + i,
        username: `user_${1000 + i}`,
        name: `高风险用户${i + 1}`,
        phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        risk_level: riskLevels[Math.floor(Math.random() * riskLevels.length)],
        risk_score: Math.floor(Math.random() * 40) + 60, // 60-100分
        ban_status: banStatuses[Math.floor(Math.random() * banStatuses.length)],
        ban_type: Math.random() > 0.5 ? 'register' : 'login', // register=禁止挂号, login=禁止登录
        ban_end_time: Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null,
        warning_count: Math.floor(Math.random() * 10),
        cancel_count: Math.floor(Math.random() * 20),
        register_count: Math.floor(Math.random() * 50) + 10,
        last_active: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        risk_reason: reasons[Math.floor(Math.random() * reasons.length)],
        created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        activities: [] // 占位，稍后填充
    }))
}

// 生成模拟正常用户数据
const generateNormalUsers = () => {
    const banStatuses = ['未封禁', '禁止挂号', '禁止登录']

    return Array.from({ length: 156 }, (_, i) => ({
        user_id: 2000 + i,
        username: `user_${2000 + i}`,
        name: `普通用户${i + 1}`,
        phone: `139${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        risk_level: '正常',
        risk_score: Math.floor(Math.random() * 50), // 0-50分
        ban_status: Math.random() > 0.9 ? banStatuses[Math.floor(Math.random() * 3)] : '未封禁',
        ban_type: Math.random() > 0.5 ? 'register' : 'login',
        ban_end_time: Math.random() > 0.8 ? new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null,
        warning_count: Math.floor(Math.random() * 3),
        cancel_count: Math.floor(Math.random() * 5),
        register_count: Math.floor(Math.random() * 30) + 1,
        last_active: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        risk_reason: null,
        created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        activities: [] // 占位，稍后填充
    }))
}

export const mockHighRiskUsers = generateHighRiskUsers()
export const mockNormalUsers = generateNormalUsers()

    // 基于总次数为每个用户填充活动日志（最近120天）
    ;[...mockHighRiskUsers, ...mockNormalUsers].forEach(u => {
        u.activities = generateActivities(u.register_count, u.cancel_count, 120)
    })

// Mock API 函数
export const mockGetUsers = ({ user_type, page = 1, page_size = 10 }) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const users = user_type === 'high_risk' ? mockHighRiskUsers : mockNormalUsers
            const start = (page - 1) * page_size
            const end = start + page_size
            const paginatedUsers = users.slice(start, end)

            resolve({
                code: 0,
                message: {
                    users: paginatedUsers,
                    total: users.length,
                    page,
                    page_size,
                    total_pages: Math.ceil(users.length / page_size)
                }
            })
        }, 300)
    })
}

export const mockBanUser = ({ user_id, ban_type, duration_days }) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                code: 0,
                message: '封禁成功',
                data: {
                    user_id,
                    ban_type,
                    ban_end_time: duration_days > 0
                        ? new Date(Date.now() + duration_days * 24 * 60 * 60 * 1000).toISOString()
                        : null
                }
            })
        }, 300)
    })
}

export const mockUnbanUser = ({ user_id }) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                code: 0,
                message: '解除封禁成功',
                data: { user_id }
            })
        }, 300)
    })
}

export const mockGetUserDetail = ({ user_id }) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const allUsers = [...mockHighRiskUsers, ...mockNormalUsers]
            const user = allUsers.find(u => u.user_id === user_id)

            if (user) {
                resolve({
                    code: 0,
                    message: user
                })
            } else {
                resolve({
                    code: 404,
                    message: '用户不存在'
                })
            }
        }, 300)
    })
}

// 根据时间范围统计用户行为
export const mockGetUserStats = ({ user_id, start_date, end_date }) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const allUsers = [...mockHighRiskUsers, ...mockNormalUsers]
            const user = allUsers.find(u => u.user_id === user_id)
            if (!user) {
                resolve({ code: 404, message: '用户不存在' })
                return
            }

            const start = start_date ? new Date(start_date).getTime() : 0
            const end = end_date ? new Date(end_date).getTime() : Date.now()
            const within = user.activities.filter(a => {
                const t = new Date(a.time).getTime()
                return t >= start && t <= end
            })

            const register_count = within.filter(a => a.action === 'register').length
            const cancel_count = within.filter(a => a.action === 'cancel').length

            resolve({
                code: 0,
                message: { user_id, start_date, end_date, register_count, cancel_count }
            })
        }, 200)
    })
}
