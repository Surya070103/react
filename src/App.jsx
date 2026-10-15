import { Layout } from "antd";
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./login.jsx";
import Header from "./components/Header";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import Footer from "./components/Footer";
import Parking from "./parking.jsx";
import ParkingRecords from "./ParkingRecords.jsx";
import RolePermission from "./RolePermission.jsx";
import "./App.css";

const { Content } = Layout;
const API_URL = "http://localhost:4000";

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("currentUser")) || null;
  } catch {
    return null;
  }
}

function hasPermission(user, permission) {
  if (permission === "VIEW_PARKING_RECORDS") {
    return user.role_name === "Manager"
      ? user.permissions?.includes("VIEW_PARKING_RECORDS")
      : user.permissions?.includes("VIEW_OWN_PARKING_RECORDS");
  }
  if (permission === "VIEW_ROLES" && user.role_name !== "Manager") {
    return false;
  }
  return user.permissions?.includes(permission);
}

function defaultRoute(user) {
  return [
    ["/parking", "VIEW_PARKING"],
    ["/parking-records", "VIEW_PARKING_RECORDS"],
    ["/roles", "VIEW_ROLES"]
  ].find(([, permission]) => hasPermission(user, permission))?.[0] || "/no-access";
}

function ProtectedPage({ user, permission, children }) {
  return hasPermission(user, permission)
    ? children
    : <Navigate to={defaultRoute(user)} replace />;
}

function AuthenticatedApp({ user, onLogout }) {
  const firstRoute = defaultRoute(user);
  return (
    <Layout className="app-layout">
      <Header user={user} onLogout={onLogout} />
      <Layout>
        <Sidebar user={user} />
        <Content className="content">
          <Routes>
            <Route path="/" element={<Navigate to={firstRoute} replace />} />
            
            <Route path="/parking" element={<ProtectedPage user={user} permission="VIEW_PARKING"><Parking user={user} /></ProtectedPage>} />
            <Route path="/parking-records" element={<ProtectedPage user={user} permission="VIEW_PARKING_RECORDS"><ParkingRecords user={user} /></ProtectedPage>} />
            <Route path="/roles" element={<ProtectedPage user={user} permission="VIEW_ROLES"><RolePermission user={user} /></ProtectedPage>} />
            <Route path="/no-access" element={<p>Your account has no page permissions. Contact an administrator.</p>} />
            <Route path="*" element={<Navigate to={firstRoute} replace />} />
          </Routes>
        </Content>
      </Layout>
      <Footer />
    </Layout>
  );
}

function App() {
  const [user, setUser] = useState(getStoredUser);
  const [refreshingUser, setRefreshingUser] = useState(() => Boolean(getStoredUser()?.id));

  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser?.id) return;

    let cancelled = false;
    fetch(`${API_URL}/users/${storedUser.id}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not refresh user details");
        return data;
      })
      .then((freshUser) => {
        if (cancelled) return;
        const refreshedUser = { ...freshUser, token: storedUser.token };
        localStorage.setItem("currentUser", JSON.stringify(refreshedUser));
        setUser(refreshedUser);
      })
      .catch((error) => console.error("Could not refresh user details:", error))
      .finally(() => {
        if (!cancelled) setRefreshingUser(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function handleLogin(authenticatedUser) {
    localStorage.setItem("currentUser", JSON.stringify(authenticatedUser));
    setUser(authenticatedUser);
  }

  function handleLogout() {
    const storedUser = getStoredUser();
    if (storedUser?.token) {
      fetch(`${API_URL}/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${storedUser.token}` },
      }).catch((error) => console.error("Could not end session:", error));
    }
    localStorage.removeItem("currentUser");
    setUser(null);
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={refreshingUser ? <p>Loading account...</p> : user ? <Navigate to={defaultRoute(user)} replace /> : <Login onLogin={handleLogin} />} />
        <Route path="*" element={refreshingUser ? <p>Loading account...</p> : user ? <AuthenticatedApp user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;