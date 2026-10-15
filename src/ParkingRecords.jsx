import { useCallback, useEffect, useState } from "react";
import { Table, Tag, message, Button, Popconfirm } from "antd";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:4000";

function ParkingRecords({ user }) {
    const [parkingData, setParkingData] = useState([]);
    const [exitingId, setExitingId] = useState(null);
    const navigate = useNavigate();
    const canExit = user.permissions?.includes("EXIT_PARKING");

    const fetchParkingData = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/parking-records`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            const data = await response.json();
            console.log("Parking API response:", data);
            if (!response.ok || !Array.isArray(data)) {
                throw new Error(data.error || "Invalid parking records response");
            }
            setParkingData(data);
        } catch (error) {
            setParkingData([]);
            message.error(error.message || "Failed to fetch parking records");
        }
    }, [user.token]);

    useEffect(() => {
        fetchParkingData();
    }, [fetchParkingData]);

    const handleExit = async (record) => {
        setExitingId(record.id);
        try {
            const response = await fetch(`${API_URL}/parking/${record.id}/exit`, {
                method: "POST",
                headers: { Authorization: `Bearer ${user.token}` },
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to record vehicle exit");
            }
            message.success(data.message || "Vehicle exit recorded");
            await fetchParkingData();
        } catch (error) {
            message.error(error.message || "Failed to record vehicle exit");
        } finally {
            setExitingId(null);
        }
    };

    const columns = [
        {
            title: "Vehicle Number",
            dataIndex: "vehicle_number",
            key: "vehicle_number",
        },
        {
            title: "Vehicle Type",
            dataIndex: "vehicle_type",
            key: "vehicle_type",
        },
        {
            title: "Entry Time",
            dataIndex: "entry_time",
            key: "entry_time",
            render: (value) =>
                new
                    Date(value).toLocaleString()
        },
        {
            title: "Exit Time",
            dataIndex: "exit_time",
            key: "exit_time",
            render: (value) =>
                value ? new Date(value).toLocaleString() : "not exited",
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (value) => (
                <Tag color={value === "PARKED" ? "red" : "green"}>
                    {value}
                </Tag>
            ),
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => record.exit_time || !canExit ? "-" : (
                <Popconfirm
                    title={`Exit ${record.vehicle_number}?`}
                    onConfirm={() => handleExit(record)}
                    okText="Confirm exit"
                    cancelText="Cancel"
                >
                    <Button danger loading={exitingId === record.id}>
                        Exit
                    </Button>
                </Popconfirm>
            ),
        },
    ];

    return (
        <div className="parking-page">
            <div className="parking-actions">
                <Button
                    type="primary"
                    onClick={() => navigate("/parking", { state: { openParkModal: true } })}
                >
                    + Park vehicle
                </Button>
            </div>
            <Table
                columns={columns}
                dataSource={parkingData}
                rowKey="id"
            />
        </div>
    );
}

export default ParkingRecords;