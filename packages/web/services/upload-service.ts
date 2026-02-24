import { api } from '@/lib/api-client'

export const uploadService = {
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.postForm<{ url: string }>('/upload/image', formData)
    return response.data.url
  },
}
