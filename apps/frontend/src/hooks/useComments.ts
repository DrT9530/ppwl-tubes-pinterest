import { useMutation, useQueryClient } from "@tanstack/react-query";
import { commentService } from "../services/comment.service";
import toast from "react-hot-toast";

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ postId, content, image, stickerUrl }: { postId: string; content: string; image?: File; stickerUrl?: string }) => 
      commentService.createComment(postId, content, image, stickerUrl),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["post", variables.postId] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Gagal menambahkan komentar");
    },
  });
};

export const useCreateReply = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ commentId, content, image, stickerUrl }: { commentId: string; content: string; image?: File; stickerUrl?: string }) => 
      commentService.createReply(commentId, content, image, stickerUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post"] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Gagal membalas komentar");
    },
  });
};

export const useLikeComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => commentService.likeComment(commentId),
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: ["post"] });
      const previousData = queryClient.getQueriesData({ queryKey: ["post"] });
      queryClient.setQueriesData({ queryKey: ["post"] }, (old: any) => {
        if (!old?.data?.comments) return old;
        return {
          ...old,
          data: {
            ...old.data,
            comments: old.data.comments.map((c: any) =>
              c.id === commentId ? { ...c, isLiked: true, likeCount: (c.likeCount || 0) + 1 } : c
            ),
          },
        };
      });
      return { previousData };
    },
    onError: (err, _, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
      }
      toast.error("Gagal menyukai komentar");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["post"] }),
  });
};

export const useUnlikeComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => commentService.unlikeComment(commentId),
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: ["post"] });
      const previousData = queryClient.getQueriesData({ queryKey: ["post"] });
      queryClient.setQueriesData({ queryKey: ["post"] }, (old: any) => {
        if (!old?.data?.comments) return old;
        return {
          ...old,
          data: {
            ...old.data,
            comments: old.data.comments.map((c: any) =>
              c.id === commentId ? { ...c, isLiked: false, likeCount: Math.max(0, (c.likeCount || 1) - 1) } : c
            ),
          },
        };
      });
      return { previousData };
    },
    onError: (err, _, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["post"] }),
  });
};

export const useEditComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) => 
      commentService.editComment(commentId, content),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["post"] }),
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => commentService.deleteComment(commentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["post"] }),
  });
};

export const useHighlightComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => commentService.highlightComment(commentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["post"] }),
  });
};

export const useLikeReply = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (replyId: string) => commentService.likeReply(replyId),
    onMutate: async (replyId) => {
      await queryClient.cancelQueries({ queryKey: ["post"] });
      const previousData = queryClient.getQueriesData({ queryKey: ["post"] });
      queryClient.setQueriesData({ queryKey: ["post"] }, (old: any) => {
        if (!old?.data?.comments) return old;
        return {
          ...old,
          data: {
            ...old.data,
            comments: old.data.comments.map((c: any) => ({
              ...c,
              replies: c.replies?.map((r: any) =>
                r.id === replyId ? { ...r, isLiked: true, likeCount: (r.likeCount || 0) + 1 } : r
              )
            })),
          },
        };
      });
      return { previousData };
    },
    onError: (err, _, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["post"] }),
  });
};

export const useUnlikeReply = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (replyId: string) => commentService.unlikeReply(replyId),
    onMutate: async (replyId) => {
      await queryClient.cancelQueries({ queryKey: ["post"] });
      const previousData = queryClient.getQueriesData({ queryKey: ["post"] });
      queryClient.setQueriesData({ queryKey: ["post"] }, (old: any) => {
        if (!old?.data?.comments) return old;
        return {
          ...old,
          data: {
            ...old.data,
            comments: old.data.comments.map((c: any) => ({
              ...c,
              replies: c.replies?.map((r: any) =>
                r.id === replyId ? { ...r, isLiked: false, likeCount: Math.max(0, (r.likeCount || 1) - 1) } : r
              )
            })),
          },
        };
      });
      return { previousData };
    },
    onError: (err, _, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["post"] }),
  });
};

export const useEditReply = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ replyId, content }: { replyId: string; content: string }) => 
      commentService.editReply(replyId, content),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["post"] }),
  });
};

export const useDeleteReply = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (replyId: string) => commentService.deleteReply(replyId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["post"] }),
  });
};