import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, ImagePlus, Loader2, Upload, X } from "lucide-react";
import { postService } from "../services/post.service";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function CreatePostModal() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const previewUrl = useMemo(() => {
    if (!image) return "";
    return URL.createObjectURL(image);
  }, [image]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const createPost = useMutation({
    mutationFn: async ({ image, caption }: { image: File; caption: string }) => {
      // 1. Dapatkan upload signature dari Backend AWS Lambda
      const sigRes = await postService.getUploadSignature();
      if (!sigRes.success || !sigRes.data) {
        throw new Error(sigRes.message || "Gagal mengotorisasi unggahan gambar");
      }

      const { signature, timestamp, apiKey, folder, cloudName } = sigRes.data;

      // 2. Unggah gambar fisik langsung ke Cloudinary dari browser
      const formData = new FormData();
      formData.append("file", image);
      formData.append("api_key", apiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("folder", folder);
      formData.append("signature", signature);

      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const cloudinaryData = await cloudinaryRes.json();
      if (!cloudinaryRes.ok) {
        throw new Error(cloudinaryData.error?.message || "Gagal mengunggah gambar ke Cloudinary");
      }

      const imageUrl = cloudinaryData.secure_url;

      // 3. Simpan URL gambar dan caption ke database backend
      const response = await postService.create({ imageUrl, caption });
      return response;
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Pin berhasil dibuat");
      navigate(`/post/${response.data?.id || ""}`, { replace: true });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Gagal membuat pin");
    },
  });

  const handleFile = (file?: File) => {
    setError("");

    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImage(null);
      setError("File harus berupa gambar JPG, PNG, WEBP, atau GIF.");
      return;
    }

    setImage(file);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!image) {
      setError("Pilih gambar terlebih dahulu.");
      return;
    }

    if (caption.length > 500) {
      setError("Caption maksimal 500 karakter.");
      return;
    }

    createPost.mutate({ image, caption });
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] px-4 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between pb-5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#111] shadow-sm transition-colors hover:bg-[#efefef]"
          title="Back"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-xl font-semibold text-[#111]">Create Pin</h1>
        <div className="h-12 w-12" />
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-auto grid max-w-[1180px] gap-8 rounded-[28px] bg-white p-5 shadow-sm sm:p-8 lg:grid-cols-[minmax(320px,520px)_1fr]"
      >
        <section
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            handleFile(event.dataTransfer.files[0]);
          }}
          className={`relative flex min-h-[520px] flex-col items-center justify-center overflow-hidden rounded-[24px] border-2 border-dashed transition-colors ${
            isDragging ? "border-[#e60023] bg-[#fff2f4]" : "border-[#dadada] bg-[#f7f7f7]"
          }`}
        >
          {previewUrl ? (
            <>
              <img
                src={previewUrl}
                alt="Preview pin"
                className="h-full max-h-[680px] w-full object-contain"
              />
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  fileInputRef.current?.click();
                }}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#111] shadow-md transition-colors hover:bg-[#efefef]"
                title="Replace image"
              >
                <X size={20} />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-4 px-8 text-center text-[#111]"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
                <ImagePlus size={30} />
              </span>
              <span className="max-w-[260px] text-lg font-semibold">
                Drag image here or browse from your device
              </span>
              <span className="text-sm text-[#767676]">JPG, PNG, WEBP, GIF</span>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
        </section>

        <section className="flex min-w-0 flex-col gap-6 py-1">
          <div>
            <label className="input-label" htmlFor="caption">
              Caption
            </label>
            <textarea
              id="caption"
              value={caption}
              maxLength={500}
              onChange={(event) => setCaption(event.target.value)}
              placeholder="Tambahkan deskripsi pin"
              className="input-field min-h-[180px] resize-y leading-relaxed"
            />
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className={error ? "text-[#cc0000]" : "text-[#767676]"}>
                {error || " "}
              </span>
              <span className="text-[#767676]">{caption.length}/500</span>
            </div>
          </div>

          <div className="mt-auto flex justify-end gap-3 border-t border-[#efefef] pt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary"
              disabled={createPost.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary min-w-[132px]"
              disabled={createPost.isPending}
            >
              {createPost.isPending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Upload size={18} />
              )}
              Publish
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}
