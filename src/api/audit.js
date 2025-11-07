import axios from './axios'
import {
    mockScheduleAudits,
    mockLeaveAudits
} from '@/views/audit/audit-mock'

// 是否使用 Mock 数据
const USE_MOCK = false

/**
 * 将后端的下划线命名转换为前端的驼峰命名
 * @param {any} obj - 后端数据
 * @returns {any} 转换后的数据
 */
const convertToCamelCase = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(item => convertToCamelCase(item))
    }

    if (obj === null || typeof obj !== 'object') {
        return obj
    }

    const converted = {}
    for (const [key, value] of Object.entries(obj)) {
        // 转换键名：将下划线命名转为驼峰命名
        const camelKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase())
        // 递归转换值
        converted[camelKey] = convertToCamelCase(value)
    }
    return converted
}

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
 *         department_id: number,         // 科室ID
 *         department_name: string,       // 科室名称
 *         clinic_id: number,             // 门诊ID
 *         clinic_name: string,           // 门诊名称
 *         submitter_id: number,          // 提交人ID（科室主任）
 *         submitter_name: string,        // 提交人姓名
 *         submit_time: string,           // 提交时间 ISO 8601格式
 *         week_start: string,            // 排班周起始日期 YYYY-MM-DD
 *         week_end: string,              // 排班周结束日期 YYYY-MM-DD
 *         remark: string,                // 备注信息
 *         status: string,                // 审核状态: 'pending'(待审核)、'approved'(已通过)、'rejected'(已拒绝)
 *         auditor_id: number | null,     // 审核人ID
 *         audit_time: string | null,     // 审核时间
 *         audit_remark: string | null,   // 审核备注
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
export const getScheduleAudits = async () => {
    if (USE_MOCK) {
        return Promise.resolve({
            data: {
                code: 0,
                message: {
                    audits: convertToCamelCase(mockScheduleAudits)
                }
            }
        })
    }
    const response = await axios.get('/admin/audit/schedule')
    // 转换后端的下划线命名为驼峰命名
    if (response.data.code === 0 && response.data.message.audits) {
        response.data.message.audits = convertToCamelCase(response.data.message.audits)
    }
    return response
}

/**
 * 获取排班审核详情
 * @param {number} auditId - 审核ID
 * @returns {Promise} 返回排班审核详情
 * Response格式同上面的单个审核对象
 */
export const getScheduleAuditDetail = async (auditId) => {
    if (USE_MOCK) {
        const audit = mockScheduleAudits.find(item => item.id === auditId)
        return Promise.resolve({
            data: {
                code: 0,
                message: convertToCamelCase(audit)
            }
        })
    }
    const response = await axios.get(`/admin/audit/schedule/${auditId}`)
    // 转换后端的下划线命名为驼峰命名
    if (response.data.code === 0 && response.data.message) {
        response.data.message = convertToCamelCase(response.data.message)
    }
    return response
}

/**
 * 通过排班审核
 * @param {number} auditId - 审核ID
 * @param {string} comment - 审核意见
 * @returns {Promise}
 * 
 * Response格式:
 * {
 *   code: 0,
 *   message: {
 *     audit_id: number,
 *     status: 'approved',
 *     auditor_id: number,
 *     audit_time: string
 *   }
 * }
 */
export const approveScheduleAudit = (auditId, comment) => {
    if (USE_MOCK) {
        const audit = mockScheduleAudits.find(item => item.id === auditId)
        if (audit) {
            audit.status = 'approved'
            audit.auditor_id = 1
            audit.audit_time = new Date().toISOString()
            audit.audit_remark = comment
        }
        return Promise.resolve({
            data: {
                code: 0,
                message: {
                    audit_id: auditId,
                    status: 'approved',
                    auditor_id: 1,
                    audit_time: new Date().toISOString()
                }
            }
        })
    }
    return axios.post(`/admin/audit/schedule/${auditId}/approve`, { comment })
}

/**
 * 拒绝排班审核
 * @param {number} auditId - 审核ID
 * @param {string} comment - 拒绝原因
 * @returns {Promise}
 * 
 * Response格式:
 * {
 *   code: 0,
 *   message: {
 *     audit_id: number,
 *     status: 'rejected',
 *     auditor_id: number,
 *     audit_time: string
 *   }
 * }
 */
export const rejectScheduleAudit = (auditId, comment) => {
    if (USE_MOCK) {
        const audit = mockScheduleAudits.find(item => item.id === auditId)
        if (audit) {
            audit.status = 'rejected'
            audit.auditor_id = 1
            audit.audit_time = new Date().toISOString()
            audit.audit_remark = comment
        }
        return Promise.resolve({
            data: {
                code: 0,
                message: {
                    audit_id: auditId,
                    status: 'rejected',
                    auditor_id: 1,
                    audit_time: new Date().toISOString()
                }
            }
        })
    }
    return axios.post(`/admin/audit/schedule/${auditId}/reject`, { comment })
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
export const getLeaveAudits = async () => {
    if (USE_MOCK) {
        return Promise.resolve({
            data: {
                code: 0,
                message: {
                    audits: convertToCamelCase(mockLeaveAudits)
                }
            }
        })
    }
    const response = await axios.get('/admin/audit/leave')
    // 转换后端的下划线命名为驼峰命名
    if (response.data.code === 0 && response.data.message.audits) {
        response.data.message.audits = convertToCamelCase(response.data.message.audits)
    }
    return response
}

/**
 * 获取请假审核详情
 * @param {number} auditId - 审核ID
 * @returns {Promise} 返回请假审核详情
 * Response格式同上面的单个审核对象
 */
export const getLeaveAuditDetail = async (auditId) => {
    if (USE_MOCK) {
        const audit = mockLeaveAudits.find(item => item.id === auditId)
        return Promise.resolve({
            data: {
                code: 0,
                message: convertToCamelCase(audit)
            }
        })
    }
    const response = await axios.get(`/admin/audit/leave/${auditId}`)
    // 转换后端的下划线命名为驼峰命名
    if (response.data.code === 0 && response.data.message) {
        response.data.message = convertToCamelCase(response.data.message)
    }
    return response
}

/**
 * 通过请假审核
 * @param {number} auditId - 审核ID
 * @param {string} comment - 审核意见
 * @returns {Promise}
 * 
 * Response格式:
 * {
 *   code: 0,
 *   message: {
 *     audit_id: number,
 *     status: 'approved',
 *     auditor_id: number,
 *     audit_time: string
 *   }
 * }
 */
export const approveLeaveAudit = (auditId, comment) => {
    if (USE_MOCK) {
        const audit = mockLeaveAudits.find(item => item.id === auditId)
        if (audit) {
            audit.status = 'approved'
            audit.auditor_id = 1
            audit.audit_time = new Date().toISOString()
            audit.audit_remark = comment
        }
        return Promise.resolve({
            data: {
                code: 0,
                message: {
                    audit_id: auditId,
                    status: 'approved',
                    auditor_id: 1,
                    audit_time: new Date().toISOString()
                }
            }
        })
    }
    return axios.post(`/admin/audit/leave/${auditId}/approve`, { comment })
}

/**
 * 拒绝请假审核
 * @param {number} auditId - 审核ID
 * @param {string} comment - 拒绝原因
 * @returns {Promise}
 * 
 * Response格式:
 * {
 *   code: 0,
 *   message: {
 *     audit_id: number,
 *     status: 'rejected',
 *     auditor_id: number,
 *     audit_time: string
 *   }
 * }
 */
export const rejectLeaveAudit = (auditId, comment) => {
    if (USE_MOCK) {
        const audit = mockLeaveAudits.find(item => item.id === auditId)
        if (audit) {
            audit.status = 'rejected'
            audit.auditor_id = 1
            audit.audit_time = new Date().toISOString()
            audit.audit_remark = comment
        }
        return Promise.resolve({
            data: {
                code: 0,
                message: {
                    audit_id: auditId,
                    status: 'rejected',
                    auditor_id: 1,
                    audit_time: new Date().toISOString()
                }
            }
        })
    }
    return axios.post(`/admin/audit/leave/${auditId}/reject`, { comment })
}

/**
 * 获取审核附件
 * @param {string} path - 附件相对路径
 * @returns {Promise} 返回文件二进制数据
 * 
 * Response: 文件二进制流 (StreamingResponse)
 * Content-Type: 根据文件扩展名自动推断 (image/jpeg, image/png, application/pdf 等)
 * 
 * 失败时返回错误格式:
 * {
 *   code: 106,
 *   message: {
 *     error: "资源错误",
 *     msg: "附件文件不存在或路径错误"
 *   }
 * }
 */
export const getAuditAttachment = (path) => {
    if (USE_MOCK) {
        // Mock 模式返回占位图片
        return Promise.resolve({
            data: null,
            headers: {
                'content-type': 'image/jpeg'
            }
        })
    }
    return axios.get('/admin/audit/attachment/raw', {
        params: { path },
        responseType: 'blob' // 接收二进制数据
    })
}
