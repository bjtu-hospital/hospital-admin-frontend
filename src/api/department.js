import axios from "./axios"

// 获取所有大科室
export const getMajorDepartments = () => {
    return axios.get("/major-departments")
}

// 获取单个大科室
export const getMajorDepartment = (id) => {
    return axios.get(`/major-departments/${id}`)
}

// 新增大科室
export const createMajorDepartment = (data) => {
    return axios.post("/major-departments", data)
}

// 更新大科室
export const updateMajorDepartment = (id, data) => {
    return axios.put(`/major-departments/${id}`, data)
}

// 删除大科室
export const deleteMajorDepartment = (id) => {
    return axios.delete(`/major-departments/${id}`)
}

// 获取所有详细科室
export const getMinorDepartments = () => {
    return axios.get("/minor-departments")
}

// 根据大科室ID获取详细科室
export const getMinorDepartmentsByMajor = (majorId) => {
    return axios.get(`/major-departments/${majorId}/minor-departments`)
}

// 获取单个详细科室
export const getMinorDepartment = (id) => {
    return axios.get(`/minor-departments/${id}`)
}

// 新增详细科室
export const createMinorDepartment = (data) => {
    return axios.post("/minor-departments", data)
}

// 更新详细科室
export const updateMinorDepartment = (id, data) => {
    return axios.put(`/minor-departments/${id}`, data)
}

// 删除详细科室
export const deleteMinorDepartment = (id) => {
    return axios.delete(`/minor-departments/${id}`)
}
