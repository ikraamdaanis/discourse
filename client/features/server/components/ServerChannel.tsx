"use client";

import { Channel, ChannelType, MemberRole, Server } from "@prisma/client";
import { ActionTooltip } from "components/ActionTooltip";
import { HashIcon } from "components/icons/HashIcon";
import { ModalType, useModal } from "hooks/useModal";
import { cn } from "lib/utils";
import { Edit, Lock, Mic, Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

const iconMap = (showLock: boolean) => ({
  [ChannelType.TEXT]: () => (
    <HashIcon
      showLock={showLock}
      className="h-5 w-5 flex-shrink-0 text-zinc-400"
    />
  ),
  [ChannelType.AUDIO]: Mic
});

type ServerChannelProps = {
  channel: Channel;
  server: Server;
  role?: MemberRole;
};

/** Displays a channel's name and links to the channel chat page. */
export const ServerChannel = ({
  channel,
  server,
  role
}: ServerChannelProps) => {
  const params = useParams();
  const router = useRouter();

  const Icon = iconMap(channel.name === "general")[channel.type];

  const { onOpen } = useModal();

  function handleClick() {
    router.push(`/servers/${params?.serverId}/channels/${channel.id}`);
  }

  function onAction(e: React.MouseEvent, action: ModalType) {
    e.stopPropagation();
    onOpen(action, { channel, server });
  }

  return (
    <button
      className={cn(
        "group mb-1 flex w-full items-center gap-x-2 rounded-md px-2 py-2 transition hover:bg-zinc-700/50",
        params?.channelId === channel.id && "bg-zinc-700"
      )}
      onClick={handleClick}
    >
      <Icon className="h-5 w-5 flex-shrink-0 text-zinc-400" />
      <p
        className={cn(
          "line-clamp-1 font-medium text-zinc-400 transition group-hover:text-zinc-300",
          params?.channelId === channel.id &&
            "text-zinc-200 group-hover:text-white"
        )}
      >
        {channel.name}
      </p>
      {channel.name !== "general" && role !== MemberRole.GUEST && (
        <div className="ml-auto flex items-center gap-x-2">
          <ActionTooltip label="Edit">
            <Edit
              className="hidden h-4 w-4 text-zinc-400 transition hover:text-zinc-300 group-hover:block"
              onClick={e => onAction(e, "editChannel")}
            />
          </ActionTooltip>
          <ActionTooltip label="Delete">
            <Trash
              className="hidden h-4 w-4 text-zinc-400 transition hover:text-zinc-300 group-hover:block"
              onClick={e => onAction(e, "deleteChannel")}
            />
          </ActionTooltip>
        </div>
      )}
      {channel.name === "general" && (
        <Lock className="ml-auto h-4 w-4 text-zinc-400" />
      )}
    </button>
  );
};
