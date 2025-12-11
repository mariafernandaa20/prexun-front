import axiosInstance from '@/lib/api/axiosConfig';

export interface Tag {
  id: number;
  campus_id: number;
  name: string;
  created_at: string;
  updated_at: string;
  campus?: {
    id: number;
    name: string;
  };
  students?: Array<{
    id: number;
    firstname: string;
    lastname: string;
  }>;
}

export interface CreateTagData {
  campus_id: number;
  name: string;
}

export interface UpdateTagData {
  name: string;
}

export const tagsService = {
  async getTags(campusId?: number) {
    const params = campusId ? { campus_id: campusId } : {};
    const response = await axiosInstance.get<Tag[]>('/tags', { params });
    return response.data;
  },

  async getTag(id: number) {
    const response = await axiosInstance.get<Tag>(`/tags/${id}`);
    return response.data;
  },

  async createTag(data: CreateTagData) {
    const response = await axiosInstance.post<Tag>('/tags', data);
    return response.data;
  },

  async updateTag(id: number, data: UpdateTagData) {
    const response = await axiosInstance.put<Tag>(`/tags/${id}`, data);
    return response.data;
  },

  async deleteTag(id: number) {
    const response = await axiosInstance.delete(`/tags/${id}`);
    return response.data;
  },
};
