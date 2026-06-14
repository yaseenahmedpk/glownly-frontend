import API from "./api";

export const getBranches = (companyId) => API.get(`/v1/branches/${companyId}`);
export const getNewBranchCode = (companyId) => API.get(`/v1/branches/new-code/${companyId}`);
export const getBranch = (id) => API.get(`/v1/branches/${id}`);
export const storeBranch = (data) => API.post("/v1/branches", data);
export const updateBranch = (id, data) => API.put(`/v1/branches/${id}`, data);
export const deleteBranch = (id) => API.delete(`/v1/branches/${id}`);
export const updateQrCode = (branchId) => API.put(`/v1/branches/update-qr-code/${branchId}`);
