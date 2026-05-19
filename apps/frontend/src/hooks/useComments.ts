import { useMutation, useQueryClient } from "@tanstack/react-query"; // [cite: 311]
import { commentService } from "../services/comment.service";

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) => 
      commentService.createComment(postId, content),
    onSuccess: (_, variables) => {
      // Invalidate queries untuk me-refresh data detail post yang sedang dilihat
      queryClient.invalidateQueries({ queryKey: ["post", variables.postId] });
    },
  });
};

// Buat juga `useCreateReply` dengan pola yang persis sama.