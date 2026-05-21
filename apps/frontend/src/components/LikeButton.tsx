import { Heart } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likeService } from "../services/like.service";
import { useAuthStore } from "../stores/auth.store";

interface LikeButtonProps {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
  onAuthRequired?: () => void;
  /** tampilan compact untuk feed card */
  compact?: boolean;
}

export function LikeButton({
  postId,
  initialLiked,
  initialCount,
  onAuthRequired,
  compact = false,
}: LikeButtonProps) {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => likeService.toggle(postId),

    // Optimistic update
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["post", postId] });
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      const previousPost = queryClient.getQueryData(["post", postId]);

      // Update cache optimistically
      queryClient.setQueryData(["post", postId], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            isLiked: !old.data.isLiked,
            likeCount: old.data.isLiked
              ? old.data.likeCount - 1
              : old.data.likeCount + 1,
          },
        };
      });

      return { previousPost };
    },

    onError: (_err, _vars, context) => {
      // Rollback jika error
      if (context?.previousPost) {
        queryClient.setQueryData(["post", postId], context.previousPost);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // jangan trigger navigasi ke detail post
    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }
    mutate();
  };

  if (compact) {
    return (
      <button
        onClick={handleClick}
        disabled={isPending}
        className="flex items-center gap-1 text-gray-500 hover:text-[#E60023] transition-colors group"
        aria-label={initialLiked ? "Unlike" : "Like"}
      >
        <Heart
          size={18}
          className={`transition-all duration-150 group-hover:scale-110 ${
            initialLiked ? "fill-[#E60023] stroke-[#E60023]" : "stroke-current"
          }`}
        />
        <span className="text-xs font-semibold">{initialCount}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="flex items-center gap-1.5 px-3 py-2.5 rounded-full font-semibold transition-all duration-150 hover:bg-[#f1f1f1] active:bg-[#e1e1e1] active:scale-95 group text-[#111]"
      aria-label={initialLiked ? "Unlike" : "Like"}
    >
      <Heart
        size={24}
        strokeWidth={2.4}
        className={`transition-all duration-200 group-hover:scale-110 ${
          initialLiked
            ? "fill-[#E60023] stroke-[#E60023]"
            : "stroke-[#111] group-hover:stroke-[#E60023]"
        } ${isPending ? "opacity-50" : ""}`}
      />
      <span className="text-[15px] font-semibold text-[#111]">
        {initialCount}
      </span>
    </button>
  );
}
