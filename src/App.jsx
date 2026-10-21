import React from "react";

import {
  Layout,
  Menu,
  Dropdown,
} from "antd";

import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";

import Carrier from "./Carrier";
import Login from "./Login";

import "./App.css";

const { Header, Sider, Content } = Layout;




function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();



  const menuItems = [
    {
      key: "/settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
  ];



  const handleMenuClick = ({ key }) => {
    navigate(key);
  };



  const userMenuItems = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
    },
  ];

  const handleUserMenuClick = ({ key }) => {

    navigate("/login");

  };

  return (
    <Layout className="app-shell">



      <Header className="app-header">


        <div className="hpb-logo">
          HPB
        </div>


        <div className="header-right">

          <Dropdown
            menu={{
              items: userMenuItems,
              onClick: handleUserMenuClick,
            }}
            placement="bottomRight"
            trigger={["click"]}
          >
            <div className="user-menu">
              <UserOutlined className="user-icon" />
            </div>
          </Dropdown>

        </div>

      </Header>




      <Layout>



        <Sider
          width={154}
          className="app-sider"
          theme="light"
        >

          <div className="sidebar-menu-wrapper">

            <Menu
              mode="inline"
              selectedKeys={[location.pathname]}
              items={menuItems}
              onClick={handleMenuClick}
              className="sidebar-menu"
            />

          </div>

        </Sider>


        <Content className="app-content">

          <Routes>


            <Route
              path="/settings"
              element={<Carrier />}
            />


            <Route
              path="/carrier"
              element={<Carrier />}
            />

            {/* DEFAULT */}
            <Route
              path="*"
              element={<Carrier />}
            />

          </Routes>

        </Content>

      </Layout>

    </Layout>
  );
}




function App() {
  return (
    <BrowserRouter>

      <Routes>


        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/*"
          element={<MainLayout />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;