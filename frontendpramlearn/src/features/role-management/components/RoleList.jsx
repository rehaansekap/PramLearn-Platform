import React from "react";
import useFetchRoles from "../../../hooks/useFetchRoles";

const RoleList = () => {
  const { roles, error } = useFetchRoles();

  if (error) {
    return <div>Error fetching roles: {error.message}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Roles</h1>
      <ul>
        {roles.map((role) => (
          <li key={role.id}>{role.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default RoleList;
