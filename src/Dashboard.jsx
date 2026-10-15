import { useEffect, useState } from "react";
import { Button, message, Modal, Table, Typography, Form, Input, Select } from "antd";

const { Title } = Typography;
const API_URL = "http://localhost:3000";
const ROLE_API_URL = "http://localhost:4000";

function Dashboard() {
    const [items, setItems] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const response = await fetch(`${API_URL}/users`);
                if (!response.ok) throw new Error("Unable to load users");
                setItems(await response.json());
            } catch (error) {
                message.error(error.message);
            } finally {
                setLoading(false);
            }
        };

        loadUsers();

        fetch(`${ROLE_API_URL}/roles`)
            .then((response) => {
                if (!response.ok) throw new Error("Unable to load roles");
                return response.json();
            })
            .then(setRoles)
            .catch((error) => message.error(error.message));
    }, []);



    const handleAdd = () => {
        setEditingItem(null);
        form.resetFields();
        setIsModalOpen(true);
    };
    const handleEdit = (record) => {
        console.log("EDIT ID:", record.id);
        console.log("EDIT URL:", `${API_URL}/users/${record.id}`);

        setEditingItem(record);

        setIsModalOpen(true);

        form.setFieldsValue({
            name: record.name,
            description: record.description,
            role_id: Number(record.role_id),
            gender: record.gender,
            age: record.age
        });
    };
    const handleCancel = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        form.resetFields();
    };

    const handleSubmit = async (values) => {
        setSaving(true);
        const isEditing = Boolean(editingItem);

        try {
            const response = await fetch(
                isEditing
                    ? `${API_URL}/users/${editingItem.id}`
                    : `${API_URL}/users`,
                {
                    method: isEditing ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(values),
                }
            );

            if (!response.ok)
                throw new Error("Unable to save user");

            const savedItem = await response.json();

            setItems((prev) =>
                isEditing
                    ? prev.map((item) =>
                        item.id === savedItem.id
                            ? savedItem
                            : item
                    )
                    : [...prev, savedItem]
            );

            message.success(
                isEditing ? "User updated" : "User added"
            );

            handleCancel();

        } catch (error) {
            message.error(error.message);

        } finally {
            setSaving(false);
        }
    };
    const columns = [
        { title: "Name", dataIndex: "name", key: "name" },
        { title: "Description", dataIndex: "description", key: "description" },
        { title: "Role ID", dataIndex: "role_id", key: "role_id" },
        { title: "Gender", dataIndex: "gender", key: "gender" },
        { title: "Age", dataIndex: "age", key: "age" },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
            ),
        },
    ];


    return (
        <div className="dashboard">
            <Title level={1}>welcome dashboard</Title>
            <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
                <h2>Items</h2>
                <Button type="primary" onClick={handleAdd}>
                    Add Item
                </Button>
            </div>
            <Table
                columns={columns}
                dataSource={items}
                rowKey="id"
                loading={loading}
            />
            <Modal
                title={editingItem ? "Edit Item" : "Add Item"}
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
            >
                <Form form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{ required: true, message: "pls enter a name", },

                        ]}
                    >
                        <Input placeholder="enter name" />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{
                            required: true, message: "Enter a description",

                        },
                        ]}
                    >
                        <Input placeholder="Enter description" />
                    </Form.Item>
                    <Form.Item
                        name="role_id"
                        label="Role Name"
                        rules={[
                            {
                                required: true, message: "Please select a role",

                            },
                        ]}
                    >
                        <Select
                            placeholder="Select a role"
                            options={roles.map((role) => ({
                                label: role.role_name,
                                value: Number(role.id),
                            }))}
                        />
                    </Form.Item>
                    <Form.Item
                        name="gender"
                        label="Gender"
                        rules={[
                            { required: true, message: "Please enter the gender" }
                        ]}
                    >
                        <Input placeholder="Enter gender" />

                    </Form.Item>
                    <Form.Item
                        name="age"
                        label="Age"
                        rules={[
                            { required: true, message: "please enter the age" }
                        ]}
                    >
                        <Input placeholder="Enter age" />

                    </Form.Item>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "10px",
                        }}
                    >
                        <Button onClick={handleCancel}
                        >
                            cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={saving}
                        >
                            {editingItem ? "Update" : "Save"}
                        </Button>
                    </div>
                </Form>
            </Modal>

        </div>
    );
}

export default Dashboard;