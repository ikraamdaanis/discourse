import { redirectToSignIn } from "@clerk/nextjs";
import { ChatHeader } from "features/chat/components/ChatHeader";
import { ChatInput } from "features/chat/components/ChatInput";
import { ChatMessages } from "features/chat/components/ChatMessages";
import { LiveKit } from "features/chat/components/LiveKit";
import { getOrCreateConversation } from "lib/conversation";
import { currentProfile } from "features/profile/utils/currentProfile";
import { db } from "lib/db";
import { redirect } from "next/navigation";

type MemberPageProps = {
  params: {
    memberId: string;
    serverId: string;
  };
  searchParams: {
    video?: boolean;
  };
};

const MemberPage = async ({ params, searchParams }: MemberPageProps) => {
  const profile = await currentProfile();

  if (!profile) {
    return redirectToSignIn();
  }

  const currentMember = await db.member.findFirst({
    where: {
      serverId: params.serverId,
      profileId: profile.id
    },
    include: {
      profile: true
    }
  });

  if (!currentMember) {
    return redirect("/");
  }

  const conversation = await getOrCreateConversation(
    currentMember.id,
    params.memberId
  );

  if (!conversation) {
    return redirect(`/servers/${params.serverId}`);
  }

  const { memberOne, memberTwo } = conversation;

  const otherMember =
    memberOne.profileId === profile.id ? memberTwo : memberOne;

  return (
    <div className="flex h-full flex-col bg-backgroundDark">
      <ChatHeader
        imageUrl={otherMember.profile.imageUrl}
        name={otherMember.profile.name}
        serverId={params.serverId}
        type="conversation"
      />
      <div className="mt-[48px] h-full">
        {searchParams.video && <LiveKit chatId={conversation.id} />}
        {!searchParams.video && (
          <>
            <ChatMessages
              member={currentMember}
              name={otherMember.profile.name}
              channelId={conversation.id}
              type="conversation"
              apiUrl="/api/direct-messages"
              paramKey="conversationId"
              paramValue={conversation.id}
              socketKey={`direct:${conversation.id}`}
            />
            <ChatInput
              name={otherMember.profile.name}
              type="conversation"
              apiUrl="/api/socket/direct-messages"
              socketKey={`direct:${conversation.id}`}
              query={{
                conversationId: conversation.id
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default MemberPage;
