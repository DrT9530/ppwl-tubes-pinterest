import { useInfiniteQuery } from "@tanstack/react-query";
import { postService } from "../services/post.service";

export const usePostFeed = (limit = 20) => {
  return useInfiniteQuery({
    queryKey: ["posts", "feed"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await postService.getFeed(pageParam, limit);
      return response; 
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) => {
      if (lastPage?.meta?.hasNext) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
  });
};