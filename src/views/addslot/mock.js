/**
 * Mock 数据 - 加号申请系统
 * 用于模拟加号申请的创建、查询和审批流程
 */

// 模拟数据存储
let mockAudits = [
    {
        audit_id: 1,
        schedule_id: 101,
        doctor_id: 10,
        doctor_name: '张医生',
        patient_id: 501,
        patient_name: '王小明',
        slot_type: '普通',
        reason: '患者病情紧急，需要尽快就诊',
        applicant_id: 10,
        submit_time: '2025-11-13T09:30:00',
        status: 'pending',
        auditor_admin_id: null,
        audit_time: null,
        audit_remark: null
    },
    {
        audit_id: 2,
        schedule_id: 102,
        doctor_id: 11,
        doctor_name: '李医生',
        patient_id: 502,
        patient_name: '张小红',
        slot_type: '专家',
        reason: '患者从外地赶来，希望能加号',
        applicant_id: 11,
        submit_time: '2025-11-13T10:15:00',
        status: 'pending',
        auditor_admin_id: null,
        audit_time: null,
        audit_remark: null
    },
    {
        audit_id: 3,
        schedule_id: 103,
        doctor_id: 12,
        doctor_name: '王医生',
        patient_id: 503,
        patient_name: '李小华',
        slot_type: '特需',
        reason: '老患者复诊，需要继续治疗',
        applicant_id: 12,
        submit_time: '2025-11-12T14:20:00',
        status: 'approved',
        auditor_admin_id: 1,
        audit_time: '2025-11-12T15:30:00',
        audit_remark: '同意加号，患者情况特殊'
    },
    {
        audit_id: 4,
        schedule_id: 104,
        doctor_id: 13,
        doctor_name: '赵医生',
        patient_id: 504,
        patient_name: '刘小刚',
        slot_type: '普通',
        reason: '患者要求加号',
        applicant_id: 13,
        submit_time: '2025-11-11T16:45:00',
        status: 'rejected',
        auditor_admin_id: 1,
        audit_time: '2025-11-11T17:00:00',
        audit_remark: '当日号源已满，建议预约其他时间'
    }
]

let nextAuditId = 5
let nextOrderId = 1001

// 模拟医生数据
const mockDoctors = [
    { doctor_id: 10, name: '张医生', department_id: 1, department_name: '心内科', title: '主任医师', specialization: '心血管疾病' },
    { doctor_id: 11, name: '李医生', department_id: 1, department_name: '心内科', title: '副主任医师', specialization: '冠心病' },
    { doctor_id: 12, name: '王医生', department_id: 2, department_name: '神经内科', title: '主任医师', specialization: '脑血管疾病' },
    { doctor_id: 13, name: '赵医生', department_id: 3, department_name: '骨科', title: '主治医师', specialization: '骨折治疗' },
    { doctor_id: 14, name: '刘医生', department_id: 2, department_name: '神经内科', title: '副主任医师', specialization: '帕金森' }
]

// 模拟患者数据
const mockPatients = [
    { patient_id: 501, name: '王小明', phone: '13812345678', gender: '男', age: 35, id_card: '110101198901011234' },
    { patient_id: 502, name: '张小红', phone: '13898765432', gender: '女', age: 28, id_card: '110101199201011234' },
    { patient_id: 503, name: '李小华', phone: '13776543210', gender: '男', age: 45, id_card: '110101198001011234' },
    { patient_id: 504, name: '刘小刚', phone: '13665432109', gender: '男', age: 52, id_card: '110101197301011234' },
    { patient_id: 505, name: '王大明', phone: '13854321098', gender: '男', age: 38, id_card: '110101198701011234' },
    { patient_id: 506, name: '陈小丽', phone: '13943210987', gender: '女', age: 31, id_card: '110101199401011234' }
]

// 门诊类型与可用号源类型映射
// clinic_type: 0=普通门诊, 1=专家门诊(国疗), 2=特需门诊
const clinicTypeSlotMap = {
    0: ['普通'],
    1: ['普通', '专家'],
    2: ['普通', '专家', '特需']
}

/**
 * 获取所有医生
 */
export function getMockDoctors(params = {}) {
    return new Promise((resolve) => {
        setTimeout(() => {
            let result = [...mockDoctors]

            // 按姓名筛选
            if (params.name) {
                result = result.filter(d => d.name.includes(params.name))
            }

            // 按科室筛选
            if (params.department_id) {
                result = result.filter(d => d.department_id === params.department_id)
            }

            resolve({
                code: 0,
                message: {
                    doctors: result
                }
            })
        }, 300)
    })
}

/**
 * 根据医生ID获取当日排班
 */
export function getMockDoctorSchedulesToday(doctorId) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const doctor = mockDoctors.find(d => d.doctor_id === doctorId)

            if (!doctor) {
                resolve({
                    code: 1,
                    message: '医生不存在'
                })
                return
            }

            // 模拟该医生当日的排班
            const schedules = [
                {
                    schedule_id: 100 + doctorId,
                    time_section: '上午',
                    clinic_id: 5,
                    clinic_name: '心内科门诊',
                    clinic_type: 1, // 0=普通门诊, 1=专家门诊, 2=特需门诊
                    minor_dept_name: doctor.department_name,
                    slot_type: '专家',
                    total_slots: 20,
                    remaining_slots: 5,
                    price: 120.00,
                    status: '正常',
                    available_slot_types: ['普通', '专家']
                },
                {
                    schedule_id: 200 + doctorId,
                    time_section: '下午',
                    clinic_id: 6,
                    clinic_name: '普通门诊',
                    clinic_type: 0,
                    minor_dept_name: doctor.department_name,
                    slot_type: '普通',
                    total_slots: 30,
                    remaining_slots: 12,
                    price: 60.00,
                    status: '正常',
                    available_slot_types: ['普通']
                }
            ]

            resolve({
                code: 0,
                message: {
                    doctor_id: doctorId,
                    date: '2025-11-14',
                    schedules
                }
            })
        }, 400)
    })
}

/**
 * 查询患者
 */
export function getMockPatients(params = {}) {
    return new Promise((resolve) => {
        setTimeout(() => {
            let result = [...mockPatients]

            // 按姓名筛选
            if (params.name) {
                result = result.filter(p => p.name.includes(params.name))
            }

            // 按手机号筛选
            if (params.phone) {
                result = result.filter(p => p.phone.includes(params.phone))
            }

            // 按患者ID精确查询
            if (params.patient_id) {
                result = result.filter(p => p.patient_id === params.patient_id)
            }

            resolve({
                code: 0,
                message: {
                    patients: result
                }
            })
        }, 300)
    })
}

/**
 * 管理员直接创建加号
 */
export function createMockAdminAddSlot(data) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // 管理员直接创建挂号记录
            const orderId = nextOrderId++

            // 同时创建审批记录（状态为已通过）
            const auditId = nextAuditId++
            const doctor = mockDoctors.find(d => d.doctor_id === data.doctor_id)
            const patient = mockPatients.find(p => p.patient_id === data.patient_id)

            const newAudit = {
                audit_id: auditId,
                schedule_id: data.schedule_id,
                doctor_id: data.doctor_id,
                doctor_name: doctor?.name || `医生${data.doctor_id}`,
                patient_id: data.patient_id,
                patient_name: patient?.name || `患者${data.patient_id}`,
                slot_type: data.slot_type,
                reason: '管理员直接加号',
                applicant_id: 1, // 管理员ID
                submit_time: new Date().toISOString(),
                status: 'approved',
                auditor_admin_id: 1,
                audit_time: new Date().toISOString(),
                audit_remark: '管理员直接创建'
            }

            mockAudits.unshift(newAudit)

            resolve({
                code: 0,
                message: {
                    detail: '加号记录已创建',
                    order_id: orderId,
                    audit_id: auditId
                }
            })
        }, 800)
    })
}

/**
 * 获取所有加号申请
 */
export function getMockAddSlotAudits() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                code: 0,
                message: {
                    audits: [...mockAudits]
                }
            })
        }, 500)
    })
}

/**
 * 创建加号申请或直接创建挂号
 * @param {Object} data - 包含 schedule_id, patient_id, slot_type, reason
 */
export function createMockAddSlot(data) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // 模拟获取当前用户角色
            // 在实际应用中应该从 auth store 获取
            const isAdmin = Math.random() > 0.5 // 随机模拟管理员或医生身份

            if (isAdmin) {
                // 管理员直接创建挂号记录
                const orderId = nextOrderId++
                resolve({
                    code: 0,
                    message: {
                        detail: '加号记录已创建',
                        order_id: orderId
                    }
                })
            } else {
                // 医生提交申请
                const auditId = nextAuditId++
                const newAudit = {
                    audit_id: auditId,
                    schedule_id: data.schedule_id,
                    doctor_id: Math.floor(Math.random() * 20) + 10, // 随机医生ID
                    doctor_name: `医生${Math.floor(Math.random() * 100)}`,
                    patient_id: data.patient_id,
                    patient_name: `患者${data.patient_id}`,
                    slot_type: data.slot_type,
                    reason: data.reason || '需要加号',
                    applicant_id: Math.floor(Math.random() * 20) + 10,
                    submit_time: new Date().toISOString(),
                    status: 'pending',
                    auditor_admin_id: null,
                    audit_time: null,
                    audit_remark: null
                }

                mockAudits.unshift(newAudit) // 添加到列表开头

                resolve({
                    code: 0,
                    message: {
                        detail: '加号申请已提交，等待审核',
                        audit_id: auditId
                    }
                })
            }
        }, 800)
    })
}

/**
 * 审批通过加号申请
 */
export function approveMockAddSlot(auditId, comment) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const audit = mockAudits.find(a => a.audit_id === auditId)

            if (!audit) {
                reject({
                    response: {
                        data: {
                            code: 1,
                            message: '申请记录不存在'
                        }
                    }
                })
                return
            }

            if (audit.status !== 'pending') {
                reject({
                    response: {
                        data: {
                            code: 1,
                            message: '该申请已经处理过了'
                        }
                    }
                })
                return
            }

            // 更新审批状态
            audit.status = 'approved'
            audit.auditor_admin_id = 1 // 模拟管理员ID
            audit.audit_time = new Date().toISOString()
            audit.audit_remark = comment || '审批通过'

            resolve({
                code: 0,
                message: {
                    audit_id: auditId,
                    status: 'approved',
                    auditor_id: 1,
                    audit_time: audit.audit_time
                }
            })
        }, 600)
    })
}

/**
 * 拒绝加号申请
 */
export function rejectMockAddSlot(auditId, comment) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const audit = mockAudits.find(a => a.audit_id === auditId)

            if (!audit) {
                reject({
                    response: {
                        data: {
                            code: 1,
                            message: '申请记录不存在'
                        }
                    }
                })
                return
            }

            if (audit.status !== 'pending') {
                reject({
                    response: {
                        data: {
                            code: 1,
                            message: '该申请已经处理过了'
                        }
                    }
                })
                return
            }

            // 更新审批状态
            audit.status = 'rejected'
            audit.auditor_admin_id = 1 // 模拟管理员ID
            audit.audit_time = new Date().toISOString()
            audit.audit_remark = comment || '拒绝申请'

            resolve({
                code: 0,
                message: {
                    audit_id: auditId,
                    status: 'rejected',
                    auditor_id: 1,
                    audit_time: audit.audit_time
                }
            })
        }, 600)
    })
}
