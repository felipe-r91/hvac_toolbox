import { API_BASE_URL } from "../api/config";

type PhotoLike = {
  previewUrl?: string;
  remotePhotoId?: string;
};

export function resolvePhotoUrl(photo: PhotoLike): string | undefined {
  if (photo.previewUrl) {
    if (
      photo.previewUrl.startsWith("blob:") ||
      photo.previewUrl.startsWith("http://") ||
      photo.previewUrl.startsWith("https://")
    ) {
      return photo.previewUrl;
    }

    return `${API_BASE_URL}${photo.previewUrl}`;
  }

  if (photo.remotePhotoId) {
    return `${API_BASE_URL}/api/photos/${photo.remotePhotoId}`;
  }

  return undefined;
}