import React from "react";
import { Button } from "antd";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/solid";

const SidebarHeader = ({
  isMobile,
  collapsed,
  setCollapsed,
  setDrawerVisible,
  onLogout,
  token,
  className,
}) => {
  if (isMobile) {
    return (
      <div
        className={`sidebar-header-sticky ${className || ""}`}
        style={{
          padding: 0,
          background: "#11418b",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Button
          type="text"
          icon={<ChevronRightIcon className="h-5 w-5" />}
          onClick={() => setDrawerVisible && setDrawerVisible(true)}
          style={{
            fontSize: "16px",
            width: 64,
            height: 64,
            marginLeft: "16px",
            color: "#ffffff",
          }}
        />
        {token && (
          <Button
            type="text"
            icon={<ArrowRightOnRectangleIcon className="h-5 w-5" />}
            onClick={onLogout}
            style={{
              fontSize: "16px",
              backgroundColor: "#ff4d4f",
              color: "#ffffff",
              marginRight: "16px",
              display: "flex",
              alignItems: "center",
              fontWeight: "initial",
            }}
          >
            Logout
          </Button>
        )}
      </div>
    );
  }
  // Desktop
  return (
    <div
      className={className}
      style={{
        padding: 0,
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Button
        type="text"
        icon={
          collapsed ? (
            <ChevronRightIcon className="h-5 w-5" />
          ) : (
            <ChevronLeftIcon className="h-5 w-5" />
          )
        }
        onClick={() => setCollapsed && setCollapsed(!collapsed)}
        style={{
          fontSize: "16px",
          width: 64,
          height: 64,
          marginLeft: "16px",
          color: "#000000",
        }}
      />
      {token && (
        <Button
          type="text"
          icon={<ArrowRightOnRectangleIcon className="h-5 w-5" />}
          onClick={onLogout}
          style={{
            fontSize: "16px",
            backgroundColor: "#ff4d4f",
            color: "#ffffff",
            marginRight: "16px",
            display: "flex",
            alignItems: "center",
            fontWeight: "initial",
          }}
        >
          Logout
        </Button>
      )}
    </div>
  );
};

export default SidebarHeader;
