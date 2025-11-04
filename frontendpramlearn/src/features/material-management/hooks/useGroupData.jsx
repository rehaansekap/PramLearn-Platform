import { useState, useEffect } from "react";
import api from "../../../api";

const useGroupData = (materialId) => {
  const [groups, setGroups] = useState([]);
  const [groupMembers, setGroupMembers] = useState({});
  const [loading, setLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false); 

  const fetchGroups = async () => {
    if (!materialId) return;

    setLoading(true);
    try {
      const res = await api.get(`groups/?material=${materialId}`);
      setGroups(res.data);
    } catch (error) {
      console.error("Error fetching groups:", error);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [materialId]);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!groups || groups.length === 0) {
        setGroupMembers({});
        return;
      }

      setMembersLoading(true);
      try {
        const allMembers = {};

        // Fetch members untuk setiap group secara parallel
        const memberPromises = groups.map(async (group) => {
          try {
            // Cek apakah group sudah memiliki members data
            if (group.members && group.members.length > 0) {
              const memberDetails = await Promise.all(
                group.members.map(async (member) => {
                  try {
                    const res = await api.get(`students/${member.student}/`);
                    return res.data;
                  } catch {
                    return { username: "Unknown", id: member.student };
                  }
                })
              );
              allMembers[group.id] = memberDetails;
            } else {
              allMembers[group.id] = [];
            }
          } catch (error) {
            console.error(
              `Error fetching members for group ${group.id}:`,
              error
            );
            allMembers[group.id] = [];
          }
        });

        await Promise.all(memberPromises);
        setGroupMembers(allMembers);
      } catch (error) {
        console.error("Error fetching group members:", error);
        setGroupMembers({});
      } finally {
        setMembersLoading(false);
      }
    };

    fetchMembers();
  }, [groups]);

  // Gabungkan loading states
  const isLoading = loading || membersLoading;

  return {
    groups,
    groupMembers,
    fetchGroups,
    loading: isLoading,
    groupsLoading: loading,
    membersLoading,
  };
};

export default useGroupData;
