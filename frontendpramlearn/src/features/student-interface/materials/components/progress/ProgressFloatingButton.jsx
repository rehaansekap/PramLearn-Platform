import React, { useState, useEffect } from "react";
import { Button, Badge } from "antd";
import { TrophyOutlined, FireOutlined, CloseOutlined } from "@ant-design/icons";

const ProgressFloatingButton = ({
  progressPercent,
  onClick,
  getProgressColor,
  isOpen = false,
}) => {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    // Hanya pulse jika card tidak terbuka
    if (!isOpen) {
      const interval = setInterval(() => {
        setPulse(true);
        setTimeout(() => setPulse(false), 1000);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 1000,
      }}
    >
      <div
        style={{
          position: "relative",
          display: "inline-block",
        }}
      >
        {/* Pulse Animation Ring - hanya muncul jika card tidak terbuka */}
        {pulse && !isOpen && (
          <div
            style={{
              position: "absolute",
              top: -8,
              left: -8,
              right: -8,
              bottom: -8,
              borderRadius: "50%",
              border: `3px solid ${getProgressColor(progressPercent)}`,
              animation: "pulse 1s ease-out",
              opacity: 0,
            }}
          />
        )}

        <Badge
          count={
            // Hanya tampilkan badge jika card tidak terbuka
            !isOpen ? (
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
                  color: "white",
                  fontSize: 11,
                  padding: "4px 8px",
                  borderRadius: 12,
                  fontWeight: 600,
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                  border: "2px solid white",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <FireOutlined style={{ fontSize: 10 }} />
                {progressPercent}%
              </div>
            ) : null
          }
          offset={[-12, 12]}
        >
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={isOpen ? <CloseOutlined /> : <TrophyOutlined />}
            onClick={onClick}
            style={{
              width: 64,
              height: 64,
              fontSize: 24,
              background: isOpen
                ? "linear-gradient(135deg, #ff4757 0%, #ff3742 100%)"
                : "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
              border: "none",
              boxShadow: isOpen
                ? "0 8px 24px rgba(255, 71, 87, 0.4), 0 4px 12px rgba(0, 0, 0, 0.1)"
                : "0 8px 24px rgba(102, 126, 234, 0.4), 0 4px 12px rgba(0, 0, 0, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = isOpen
                ? "scale(1.1) translateY(-2px) rotate(90deg)"
                : "scale(1.1) translateY(-2px) rotate(0deg)";
              e.currentTarget.style.boxShadow = isOpen
                ? "0 12px 32px rgba(255, 71, 87, 0.5), 0 6px 16px rgba(0, 0, 0, 0.15)"
                : "0 12px 32px rgba(102, 126, 234, 0.5), 0 6px 16px rgba(0, 0, 0, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = isOpen
                ? "scale(1) translateY(0) rotate(90deg)"
                : "scale(1) translateY(0) rotate(0deg)";
              e.currentTarget.style.boxShadow = isOpen
                ? "0 8px 24px rgba(255, 71, 87, 0.4), 0 4px 12px rgba(0, 0, 0, 0.1)"
                : "0 8px 24px rgba(102, 126, 234, 0.4), 0 4px 12px rgba(0, 0, 0, 0.1)";
            }}
          />
        </Badge>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ProgressFloatingButton;
