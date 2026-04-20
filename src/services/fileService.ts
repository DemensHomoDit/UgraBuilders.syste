const API_BASE = import.meta.env.VITE_API_BASE ?? "";

function getToken(): string {
  try {
    return localStorage.getItem("mongo_auth_token") ?? "";
  } catch {
    return "";
  }
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface ClientFile {
  id: string;
  client_id: string;
  name: string;
  mime_type: string;
  url: string;
  folder_type: "documents" | "contracts" | "photos";
  uploaded_by?: string;
  uploaded_by_name?: string;
  file_size?: number;
  created_at: string;
}

class FileService {
  async getClientFiles(
    clientId: string,
    folderType: "documents" | "contracts" | "photos",
  ): Promise<ClientFile[]> {
    try {
      const res = await fetch(
        `${API_BASE}/api/client-files/${clientId}/${folderType}`,
        {
          headers: authHeaders(),
        },
      );
      const json = await res.json();
      return json.data ?? [];
    } catch {
      return [];
    }
  }

  async uploadFile(
    clientId: string,
    file: File,
    folderType: "documents" | "contracts" | "photos",
    uploaderId?: string,
    uploaderName?: string,
  ): Promise<ClientFile | null> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder_type", folderType);
      if (uploaderId) formData.append("uploaded_by", uploaderId);
      if (uploaderName) formData.append("uploaded_by_name", uploaderName);

      const token = getToken();
      const res = await fetch(
        `${API_BASE}/api/client-files/${clientId}/upload`,
        {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        },
      );
      const json = await res.json();
      return json.data ?? null;
    } catch {
      return null;
    }
  }

  async deleteFile(fileId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/api/client-files/${fileId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const json = await res.json();
      return !json.error;
    } catch {
      return false;
    }
  }

  getFileUrl(file: ClientFile): string {
    return `${API_BASE}${file.url}`;
  }
}

export default new FileService();
