import axios from './axios'
import {
    getMockAddSlotAudits,
    createMockAddSlot,
    approveMockAddSlot,
    rejectMockAddSlot,
    getMockDoctors,
    getMockDoctorSchedulesToday,
    getMockPatients,
    createMockAdminAddSlot
} from '@/views/addslot/mock'

// 是否使用 Mock 数据
const USE_MOCK = false

/**
 * 医生/管理员发起加号
 * POST /schedules/add-slot
 * 管理员直接创建挂号记录，医生提交申请等待审批
 */
export async function createAddSlot(data) {
    if (USE_MOCK) {
        return createMockAddSlot(data)
    }

    const response = await axios.post('/doctor/schedules/add-slot', data)
    return response.data
}

/**
 * 管理员查看所有加号申请
 * GET /audit/add-slot
 */
export async function getAddSlotAudits() {
    if (USE_MOCK) {
        return getMockAddSlotAudits()
    }

    const response = await axios.get('/admin/audit/add-slot')
    return response.data
}

/**
 * 管理员审批通过加号申请
 * POST /admin/audit/add-slot/{audit_id}/approve
 */
export async function approveAddSlot(auditId, comment) {
    if (USE_MOCK) {
        return approveMockAddSlot(auditId, comment)
    }

    const response = await axios.post(`/admin/audit/add-slot/${auditId}/approve`, {
        comment
    })
    return response.data
}

/**
 * 管理员拒绝加号申请
 * POST /admin/audit/add-slot/{audit_id}/reject
 */
export async function rejectAddSlot(auditId, comment) {
    if (USE_MOCK) {
        return rejectMockAddSlot(auditId, comment)
    }

    const response = await axios.post(`/admin/audit/add-slot/${auditId}/reject`, {
        comment
    })
    return response.data
}

/**
 * 搜索医生（用于管理员选择医生）
 * GET /admin/doctors?name={name}
 * 支持按姓名模糊搜索
 */
export async function getDoctors(params) {
    if (USE_MOCK) {
        return getMockDoctors(params)
    }

    const response = await axios.get('/admin/doctors', { params })
    return response.data
}

/**
 * 根据医生ID获取当日排班
 * GET /admin/doctors/{doctor_id}/schedules/today
 */
export async function getDoctorSchedulesToday(doctorId) {
    if (USE_MOCK) {
        return getMockDoctorSchedulesToday(doctorId)
    }

    const response = await axios.get(`/admin/doctors/${doctorId}/schedules/today`)
    return response.data
}

/**
 * 搜索患者信息
 * GET /admin/patients?name={name}&phone={phone}&patient_id={patient_id}
 * 支持按姓名、手机号模糊搜索，或患者ID精确查询
 * 参数：name (string, optional), phone (string, optional), patient_id (int, optional)
 * 至少提供一个搜索条件
 */
export async function getPatients(params) {
    if (USE_MOCK) {
        return getMockPatients(params)
    }

    const response = await axios.get('/admin/patients', { params })
    return response.data
}

/**
 * 管理员直接创建加号（跳过审核）
 * POST /doctor/schedules/add-slot
 * 管理员调用此接口会直接创建挂号记录，跳过审批流程
 */
export async function createAdminAddSlot(data) {
    if (USE_MOCK) {
        return createMockAdminAddSlot(data)
    }

    const response = await axios.post('/doctor/schedules/add-slot', data)
    return response.data
}
