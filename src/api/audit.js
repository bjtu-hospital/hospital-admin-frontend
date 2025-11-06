import axios from './axios'
import {
    mockScheduleAudits,
    mockLeaveAudits
} from '@/views/audit/audit-mock'

// 是否使用 Mock 数据
const USE_MOCK = true

// ==================== 排班审核相关 ====================

/**
 * 获取所有排班审核列表（不带分页，返回全部数据）
 * @returns {Promise} 返回所有排班审核列表
 * 
 * 【重要】数据结构说明：每个门诊一条记录
 * 
 * Response格式:
 * {
 *   code: 0,
 *   message: {
 *     audits: [
 *       {
 *         id: number,                    // 审核ID
 *         departmentId: number,          // 科室ID
 *         departmentName: string,        // 科室名称
 *         clinicId: number,              // 门诊ID
 *         clinicName: string,            // 门诊名称
 *         submitterId: number,           // 提交人ID（科室主任）
 *         submitterName: string,         // 提交人姓名
 *         submitTime: string,            // 提交时间 ISO 8601格式
 *         weekStart: string,             // 排班周起始日期 YYYY-MM-DD
 *         weekEnd: string,               // 排班周结束日期 YYYY-MM-DD
 *         remark: string,                // 备注信息
 *         status: string,                // 审核状态: 'pending'(待审核)、'approved'(已通过)、'rejected'(已拒绝)
 *         schedule: [                    // 7天的排班，每天3个时段
 *           [                            // 第1天 [上午, 下午, 晚上]
 *             { doctorId: number, doctorName: string } | null,
 *             { doctorId: number, doctorName: string } | null,
 *             { doctorId: number, doctorName: string } | null
 *           ],
 *           // ... 共7天
 *         ]
 *       }
 *     ]
 *   }
 * }
 * 
 * 注意：前端需要根据 status 字段进行筛选和分页
 */
export const getScheduleAudits = () => {
    if (USE_MOCK) {
        return Promise.resolve({
            data: {
                code: 0,
                message: {
                    audits: mockScheduleAudits
                }
            }
        })
    }
    return axios.get('/admin/audit/schedule/')
}

/**
 * 获取排班审核详情
 * @param {number} auditId - 审核ID
 * @returns {Promise} 返回排班审核详情
 * Response格式同上面的单个审核对象
 */
export const getScheduleAuditDetail = (auditId) => {
    if (USE_MOCK) {
        const audit = mockScheduleAudits.find(item => item.id === auditId)
        return Promise.resolve({
            data: {
                code: 0,
                message: audit
            }
        })
    }
    return axios.get(`/admin/audit/schedule/${auditId}/`)
}

/**
 * 审核排班（通过）
 * @param {number} auditId - 审核ID
 * @param {Object} data - 审核数据
 * @param {string} data.comment - 审核备注（可选）
 * @returns {Promise}
 * 
 * Response格式:
 * {
 *   code: 0,
 *   message: {
 *     auditId: number,
 *     status: 'approved',
 *     auditorId: number,        // 审核人ID
 *     auditorName: string,      // 审核人姓名
 *     auditTime: string         // 审核时间
 *   }
 * }
 */
export const approveScheduleAudit = (auditId, data) => {
    if (USE_MOCK) {
        const audit = mockScheduleAudits.find(item => item.id === auditId)
        if (audit) {
            audit.status = 'approved'
            audit.auditorId = 1
            audit.auditorName = '管理员'
            audit.auditTime = new Date().toISOString()
            audit.auditComment = data.comment || ''
        }
        return Promise.resolve({
            data: {
                code: 0,
                message: {
                    auditId,
                    status: 'approved',
                    auditorId: 1,
                    auditorName: '管理员',
                    auditTime: new Date().toISOString()
                }
            }
        })
    }
    return axios.post(`/admin/audit/schedule/${auditId}/approve/`, data)
}

/**
 * 审核排班（拒绝）
 * @param {number} auditId - 审核ID
 * @param {Object} data - 审核数据
 * @param {string} data.reason - 拒绝原因（必填，至少10个字符）
 * @returns {Promise}
 * Response格式同 approveScheduleAudit
 */
export const rejectScheduleAudit = (auditId, data) => {
    if (USE_MOCK) {
        const audit = mockScheduleAudits.find(item => item.id === auditId)
        if (audit) {
            audit.status = 'rejected'
            audit.auditorId = 1
            audit.auditorName = '管理员'
            audit.auditTime = new Date().toISOString()
            audit.rejectReason = data.reason
        }
        return Promise.resolve({
            data: {
                code: 0,
                message: {
                    auditId,
                    status: 'rejected',
                    auditorId: 1,
                    auditorName: '管理员',
                    auditTime: new Date().toISOString()
                }
            }
        })
    }
    return axios.post(`/admin/audit/schedule/${auditId}/reject/`, data)
}

// ==================== 请假审核相关 ====================

/**
 * 获取所有请假审核列表（不带分页，返回全部数据）
 * @returns {Promise} 返回所有请假审核列表
 * 
 * Response格式:
 * {
 *   code: 0,
 *   message: {
 *     audits: [
 *       {
 *         id: number,                    // 审核ID
 *         doctorId: number,              // 医生ID
 *         doctorName: string,            // 医生姓名
 *         doctorTitle: string,           // 医生职称
 *         departmentName: string,        // 所属科室
 *         leaveStartDate: string,        // 请假开始日期 YYYY-MM-DD
 *         leaveEndDate: string,          // 请假结束日期 YYYY-MM-DD
 *         leaveDays: number,             // 请假天数
 *         reason: string,                // 请假原因
 *         reasonPreview: string,         // 原因预览（前50字）
 *         attachments: [                 // 附件图片列表（最多10张）
 *           {
 *             url: string,               // 图片URL
 *             name: string               // 图片名称
 *           }
 *         ],
 *         submitTime: string,            // 提交时间 ISO 8601格式
 *         status: string,                // 审核状态: 'pending'(待审核)、'approved'(已通过)、'rejected'(已拒绝)
 *       }
 *     ]
 *   }
 * }
 * 
 * 注意：前端需要根据 status 字段进行筛选和分页
 */
export const getLeaveAudits = () => {
    if (USE_MOCK) {
        return Promise.resolve({
            data: {
                code: 0,
                message: {
                    audits: mockLeaveAudits
                }
            }
        })
    }
    return axios.get('/admin/audit/leave/')
}

/**
 * 获取请假审核详情
 * @param {number} auditId - 审核ID
 * @returns {Promise} 返回请假审核详情
 * Response格式同上面的单个审核对象
 */
export const getLeaveAuditDetail = (auditId) => {
    if (USE_MOCK) {
        const audit = mockLeaveAudits.find(item => item.id === auditId)
        return Promise.resolve({
            data: {
                code: 0,
                message: audit
            }
        })
    }
    return axios.get(`/admin/audit/leave/${auditId}/`)
}

/**
 * 审核请假（通过）
 * @param {number} auditId - 审核ID
 * @param {Object} data - 审核数据
 * @param {string} data.comment - 审核备注（可选）
 * @returns {Promise}
 * 
 * Response格式:
 * {
 *   code: 0,
 *   message: {
 *     auditId: number,
 *     status: 'approved',
 *     auditorId: number,        // 审核人ID
 *     auditorName: string,      // 审核人姓名
 *     auditTime: string         // 审核时间
 *   }
 * }
 */
export const approveLeaveAudit = (auditId, data) => {
    if (USE_MOCK) {
        const audit = mockLeaveAudits.find(item => item.id === auditId)
        if (audit) {
            audit.status = 'approved'
            audit.auditorId = 1
            audit.auditorName = '管理员'
            audit.auditTime = new Date().toISOString()
            audit.auditComment = data.comment || ''
        }
        return Promise.resolve({
            data: {
                code: 0,
                message: {
                    auditId,
                    status: 'approved',
                    auditorId: 1,
                    auditorName: '管理员',
                    auditTime: new Date().toISOString()
                }
            }
        })
    }
    return axios.post(`/admin/audit/leave/${auditId}/approve/`, data)
}

/**
 * 审核请假（拒绝）
 * @param {number} auditId - 审核ID
 * @param {Object} data - 审核数据
 * @param {string} data.reason - 拒绝原因（必填，至少10个字符）
 * @returns {Promise}
 * Response格式同 approveLeaveAudit
 */
export const rejectLeaveAudit = (auditId, data) => {
    if (USE_MOCK) {
        const audit = mockLeaveAudits.find(item => item.id === auditId)
        if (audit) {
            audit.status = 'rejected'
            audit.auditorId = 1
            audit.auditorName = '管理员'
            audit.auditTime = new Date().toISOString()
            audit.rejectReason = data.reason
        }
        return Promise.resolve({
            data: {
                code: 0,
                message: {
                    auditId,
                    status: 'rejected',
                    auditorId: 1,
                    auditorName: '管理员',
                    auditTime: new Date().toISOString()
                }
            }
        })
    }
    return axios.post(`/admin/audit/leave/${auditId}/reject/`, data)
}
