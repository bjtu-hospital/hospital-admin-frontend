// Mock 数据 - 排班审核

/**
 * 生成日期字符串
 * @param {number} daysOffset - 距离今天的天数偏移
 */
const getDateString = (daysOffset = 0) => {
    const date = new Date()
    date.setDate(date.getDate() + daysOffset)
    return date.toISOString().split('T')[0]
}

/**
 * 获取本周的起始和结束日期
 * @param {number} weekOffset - 周偏移（0表示本周，1表示下周，-1表示上周）
 */
const getWeekDates = (weekOffset = 0) => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const monday = new Date(now)
    monday.setDate(now.getDate() - dayOfWeek + 1 + (weekOffset * 7))
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)

    return {
        start: monday.toISOString().split('T')[0],
        end: sunday.toISOString().split('T')[0]
    }
}

// 排班审核 Mock 数据
// 注意：每个门诊一条记录，不再是一个科室包含多个门诊
export const mockScheduleAudits = [
    // 心血管内科 - 心内一诊室
    {
        id: 1,
        department_id: 1,
        department_name: '心血管内科',
        clinic_id: 1,
        clinic_name: '心内一诊室',
        submitter_id: 101,
        submitter_name: '张主任',
        submit_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        week_start: getWeekDates(1).start,
        week_end: getWeekDates(1).end,
        remark: '下周因春节假期，部分医生排班有调整，请尽快审核。',
        status: 'pending',
        auditor_id: null,
        audit_time: null,
        audit_remark: null,
        schedule: [
            // 周一
            [
                { doctorId: 1001, doctorName: '李明医生' },
                { doctorId: 1002, doctorName: '王芳医生' },
                null
            ],
            // 周二
            [
                { doctorId: 1002, doctorName: '王芳医生' },
                { doctorId: 1003, doctorName: '刘强医生' },
                null
            ],
            // 周三
            [
                { doctorId: 1001, doctorName: '李明医生' },
                { doctorId: 1003, doctorName: '刘强医生' },
                { doctorId: 1004, doctorName: '陈静医生' }
            ],
            // 周四
            [
                { doctorId: 1002, doctorName: '王芳医生' },
                { doctorId: 1001, doctorName: '李明医生' },
                null
            ],
            // 周五
            [
                { doctorId: 1003, doctorName: '刘强医生' },
                { doctorId: 1004, doctorName: '陈静医生' },
                null
            ],
            // 周六
            [
                { doctorId: 1001, doctorName: '李明医生' },
                null,
                null
            ],
            // 周日
            [
                { doctorId: 1002, doctorName: '王芳医生' },
                null,
                null
            ]
        ]
    },
    // 心血管内科 - 心内二诊室
    {
        id: 2,
        departmentId: 1,
        departmentName: '心血管内科',
        clinicId: 2,
        clinicName: '心内二诊室',
        submitterId: 101,
        submitterName: '张主任',
        submitTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        weekStart: getWeekDates(1).start,
        weekEnd: getWeekDates(1).end,
        remark: '下周因春节假期，部分医生排班有调整，请尽快审核。',
        status: 'pending',
        schedule: [
            // 周一
            [
                { doctorId: 1004, doctorName: '陈静医生' },
                { doctorId: 1005, doctorName: '赵敏医生' },
                null
            ],
            // 周二
            [
                { doctorId: 1005, doctorName: '赵敏医生' },
                { doctorId: 1004, doctorName: '陈静医生' },
                null
            ],
            // 周三
            [
                { doctorId: 1005, doctorName: '赵敏医生' },
                null,
                null
            ],
            // 周四
            [
                { doctorId: 1004, doctorName: '陈静医生' },
                { doctorId: 1005, doctorName: '赵敏医生' },
                null
            ],
            // 周五
            [
                { doctorId: 1005, doctorName: '赵敏医生' },
                null,
                null
            ],
            // 周六
            [
                null,
                null,
                null
            ],
            // 周日
            [
                null,
                null,
                null
            ]
        ]
    },
    // 呼吸内科 - 呼吸门诊
    {
        id: 3,
        departmentId: 2,
        departmentName: '呼吸内科',
        clinicId: 3,
        clinicName: '呼吸门诊',
        submitterId: 102,
        submitterName: '李主任',
        submitTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        weekStart: getWeekDates(1).start,
        weekEnd: getWeekDates(1).end,
        remark: '按照常规排班，无特殊情况。',
        status: 'pending',
        schedule: [
            // 周一
            [
                { doctorId: 2001, doctorName: '周杰医生' },
                { doctorId: 2002, doctorName: '吴婷医生' },
                { doctorId: 2003, doctorName: '郑伟医生' }
            ],
            // 周二
            [
                { doctorId: 2002, doctorName: '吴婷医生' },
                { doctorId: 2003, doctorName: '郑伟医生' },
                null
            ],
            // 周三
            [
                { doctorId: 2001, doctorName: '周杰医生' },
                { doctorId: 2002, doctorName: '吴婷医生' },
                null
            ],
            // 周四
            [
                { doctorId: 2003, doctorName: '郑伟医生' },
                { doctorId: 2001, doctorName: '周杰医生' },
                null
            ],
            // 周五
            [
                { doctorId: 2002, doctorName: '吴婷医生' },
                { doctorId: 2003, doctorName: '郑伟医生' },
                { doctorId: 2001, doctorName: '周杰医生' }
            ],
            // 周六
            [
                { doctorId: 2001, doctorName: '周杰医生' },
                null,
                null
            ],
            // 周日
            [
                { doctorId: 2002, doctorName: '吴婷医生' },
                null,
                null
            ]
        ]
    },
    // 骨科 - 骨科门诊一
    {
        id: 4,
        departmentId: 3,
        departmentName: '骨科',
        clinicId: 4,
        clinicName: '骨科门诊一',
        submitterId: 103,
        submitterName: '王主任',
        submitTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        weekStart: getWeekDates(0).start,
        weekEnd: getWeekDates(0).end,
        remark: '本周排班，周三有专家会诊安排。',
        status: 'pending',
        schedule: [
            // 周一
            [
                { doctorId: 3001, doctorName: '孙强医生' },
                { doctorId: 3002, doctorName: '钱丽医生' },
                null
            ],
            // 周二
            [
                { doctorId: 3002, doctorName: '钱丽医生' },
                { doctorId: 3003, doctorName: '赵云医生' },
                null
            ],
            // 周三
            [
                { doctorId: 3001, doctorName: '孙强医生' },
                { doctorId: 3001, doctorName: '孙强医生' }, // 专家会诊
                null
            ],
            // 周四
            [
                { doctorId: 3003, doctorName: '赵云医生' },
                { doctorId: 3002, doctorName: '钱丽医生' },
                null
            ],
            // 周五
            [
                { doctorId: 3001, doctorName: '孙强医生' },
                { doctorId: 3003, doctorName: '赵云医生' },
                null
            ],
            // 周六
            [
                { doctorId: 3002, doctorName: '钱丽医生' },
                null,
                null
            ],
            // 周日
            [
                null,
                null,
                null
            ]
        ]
    },
    // 已通过的记录 - 心血管内科
    {
        id: 5,
        departmentId: 1,
        departmentName: '心血管内科',
        clinicId: 1,
        clinicName: '心内一诊室',
        submitterId: 101,
        submitterName: '张主任',
        submitTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        weekStart: getWeekDates(-1).start,
        weekEnd: getWeekDates(-1).end,
        remark: '上周排班表，已执行完毕。',
        status: 'approved',
        auditorId: 1,
        auditorName: '管理员',
        auditTime: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        auditComment: '审核通过',
        schedule: [
            [{ doctorId: 1001, doctorName: '李明医生' }, { doctorId: 1002, doctorName: '王芳医生' }, null],
            [{ doctorId: 1002, doctorName: '王芳医生' }, { doctorId: 1003, doctorName: '刘强医生' }, null],
            [{ doctorId: 1001, doctorName: '李明医生' }, { doctorId: 1003, doctorName: '刘强医生' }, null],
            [{ doctorId: 1002, doctorName: '王芳医生' }, { doctorId: 1001, doctorName: '李明医生' }, null],
            [{ doctorId: 1003, doctorName: '刘强医生' }, { doctorId: 1004, doctorName: '陈静医生' }, null],
            [{ doctorId: 1001, doctorName: '李明医生' }, null, null],
            [{ doctorId: 1002, doctorName: '王芳医生' }, null, null]
        ]
    }
]

// 请假审核 Mock 数据
export const mockLeaveAudits = [
    {
        id: 1,
        doctorId: 1003,
        doctorName: '刘强',
        doctorTitle: '主治医师',
        departmentName: '心血管内科',
        leaveStartDate: getDateString(3),
        leaveEndDate: getDateString(5),
        leaveDays: 3,
        reason: '因家中有急事需要处理，特此请假3天。已经和科室主任沟通，会安排其他医生代班。家中父亲突发疾病住院，需要陪护照顾。',
        reasonPreview: '因家中有急事需要处理，特此请假3天。已经和科室主任沟通，会安排其他医...',
        attachments: [
            { url: "static/images/audit/1.jpg", name: "诊断证明.jpg" },
            { url: "static/images/audit/2.jpg", name: "住院记录.jpg" }
        ],
        submitTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        status: 'pending'
    },
    {
        id: 2,
        doctorId: 2002,
        doctorName: '吴婷',
        doctorTitle: '副主任医师',
        departmentName: '呼吸内科',
        leaveStartDate: getDateString(7),
        leaveEndDate: getDateString(10),
        leaveDays: 4,
        reason: '参加学术会议，需要请假4天。本次会议是由中华医学会主办的全国呼吸系统疾病学术研讨会，对提升专业水平有重要意义。',
        reasonPreview: '参加学术会议，需要请假4天。本次会议是由中华医学会主办的全国呼吸系统...',
        attachments: [
            { url: "static/images/audit/3.jpg", name: "会议邀请函.jpg" }
        ],
        submitTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending'
    },
    {
        id: 3,
        doctorId: 3002,
        doctorName: '钱丽',
        doctorTitle: '主治医师',
        departmentName: '骨科',
        leaveStartDate: getDateString(1),
        leaveEndDate: getDateString(1),
        leaveDays: 1,
        reason: '身体不适，需要休息一天。昨晚开始发烧，体温38.5度，伴有头痛乏力症状，已服药但效果不佳，需要在家休息观察。',
        reasonPreview: '身体不适，需要休息一天。昨晚开始发烧，体温38.5度，伴有头痛乏力症状...',
        attachments: [],
        submitTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'pending'
    },
    {
        id: 4,
        doctorId: 1002,
        doctorName: '王芳',
        doctorTitle: '主任医师',
        departmentName: '心血管内科',
        leaveStartDate: getDateString(14),
        leaveEndDate: getDateString(20),
        leaveDays: 7,
        reason: '年假申请，计划与家人外出旅游放松。已经提前一个月告知科室，并做好了工作交接安排。',
        reasonPreview: '年假申请，计划与家人外出旅游放松。已经提前一个月告知科室，并做好了...',
        attachments: [],
        submitTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending'
    },
    {
        id: 5,
        doctorId: 1001,
        doctorName: '李明',
        doctorTitle: '副主任医师',
        departmentName: '心血管内科',
        leaveStartDate: getDateString(-3),
        leaveEndDate: getDateString(-2),
        leaveDays: 2,
        reason: '因个人原因需要请假2天处理私人事务。',
        reasonPreview: '因个人原因需要请假2天处理私人事务。',
        attachments: [],
        submitTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'approved',
        auditorId: 1,
        auditorName: '管理员',
        auditTime: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        auditComment: '同意请假'
    },
    {
        id: 6,
        doctorId: 2001,
        doctorName: '周杰',
        doctorTitle: '主任医师',
        departmentName: '呼吸内科',
        leaveStartDate: getDateString(-7),
        leaveEndDate: getDateString(-5),
        leaveDays: 3,
        reason: '需要请假3天参加家庭活动。',
        reasonPreview: '需要请假3天参加家庭活动。',
        attachments: [],
        submitTime: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'rejected',
        auditorId: 1,
        auditorName: '管理员',
        auditTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        rejectReason: '该时间段科室人手紧张，无法批准请假。建议调整请假时间或缩短请假天数。'
    }
]
