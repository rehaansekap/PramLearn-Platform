import { useEffect, useRef } from "react";

const useAttendanceWebSocket = (materialId, onAttendanceUpdate) => {
  const ws = useRef(null);

  useEffect(() => {
    if (!materialId) return;

    // Create WebSocket connection
    const wsUrl = `ws://localhost:8000/ws/attendance/${materialId}/`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log(
        `Connected to attendance WebSocket for material ${materialId}`
      );
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "attendance_update") {
        onAttendanceUpdate(data);
      }
    };

    ws.current.onclose = () => {
      console.log(
        `Disconnected from attendance WebSocket for material ${materialId}`
      );
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [materialId, onAttendanceUpdate]);

  const sendAttendanceUpdate = (studentId, status, updatedBy, updatedAt) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: "attendance_update",
          student_id: studentId,
          status: status,
          updated_by: updatedBy,
          updated_at: updatedAt,
        })
      );
    }
  };

  return { sendAttendanceUpdate };
};

export default useAttendanceWebSocket;
