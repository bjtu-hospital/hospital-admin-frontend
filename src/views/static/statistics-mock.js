// Mock数据开关 - 设置为true使用mock数据，false使用真实API
export const USE_MOCK = true

// 生成指定范围的随机数
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const randomFloat = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(2))

// 生成日期序列
const generateDateSeries = (days) => {
    const dates = []
    const today = new Date()
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        dates.push(date.toISOString().split('T')[0])
    }
    return dates
}

// 模拟医院总体统计数据
export const mockHospitalRegistrations = (params) => {
    const isTimeSeries = params?.date_range && params.date_range !== 'today'

    if (isTimeSeries) {
        const days = params.date_range === '7days' ? 7 : 30
        const dates = generateDateSeries(days)
        const timeSeries = dates.map(date => ({
            date,
            registrations: randomInt(1000, 1500),
            revenue: randomFloat(100000, 150000)
        }))

        const totalRegistrations = timeSeries.reduce((sum, item) => sum + item.registrations, 0)
        const totalRevenue = timeSeries.reduce((sum, item) => sum + item.revenue, 0)

        return {
            code: 0,
            message: {
                date_range: params.date_range,
                start_date: dates[0],
                end_date: dates[dates.length - 1],
                time_series: timeSeries,
                total_registrations: totalRegistrations,
                total_revenue: parseFloat(totalRevenue.toFixed(2)),
                completed_consultations: Math.round(totalRegistrations * 0.95) // 95% completion rate
            }
        }
    }

    return {
        code: 0,
        message: {
            date: params?.date || new Date().toISOString().split('T')[0],
            total_registrations: 1250,
            by_slot_type: {
                "普通": 800,
                "专家": 350,
                "特需": 100
            },
            total_revenue: 125000.00,
            completed_consultations: 1188, // 95% of total
            areas: [
                {
                    area_id: 1,
                    area_name: "东院区",
                    registrations: 650,
                    revenue: 65000.00
                },
                {
                    area_id: 2,
                    area_name: "西院区",
                    registrations: 600,
                    revenue: 60000.00
                }
            ]
        }
    }
}

// 模拟院区统计数据
export const mockAreaRegistrations = (areaId, params) => {
    const areaNames = {
        1: "东院区",
        2: "西院区"
    }

    return {
        code: 0,
        message: {
            area_id: areaId,
            area_name: areaNames[areaId] || "未知院区",
            date: params?.date || new Date().toISOString().split('T')[0],
            total_registrations: 650,
            by_slot_type: {
                "普通": 400,
                "专家": 200,
                "特需": 50
            },
            total_revenue: 65000.00,
            departments: [
                {
                    minor_dept_id: 101,
                    dept_name: "心内科",
                    registrations: 120,
                    revenue: 12000.00
                },
                {
                    minor_dept_id: 102,
                    dept_name: "神经内科",
                    registrations: 100,
                    revenue: 10000.00
                },
                {
                    minor_dept_id: 103,
                    dept_name: "消化内科",
                    registrations: 95,
                    revenue: 9500.00
                },
                {
                    minor_dept_id: 104,
                    dept_name: "呼吸内科",
                    registrations: 90,
                    revenue: 9000.00
                },
                {
                    minor_dept_id: 105,
                    dept_name: "内分泌科",
                    registrations: 85,
                    revenue: 8500.00
                }
            ]
        }
    }
}

// 模拟科室统计数据
export const mockDepartmentRegistrations = (minorDeptId, params) => {
    const deptNames = {
        101: "心内科",
        102: "神经内科",
        103: "消化内科",
        104: "呼吸内科",
        105: "内分泌科"
    }

    const isTimeSeries = params?.date_range && params.date_range !== 'today'

    if (isTimeSeries) {
        const days = params.date_range === '7days' ? 7 : 30
        const dates = generateDateSeries(days)
        const timeSeries = dates.map(date => ({
            date,
            registrations: randomInt(80, 150),
            revenue: randomFloat(8000, 15000)
        }))

        const totalRegistrations = timeSeries.reduce((sum, item) => sum + item.registrations, 0)
        const totalRevenue = timeSeries.reduce((sum, item) => sum + item.revenue, 0)

        return {
            code: 0,
            message: {
                minor_dept_id: minorDeptId,
                dept_name: deptNames[minorDeptId] || "未知科室",
                major_dept_name: "内科",
                date_range: params.date_range,
                start_date: dates[0],
                end_date: dates[dates.length - 1],
                time_series: timeSeries,
                total_registrations: totalRegistrations,
                total_revenue: parseFloat(totalRevenue.toFixed(2)),
                completed_consultations: Math.round(totalRegistrations * 0.96) // 96% completion rate
            }
        }
    }

    return {
        code: 0,
        message: {
            minor_dept_id: minorDeptId,
            dept_name: deptNames[minorDeptId] || "未知科室",
            major_dept_name: "内科",
            date: params?.date || new Date().toISOString().split('T')[0],
            total_registrations: 120,
            by_slot_type: {
                "普通": 70,
                "专家": 40,
                "特需": 10
            },
            total_revenue: 12000.00,
            completed_consultations: 115, // 96% of total
            doctors: [
                {
                    doctor_id: 301,
                    doctor_name: "张三",
                    title: "主任医师",
                    registrations: 45,
                    revenue: 4500.00
                },
                {
                    doctor_id: 302,
                    doctor_name: "李四",
                    title: "副主任医师",
                    registrations: 40,
                    revenue: 4000.00
                },
                {
                    doctor_id: 303,
                    doctor_name: "王五",
                    title: "主治医师",
                    registrations: 35,
                    revenue: 3500.00
                }
            ]
        }
    }
}

// 模拟医生统计数据
export const mockDoctorRegistrations = (doctorId, params) => {
    const doctorInfo = {
        301: { name: "张三", title: "主任医师", dept: "心内科" },
        302: { name: "李四", title: "副主任医师", dept: "心内科" },
        303: { name: "王五", title: "主治医师", dept: "心内科" }
    }

    const doctor = doctorInfo[doctorId] || { name: "未知医生", title: "医师", dept: "未知科室" }

    const isTimeSeries = params?.date_range && params.date_range !== 'today'

    if (isTimeSeries) {
        const days = params.date_range === '7days' ? 7 : 30
        const dates = generateDateSeries(days)
        const timeSeries = dates.map(date => ({
            date,
            registrations: randomInt(30, 50),
            revenue: randomFloat(3000, 5000)
        }))

        const totalRegistrations = timeSeries.reduce((sum, item) => sum + item.registrations, 0)
        const totalRevenue = timeSeries.reduce((sum, item) => sum + item.revenue, 0)

        return {
            code: 0,
            message: {
                doctor_id: doctorId,
                doctor_name: doctor.name,
                title: doctor.title,
                dept_name: doctor.dept,
                date_range: params.date_range,
                start_date: dates[0],
                end_date: dates[dates.length - 1],
                time_series: timeSeries,
                total_registrations: totalRegistrations,
                total_revenue: parseFloat(totalRevenue.toFixed(2)),
                completed_consultations: Math.round(totalRegistrations * 0.97), // 97% completion rate
                working_days: days
            }
        }
    }

    return {
        code: 0,
        message: {
            doctor_id: doctorId,
            doctor_name: doctor.name,
            title: doctor.title,
            dept_name: doctor.dept,
            date: params?.date || new Date().toISOString().split('T')[0],
            total_registrations: 45,
            by_slot_type: {
                "普通": 25,
                "专家": 15,
                "特需": 5
            },
            total_revenue: 4500.00,
            completed_consultations: 44, // 97% of total
            by_time_section: {
                "上午": 25,
                "下午": 15,
                "晚上": 5
            },
            schedules: [
                {
                    schedule_id: 1001,
                    clinic_name: "心内科1诊室",
                    time_section: "上午",
                    slot_type: "专家",
                    registrations: 15,
                    total_slots: 20,
                    utilization_rate: 0.75
                },
                {
                    schedule_id: 1002,
                    clinic_name: "心内科1诊室",
                    time_section: "下午",
                    slot_type: "普通",
                    registrations: 15,
                    total_slots: 25,
                    utilization_rate: 0.60
                },
                {
                    schedule_id: 1003,
                    clinic_name: "心内科2诊室",
                    time_section: "晚上",
                    slot_type: "特需",
                    registrations: 5,
                    total_slots: 10,
                    utilization_rate: 0.50
                }
            ]
        }
    }
}

// 模拟科室排行榜
export const mockDepartmentRanking = (params) => {
    const departments = [
        { minor_dept_id: 101, dept_name: "心内科", registrations: 120, revenue: 12000.00 },
        { minor_dept_id: 102, dept_name: "神经内科", registrations: 110, revenue: 11000.00 },
        { minor_dept_id: 103, dept_name: "消化内科", registrations: 105, revenue: 10500.00 },
        { minor_dept_id: 104, dept_name: "呼吸内科", registrations: 100, revenue: 10000.00 },
        { minor_dept_id: 105, dept_name: "内分泌科", registrations: 95, revenue: 9500.00 },
        { minor_dept_id: 106, dept_name: "肾内科", registrations: 90, revenue: 9000.00 },
        { minor_dept_id: 107, dept_name: "血液科", registrations: 85, revenue: 8500.00 },
        { minor_dept_id: 108, dept_name: "风湿免疫科", registrations: 80, revenue: 8000.00 },
        { minor_dept_id: 109, dept_name: "感染科", registrations: 75, revenue: 7500.00 },
        { minor_dept_id: 110, dept_name: "老年科", registrations: 70, revenue: 7000.00 }
    ]

    // 根据排序方式排序
    const orderBy = params?.order_by || 'registrations'
    const sorted = [...departments].sort((a, b) => b[orderBy] - a[orderBy])

    // 限制返回数量
    const limit = params?.limit || 10
    const ranking = sorted.slice(0, limit).map((dept, index) => ({
        rank: index + 1,
        ...dept
    }))

    return {
        code: 0,
        message: {
            date: params?.date || new Date().toISOString().split('T')[0],
            order_by: orderBy,
            ranking
        }
    }
}

// 模拟医生排行榜
export const mockDoctorRanking = (params) => {
    const doctors = [
        { doctor_id: 301, doctor_name: "张三", title: "主任医师", dept_name: "心内科", registrations: 45, revenue: 4500.00 },
        { doctor_id: 302, doctor_name: "李四", title: "副主任医师", dept_name: "心内科", registrations: 42, revenue: 4200.00 },
        { doctor_id: 303, doctor_name: "王五", title: "主治医师", dept_name: "心内科", registrations: 40, revenue: 4000.00 },
        { doctor_id: 304, doctor_name: "赵六", title: "主任医师", dept_name: "神经内科", registrations: 38, revenue: 3800.00 },
        { doctor_id: 305, doctor_name: "孙七", title: "副主任医师", dept_name: "神经内科", registrations: 36, revenue: 3600.00 },
        { doctor_id: 306, doctor_name: "周八", title: "主治医师", dept_name: "消化内科", registrations: 35, revenue: 3500.00 },
        { doctor_id: 307, doctor_name: "吴九", title: "主任医师", dept_name: "呼吸内科", registrations: 33, revenue: 3300.00 },
        { doctor_id: 308, doctor_name: "郑十", title: "副主任医师", dept_name: "内分泌科", registrations: 30, revenue: 3000.00 },
        { doctor_id: 309, doctor_name: "钱十一", title: "主治医师", dept_name: "肾内科", registrations: 28, revenue: 2800.00 },
        { doctor_id: 310, doctor_name: "冯十二", title: "主任医师", dept_name: "血液科", registrations: 25, revenue: 2500.00 }
    ]

    // 如果指定了科室，进行过滤
    let filteredDoctors = doctors
    if (params?.dept_id) {
        // 这里简化处理，实际应该根据dept_id过滤
        filteredDoctors = doctors.slice(0, 5)
    }

    // 根据排序方式排序
    const orderBy = params?.order_by || 'registrations'
    const sorted = [...filteredDoctors].sort((a, b) => b[orderBy] - a[orderBy])

    // 限制返回数量
    const limit = params?.limit || 10
    const ranking = sorted.slice(0, limit).map((doctor, index) => ({
        rank: index + 1,
        ...doctor
    }))

    return {
        code: 0,
        message: {
            date: params?.date || new Date().toISOString().split('T')[0],
            order_by: orderBy,
            ranking
        }
    }
}
