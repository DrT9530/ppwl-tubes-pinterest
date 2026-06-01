import { X } from "lucide-react";
import type { UserDTO } from "shared/types";
import { useEffect, useState } from "react";
import { profileService } from "../services/profile.service";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";
import toast from "react-hot-toast";

interface FollowListModalProps {
  userId: string;
  type: "followers" | "following";
  onClose: () => void;
  count: number;
}

export function FollowListModal({ userId, type, onClose, count }: FollowListModalProps) {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  
  const isOwnProfile = currentUser?.id === userId;

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = type === "followers" 
          ? await profileService.getFollowers(userId)
          : await profileService.getFollowing(userId);
        
        if (res.success && res.data) {
          setUsers(res.data);
        }
      } catch (err) {
        toast.error(`Gagal memuat ${type === "followers" ? "pengikut" : "mengikuti"}`);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [userId, type]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-follow" onClick={(e) => e.stopPropagation()}>
        <div className="modal-follow-header">
          <h2 className="modal-follow-title">
            {type === "followers" ? `${count} Pengikut` : "Mengikuti"}
          </h2>
          <button className="modal-close-btn-follow" onClick={onClose}>
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="modal-follow-body">
          {loading ? (
            <div className="flex justify-center p-4">
              <div className="spinner" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-[#767676] py-4">Belum ada data.</p>
          ) : (
            <div className="follow-list-container">
              {users.map((user) => (
                <div key={user.id} className="follow-list-item" onClick={() => {
                  onClose();
                  navigate(`/profile/${user.id}`);
                }}>
                  <div className="follow-list-user">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.username} className="follow-list-avatar" />
                    ) : (
                      <div className="follow-list-avatar-placeholder">{getInitial(user.username)}</div>
                    )}
                    <span className="follow-list-username">{user.username}</span>
                  </div>
                  {isOwnProfile && (
                    type === "followers" ? (
                      <button className="follow-list-action-btn" onClick={(e) => {
                        e.stopPropagation();
                        // Jika Anda ingin membuat fungsionalitas Ikuti kembali
                      }}>Mengikuti</button>
                    ) : (
                      <button className="follow-list-action-btn" onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          await profileService.unfollowUser(user.id);
                          setUsers(users.filter(u => u.id !== user.id));
                          toast.success(`Berhasil unfollow ${user.username}`);
                        } catch (err) {
                          toast.error("Gagal unfollow");
                        }
                      }}>Batal mengikuti</button>
                    )
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
