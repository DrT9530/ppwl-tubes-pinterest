import { createHash } from "node:crypto";

const CLOUDINARY_UPLOAD_URL = (cloudName: string) =>
  `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

const CLOUDINARY_DESTROY_URL = (cloudName: string) =>
  `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`;

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary environment variables belum lengkap");
  }

  return { cloudName, apiKey, apiSecret };
}

function signParams(params: Record<string, string | number>, apiSecret: string) {
  const payload = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1")
    .update(`${payload}${apiSecret}`)
    .digest("hex");
}

function getPublicIdFromUrl(imageUrl: string) {
  try {
    const url = new URL(imageUrl);
    const uploadIndex = url.pathname.indexOf("/upload/");

    if (uploadIndex === -1) return null;

    const afterUpload = url.pathname.slice(uploadIndex + "/upload/".length);
    const withoutVersion = afterUpload.replace(/^v\d+\//, "");
    const withoutExtension = withoutVersion.replace(/\.[^/.]+$/, "");

    return decodeURIComponent(withoutExtension);
  } catch {
    return null;
  }
}

export async function uploadImageToCloudinary(file: File) {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "ppwl-pinterest/posts";
  const signature = signParams({ folder, timestamp }, apiSecret);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("folder", folder);
  formData.append("signature", signature);

  const response = await fetch(CLOUDINARY_UPLOAD_URL(cloudName), {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.error?.message || "Gagal upload gambar ke Cloudinary");
  }

  return {
    imageUrl: result.secure_url as string,
    publicId: result.public_id as string,
  };
}

export async function deleteImageFromCloudinary(imageUrl: string) {
  const publicId = getPublicIdFromUrl(imageUrl);
  if (!publicId) return;

  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = signParams({ public_id: publicId, timestamp }, apiSecret);

  const formData = new FormData();
  formData.append("public_id", publicId);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);

  const response = await fetch(CLOUDINARY_DESTROY_URL(cloudName), {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const result = await response.json();
    throw new Error(result?.error?.message || "Gagal menghapus gambar dari Cloudinary");
  }
}

export function getCloudinaryUploadSignature() {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "ppwl-pinterest/posts";
  const signature = signParams({ folder, timestamp }, apiSecret);

  return {
    signature,
    timestamp,
    apiKey,
    folder,
    cloudName,
  };
}
