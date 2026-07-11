// src/lib/cloudinary.ts
interface ImportMetaEnv {
  readonly VITE_CLOUDINARY_CLOUD_NAME: string;
  readonly VITE_CLOUDINARY_UPLOAD_PRESET: string;
}

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export async function uploadPhotoToCloudinary(file: File): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Variables Cloudinary manquantes dans le fichier .env");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", "djassaclub/client-uploads");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!res.ok) {
    throw new Error("Échec upload Cloudinary");
  }

  const data = await res.json();
  return data.secure_url;
}