import React, { useState, useEffect, useContext } from "react";
import { Grid } from "antd";
import { AuthContext } from "../../../../../../context/AuthContext";
import { useOnlineStatus } from "../../../../../../context/OnlineStatusContext";
import useGroupChat from "../../../../materials/hooks/useGroupChat";
import GroupChatFloatingButton from "./GroupChatFloatingButton";
import GroupChatCard from "./GroupChatCard";
import GroupChatDrawer from "./GroupChatDrawer";

const { useBreakpoint } = Grid;

const GroupQuizChatManager = ({ materialSlug }) => {
  const { user } = useContext(AuthContext);
  const { isUserOnline } = useOnlineStatus();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [chatOpen, setChatOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const {
    loading,
    groupInfo,
    members,
    messages,
    wsConnected,
    typingUsers,
    onlineUsers,
    sendMessage,
    handleTyping,
    manualRefresh,
    forceReconnect,
  } = useGroupChat(materialSlug);

  // Calculate unread messages (simple implementation)
  useEffect(() => {
    if (!chatOpen && messages.length > 0) {
      // Count messages from others that arrived while chat was closed
      const otherMessages = messages.filter((msg) => !msg.is_current_user);
      // This is a simplified version - in real app you'd track read status
      setUnreadCount(
        otherMessages.length > 0 ? Math.min(otherMessages.length, 99) : 0
      );
    } else if (chatOpen) {
      setUnreadCount(0);
    }
  }, [messages, chatOpen]);

  const handleChatToggle = () => {
    if (chatOpen) {
      setClosing(true);
      setTimeout(() => {
        setChatOpen(false);
        setClosing(false);
      }, 350); // durasi animasi
    } else {
      setChatOpen(true);
    }
  };

  const handleChatClose = () => {
    setClosing(true);
    setTimeout(() => {
      setChatOpen(false);
      setClosing(false);
    }, 350);
  };

  const commonProps = {
    loading,
    groupInfo,
    members,
    messages,
    wsConnected,
    typingUsers,
    onlineUsers,
    sendMessage,
    handleTyping,
    manualRefresh,
    forceReconnect,
    user,
    isUserOnline,
  };

  return (
    <>
      <GroupChatFloatingButton
        onClick={handleChatToggle}
        isOpen={chatOpen}
        unreadCount={unreadCount}
        wsConnected={wsConnected}
      />

      {isMobile ? (
        <GroupChatDrawer
          open={chatOpen}
          onClose={handleChatClose}
          closing={closing}
          {...commonProps}
        />
      ) : (
        chatOpen && (
          <GroupChatCard
            onClose={handleChatClose}
            closing={closing}
            {...commonProps}
          />
        )
      )}
    </>
  );
};

export default GroupQuizChatManager;
