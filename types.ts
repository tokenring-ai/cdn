export interface UploadOptions {
  filename?: string | undefined;
  contentType?: string | undefined;
  metadata?: Record<string, string> | undefined;
}

export interface UploadResult {
  url: string;
  id?: string | undefined;
  metadata?: Record<string, any> | undefined;
}

export interface DeleteResult {
  success: boolean;
  message?: string | undefined;
}
