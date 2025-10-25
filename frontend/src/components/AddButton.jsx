import React from 'react';

const AddButton = ({ onClick }) => {
  return (
    <button className="btn-primary btn-add" onClick={onClick}>
      + Yeni Kayıt Ekle
    </button>
  );
};

export default AddButton;
