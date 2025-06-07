// frontendpramlearn/src/components/FormSelect.jsx
import React from "react";

const FormSelect = ({ label, name, value, onChange, options, required }) => {
  return (
    <div className="form-group">
      <label>{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="form-control"
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FormSelect;
