import { Row, Col, Form, Input, Select, Button, message, Tag, Card, Modal } from "antd";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:4000";

function Parking({ user }) {
    const [parkingData, setParkingData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();


    const showParkingModal = () => {
        setIsModalVisible(true);
    };
    const closeParkVehicleModal = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const fetchParking = async () => {
        try {
            const response = await fetch(`${API_URL}/parking`);
            const data = await response.json();
            console.log("Parking API response:", data);
            if (!response.ok) {
                throw new Error(data.error);
            }
            setParkingData(data);
        } catch (error) {
            message.error(error.message);
            console.error("Fetch parking error:", error);
        }
    };
    useEffect(() => {
        fetchParking();
    }, []);

    useEffect(() => {
        if (location.state?.openParkModal) {
            setIsModalVisible(true);
            navigate(location.pathname, { replace: true, state: null });
        }
    }, [location, navigate]);
    const handleSubmit = async (values) => {
        try {
            setLoading(true);

            const payload = {
                vehicle_number:
                    values.vehicle_number.trim().toUpperCase(),
                vehicle_type: values.vehicle_type,
            };

            console.log("Sending parking data:", payload);

            const response = await fetch(`${API_URL}/parking`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify(payload),
            });

            const responseText = await response.text();

            console.log("Status:", response.status);
            console.log("Backend response:", responseText);

            let data;

            try {
                data = JSON.parse(responseText);
            } catch {
                data = {
                    error: responseText || "Invalid server response",
                };
            }

            if (!response.ok) {
                await fetchParking();
                throw new Error(
                    data.error || `Request failed: ${response.status}`
                );
            }

            message.success("Vehicle parked successfully");

            form.resetFields();
            setIsModalVisible(false);

            await fetchParking();

        } catch (error) {
            console.error("Parking submission failed:", error);

            message.error(
                error.message || "Failed to park vehicle"
            );
        } finally {
            setLoading(false);
        }
    };

    const getSlotStatus = (slotNumber) => {
        return parkingData.some((item) => item.slot_number === slotNumber)
            ? "PARKED"
            : "AVAILABLE";
    };

    const sections = ["A", "B", "C", "D"];
    return (
        <div className="parking-page">
            <h1 className="parking-title">Parking Management System</h1>
            {sections.map(section => (
                <section className="parking-section" key={section}>
                    <h2>Section {section}</h2>
                    <Row gutter={[16, 16]}>
                        {Array.from(
                            { length: 10 },
                            (_, index) => {
                                const slotNumber = `${section}${String(index + 1).padStart(2, "0")}`;
                                const status = getSlotStatus(slotNumber);
                                return (
                                    <Col
                                        xs={12}
                                        sm={8}
                                        md={6}
                                        lg={4}
                                        key={slotNumber}
                                    >
                                        <Card className={`slot ${status === "PARKED" ? "occupied" : "available"}`}>
                                            <h3>{slotNumber}</h3>
                                            <Tag color={status === "PARKED" ? "red" : "green"}>{status}</Tag>
                                        </Card>
                                    </Col>
                                );
                            }
                        )}
                    </Row>
                </section>
            ))}

            <Modal
                title="Park Vehicle"
                open={isModalVisible}
                onCancel={closeParkVehicleModal}
                footer={null}

            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        label="Vehicle number"
                        name="vehicle_number"
                        rules={[
                            {
                                required: true,
                                message: "Enter vehicle number",
                            },
                            {
                                pattern: /^[A-Za-z]{2}\d{1,2}[A-Za-z]{1,3}\d{1,4}$/,
                                message: "Enter a valid vehicle number",
                            },
                        ]}
                    >
                        <Input placeholder="KA03AB1765" />
                    </Form.Item>
                    <Form.Item
                        label="Vehicle Type"
                        name="vehicle_type"
                        rules={[
                            {
                                required: true,
                                message: "Select vehicle type",
                            },
                        ]}
                    >
                        <Select>
                            <Select.Option value="Car">Car</Select.Option>
                            <Select.Option value="Bike">Bike</Select.Option>
                        </Select>
                    </Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Park vehicle
                    </Button>
                    <Button type="primary" onClick={closeParkVehicleModal} style={{ marginRight: "8px" }}>
                        Login
                    </Button>
                </Form>
            </Modal>
        </div >
    );
}
export default Parking;