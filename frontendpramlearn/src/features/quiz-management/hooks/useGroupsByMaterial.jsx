import { useEffect, useState } from "react";
import api from "../../../api";

const useGroupsByMaterial = (materialId) => {
  const [groups, setGroups] = useState([]);
  useEffect(() => {
    if (!materialId) return;
    api
      .get(`groups/?material=${materialId}`)
      .then((res) => setGroups(res.data));
  }, [materialId]);
  return groups;
};

export default useGroupsByMaterial;
