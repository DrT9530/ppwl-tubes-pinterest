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
        <svg
          aria-hidden="true"
          height="18"
          viewBox="0 0 24 24"
          width="18"
          className={`transition-all duration-150 group-hover:scale-110 ${
            initialLiked ? "text-[#E60023]" : "text-gray-500 group-hover:text-[#E60023]"
          }`}
          fill="currentColor"
        >
          {initialLiked ? (
            <path d="M0 9c0 6.18 8.97 11.59 11.07 12.76q.43.24.93.24t.93-.24C15.03 20.6 24 15.18 24 9v-.53a6.47 6.47 0 0 0-11.44-4.14L12 5l-.56-.67A6.47 6.47 0 0 0 0 8.47z"></path>
          ) : (
            <path d="M14.1 5.6A4.47 4.47 0 0 1 22 8.48V9c0 2.18-1.65 4.56-4.1 6.78a35 35 0 0 1-5.9 4.21 35 35 0 0 1-5.9-4.21C3.64 13.56 2 11.18 2 9v-.53a4.47 4.47 0 0 1 7.9-2.86L12 8.12zm-3.47-2.08A6.47 6.47 0 0 0 0 8.47V9c0 6.18 8.97 11.59 11.07 12.76q.43.24.93.24t.93-.24C15.03 20.6 24 15.18 24 9v-.53a6.47 6.47 0 0 0-11.44-4.14L12 5l-.56-.67q-.38-.45-.8-.81"></path>
          )}
        </svg>
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
      <svg
        aria-hidden="true"
        height="24"
        viewBox="0 0 24 24"
        width="24"
        className={`transition-all duration-200 group-hover:scale-110 ${
          initialLiked
            ? "text-[#E60023]"
            : "text-[#111] group-hover:text-[#E60023]"
        } ${isPending ? "opacity-50" : ""}`}
        fill="currentColor"
      >
        {initialLiked ? (
          <path d="M0 9c0 6.18 8.97 11.59 11.07 12.76q.43.24.93.24t.93-.24C15.03 20.6 24 15.18 24 9v-.53a6.47 6.47 0 0 0-11.44-4.14L12 5l-.56-.67A6.47 6.47 0 0 0 0 8.47z"></path>
        ) : (
          <path d="M14.1 5.6A4.47 4.47 0 0 1 22 8.48V9c0 2.18-1.65 4.56-4.1 6.78a35 35 0 0 1-5.9 4.21 35 35 0 0 1-5.9-4.21C3.64 13.56 2 11.18 2 9v-.53a4.47 4.47 0 0 1 7.9-2.86L12 8.12zm-3.47-2.08A6.47 6.47 0 0 0 0 8.47V9c0 6.18 8.97 11.59 11.07 12.76q.43.24.93.24t.93-.24C15.03 20.6 24 15.18 24 9v-.53a6.47 6.47 0 0 0-11.44-4.14L12 5l-.56-.67q-.38-.45-.8-.81"></path>
        )}
      </svg>
      <span className="text-[15px] font-semibold text-[#111]">
        {initialCount}
      </span>
    </button>
  );
}
