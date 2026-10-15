import { useCallback, useEffect, useState } from "react";
import {
    Button,
    Modal,
    Select,
    Checkbox,
    Typography,
    message,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";

const API_URL = "http://localhost:4000";

function ModulePermission() {
    const [open, setOpen] = useState(false);
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [roleId, setRoleId] = useState(null);
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [saving, setSaving] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const [rolesRes, permissionRes] = await Promise.all([
                fetch(`${API_URL}/roles`),
                fetch(`${API_URL}/permissions`),
            ]);

            if (!rolesRes.ok || !permissionRes.ok) {
                throw new Error("Unable to load data");
            }

            const rolesData = await rolesRes.json();
            const permissionData = await permissionRes.json();
            setRoles(rolesData);
            setPermissions(permissionData);
        } catch {
            message.error("Failed to load roles or permissions");
        }
    }, []);

    useEffect(() => {
        void Promise.resolve().then(loadData);
    }, [loadData]);

    const handleOpen = () => {
        setRoleId(null);
        setSelectedPermissions([]);
        setOpen(true);
    };

    const handleRoleChange = async (nextRoleId) => {
        setRoleId(nextRoleId);
        setSelectedPermissions([]);
        try {
            const response = await fetch(`${API_URL}/roles/${nextRoleId}/permissions`);
            if (!response.ok) throw new Error("Unable to load role permissions");
            const assigned = await response.json();
            setSelectedPermissions(assigned.map((permission) => Number(permission.id)));
        } catch (error) {
            message.error(error.message);
        }
    };

    const handleSubmit = async () => {
        if (roleId === null) {
            message.warning("Please select a role");
            return;
        }

        setSaving(true);
        try {
            const response = await fetch(`${API_URL}/roles/${roleId}/permissions`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    permissionIds: selectedPermissions.map(Number),
                }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || "Failed to save permissions");
            }

            message.success("Permissions saved successfully");
            setOpen(false);
            setRoleId(null);
            setSelectedPermissions([]);
            await loadData();
        } catch (error) {
            message.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="roles-page">
            <div className="roles-page-header">
                <Typography.Title level={2}>Permissions</Typography.Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleOpen}>
                    Add Permission
                </Button>
            </div>


            <Modal
                title="Add Permission"
                open={open}
                onOk={handleSubmit}
                onCancel={() => setOpen(false)}
                confirmLoading={saving}
                okText="Submit"
            >
                <Modal
                title = "Edit Permission"
                open={open}
                onCancel={() => setOpen(false)}
                footer={null}
                >

                    
                </Modal>
                <Typography.Text strong>Role Name</Typography.Text>
                <Select
                    placeholder="Select a role"
                    value={roleId}
                    onChange={handleRoleChange}
                    options={roles.map((role) => ({
                        label: role.role_name,
                        value: Number(role.id),
                    }))}
                    style={{ width: "100%", marginTop: 8, marginBottom: 16 }}
                />

                <Typography.Text strong>Module Permission</Typography.Text>

                {permissions
                    .filter((permissions) =>
                        selectedPermissions.includes(permissions.id)
                    )
                    .map((permission) => (
                        <Checkbox
                            key={permission.id}
                            checked
                            disabled
                        >
                            {permission.permission_name}
                        </Checkbox>
                    ))
                }
            </Modal>
        </div>
    );
}

export default ModulePermission;