import React, { useState } from "react";
import {
  Card,
  Switch,
  Typography,
  Space,
  Button,
  Divider,
  Select,
  TimePicker,
  Form,
  Row,
  Col,
  message,
} from "antd";
import {
  MailOutlined,
  BellOutlined,
  ClockCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

const NotificationSettings = ({ settings, onUpdateSettings }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSettingsChange = async (changedFields, allFields) => {
    setLoading(true);
    try {
      const newSettings = {};
      allFields.forEach((field) => {
        newSettings[field.name[0]] = field.value;
      });

      await onUpdateSettings(newSettings);
    } catch (error) {
      message.error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Form
        form={form}
        layout="vertical"
        initialValues={settings}
        onValuesChange={handleSettingsChange}
      >
        {/* Email Notifications */}
        <Card style={{ marginBottom: 16 }}>
          <Title level={4}>
            <MailOutlined style={{ marginRight: 8, color: "#1890ff" }} />
            Email Notifications
          </Title>
          <Text type="secondary">
            Choose when you want to receive email notifications
          </Text>
          <Divider />

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item name="email_grades" valuePropName="checked">
                <Space>
                  <Switch loading={loading} />
                  <div>
                    <Text strong>Grade Updates</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Get notified when grades are posted
                    </Text>
                  </div>
                </Space>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item name="email_deadlines" valuePropName="checked">
                <Space>
                  <Switch loading={loading} />
                  <div>
                    <Text strong>Assignment Deadlines</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Reminders for upcoming deadlines
                    </Text>
                  </div>
                </Space>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item name="email_announcements" valuePropName="checked">
                <Space>
                  <Switch loading={loading} />
                  <div>
                    <Text strong>Announcements</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Important announcements from teachers
                    </Text>
                  </div>
                </Space>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item name="email_quiz_results" valuePropName="checked">
                <Space>
                  <Switch loading={loading} />
                  <div>
                    <Text strong>Quiz Results</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Get notified about quiz scores
                    </Text>
                  </div>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Push Notifications */}
        <Card style={{ marginBottom: 16 }}>
          <Title level={4}>
            <BellOutlined style={{ marginRight: 8, color: "#52c41a" }} />
            Browser Notifications
          </Title>
          <Text type="secondary">Real-time notifications in your browser</Text>
          <Divider />

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item name="push_notifications" valuePropName="checked">
                <Space>
                  <Switch loading={loading} />
                  <div>
                    <Text strong>Enable Push Notifications</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Show notifications even when tab is not active
                    </Text>
                  </div>
                </Space>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item name="sound_notifications" valuePropName="checked">
                <Space>
                  <Switch loading={loading} />
                  <div>
                    <Text strong>Sound Alerts</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Play sound for important notifications
                    </Text>
                  </div>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Digest Settings */}
        <Card style={{ marginBottom: 16 }}>
          <Title level={4}>
            <ClockCircleOutlined style={{ marginRight: 8, color: "#faad14" }} />
            Digest Settings
          </Title>
          <Text type="secondary">
            Schedule summary emails and notifications
          </Text>
          <Divider />

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item name="daily_digest" valuePropName="checked">
                <Space>
                  <Switch loading={loading} />
                  <div>
                    <Text strong>Daily Digest</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Daily summary of activities and deadlines
                    </Text>
                  </div>
                </Space>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item name="digest_time" label="Digest Time">
                <TimePicker
                  format="HH:mm"
                  placeholder="Select time"
                  disabled={!form.getFieldValue("daily_digest")}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item name="weekly_summary" valuePropName="checked">
                <Space>
                  <Switch loading={loading} />
                  <div>
                    <Text strong>Weekly Summary</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Weekly progress and upcoming events
                    </Text>
                  </div>
                </Space>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item name="summary_day" label="Summary Day">
                <Select
                  placeholder="Select day"
                  disabled={!form.getFieldValue("weekly_summary")}
                  style={{ width: "100%" }}
                >
                  <Option value="monday">Monday</Option>
                  <Option value="friday">Friday</Option>
                  <Option value="sunday">Sunday</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Advanced Settings */}
        <Card>
          <Title level={4}>
            <SettingOutlined style={{ marginRight: 8, color: "#722ed1" }} />
            Advanced Settings
          </Title>
          <Text type="secondary">Fine-tune your notification preferences</Text>
          <Divider />

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="deadline_reminder_days"
                label="Deadline Reminder (days before)"
              >
                <Select style={{ width: "100%" }}>
                  <Option value={1}>1 day</Option>
                  <Option value={2}>2 days</Option>
                  <Option value={3}>3 days</Option>
                  <Option value={7}>1 week</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="notification_frequency"
                label="Notification Frequency"
              >
                <Select style={{ width: "100%" }}>
                  <Option value="immediate">Immediate</Option>
                  <Option value="hourly">Hourly</Option>
                  <Option value="daily">Daily</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item name="do_not_disturb" valuePropName="checked">
                <Space>
                  <Switch loading={loading} />
                  <div>
                    <Text strong>Do Not Disturb Mode</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Pause all notifications during study hours (9 PM - 6 AM)
                    </Text>
                  </div>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
    </div>
  );
};

export default NotificationSettings;
