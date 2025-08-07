import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  Form,
  Input,
  Checkbox,
  Button,
  Typography,
  Space,
  Tag,
  Spin,
  Avatar,
} from "antd";
import {
  UserOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { fetchTestDetail } from "../../api/request.api";

const { Title, Text, Paragraph } = Typography;

export default function TestForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, testDetail } = location.state || {};
  const [form] = Form.useForm();

  const {
    data: testDetailData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["testDetail", token],
    queryFn: () => fetchTestDetail(token!),
    enabled: !!token,
    retry: 1,
  });

  const currentTestDetail = testDetail || testDetailData;

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
  }, [token, navigate]);

  const handleStartTest = (values: any) => {
    sessionStorage.setItem("studentName", values.fullName);
    sessionStorage.setItem("testToken", token);
    navigate("/quiz");
  };

  if (!token) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <Card
          style={{
            maxWidth: 500,
            width: "100%",
            borderRadius: "16px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            border: "none",
          }}
        >
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <Avatar
              size={64}
              style={{
                backgroundColor: "#ff4d4f",
                marginBottom: "16px",
              }}
              icon={<ExclamationCircleOutlined />}
            />
            <Title level={3} style={{ color: "#ff4d4f", marginBottom: "8px" }}>
              ❌ Xatolik
            </Title>
            <Paragraph style={{ color: "#666", fontSize: "16px" }}>
              Test havolasi topilmadi. Iltimos, o'qituvchingizdan to'g'ri
              havolani so'rang.
            </Paragraph>
          </div>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Card
          style={{
            padding: "40px",
            borderRadius: "16px",
            border: "none",
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <Spin size="large" />
            <Title level={4} style={{ marginTop: "16px", color: "#666" }}>
              Test ma'lumotlari yuklanmoqda...
            </Title>
          </div>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <Card
          style={{
            maxWidth: 500,
            width: "100%",
            borderRadius: "16px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            border: "none",
          }}
        >
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <Avatar
              size={64}
              style={{
                backgroundColor: "#ff4d4f",
                marginBottom: "16px",
              }}
              icon={<ExclamationCircleOutlined />}
            />
            <Title level={3} style={{ color: "#ff4d4f", marginBottom: "8px" }}>
              ❌ Xatolik
            </Title>
            <Paragraph
              style={{ color: "#666", fontSize: "16px", marginBottom: "8px" }}
            >
              Test ma'lumotlarini yuklashda xatolik yuz berdi.
            </Paragraph>
            <Text type="secondary">Iltimos, qaytadan urinib ko'ring.</Text>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Card
        style={{
          maxWidth: 600,
          width: "100%",
          borderRadius: "20px",
          boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
          border: "none",
          overflow: "hidden",
        }}
      >
        {/* Header Section */}
        <div
          style={{
            background: "linear-gradient(135deg, #63a3df 0%, #ae96d0 100%)",
            margin: "-24px -24px 24px -24px",
            padding: "32px 24px",
            textAlign: "center",
            color: "white",
          }}
        >
          <Avatar
            size={120}
            src="http://38.242.205.107:5050/src/assets/images/nw.png"
            style={{
              marginBottom: "16px",
              backdropFilter: "blur(10px)",
            }}
          />

          <Title level={2} style={{ color: "white", marginBottom: "8px" }}>
            {currentTestDetail?.name || "English Tests"}
          </Title>

          <Space wrap style={{ marginBottom: "16px" }}>
            <Tag
              color="blue"
              style={{
                padding: "4px 12px",
                borderRadius: "20px",
                border: "none",
                backgroundColor: "rgba(255,255,255,0.2)",
                color: "white",
              }}
            >
              {currentTestDetail?.subject_name || "Ingliz tili"}
            </Tag>
            <Tag
              color="purple"
              style={{
                padding: "4px 12px",
                borderRadius: "20px",
                border: "none",
                backgroundColor: "rgba(255,255,255,0.2)",
                color: "white",
              }}
            >
              {currentTestDetail?.group_name || "Unique"}
            </Tag>
          </Space>
        </div>

        <Paragraph
          style={{
            textAlign: "center",
            color: "#666",
            fontSize: "16px",
            marginBottom: "32px",
          }}
        >
          Testni boshlashdan oldin ism-familiyangizni kiriting va qoidalarga
          rozilik bildiring.
        </Paragraph>

        {/* Form Section */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleStartTest}
          size="large"
        >
          <Form.Item
            name="fullName"
            label={
              <Text strong style={{ fontSize: "16px" }}>
                <UserOutlined
                  style={{ marginRight: "8px", color: "#1890ff" }}
                />
                To'liq ismingiz
              </Text>
            }
            rules={[
              { required: true, message: "Iltimos, ismingizni kiriting!" },
              {
                min: 3,
                message: "Ism kamida 3 ta belgidan iborat bo'lishi kerak!",
              },
            ]}
          >
            <Input
              placeholder="Ism va familiyangizni kiriting"
              style={{
                borderRadius: "12px",
                padding: "12px 16px",
                fontSize: "16px",
                border: "2px solid #d9d9d9",
              }}
              suffix={<UserOutlined style={{ color: "#bfbfbf" }} />}
            />
          </Form.Item>

          <Form.Item
            name="agreement"
            valuePropName="checked"
            rules={[
              {
                required: true,
                message: "Qoidalarga rozilik bildirish majburiy!",
              },
            ]}
          >
            <Card
              size="small"
              style={{
                background: "#fafafa",
                borderRadius: "12px",
                border: "1px solid #e8e8e8",
              }}
            >
              <Checkbox style={{ fontSize: "15px", lineHeight: "1.6" }}>
                <Text>
                  Men test qoidalari bilan tanishdim va halol test ishlashga
                  va'da beraman
                </Text>
              </Checkbox>
            </Card>
          </Form.Item>

          <Form.Item style={{ marginBottom: "16px" }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              style={{
                height: "56px",
                borderRadius: "12px",
                fontSize: "18px",
                fontWeight: "bold",
                background: "linear-gradient(135deg, #1890ff 0%, #722ed1 100%)",
                border: "none",
                boxShadow: "0 8px 20px rgba(24, 144, 255, 0.3)",
              }}
            >
              Testni boshlash
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
