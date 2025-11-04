import React from "react";
import { Card, List, Empty, Typography } from "antd";
import ARCSCard from "./ARCSCard";
import useARCSTimer from "../../../hooks/useARCSTimer";

const { Text } = Typography;

const ARCSGrid = ({
  filteredQuestionnaires,
  materialSlug,
  getARCSStatus,
  isMobile,
  searchText,
  statusFilter,
}) => {
  const { getTimeRemaining: getARCSTimeRemaining } = useARCSTimer();
  return (
    <>
      {filteredQuestionnaires.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 24px" }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <Text style={{ fontSize: 16, color: "#666" }}>
                  {searchText || statusFilter !== "all"
                    ? "Tidak ada kuesioner yang sesuai dengan filter"
                    : "Belum ada kuesioner ARCS tersedia"}
                </Text>
                <div style={{ marginTop: 12 }}>
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    {searchText || statusFilter !== "all"
                      ? "Coba ubah kata kunci pencarian atau filter"
                      : "Kuesioner akan tersedia setelah ditambahkan oleh guru"}
                  </Text>
                </div>
              </div>
            }
          />
        </div>
      ) : (
        <List
          grid={{
            gutter: 16,
            xs: 1,
            sm: 1,
            md: 1,
            lg: 2,
            xl: 2,
            xxl: 2,
          }}
          dataSource={filteredQuestionnaires}
          renderItem={(questionnaire) => {
            const status = getARCSStatus(questionnaire);
            const timeRemaining = getARCSTimeRemaining(
              questionnaire.available_until
            );

            return (
              <List.Item>
                <ARCSCard
                  questionnaire={questionnaire}
                  materialSlug={materialSlug}
                  status={status}
                  timeRemaining={timeRemaining}
                  isMobile={isMobile}
                />
              </List.Item>
            );
          }}
        />
      )}
    </>
  );
};

export default ARCSGrid;
