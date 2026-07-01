import axios from 'axios';

const BASE = 'http://localhost:8080/api/stats';

export interface TopPartner {
    id: number;
    fullName: string;
    email: string;
    transactionCount: number;
    totalAmount: number;
}

export const statsService = {
    getTopContractors: (limit = 10): Promise<TopPartner[]> =>
        axios.get<TopPartner[]>(`${BASE}/top-contractors`, { params: { limit } }).then(r => r.data),

    getTopCustomers: (limit = 10): Promise<TopPartner[]> =>
        axios.get<TopPartner[]>(`${BASE}/top-customers`, { params: { limit } }).then(r => r.data),
    getContractorStats: (id: number): Promise<TopPartner> =>
        axios.get<TopPartner>(`${BASE}/contractor/${id}`).then(r => r.data),

    getCustomerStats: (id: number): Promise<TopPartner> =>
        axios.get<TopPartner>(`${BASE}/customer/${id}`).then(r => r.data),
};