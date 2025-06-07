import { useState } from "react";
import api from "../../../api";
import Swal from "sweetalert2";

const useGroupFormation = (materialId, onGroupsChanged) => {
  const [groupMessage, setGroupMessage] = useState("");
  const [groupProcessing, setGroupProcessing] = useState(false);

  const handleAutoGroup = async (mode) => {
    setGroupProcessing(true);
    setGroupMessage("Processing...");

    try {
      const response = await api.post(`materials/${materialId}/auto-group/`, {
        n_clusters: 3,
        mode,
      });
      setGroupMessage(response.data.message);
      if (onGroupsChanged) onGroupsChanged();
    } catch (error) {
      if (error.response?.status === 409) {
        const result = await Swal.fire({
          title: "Kelompok sudah ada!",
          text: "Kelompok untuk materi ini sudah ada. Apakah Anda ingin menimpa kelompok yang sudah ada?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Timpa",
          cancelButtonText: "Batal",
        });

        if (result.isConfirmed) {
          await handleForceOverwrite(mode);
        } else {
          setGroupMessage("Pembuatan kelompok dibatalkan.");
        }
      } else {
        setGroupMessage(
          error.response?.data?.error || "Gagal membentuk kelompok."
        );
      }
    } finally {
      setGroupProcessing(false);
    }
  };

  const handleForceOverwrite = async (mode) => {
    try {
      const response = await api.post(`materials/${materialId}/auto-group/`, {
        n_clusters: 3,
        mode,
        force_overwrite: true,
      });
      setGroupMessage(response.data.message);
      if (onGroupsChanged) onGroupsChanged();
    } catch (err) {
      setGroupMessage(err.response?.data?.error || "Gagal membentuk kelompok.");
    }
  };

  return {
    groupMessage,
    groupProcessing,
    handleAutoGroup,
  };
};

export default useGroupFormation;
