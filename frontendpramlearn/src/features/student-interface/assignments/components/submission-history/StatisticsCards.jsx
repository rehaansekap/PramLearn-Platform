import React from "react";
import { Card, Statistic, Row, Col } from "antd";
import {
  ClockCircleOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  StarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

const StatisticsCards = ({
  submissionDetails,
  assignment,
  latestSubmission,
  isMobile,
}) => {
  const getWorkDuration = (startTime, submitTime) => {
    if (!startTime || !submitTime) return "Tidak diketahui";

    const start = dayjs(startTime);
    const submit = dayjs(submitTime);
    const dur = dayjs.duration(submit.diff(start));

    const hours = dur.hours();
    const minutes = dur.minutes();

    if (hours > 0) {
      return `${hours} jam ${minutes} menit`;
    }
    return `${minutes} menit`;
  };

  const statisticsData = [
    // {
    //   title: "Waktu Pengerjaan",
    //   value:
    //     submissionDetails?.work_duration ||
    //     getWorkDuration(
    //       latestSubmission?.start_time,
    //       latestSubmission?.submission_date
    //     ),
    //   prefix: <ClockCircleOutlined style={{ color: "#1890ff" }} />,
    //   color: "#1890ff",
    // },
    {
      title: "Peringkat",
      value: submissionDetails?.rank || "-",
      suffix: submissionDetails?.total_participants
        ? `/ ${submissionDetails.total_participants}`
        : "",
      prefix: <TrophyOutlined style={{ color: "#52c41a" }} />,
      color: "#52c41a",
    },
    {
      title: "Jawaban Benar",
      value: submissionDetails?.correct_answers || 0,
      suffix: `/ ${
        submissionDetails?.total_questions || assignment?.questions?.length || 0
      }`,
      prefix: <CheckCircleOutlined style={{ color: "#faad14" }} />,
      color: "#faad14",
    },
    {
      title: "Persentase Benar",
      value:
        submissionDetails?.correct_answers && submissionDetails?.total_questions
          ? (
              (submissionDetails.correct_answers /
                submissionDetails.total_questions) *
              100
            ).toFixed(1)
          : "0.0",
      suffix: "%",
      prefix: <StarOutlined style={{ color: "#722ed1" }} />,
      color: "#722ed1",
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      {statisticsData.map((stat, index) => (
        <Col xs={24} sm={8} md={8} lg={8} key={index}>
          <Card
            style={{
              borderRadius: 12,
              textAlign: "center",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Statistic
              title={stat.title}
              value={stat.value}
              suffix={stat.suffix}
              prefix={stat.prefix}
              valueStyle={{
                color: stat.color,
                fontSize: isMobile ? 16 : 20,
              }}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default StatisticsCards;
