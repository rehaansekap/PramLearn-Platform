import React, { useState, useEffect, useContext } from "react";
import api from "../../../api";
import { AuthContext } from "../../../context/AuthContext";

const UserUpdateForm = ({ userId }) => {
  const { token } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [roles, setRoles] = useState([]);
  const [isStaff, setIsStaff] = useState(false);
  const [isSuperuser, setIsSuperuser] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`users/${userId}/`);
        const user = response.data;
        setUsername(user.username);
        setEmail(user.email);
        setRole(user.role);
        setIsStaff(user.is_staff);
        setIsSuperuser(user.is_superuser);
      } catch (error) {
        console.error("There was an error fetching the user!", error);
      }
    };

    const fetchRoles = async () => {
      try {
        const response = await api.get("roles/");
        setRoles(response.data);
      } catch (error) {
        console.error("There was an error fetching the roles!", error);
      }
    };

    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchUser();
      fetchRoles();
    }
  }, [token, userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = {
        username,
        email,
        password,
        role,
        is_staff: isStaff,
        is_superuser: isSuperuser,
      };
      const response = await api.put(`users/${userId}/`, userData);
      setMessage("User updated successfully!");
    } catch (error) {
      console.error("There was an error updating the user!", error);
      console.error("Error response:", error.response);
      setMessage("Error updating user.");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Update User</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Role:</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="">Pilih Role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Is Staff:</label>
          <input
            type="checkbox"
            checked={isStaff}
            onChange={(e) => setIsStaff(e.target.checked)}
          />
        </div>
        <div>
          <label>Is Superuser:</label>
          <input
            type="checkbox"
            checked={isSuperuser}
            onChange={(e) => setIsSuperuser(e.target.checked)}
          />
        </div>
        <button type="submit">Update User</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default UserUpdateForm;
