import React from "react";
import useUserManagement from "../hooks/useUserManagement";

const UserList = ({ onSelectUser }) => {
  if (error) {
    return <div>Error fetching users: {error.message}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Users</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.username} - {user.email} -{" "}
            {user.is_superuser ? "Superuser" : "Regular User"}
            <button onClick={() => onSelectUser(user.id)}>Update</button>
            <button onClick={() => deleteUser(user.id, setUsers)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
