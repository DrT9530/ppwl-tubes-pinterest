import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Pencil, Upload, UserPlus, UserMinus, Loader2 } from "lucide-react";
import { updateProfileSchema, changePasswordSchema } from "shared/validators";
import type { UpdateProfileInput, ChangePasswordInput } from "shared/validators";
import { useAuthStore } from "../stores/auth.store";
import { profileService } from "../services/profile.service";
import { postService } from "../services/post.service";
import { ApiError } from "../services/api";
import toast from "react-hot-toast";
import type { PostDTO } from "shared/types";
import { PinCard, SkeletonCard } from "../components/PinCard";
import { FollowListModal } from "../components/FollowListModal";

export function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, setUser } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<any>(null);
  const [createdPosts, setCreatedPosts] = useState<PostDTO[]>([]);
  const [savedPosts, setSavedPosts] = useState<PostDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);

  // Ambil tab aktif dari search query parameter (?tab=saved)
  const queryParams = new URLSearchParams(location.search);
  const tabParam = queryParams.get("tab");
  const [activeTab, setActiveTab] = useState<"posts" | "saved">(
    tabParam === "saved" ? "saved" : "posts"
  );

  // Sync activeTab ketika search query berubah (misal diklik dari sidebar)
  useEffect(() => {
    const qParams = new URLSearchParams(location.search);
    const tab = qParams.get("tab");
    if (tab === "saved") {
      setActiveTab("saved");
    } else if (tab === "posts") {
      setActiveTab("posts");
    }
  }, [location.search]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [followModalType, setFollowModalType] = useState<"followers" | "following" | null>(null);
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

  const handleAvatarUpload = async (file: File) => {
    setIsUploadingAvatar(true);
    // Preview langsung
    const previewUrl = URL.createObjectURL(file);
    setProfile((prev: any) => ({ ...prev, avatarUrl: previewUrl }));
    try {
      const res = await profileService.updateAvatar(file);
      if (res.data) {
        setProfile((prev: any) => ({ ...prev, avatarUrl: res.data!.avatarUrl }));
        // Update auth store jika profil sendiri
        if (currentUser) {
          setUser({ ...currentUser, avatarUrl: res.data!.avatarUrl });
        }
        toast.success("Foto profil berhasil diubah");
      }
    } catch (err) {
      toast.error("Gagal upload foto profil");
      // Rollback preview
      setProfile((prev: any) => ({ ...prev, avatarUrl: profile?.avatarUrl }));
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleFollow = async () => {
    if (!id || followLoading) return;
    setFollowLoading(true);
    try {
      if (profile.isFollowed) {
        await profileService.unfollowUser(id);
        setProfile((prev: any) => ({
          ...prev,
          isFollowed: false,
          followerCount: (prev.followerCount || 1) - 1,
        }));
        toast.success("Berhasil unfollow");
      } else {
        await profileService.followUser(id);
        setProfile((prev: any) => ({
          ...prev,
          isFollowed: true,
          followerCount: (prev.followerCount || 0) + 1,
        }));
        toast.success("Berhasil follow");
      }
    } catch (err) {
      toast.error("Gagal memproses follow");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleShareProfile = () => {
    const url = `${window.location.origin}/profile/${id}`;
    navigator.clipboard.writeText(url)
      .then(() => toast.success("Tautan profil disalin!"))
      .catch(() => toast.error("Gagal menyalin tautan"));
  };

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
      <div className="profile-layout-header">
        <div className="profile-layout-avatar-row">
          <div className="profile-layout-avatar-container">
            <div className="profile-layout-avatar relative overflow-hidden">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.username} className="h-full w-full object-cover" />
              ) : (
                getInitial(profile.username)
              )}
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div
                    className="spinner"
                    style={{
                      borderColor: "rgba(255, 255, 255, 0.3)",
                      borderTopColor: "#ffffff",
                      borderWidth: "3px",
                      width: "32px",
                      height: "32px",
                    }}
                  />
                </div>
              )}
            </div>
            {isOwnProfile && (
              <>
                <button 
                  className="profile-layout-avatar-edit-btn"
                  title="Change avatar" 
                  onClick={() => document.getElementById("profile-avatar-input")?.click()}
                >
                  <Pencil size={14} strokeWidth={2.5} />
                </button>
                <input
                  id="profile-avatar-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAvatarUpload(file);
                  }}
                />
              </>
            )}
          </div>
          
          <div className="profile-layout-info-col">
            <h1 className="profile-layout-name">{profile.username}</h1>
            <p className="profile-layout-username">@{profile.username}</p>
          </div>
        </div>

        <div className="profile-layout-bio-row">
          <div className="profile-layout-followers text-[16px]">
            <span className="cursor-pointer hover:underline font-semibold" onClick={() => setFollowModalType("followers")}>
              {profile.followerCount ?? 0} pengikut
            </span>
            {" · "}
            <span className="cursor-pointer hover:underline font-semibold" onClick={() => setFollowModalType("following")}>
              {profile.followingCount ?? 0} mengikuti
            </span>
          </div>
          {profile.bio ? (
            <p className="text-[#111] text-[16px] mt-1">{profile.bio}</p>
          ) : (
            isOwnProfile && (
              <button className="profile-layout-add-bio-btn" onClick={() => setShowEditModal(true)}>
                Tambahkan bio singkat agar profil Anda menjadi khas Anda <Pencil size={14} />
              </button>
            )
          )}
        </div>

        {isOwnProfile ? (
          <div className="profile-layout-actions-row">
            <button onClick={handleShareProfile} className="profile-layout-action-btn">
              <Upload size={16} strokeWidth={2.5} /> Bagikan profil
            </button>
            <button onClick={() => setShowEditModal(true)} className="profile-layout-action-btn">
              <Pencil size={16} strokeWidth={2.5} /> Edit profil
            </button>
          </div>
        ) : currentUser && (
          <div className="profile-layout-actions-row">
            <button
              onClick={handleFollow}
              disabled={followLoading}
              className={`profile-layout-action-btn ${profile.isFollowed ? '' : 'profile-layout-follow-btn'}`}
            >
              {followLoading ? (
                <><Loader2 size={16} strokeWidth={2.5} className="animate-spin" /> Memproses...</>
              ) : profile.isFollowed ? (
                <><UserMinus size={16} strokeWidth={2.5} /> Berhenti Mengikuti</>
              ) : (
                <><UserPlus size={16} strokeWidth={2.5} /> Ikuti</>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="profile-layout-tabs-row">
        <div className="flex-1"></div>
        <div className="profile-layout-tabs-center">
          <button 
            className={`profile-layout-tab-btn ${activeTab === 'posts' ? 'active' : ''}`} 
            onClick={() => setActiveTab("posts")}
          >
            Dibuat
          </button>
          {isOwnProfile && (
            <button 
              className={`profile-layout-tab-btn ${activeTab === 'saved' ? 'active' : ''}`} 
              onClick={() => setActiveTab("saved")}
            >
              Disimpan
            </button>
          )}
        </div>
        <div className="flex-1"></div>
      </div>

      <div className="flex justify-end mb-4 px-2">
        {isOwnProfile && activeTab === "posts" && (
          <button className="profile-layout-create-btn" onClick={() => navigate("/create")}>
            Buat
          </button>
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
                <PinCard key={post.id} post={post} index={i} showTitle={true} />
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
                <PinCard key={post.id} post={post} index={i} showTitle={true} />
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

      {followModalType && (
        <FollowListModal
          userId={id!}
          type={followModalType}
          onClose={() => setFollowModalType(null)}
          count={followModalType === "followers" ? (profile.followerCount ?? 0) : (profile.followingCount ?? 0)}
        />
      )}
    </div>
  );
}

function EditProfileModal({ profile, onClose, onUpdate }: { profile: any; onClose: () => void; onUpdate: (u: any) => void }) {
  const [avatarPreview, setAvatarPreview] = useState(profile.avatarUrl);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { username: profile.username, email: profile.email, bio: profile.bio || "" },
  });

  const onSubmit = async (data: UpdateProfileInput) => {
    try {
      setIsSubmitting(true);

      // Upload avatar jika ada file baru
      let newAvatarUrl = profile.avatarUrl;
      if (avatarFile) {
        const avatarRes = await profileService.updateAvatar(avatarFile);
        if (avatarRes.data) {
          newAvatarUrl = avatarRes.data.avatarUrl;
        }
      }

      const res = await profileService.updateProfile(data);
      if (res.data) {
        const updatedProfile = { ...res.data, avatarUrl: newAvatarUrl };
        onUpdate(updatedProfile);
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
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-3">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 overflow-hidden border border-gray-300">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar Preview" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-gray-500">{profile.username?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => document.getElementById("modal-avatar-input")?.click()}
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-white border shadow-sm transition hover:bg-gray-50"
              >
                <Pencil size={14} />
              </button>
            </div>
            <input
              id="modal-avatar-input"
              type="file"
              accept="image/*"
              className="hidden"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setAvatarPreview(URL.createObjectURL(file));
                  setAvatarFile(file);
                }
              }}
            />
          </div>
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
          <div className="form-group">
            <label className="input-label">Bio</label>
            <textarea
              className={`input-field ${errors.bio ? "error" : ""}`}
              rows={3}
              maxLength={200}
              placeholder="Ceritakan sedikit tentang diri Anda..."
              {...register("bio")}
            />
            {errors.bio && <span className="input-error">{errors.bio.message}</span>}
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
