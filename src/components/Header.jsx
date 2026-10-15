import { Layout, Space, Typography } from "antd";
import UserProfile from "../UserProfile.jsx";

function Header({ user, onLogout }) {
    return (
        <Layout.Header
            className="header"
            style={{
                background: "#f2f5f2",
                height: "64px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 24px",
                borderBottom: "1px solid #ddd",
            }}>
            <h1>nextype</h1>
            <Space>
                <Typography.Text strong>{user?.name}</Typography.Text>
                <Typography.Text type="secondary">{user?.role_name}</Typography.Text>
                <UserProfile onLogout={onLogout} />
            </Space>
        </Layout.Header>
    );
}

export default Header;