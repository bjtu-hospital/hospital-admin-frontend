import axios from "./axios"

// 获取医生列表（支持dept_id和name参数过滤）
export const getDoctors = (params = {}) => {
    return axios.get('/admin/doctors', { params })
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

// 上传医生照片
export const uploadDoctorPhoto = (doctorId, formData) => {
    return axios.post(`/admin/doctors/${doctorId}/photo`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

// 获取医生照片
export const getDoctorPhoto = (doctorId) => {
    return axios.get(`/admin/doctors/${doctorId}/photo`, {
        responseType: 'blob' // 重要：设置响应类型为 blob
    })
}

// 删除医生照片
export const deleteDoctorPhoto = (doctorId) => {
    return axios.delete(`/admin/doctors/${doctorId}/photo`)
}
