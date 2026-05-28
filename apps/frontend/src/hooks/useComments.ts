import { useMutation, useQueryClient } from "@tanstack/react-query";
import { commentService } from "../services/comment.service";

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ postId, content, image, stickerUrl }: { postId: string; content: string; image?: File; stickerUrl?: string }) => 
      commentService.createComment(postId, content, image, stickerUrl),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["post", variables.postId] });
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
  });
};

export const useLikeComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => commentService.likeComment(commentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["post"] }),
  });
};

export const useUnlikeComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => commentService.unlikeComment(commentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["post"] }),
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["post"] }),
  });
};

export const useUnlikeReply = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (replyId: string) => commentService.unlikeReply(replyId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["post"] }),
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