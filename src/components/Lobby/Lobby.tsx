import React, { useEffect, useRef, useState } from "react";
import api from "../../services/api";
import { AxiosError } from "axios";
import { createWebSocketService } from "../../services/websocketService";
import WaitingRoom from "../WaitingRoom/WaitingRoom";
import "./Lobby.scss";
import {
  ILobbyGame,
  ILeaderboard,
  IRoomInfo,
  IServerMessage,
} from "../../interfaces";
import ConnectModal from "../ConnectModal/ConnectModal";
import TransitionMessage from "../TransitionMessage/TransitionMessage";
import LeaderBoard from "../Leaderboard/Leaderboard";

const Lobby: React.FC = () => {
  const [games, setGames] = useState<ILobbyGame[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string>("");
  const [serverMessage, setServerMessage] = useState<IServerMessage[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [showCreateRoomInput, setShowCreateRoomInput] =
    useState<boolean>(false);
  const [enterGame, setEnterGame] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [leaderboardView, setLeaderboardView] = useState(false);
  const [leaderboardList, setLeaderboardList] = useState<ILeaderboard[]>([]);
  const [sessionId, setSessionId] = useState("");

  const [roomInfo, setRoomInfo] = useState<IRoomInfo>({
    roomName: "",
    question_count: 3,
  });

  const handleOpen = (identifier: string) => {
    setIsConnected(true);
    setSessionId(identifier);
  };

  const handleClose = () => {
    alert("Failed to connect to server. Please try a new username.");
    setIsConnected(false);
    setCurrentUser("");
    setEnterGame(false);

    if (wsService.current) {
      wsService.current.disconnect();
    }
  };

  const wsService = useRef(createWebSocketService(handleOpen, handleClose));

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const gameList = await api.fetchGameList();
        setGames(gameList);
      } catch (error) {
        if (error instanceof AxiosError) {
          setError("Failed to fetch game list: " + error.message);
        } else {
          console.error(
            "An unknown error occurred while fetching the game list:",
            error
          );
          setError("An unknown error occurred. Please try again later.");
        }
      }
    };
    setIsLoading(false);
    fetchGames();
  }, [isConnected, refresh]);

  useEffect(() => {
    if (leaderboardView) {
      const fetchLeaderboard = async () => {
        try {
          const leaderboardList = await api.fetchLeaderboard();
          setLeaderboardList(leaderboardList);
          setIsLoading(false);
        } catch (error) {
          if (error instanceof AxiosError) {
            setError("Failed to fetch game list: " + error.message);
          } else {
            console.error(
              "An unknown error occurred while fetching the leaderboard list:",
              error
            );
            setError("An unknown error occurred. Please try again later.");
          }
          setIsLoading(false);
        }
      };
      fetchLeaderboard();
    }
  }, [leaderboardView]);

  useEffect(() => {
    setRefresh(!refresh);
    if (serverMessage.length === 0 && isConnected) {
      wsService.current.connect(currentUser, (message) => {
        setServerMessage((prevMessage) => [...prevMessage, message]);
        setIsConnected(true);
      });
      setRoomInfo({ ...roomInfo, roomName: "" });
    }
  }, [serverMessage]);

  const handleJoinRoom = (user: string, id: string, gameName: string) => {
    if (!isConnected) {
      wsService.current.connect(user, (message) => {
        setServerMessage((prevMessage) => [...prevMessage, message]);
        setIsConnected(true);
      });
    }
    setRoomInfo({ ...roomInfo, roomName: gameName });
    setEnterGame(true);
    setShowCreateRoomInput(false);

    const payload = {
      payload: { game_id: id },
      type: "join",
    };
    wsService.current.send(payload);
  };

  const handleCreateRoom = () => {
    const room = roomInfo.roomName;
    const questionCount = roomInfo.question_count;
    if (!room) {
      alert("Missing room name");
      return;
    }

    if (questionCount > 10 || questionCount === 0) {
      alert("Please choose from 1-10 questions.");
      return;
    } 

    if (!isConnected) {
      wsService.current.connect(currentUser, (message: IServerMessage) => {
        setServerMessage((prevMessage) => [...prevMessage, message]);
        setIsConnected(true);
      });
    }

    setEnterGame(true);
    setShowCreateRoomInput(false);

    const payload = {
      payload: {
        name: room,
        question_count: questionCount,
      },
      type: "create",
    };
    wsService.current.send(payload);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setRefresh(!refresh);
    }, 1000);
  };

  const handleClear = () => {
    setShowCreateRoomInput(false);
    setCurrentUser("");
    setRoomInfo({ ...roomInfo, roomName: "" });
  };

  useEffect(() => {
    return () => {
      console.log("Cleaning up WebSocket connection...");
      wsService.current.disconnect();
    };
  }, []);

  const openLeaderboard = () => {
    setLeaderboardView(true);
  };

  return (
    <div id="main-page-container">
      <span id="left-info-display">
        <p id="currentUser-display">{`USERNAME: ${currentUser.toUpperCase()}`}</p>
        <p id="sessionId-display">{`SESSION ID: ${sessionId.substring(1)}`}</p>
      </span>
      <button id="leaderboard-button" onClick={openLeaderboard}>
        LEADERBOARD
      </button>
      <h1>TRIVIA</h1>
      {!isConnected && (
        <ConnectModal
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          setServerMessage={setServerMessage}
          wsService={wsService}
        />
      )}
      {isConnected && leaderboardView && (
        <LeaderBoard
          leaderboardList={leaderboardList}
          setLeaderboardView={setLeaderboardView}
          setLeaderboardList={setLeaderboardList}
        />
      )}
      {enterGame ? (
        <WaitingRoom
          wsService={wsService}
          serverMessage={serverMessage}
          setServerMessage={setServerMessage}
          roomInfo={roomInfo}
          setRoomInfo={setRoomInfo}
          currentUser={currentUser}
          setEnterGame={setEnterGame}
          sessionId={sessionId}
        />
      ) : (
        <div id="game-list-container">
          <header id="available-games-header">
            <h2 id="game-list-header">Available Games</h2>
          </header>
          <button
            id="refresh-button"
            onClick={handleRefresh}
            disabled={isLoading}
            title="REFRESH"
          >
            {isLoading ? "LOADING" : "REFRESH"}
          </button>
          {isLoading ? (
            <div className="game-list">
              <TransitionMessage message={"Loading games..."} />
            </div>
          ) : error ? (
            <div className="game-list">
              <span className="game-list-description">{error}</span>
            </div>
          ) : games.length === 0 ? (
            <div className="game-list">
              <span className="game-list-description">No games available.</span>
            </div>
          ) : (
            <ul className="game-list">
              {games.map((game) => (
                <li key={game.id} className="game-item">
                  <h3 className="game-item-name">{game.name}</h3>
                  <p>Question Count: {game.question_count}</p>
                  <p>State: {game.state}</p>
                  <p># of Players: {game.player_count}</p>
                  {game.state !== "waiting" && (
                    <p className="game-item-description">
                      Game started. Can not join.
                    </p>
                  )}
                  <button
                    onClick={() =>
                      handleJoinRoom(currentUser, game.id, game.name)
                    }
                    disabled={game.state !== "waiting"}
                    title="JOIN"
                  >
                    join
                  </button>
                </li>
              ))}
            </ul>
          )}
          {showCreateRoomInput ? (
            <form id="create-room-form">
              <input
                value={roomInfo.roomName}
                onChange={(e) =>
                  setRoomInfo({ ...roomInfo, roomName: e.target.value })
                }
                type="text"
                placeholder="room name"
                required
                autoFocus
              />
              <input
                onChange={(e) =>
                  setRoomInfo({
                    ...roomInfo,
                    question_count: Number(e.target.value),
                  })
                }
                type="number"
                placeholder={`# of questions: ${roomInfo.question_count || 3}`}
                max={10}
                min={1}
              />
              <span>
                <button onClick={() => handleCreateRoom()}>enter</button>
                <button onClick={handleClear}>cancel</button>
              </span>
            </form>
          ) : (
            <button
              onClick={() => setShowCreateRoomInput(true)}
              disabled={isLoading}
              title="CREATE AND JOIN"
            >
              CREATE AND JOIN
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Lobby;
