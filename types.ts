export interface UploadOptions {
  filename?: string;
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface UploadResult {
  url: string;
  id?: string;
  metadata?: Record<string, any>;
}

export interface DeleteResult {
  success: boolean;
  message?: string;
}