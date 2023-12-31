"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Member, MemberRole, Profile } from "@prisma/client";
import { ActionTooltip } from "components/ActionTooltip";
import { useSocket } from "components/providers/socket-provider";
import { Button } from "components/ui/button";
import { Form, FormControl, FormField, FormItem } from "components/ui/form";
import { Input } from "components/ui/input";
import { DeleteMessageModal } from "features/chat/components/DeleteMessageModal";
import { MessageType, UpdateMessagePayload } from "features/chat/types";
import { UserAvatar } from "features/profile/components/ProfileAvatar";
import { cn } from "lib/utils";
import { Edit, FileIcon, ShieldAlert, ShieldCheck, Trash } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const roleIconMap = {
  GUEST: null,
  MODERATOR: <ShieldCheck className="ml-2 h-4 w-4 text-indigo-500" />,
  ADMIN: <ShieldAlert className="ml-2 h-4 w-4 text-rose-500" />
};

const formSchema = z.object({
  content: z.string().min(1)
});

type ChatItemProps = {
  id: string;
  channelId: string;
  serverId: string;
  content: string;
  member: Member & {
    profile: Profile;
  };
  timestamp: string;
  fileUrl: string | null;
  deleted: boolean;
  currentMember: Member;
  isUpdated: boolean;
  type: MessageType;
  socketKey: string;
};

/** Displays a single message in a server or direct message. */
export const ChatMessage = ({
  id,
  channelId,
  serverId,
  content,
  member,
  timestamp,
  fileUrl,
  deleted,
  currentMember,
  isUpdated,
  type,
  socketKey
}: ChatItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const params = useParams();
  const router = useRouter();

  const onMemberClick = () => {
    if (member.id === currentMember.id) return;
    router.push(`/servers/${params?.serverId}/conversations/${member.id}`);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsEditing(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: content
    }
  });

  const isLoading = form.formState.isSubmitting;

  const { socket } = useSocket();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const payload: UpdateMessagePayload = {
        key: `${socketKey}:messages:update`,
        serverId: serverId,
        channelId: channelId,
        content: values.content,
        messageId: id,
        directMessageId: id
      };

      socket?.send(JSON.stringify(payload));

      form.reset();
      setIsEditing(false);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    form.reset({
      content: content
    });
  }, [content, form]);

  const fileType = fileUrl?.split(".").pop();

  const isAdmin = currentMember.role === MemberRole.ADMIN;
  const isModerator = currentMember.role === MemberRole.MODERATOR;

  const isDirectMessage = type === "conversation";

  const isOwner = currentMember.id === member.id;

  const isPDF = fileType === "pdf" && fileUrl;
  const isImage = !isPDF && fileUrl;

  const canDeleteMessage = isDirectMessage
    ? isOwner
    : !deleted && (isAdmin || isModerator || isOwner);
  const canEditMessage = !deleted && isOwner && !fileUrl;

  return (
    <>
      <div className="group relative flex w-full items-center p-4 transition hover:bg-black/5">
        <div className="group flex w-full items-start gap-x-2">
          <div
            onClick={onMemberClick}
            className="cursor-pointer transition hover:drop-shadow-md"
          >
            <UserAvatar src={member.profile.imageUrl} />
          </div>
          <div className="flex w-full flex-col">
            <div className="flex items-center gap-x-2">
              <div className="flex items-center">
                <p
                  onClick={onMemberClick}
                  className="cursor-pointer text-sm font-semibold hover:underline"
                >
                  {member.profile.name}
                </p>
                <ActionTooltip label={member.role}>
                  {roleIconMap[member.role]}
                </ActionTooltip>
              </div>
              <span className="text-xs text-zinc-400">{timestamp}</span>
            </div>
            {isImage && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative mt-2 flex aspect-square h-48 w-48 items-center overflow-hidden rounded-md border bg-secondary"
              >
                <Image
                  src={fileUrl}
                  alt={content}
                  fill
                  className="object-cover"
                  sizes="400px"
                  priority
                />
              </a>
            )}
            {isPDF && (
              <div className="relative mt-2 flex items-center rounded-md bg-background/10 p-2">
                <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-sm text-indigo-400 hover:underline"
                >
                  PDF File
                </a>
              </div>
            )}
            {!fileUrl && !isEditing && (
              <p
                className={cn(
                  "text text-zinc-300",
                  deleted && "mt-1 text-xs italic text-zinc-400"
                )}
              >
                {content}
                {isUpdated && !deleted && (
                  <span className="mx-2 text-[10px] text-zinc-400">
                    (edited)
                  </span>
                )}
              </p>
            )}
            {!fileUrl && isEditing && (
              <Form {...form}>
                <form
                  className="flex w-full items-center gap-x-2 pt-2"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <div className="relative w-full">
                            <Input
                              disabled={isLoading}
                              className="border-0 border-none bg-zinc-700/75 p-2 text-base text-zinc-200 focus-visible:ring-0 focus-visible:ring-offset-0"
                              placeholder="Edited message"
                              {...field}
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button disabled={isLoading} size="sm" variant="primary">
                    Save
                  </Button>
                </form>
                <span className="mt-1 text-[10px] text-zinc-400">
                  Press escape to cancel, enter to save
                </span>
              </Form>
            )}
          </div>
        </div>
        {canDeleteMessage && (
          <div className="absolute -top-2 right-5 hidden items-center gap-x-2 rounded-sm border  bg-zinc-800 p-1 group-hover:flex">
            {canEditMessage && (
              <ActionTooltip label="Edit">
                <Edit
                  onClick={() => setIsEditing(true)}
                  className="ml-auto h-4 w-4 cursor-pointer text-zinc-500 transition hover:text-zinc-300"
                />
              </ActionTooltip>
            )}
            <ActionTooltip label="Delete">
              <Trash
                onClick={() => setIsOpen(true)}
                className="ml-auto h-4 w-4 cursor-pointer text-zinc-500 transition hover:text-zinc-300"
              />
            </ActionTooltip>
          </div>
        )}
      </div>
      <DeleteMessageModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        channelId={channelId}
        serverId={serverId}
        messageId={id}
        socketKey={socketKey}
      />
    </>
  );
};
