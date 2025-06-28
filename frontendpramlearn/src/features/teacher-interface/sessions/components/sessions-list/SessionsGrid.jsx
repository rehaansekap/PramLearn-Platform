import React from "react";
import { Row, Col } from "antd";
import SessionCard from "./SessionCard";
import './styles/styles.css'

const SessionsGrid = ({ sessions, onSessionClick, isMobile }) => {
  return (
    <Row gutter={[16, 16]}>
      {sessions.map((session) => (
        <Col key={session.id} xs={24} sm={12} md={12} lg={8} xl={6}>
          <SessionCard
            session={session}
            onClick={onSessionClick}
            isMobile={isMobile}
          />
        </Col>
      ))}
    </Row>
  );
};

export default SessionsGrid;
