export type CompressImageOptions = {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: "image/jpeg" | "image/webp";
};

export async function compressImageFile(
  file: File,
  options: CompressImageOptions = {}
): Promise<File> {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.78,
    mimeType = "image/jpeg",
  } = options;

  if (!file.type.startsWith("image/")) {
    return file;
  }

  const imageBitmap = await createImageBitmap(file);

  const { width, height } = fitInside(
    imageBitmap.width,
    imageBitmap.height,
    maxWidth,
    maxHeight
  );

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return file;
  }

  ctx.drawImage(imageBitmap, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, mimeType, quality);
  });

  imageBitmap.close();

  if (!blob) {
    return file;
  }

  const extension = mimeType === "image/webp" ? "webp" : "jpg";
  const baseName = file.name.replace(/\.[^.]+$/, "");

  return new File([blob], `${baseName}.${extension}`, {
    type: mimeType,
    lastModified: Date.now(),
  });
}

function fitInside(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
) {
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }

  const ratio = Math.min(maxWidth / width, maxHeight / height);

  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}