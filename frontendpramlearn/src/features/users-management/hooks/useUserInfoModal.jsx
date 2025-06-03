import { useState } from "react";

const useUserInfoModal = () => {
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const showInfoModal = (user) => {
    setSelectedUser(user);
    setInfoModalVisible(true);
  };

  const closeInfoModal = () => {
    setInfoModalVisible(false);
    setSelectedUser(null);
  };

  return {
    infoModalVisible,
    selectedUser,
    showInfoModal,
    closeInfoModal,
  };
};

export default useUserInfoModal;
