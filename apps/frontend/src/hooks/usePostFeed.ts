// hooks/usePostFeed.ts — TanStack Query hook for infinite scroll feed
import { useInfiniteQuery } from "@tanstack/react-query";
import { postService } from "../services/post.service";

export function usePostFeed(limit = 20, search?: string) {
  return useInfiniteQuery({
    queryKey: ["posts", "feed", search],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await postService.getFeed(pageParam, limit, search);
      return res;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.meta?.hasNext) {
        return (lastPage.meta.page || 1) + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
}
