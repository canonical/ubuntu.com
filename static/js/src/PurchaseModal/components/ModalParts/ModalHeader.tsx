import React from "react";

type ModalHeader = {
  title: string;
};

const ModalHeader = ({ title }: ModalHeader) => {
  return (
    <header className="p-modal__header">
      <h2 className="p-modal__title u-no-margin--bottom">{title}</h2>
    </header>
  );
};

export default ModalHeader;
