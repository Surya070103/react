import { useEffect, useState } from "react";
import { Select, message } from "antd";

const API_URL = "http://localhost:4000";

function UserRoleDropdown() {
  const [roles, setRoles] = useState([]);
  const [roleId, setRoleId] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/roles`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load roles");
        return res.json();
      })
      .then((data) => setRoles(data))
      .catch(() => message.error("Unable to load roles"));
  }, []);

  return (
    <Select
      placeholder="Select Role Name"
      value={roleId}
      onChange={(value) => setRoleId(value)}
      options={roles.map((role) => ({
        label: role.role_name,
        value: Number(role.id),
      }))}
      style={{ width: "100%" }}
    />
  );
}

export default UserRoleDropdown;