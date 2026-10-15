import { Layout, Menu } from "antd";

import { useLocation, useNavigate } from "react-router-dom";

const { Sider } = Layout;

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const items = [
        {
            key: "/home",
            label: "Home",
        },
        {
            key: "dashboard",
            label: "dashboard",
        },
        {
            key: "files",
            label: "files",
        }

    ];
    return (
        <Sider
            className="sidebar"
            theme="light"
            width={180}
        >
            <Menu
                mode="inline"
                theme="light"
                selectedKeys={[location.pathname]}
                items={items}
                onClick={({ key }) => {
                    navigate(key);
                }}
            />
        </Sider>
    );
}

export default Sidebar;