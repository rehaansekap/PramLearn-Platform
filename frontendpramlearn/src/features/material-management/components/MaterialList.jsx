import React from "react";
import { useNavigate } from "react-router-dom";

const MaterialList = ({ materials, deleteMaterial, setEditingMaterial }) => {
  const navigate = useNavigate();

  return (
    <div>
      <h2 className="text-xl font-bold">Materials</h2>
      <ul>
        {materials.map((material) => (
          <li key={material.id}>
            {material.title ? material.title : `Material ID: ${material.id}`}
            <button onClick={() => deleteMaterial(material.id)}>Delete</button>
            <button onClick={() => setEditingMaterial(material)}>Update</button>
            <button onClick={() => navigate(`/material/${material.slug}`)}>
              Detail
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MaterialList;
