import React from "react";
import { Divider, Typography } from "antd";
import AssignmentRubricItem from "./AssignmentRubricItem";

const { Text } = Typography;

const AssignmentRubricSection = ({ rubric_items }) =>
  rubric_items && rubric_items.length > 0 ? (
    <>
      <Divider orientation="left">
        <Text strong>Kriteria Penilaian</Text>
      </Divider>
      <div style={{ marginBottom: 24 }}>
        {rubric_items.map((item) => (
          <AssignmentRubricItem item={item} key={item.id} />
        ))}
      </div>
    </>
  ) : null;

export default AssignmentRubricSection;
