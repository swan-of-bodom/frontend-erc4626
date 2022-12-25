import React from "react";
import "./Modal.css";

interface IModalProps {
  isOpen: boolean;
  closeModalHandler: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<IModalProps> = ({
  isOpen,
  closeModalHandler,
  children,
}) => {

  return (
    <div
      className="component-modal"
      style={{
        bottom: isOpen ? "0vh" : "100vh",
        backgroundColor: isOpen ? "#000000cc" : "transparent",
        visibility: isOpen ? "visible" : "hidden"
      }}
    >
      <div className="component-modal__modal">{children}</div>
      <div
        className="component-modal__close-btn"
        onClick={closeModalHandler}
      ></div>
    </div>
  );
};

export default Modal;
