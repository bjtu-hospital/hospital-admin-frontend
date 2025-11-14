import axios from "./axios"

// 获取所有大科室
export const getMajorDepartments = () => {
    return axios.get("/admin/major-departments")
}

// 获取单个大科室
// export const getMajorDepartment = (id) => {
//     return axios.get(`/admin/major-departments/${id}`)
// }

// 新增大科室
export const createMajorDepartment = (data) => {
    return axios.post("/admin/major-departments", data)
}

// 更新大科室
export const updateMajorDepartment = (id, data) => {
    return axios.put(`/admin/major-departments/${id}`, data)
}

// 删除大科室
export const deleteMajorDepartment = (id) => {
    return axios.delete(`/admin/major-departments/${id}`)
}

// 获取小科室列表（支持按大科室过滤）
export const getMinorDepartments = (params = {}) => {
    return axios.get("/admin/minor-departments", { params })
}

// 新增详细科室
export const createMinorDepartment = (data) => {
    return axios.post("/admin/minor-departments", data)
}

// 获取 - 详细科室 id为空时获取全部的科室
export const getMinorDepartment = (id = '') => {
    return axios.get(`/admin/minor-departments/${id}`)
}

// // 更新详细科室
// export const updateMinorDepartment = (id, data) => {
//     return axios.put(`/admin/minor-departments/${id}`, data)
// }

// 删除详细科室
export const deleteMinorDepartment = (id) => {
    return axios.delete(`/admin/minor-departments/${id}`)
}
