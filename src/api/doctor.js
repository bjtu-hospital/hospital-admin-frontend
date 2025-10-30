import axios from "./axios"

// 获取医生列表
export const getDoctors = (deptId = '') => {
    const url = deptId ? `/admin/doctors?dept_id=${deptId}` : '/admin/doctors'
    return axios.get(url)
}

// 创建医生（可选是否同时创建账号）
export const createDoctor = (data) => {
    return axios.post("/admin/doctors", data)
}

// 更新医生信息
export const updateDoctor = (doctorId, data) => {
    return axios.put(`/admin/doctors/${doctorId}`, data)
}

// 删除医生
export const deleteDoctor = (doctorId) => {
    return axios.delete(`/admin/doctors/${doctorId}`)
}

// 医生调科室
export const transferDoctor = (doctorId, newDeptId) => {
    return axios.put(`/admin/doctors/${doctorId}/transfer`, {
        new_dept_id: newDeptId
    })
}

// 为医生创建账号
export const createDoctorAccount = (doctorId, data) => {
    return axios.post(`/admin/doctors/${doctorId}/create-account`, data)
}

// 上传医生照片 (未完成)
export const uploadDoctorPhoto = (doctorId, formData) => {
    return axios.post(`/admin/doctors/${doctorId}/photo`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

// 删除医生照片 (未完成)
export const deleteDoctorPhoto = (doctorId) => {
    return axios.delete(`/admin/doctors/${doctorId}/photo`)
}
