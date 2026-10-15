import { Card, Space, Typography } from "antd";

const { Title } = Typography;

function Roles({ user }) {
    return (
        <div className="roles-page">
            <Title level={2}>Role & Permissions</Title>
            <Card title={user.role_name || "Assigned role"}>
                <Space wrap>
                    {(user.permissions || []).map((permission) => (
                        <Typography.Text key={permission} code>
                            {permission}
                        </Typography.Text>
                    ))}
                    {(!user.permissions || user.permissions.length === 0) && (
                        <Typography.Text type="secondary">No permissions assigned</Typography.Text>
                    )}
                </Space>
            </Card>
        </div>
    );
}

export default Roles;