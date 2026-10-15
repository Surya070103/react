import { Menu, Layout } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    CarOutlined,
    UnorderedListOutlined,
    SafetyCertificateOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;

const menuItems = [
    {
        key: '/parking',
        label: 'Parking',
        icon: <CarOutlined />,
        permission: 'VIEW_PARKING',
    },
    {
        key: '/parking-records',
        label: 'Parking Records',
        icon: <UnorderedListOutlined />,
        permission: 'VIEW_PARKING_RECORDS',
    },
    {
        key: '/roles',
        label: 'Roles & Permissions',
        icon: <SafetyCertificateOutlined />,
        permission: 'VIEW_ROLES',
    },

];

function Sidebar({ user }) {
    const navigate = useNavigate();
    const location = useLocation();
    const permissions = user.permissions || [];
    const hasPermission = (permission) => {
        if (permission === 'VIEW_PARKING_RECORDS') {
            return user.role_name === 'Manager'
                ? permissions.includes('VIEW_PARKING_RECORDS')
                : permissions.includes('VIEW_OWN_PARKING_RECORDS');
        }
        if (permission === 'VIEW_ROLES' && user.role_name !== 'Manager') return false;
        return permissions.includes(permission);
    };

    const allowedMenus = menuItems.filter((item) =>
        !item.permission || hasPermission(item.permission)
    );

    return (
        <Sider
            theme="light"
            width={230}
            style={{ minHeight: "100vh" }}
        >

            <Menu
                mode="inline"
                selectedKeys={[location.pathname]}
                items={allowedMenus}
                onClick={({ key }) => navigate(key)}
            />
        </Sider>
    );
}

export default Sidebar;