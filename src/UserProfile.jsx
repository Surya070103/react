import { Button, Dropdown } from "antd";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";

function UserProfile({ onLogout }) {
    const handleMenuClick = ({ key }) => {
        if (key === "logout") {
            onLogout();
        }
    };

    const items = [
        {
            key: "logout",
            label: "Log out",
            icon: <LogoutOutlined />,
        },
    ];

    return (
        <Dropdown
            menu={{
                items,
                onClick: handleMenuClick,
            }}
            trigger={["click"]}
            placement="bottomRight"
        >
            <Button type="text" shape="circle" aria-label="User menu" icon={<UserOutlined />} />
        </Dropdown>
    );
}

export default UserProfile;