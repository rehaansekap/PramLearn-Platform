// frontendpramlearn/src/components/FormTextArea.jsx
import React from "react";

const FormTextArea = ({ label, name, value, onChange, required }) => (
  <div>
    <label>{label}:</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      required={required}
    />
  </div>
);

export default FormTextArea;
