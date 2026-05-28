import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Edit3, X, Lock } from "lucide-react";
import { updateProfileSchema, changePasswordSchema } from "shared/validators";
import type { UpdateProfileInput, ChangePasswordInput } from "shared/validators";
import { useAuthStore } from "../stores/auth.store";
import { profileService } from "../services/profile.service";
import { postService } from "../services/post.service";
import { ApiError } from "../services/api";
import toast from "react-hot-toast";
import type { PostDTO } from "shared/types";
import { PinCard, SkeletonCard } from "../components/PinCard";

export function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, setUser } = useAuthStore();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [createdPosts, setCreatedPosts] = useState<PostDTO[]>([]);
  const [savedPosts, setSavedPosts] = useState<PostDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const isOwnProfile = currentUser?.id === id;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setPostsLoading(true);

    profileService.getProfile(id).then((res) => {
      setProfile(res.data);
    }).catch(() => {
      toast.error("User tidak ditemukan");
      navigate("/");
    }).finally(() => setLoading(false));

    postService.getUserPosts(id).then((res) => {
      setCreatedPosts(res.data || []);
    }).catch(console.error).finally(() => setPostsLoading(false));

    if (currentUser?.id === id) {
      postService.getSavedPosts().then((res) => {
        setSavedPosts(res.data || []);
      }).catch(console.error);
    }
  }, [id, navigate, currentUser?.id]);

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="profile-page" id="profile-page">
      <div className="profile-header" style={{ animation: "var(--animate-slide-up)" }}>
        <div className="avatar-wrapper">
          <div className="avatar avatar-xl">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.username} />
            ) : (
              getInitial(profile.username)
            )}
          </div>
          {isOwnProfile && (
            <button className="avatar-edit-btn" title="Change avatar">
              <Camera size={16} />
            </button>
          )}
        </div>
        <h1>{profile.username}</h1>
        <p className="username">@{profile.username}</p>
        <div className="stats">
          <span><strong>{profile.postCount || 0}</strong> posts</span>
        </div>
        {isOwnProfile && (
          <div className="profile-actions">
            <button className="btn-secondary" onClick={() => setShowEditModal(true)} id="edit-profile-btn">
              <Edit3 size={16} /> Edit Profile
            </button>
            <button className="btn-outline" onClick={() => setShowPasswordModal(true)} id="change-password-btn" style={{ padding: "8px 16px", fontSize: 14 }}>
              <Lock size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="profile-tabs">
        <button className={activeTab === "posts" ? "active" : ""} onClick={() => setActiveTab("posts")}>Created</button>
        {isOwnProfile && (
          <button className={activeTab === "saved" ? "active" : ""} onClick={() => setActiveTab("saved")}>Saved</button>
        )}
      </div>

      <div className="profile-content py-8">
        {postsLoading ? (
          <div className="masonry-grid">
            {Array.from({ length: 10 }).map((_, i) => (
              <SkeletonCard key={i} index={i} />
            ))}
          </div>
        ) : activeTab === "posts" ? (
          createdPosts.length > 0 ? (
            <div className="masonry-grid">
              {createdPosts.map((post, i) => (
                <PinCard key={post.id} post={post} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              No pins created yet
            </div>
          )
        ) : (
          savedPosts.length > 0 ? (
            <div className="masonry-grid">
              {savedPosts.map((post, i) => (
                <PinCard key={post.id} post={post} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              No saved pins yet
            </div>
          )
        )}
      </div>

      {showEditModal && (
        <EditProfileModal profile={profile} onClose={() => setShowEditModal(false)} onUpdate={(u) => { setProfile({ ...profile, ...u }); if (isOwnProfile) setUser({ ...currentUser!, ...u }); }} />
      )}
      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
}

function EditProfileModal({ profile, onClose, onUpdate }: { profile: any; onClose: () => void; onUpdate: (u: any) => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { username: profile.username, email: profile.email },
  });

  const onSubmit = async (data: UpdateProfileInput) => {
    try {
      setIsSubmitting(true);
      const res = await profileService.updateProfile(data);
      if (res.data) {
        onUpdate(res.data);
        toast.success("Profil berhasil diperbarui");
        onClose();
      }
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Gagal memperbarui profil");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Profile</h2>
          <button className="modal-close" onClick={onClose}><X size={24} /></button>
        </div>
        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="input-label">Username</label>
            <input className={`input-field ${errors.username ? "error" : ""}`} {...register("username")} />
            {errors.username && <span className="input-error">{errors.username.message}</span>}
          </div>
          <div className="form-group">
            <label className="input-label">Email</label>
            <input className={`input-field ${errors.email ? "error" : ""}`} type="email" {...register("email")} />
            {errors.email && <span className="input-error">{errors.email.message}</span>}
          </div>
          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordInput) => {
    try {
      setIsSubmitting(true);
      await profileService.changePassword(data);
      toast.success("Password berhasil diubah");
      onClose();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Gagal mengubah password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Change Password</h2>
          <button className="modal-close" onClick={onClose}><X size={24} /></button>
        </div>
        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="input-label">Current Password</label>
            <input className={`input-field ${errors.currentPassword ? "error" : ""}`} type="password" {...register("currentPassword")} />
            {errors.currentPassword && <span className="input-error">{errors.currentPassword.message}</span>}
          </div>
          <div className="form-group">
            <label className="input-label">New Password</label>
            <input className={`input-field ${errors.newPassword ? "error" : ""}`} type="password" placeholder="Min 8 characters" {...register("newPassword")} />
            {errors.newPassword && <span className="input-error">{errors.newPassword.message}</span>}
          </div>
          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
