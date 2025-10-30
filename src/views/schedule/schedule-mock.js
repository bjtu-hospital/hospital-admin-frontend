// Mock 数据 - 用于排班管理模块测试

// 模拟科室数据
export const mockDepartments = [
    {
        minor_dept_id: 1,
        major_dept_id: 1,
        name: '心血管内科',
        description: '负责高血压、冠心病、心力衰竭、心律失常等心血管疾病的诊疗与随访。',
        create_time: '2025-10-16 08:24:36'
    },
    {
        minor_dept_id: 2,
        major_dept_id: 1,
        name: '呼吸内科',
        description: '负责呼吸系统疾病的诊疗',
        create_time: '2025-10-16 08:24:36'
    },
    {
        minor_dept_id: 3,
        major_dept_id: 2,
        name: '骨科',
        description: '负责骨折、关节疾病等诊疗',
        create_time: '2025-10-16 08:24:36'
    }
]

// 模拟医生数据
export const mockDoctors = {
    1: [ // 心血管内科
        { doctor_id: 1, name: '陈明哲', title: '教授、主任医师' },
        { doctor_id: 2, name: '李华', title: '副主任医师' },
        { doctor_id: 3, name: '王芳', title: '主治医师' },
        { doctor_id: 4, name: '张伟', title: '主治医师' },
        { doctor_id: 5, name: '刘洋', title: '住院医师' }
    ],
    2: [ // 呼吸内科
        { doctor_id: 6, name: '赵敏', title: '主任医师' },
        { doctor_id: 7, name: '孙强', title: '副主任医师' }
    ],
    3: [ // 骨科
        { doctor_id: 8, name: '周杰', title: '主任医师' },
        { doctor_id: 9, name: '吴昊', title: '主治医师' }
    ]
}

// 模拟门诊数据（使用可变对象，支持运行时修改）
const mockClinicsData = {
    1: [ // 心血管内科的门诊
        {
            clinic_id: 1,
            area_id: 1,
            name: '心血管内科普通门诊',
            address: '门诊楼2层',
            minor_dept_id: 1,
            type: 0, // 普通
            create_time: '2025-10-17 00:51:23'
        },
        {
            clinic_id: 2,
            area_id: 1,
            name: '心血管内科国疗门诊',
            address: '门诊楼3层',
            minor_dept_id: 1,
            type: 1, // 国疗
            create_time: '2025-10-17 00:51:23'
        },
        {
            clinic_id: 3,
            area_id: 1,
            name: '心血管内科特需门诊',
            address: '特需门诊楼1层',
            minor_dept_id: 1,
            type: 2, // 特需
            create_time: '2025-10-17 00:51:23'
        }
    ],
    2: [
        {
            clinic_id: 4,
            area_id: 1,
            name: '呼吸内科普通门诊',
            address: '门诊楼2层',
            minor_dept_id: 2,
            type: 0,
            create_time: '2025-10-17 00:51:23'
        }
    ],
    3: [
        {
            clinic_id: 5,
            area_id: 1,
            name: '骨科普通门诊',
            address: '门诊楼4层',
            minor_dept_id: 3,
            type: 0,
            create_time: '2025-10-17 00:51:23'
        }
    ]
}

// 导出可修改的门诊数据
export const mockClinics = mockClinicsData

// 生成未来30天的日期（从2025-10-31开始）
const generateDates = () => {
    const dates = []
    // 固定从2025年10月31日（星期五）开始
    const today = new Date('2025-10-31')
    for (let i = 0; i < 30; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() + i)
        dates.push(date)
    }
    return dates
}

// 模拟排班数据（生成并导出为可修改的数组）
const generateSchedules = () => {
    const schedules = []
    let scheduleId = 1
    const dates = generateDates()
    const timeSections = ['上午', '下午', '晚上']
    const weekDays = ['日', '一', '二', '三', '四', '五', '六']

    // 为心血管内科的医生生成排班
    const heartDoctors = mockDoctors[1]
    const heartClinics = mockClinicsData[1]

    dates.forEach((date, dateIndex) => {
        const dateStr = date.toISOString().split('T')[0]
        const weekDay = weekDays[date.getDay()]

        timeSections.forEach((timeSection, timeIndex) => {
            // 每个时段安排2-3个医生
            const numDoctors = 2 + (dateIndex % 2)
            const selectedDoctors = heartDoctors.slice(0, numDoctors)

            selectedDoctors.forEach((doctor, doctorIndex) => {
                // 选择门诊（轮流使用不同门诊）
                const clinic = heartClinics[(scheduleId + doctorIndex) % heartClinics.length]

                // 确定类型和价格
                let slotType = '普通'
                let price = 50
                let status = '正常'

                if (clinic.type === 2) { // 特需门诊只能是特需
                    slotType = '特需'
                    price = 500
                } else if (clinic.type === 1) { // 国疗可以是普通或专家
                    slotType = doctorIndex === 0 ? '专家' : '普通'
                    price = slotType === '专家' ? 200 : 50
                } else { // 普通门诊
                    slotType = doctorIndex === 0 ? '专家' : '普通'
                    price = slotType === '专家' ? 100 : 50
                }

                // 随机停诊（5%概率）
                if (Math.random() < 0.05) {
                    status = '停诊'
                }

                schedules.push({
                    schedule_id: scheduleId++,
                    doctor_id: doctor.doctor_id,
                    doctor_name: doctor.name,
                    clinic_id: clinic.clinic_id,
                    clinic_name: clinic.name,
                    clinic_type: clinic.type,
                    date: dateStr,
                    week_day: weekDay,
                    time_section: timeSection,
                    slot_type: slotType,
                    total_slots: status === '停诊' ? 0 : 20,
                    remaining_slots: status === '停诊' ? 0 : Math.floor(Math.random() * 15) + 5,
                    status: status,
                    price: price,
                    create_time: '2025-10-20 23:44:28'
                })
            })
        })
    })

    return schedules
}

// 导出可修改的排班数据数组
export const mockSchedules = generateSchedules()

// 门诊类型映射
export const clinicTypeMap = {
    0: '普通',
    1: '国疗',
    2: '特需'
}

// 时段选项
export const timeSectionOptions = ['上午', '下午', '晚上']

// 状态选项
export const statusOptions = ['正常', '停诊']

// 类型选项（根据门诊类型动态）
export const slotTypeOptions = {
    0: ['普通', '专家'], // 普通门诊
    1: ['普通', '专家'], // 国疗门诊
    2: ['特需'] // 特需门诊
}
