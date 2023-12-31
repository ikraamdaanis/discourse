import { initialProfile } from "features/profile/utils/initialProfile";
import { CreateServerModal } from "features/server/components/CreateServerModal";
import { db } from "lib/db";
import { RedirectType } from "next/dist/client/components/redirect";
import { redirect } from "next/navigation";

const SetupPage = async () => {
  const profile = await initialProfile();

  if (!profile?.profileComplete) {
    return redirect("/complete-profile");
  }

  const server = await db.server.findFirst({
    where: {
      members: {
        some: {
          profileId: profile.id
        }
      }
    }
  });

  if (server) {
    return redirect(`/servers/${server.id}`, RedirectType.push);
  }

  return <CreateServerModal isOpen />;
};

export default SetupPage;
