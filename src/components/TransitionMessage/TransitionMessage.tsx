import React from "react";
import "./TransitionMessage.scss";

const TransitionMessage: React.FC<{ message: string }> = ({
  message,
}) => {
  return (
    <>
      <div className="transition-container">
        <div className="transition-text">{message}</div>
      </div>
    </>
  );
};

export default TransitionMessage;
