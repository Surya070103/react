import { useCallback, useEffect, useState } from "react";
import {
    Button,
    Checkbox,
    Input,
    Modal,
    Popconfirm,
    Select,
    Space,
    Switch,
    Table,
    Tag,
    Typography,
    message
} from "antd";
import {
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    SettingOutlined,
} from "@ant-design/icons";

const API_URL = "http://localhost:4000";
const { Title } = Typography;
const visiblePermissionNames = new Set([
    "ADD_PARKING",
    "EXIT_PARKING",
    "VIEW_PARKING",
    "VIEW_OWN_PARKING_RECORDS",
    "VIEW_PARKING_RECORDS",
    "VIEW_ROLES",
]);

function normalizePermissionName(permissionName) {
    const normalized = String(permissionName).trim().toUpperCase().replace(/\s+/g, "_");
    const aliases = {
        PARKING_VIEW: "VIEW_PARKING",
        PARKING_RECORD_VIEW: "VIEW_PARKING_RECORDS",
        MANAGE_ROLES: "VIEW_ROLES",
    };
    return aliases[normalized] || normalized;
}

function displayPermissionName(permissionName) {
    return permissionName === "EXIT_PARKING" ? "EXIT PARKING" : permissionName;
}

function getVisiblePermissions(permissions) {
    const visiblePermissions = new Map();

    permissions.forEach((permission) => {
        const normalizedName = normalizePermissionName(permission.permission_name);
        if (!visiblePermissionNames.has(normalizedName)) return;

        const current = visiblePermissions.get(normalizedName);
        const isCanonical = String(permission.permission_name).trim().toUpperCase() === normalizedName;
        const currentIsCanonical = current
            && String(current.permission_name).trim().toUpperCase() === normalizedName;
        if (!current || (isCanonical && !currentIsCanonical)) {
            visiblePermissions.set(normalizedName, permission);
        }
    });

    return [...visiblePermissions.values()];
}

async function apiRequest(path, options = {}, token) {
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
        },
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.error || data.message || `Request failed (${response.status})`);
    }

    return data;
}

function RolePermission({ user }) {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [roleModalOpen, setRoleModalOpen] = useState(false);
    const [roleName, setRoleName] = useState("");
    const [selectedRole, setSelectedRole] = useState(null);
    const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
    const [permissionModalOpen, setPermissionModalOpen] = useState(false);

    const roleApiRequest = useCallback(
        (path, options) => apiRequest(path, options, user.token),
        [user.token]
    );

    const loadData = useCallback(async () => {
        try {
            const [roleData, permissionData] = await Promise.all([
                roleApiRequest("/roles"),
                roleApiRequest("/permissions"),
            ]);
            const rolesWithPermissions = await Promise.all(
                roleData.map(async (role) => {
                    const assigned = await roleApiRequest(`/roles/${role.id}/permissions`);
                    return {
                        ...role,
                        is_active: Boolean(role.is_active),
                        permissions: assigned.map((item) => item.permission_name),
                    };
                })
            );

            setRoles(rolesWithPermissions);
            setPermissions(permissionData);
        } catch (error) {
            console.error(error);
            console.error(error.message || "Could not load roles and permissions");
        } finally {
            setLoading(false);
        }
    }, [roleApiRequest]);

    useEffect(() => {
        void Promise.resolve().then(loadData);
    }, [loadData]);

    function openCreateRole() {
        setRoleName("");
        setRoleModalOpen(true);
    }

    async function saveRole() {
        const name = roleName.trim();
        if (!name) {
            message.warning("Enter a role name");
            return;
        }

        setSaving(true);
        try {
            const savedRole = await roleApiRequest("/roles", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role_name: name }),
            });
            message.success("Role added");
            setRoleModalOpen(false);
            await loadData();
            setSelectedRole(savedRole);
            setSelectedPermissionIds([]);
        } catch (error) {
            message.error(error.message);
        } finally {
            setSaving(false);
        }
    }

    async function openPermissionModal(role = null) {
        setSelectedRole(role);
        setSelectedPermissionIds([]);
        setPermissionModalOpen(true);
        if (!role) return;

        try {
            const assigned = await roleApiRequest(`/roles/${role.id}/permissions`);
            setSelectedPermissionIds(assigned.map((item) => Number(item.id)));
        } catch (error) {
            message.error(error.message);
        }
    }

    async function selectRole(roleId) {
        const role = roles.find((item) => Number(item.id) === roleId) || null;
        setSelectedRole(role);
        setSelectedPermissionIds([]);
        if (!role) return;

        try {
            const assigned = await roleApiRequest(`/roles/${role.id}/permissions`);
            setSelectedPermissionIds(assigned.map((item) => Number(item.id)));
        } catch (error) {
            message.error(error.message);
        }
    }

    async function savePermissions() {
        if (!selectedRole) {
            message.warning("Please select a role");
            return;
        }

        setSaving(true);
        try {
            await roleApiRequest(`/roles/${selectedRole.id}/permissions`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ permissionIds: selectedPermissionIds }),
            });
            message.success("Permissions saved");
            setPermissionModalOpen(false);
            await loadData();
        } catch (error) {
            message.error(error.message);
        } finally {
            setSaving(false);
        }
    }

    async function changeActive(role, isActive) {
        try {
            await roleApiRequest(`/roles/${role.id}/active`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_active: isActive }),
            });
            setRoles((currentRoles) => currentRoles.map((item) =>
                item.id === role.id ? { ...item, is_active: isActive } : item
            ));
            console.log("Role status updated");
        } catch (error) {
            console.log(error.message);
        }
    }

    async function deleteRole(role) {
        try {
            await roleApiRequest(`/roles/${role.id}`, { method: "DELETE" });
            console.log("Role deleted");
            await loadData();
        } catch (error) {
            console.log(error.message);
        }
    }
    const columns = [
        {
            title: "Role Name",
            dataIndex: "role_name",
            key: "role_name",
        },
        {
            title: "Permissions",
            dataIndex: "permissions",
            key: "permissions",
            render: (items = []) => items.length > 0
                ? <Space wrap>{items.map((item) => <Tag key={item}>{displayPermissionName(item)}</Tag>)}</Space>
                : <Typography.Text type="secondary">No permissions</Typography.Text>,
        },
        {
            title: "Active",
            dataIndex: "is_active",
            key: "is_active",
            width: 100,
            render: (isActive, role) => (
                <Switch
                    checked={isActive}
                    aria-label={`Set ${role.role_name} active status`}
                    onChange={(checked) => changeActive(role, checked)}
                />
            ),
        },
        {
            title: "Action",
            key: "action",
            render: (_, role) => (
                <Space wrap>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => void openPermissionModal(role)}
                    >
                        Edit permissions
                    </Button>
                    <Popconfirm
                        title={`Delete ${role.role_name}?`}
                        description="Roles assigned to users cannot be deleted."
                        onConfirm={() => deleteRole(role)}
                        okText="Delete"
                        cancelText="Cancel"
                    >
                        <Button danger icon={<DeleteOutlined />} >
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="roles-page">
            <div className="roles-page-header">
                <Title level={2}>Roles &amp; Permissions</Title>
                <Space wrap>
                    <Button
                        onClick={() => void openPermissionModal()}
                    >
                        Add Permission
                    </Button>
                </Space>
            </div>
            <Table
                rowKey="id"
                columns={columns}
                dataSource={roles}
                loading={loading}
                scroll={{ x: 760 }}
                pagination={{ pageSize: 8, showSizeChanger: false }}
            />




            <Modal
                title={selectedRole ? "Edit permissions" : "Add Permission"}
                open={permissionModalOpen}
                onOk={savePermissions}
                onCancel={() => setPermissionModalOpen(false)}
                confirmLoading={saving}
                okText="Save permissions"
            >
                <Typography.Text strong>Role Name</Typography.Text>
                <Space style={{ width: "100%", marginTop: 8, marginBottom: 16 }}>
                    <Select
                        placeholder="Select a role"
                        value={selectedRole?.id}
                        onChange={selectRole}
                        options={roles.map((role) => ({
                            label: role.role_name,
                            value: Number(role.id),
                        }))}
                        style={{ flex: 1, minWidth: 0 }}
                    />

                </Space>
                <Typography.Text strong>Module Permission</Typography.Text>
                <Checkbox.Group
                    style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}
                    value={selectedPermissionIds}
                    onChange={setSelectedPermissionIds}
                    options={getVisiblePermissions(permissions).map((permission) => ({
                        label: displayPermissionName(normalizePermissionName(permission.permission_name)),
                        value: Number(permission.id),
                    }))}
                />
            </Modal>
        </div>
    );
}

export default RolePermission;