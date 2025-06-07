import React from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const AppLoading = () => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      {/* Logo atau Brand */}
      <div
        style={{
          marginBottom: 32,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #11418b 0%, #1890ff 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 32px rgba(17, 65, 139, 0.3)",
          }}
        >
          <span style={{ color: "#fff", fontSize: 24, fontWeight: 700 }}>
            P
          </span>
        </div>
        <div>
          <h1
            style={{
              color: "#fff",
              fontSize: 32,
              fontWeight: 700,
              margin: 0,
              textShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            PramLearn
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.8)",
              fontSize: 14,
              margin: 0,
            }}
          >
            Platform Pembelajaran Cerdas
          </p>
        </div>
      </div>

      {/* Custom Loading Animation */}
      <div
        style={{
          position: "relative",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            border: "4px solid rgba(255,255,255,0.2)",
            borderTop: "4px solid #fff",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 40,
            height: 40,
            background: "rgba(255,255,255,0.2)",
            borderRadius: "50%",
            animation: "pulse 2s ease-in-out infinite",
          }}
        />
      </div>

      {/* Loading Text */}
      <div style={{ textAlign: "center" }}>
        <p
          style={{
            color: "#fff",
            fontSize: 18,
            fontWeight: 500,
            margin: "0 0 8px 0",
            animation: "fadeInOut 2s ease-in-out infinite",
          }}
        >
          Memuat aplikasi...
        </p>
        <p
          style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: 14,
            margin: 0,
          }}
        >
          Mohon tunggu sebentar
        </p>
      </div>

      {/* Progress Dots */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 32,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#fff",
              animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite both`,
            }}
          />
        ))}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.7;
          }
        }

        @keyframes fadeInOut {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default AppLoading;
