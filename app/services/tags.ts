import axiosInstance from '@/lib/api/axiosConfig';

export interface Tag {
  id: number;
  campus_id: number;
  name: string;
  color?: string; // Nuevo campo
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
  color?: string; // Nuevo campo
}

export interface UpdateTagData {
  name: string;
  color?: string; // Nuevo campo
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

  async attachTagsToStudent(studentId: number, tagIds: number[]) {
    const response = await axiosInstance.post(`/students/${studentId}/tags`, {
      tag_ids: tagIds,
    });
    return response.data;
  },

  async detachTagFromStudent(studentId: number, tagId: number) {
    const response = await axiosInstance.delete(
      `/students/${studentId}/tags/${tagId}`
    );
    return response.data;
  },

  async getStudentTags(studentId: number) {
    const response = await axiosInstance.get<Tag[]>(
      `/students/${studentId}/tags`
    );
    return response.data;
  },
};