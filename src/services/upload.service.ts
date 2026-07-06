import { api } from '@/lib/axios';

export const uploadService = {
  /**
   * Uploads a single file to the backend's generic upload endpoint and
   * returns the public URL that can be stored against a worker record
   * (e.g. as a document URL or avatar URL).
   */
  uploadFile: async (file: File, folder = 'worker-documents'): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(`/upload/single?folder=${folder}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data?.data?.url || res.data?.url;
  },
};
