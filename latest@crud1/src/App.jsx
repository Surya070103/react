import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [users, setUsers] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
}

const [userinfo, setUserinfo] = useState({
  name: "",
  phonenumber: "",
  email: "",
  age: "",
});

const handleChange = (e) => {
  const { name, value } = e.target;

  setUserinfo((currinfo) => {
    return {
      ...currinfo,
      [name]: value,
    };
  });
};

const addData = () => {
  if (editIndex === null) {
    setUsers((currUsers) => [...currUsers, userinfo]);
  } else {
    setUsers((currUsers) =>
      currUsers.map((user, index) => (index === editIndex ? userinfo : user))
    );
    setEditIndex(null);
  }
  setUserinfo({
    name: "",
    phonenumber: "",
    email: "",
    age: "",
  });
};

const deleteData = (index) => {
  setUsers((currUsers) => {
    return currUsers.filter((_, i) => i !== index);
  });
};


const editData = (index) => {
  console.log("index", index);
  console.log("index", index);
  setUserinfo(users[index]);
  setEditIndex(index);
};

return (
  <>
    <div className="container">
      <div className="form">
        <input
          type="text"
          placeholder="Enter your name"
          value={userinfo.name}
          name="name"
          onChange={handleChange}
        />
        <br />
        <input
          type="number"
          placeholder="Enter your phone number"
          value={userinfo.phonenumber}
          name="phonenumber"
          onChange={handleChange}
        />
        <br />
        <input
          type="email"
          placeholder="Enter your email"
          value={userinfo.email}
          name="email"
          onChange={handleChange}
        />
        <br />
        <input
          type="number"
          placeholder="Enter your age"
          value={userinfo.age}
          name="age"
          onChange={handleChange}
        />
        <br />
        <button onClick={addData}>
          {editIndex !== null ? "Update" : "Add"}
        </button>
      </div>
      <div className="datatable">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>phonenumber</th>
              <th>email</th>
              <th>age</th>
              <th>actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => {
              return (
                <tr key={index}>
                  <td>{user.name}</td>
                  <td>{user.phonenumber}</td>
                  <td>{user.email}</td>
                  <td>{user.age}</td>
                  <td>
                    <button onClick={() => editData(index)}>
                      Edit
                    </button>

                    <button onClick={() => deleteData(index)}>
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  </>

);


export default App;
