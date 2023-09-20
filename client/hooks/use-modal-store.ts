import { Channel, ChannelType, Server } from "@prisma/client";
import { create } from "zustand";

export type ModalType =
  | "createServer"
  | "editServer"
  | "leaveServer"
  | "deleteServer"
  | "createChannel"
  | "editChannel"
  | "deleteChannel"
  | "invite"
  | "members";

type ModalData = {
  server?: Server;
  channel?: Channel;
  channelType?: ChannelType;
};

type ModalStore = {
  type: ModalType | null;
  data: ModalData;
  isOpen: boolean;
  onOpen: (type: ModalType, data?: ModalData) => void;
  onClose: () => void;
};

export const useModal = create<ModalStore>(set => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (type, data = {}) => set({ isOpen: true, type, data }),
  onClose: () => {
    set({ isOpen: false, type: null });
    setTimeout(() => {
      document.body.style.pointerEvents = "unset";
    }, 500);
  }
}));
