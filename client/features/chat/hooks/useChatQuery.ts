import { useInfiniteQuery } from "@tanstack/react-query";
import { MessagesQuery } from "features/chat/types";
import qs from "query-string";

type ChatQueryProps = {
  queryKey: string;
  apiUrl: string;
  paramKey: "channelId" | "conversationId";
  paramValue: string;
};

/** Query to fetch messages from a channel or direct messages. */
export const useChatQuery = ({
  queryKey,
  apiUrl,
  paramKey,
  paramValue
}: ChatQueryProps) => {
  async function fetchMessages({ pageParam = undefined }) {
    try {
      const url = qs.stringifyUrl(
        {
          url: apiUrl,
          query: {
            cursor: pageParam,
            [paramKey]: paramValue
          }
        },
        { skipNull: true }
      );
      const res = await fetch(url);
      return res.json();
    } catch (error) {
      console.error("Error fetching messages: ", error);
      return null;
    }
  }

  return useInfiniteQuery<MessagesQuery["pages"][0]>({
    queryKey: [queryKey],
    queryFn: data => fetchMessages({ pageParam: data.pageParam }),
    getNextPageParam: lastPage => lastPage?.nextCursor || false,
    refetchOnMount: true,
    enabled: !!queryKey
  });
};
