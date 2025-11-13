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
const USE_MOCK = true

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

    const response = await axios.get('/audit/add-slot')
    return response.data
}

/**
 * 管理员审批通过加号申请
 * POST /audit/add-slot/{audit_id}/approve
 */
export async function approveAddSlot(auditId, comment) {
    if (USE_MOCK) {
        return approveMockAddSlot(auditId, comment)
    }

    const response = await axios.post(`/audit/add-slot/${auditId}/approve`, {
        comment
    })
    return response.data
}

/**
 * 管理员拒绝加号申请
 * POST /audit/add-slot/{audit_id}/reject
 */
export async function rejectAddSlot(auditId, comment) {
    if (USE_MOCK) {
        return rejectMockAddSlot(auditId, comment)
    }

    const response = await axios.post(`/audit/add-slot/${auditId}/reject`, {
        comment
    })
    return response.data
}

/**
 * 获取所有医生
 * GET /doctors
 */
export async function getDoctors(params) {
    if (USE_MOCK) {
        return getMockDoctors(params)
    }

    const response = await axios.get('/doctors', { params })
    return response.data
}

/**
 * 根据医生ID获取当日排班
 * GET /doctors/{doctor_id}/schedules/today
 */
export async function getDoctorSchedulesToday(doctorId) {
    if (USE_MOCK) {
        return getMockDoctorSchedulesToday(doctorId)
    }

    const response = await axios.get(`/doctors/${doctorId}/schedules/today`)
    return response.data
}

/**
 * 查询患者
 * GET /patients
 */
export async function getPatients(params) {
    if (USE_MOCK) {
        return getMockPatients(params)
    }

    const response = await axios.get('/patients', { params })
    return response.data
}

/**
 * 管理员直接创建加号
 * POST /admin/schedules/add-slot
 */
export async function createAdminAddSlot(data) {
    if (USE_MOCK) {
        return createMockAdminAddSlot(data)
    }

    const response = await axios.post('/admin/schedules/add-slot', data)
    return response.data
}
