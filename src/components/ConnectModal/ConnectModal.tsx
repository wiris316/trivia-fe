import React, { FormEvent, RefObject, useEffect, useState } from "react";
import { createWebSocketService } from "../../services/websocketService";
import { IServerMessage } from "../../interfaces";
import "./ConnectModal.scss";

interface IConnectModal {
  currentUser: string;
  setCurrentUser: React.Dispatch<React.SetStateAction<string>>;
  setServerMessage: React.Dispatch<React.SetStateAction<IServerMessage[]>>;
  wsService: RefObject<ReturnType<typeof createWebSocketService>>;
}

const ConnectModal: React.FC<IConnectModal> = ({
  currentUser,
  setCurrentUser,
  setServerMessage,
  wsService,
}) => {
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    setClicked(false);
  }, []);

  const handleConnect = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (/^[a-zA-Z0-9]+$/.test(currentUser)) {
      if (wsService.current) {
        wsService.current.connect(currentUser, (message: IServerMessage) => {
          setClicked(true);
          setServerMessage((prevMessage) => [...prevMessage, message]);
        });
      } else {
        alert("Failed to connect to the server.");
      }
    } else {
      alert("Special characters are not allowed.");
    }
  };

  return (
    <div className="modal-overlay">
      <form className="modal-content" onSubmit={(e) => handleConnect(e)}>
        <h3 id="modal-title">Connect to the server</h3>
        <label id="modal-intro">Input a username to connect</label>
        <input
          placeholder="username"
          value={currentUser}
          onChange={(e) => setCurrentUser(e.target.value)}
          id="modal-input"
          type="text"
          autoFocus
        />
        <button id="modal-enter-button" title="ENTER" disabled={clicked}>
          ENTER
        </button>
      </form>
    </div>
  );
};

export default ConnectModal;
