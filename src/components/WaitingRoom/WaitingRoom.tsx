import React, { RefObject, useEffect, useState } from "react";
import { createWebSocketService } from "../../services/websocketService";
import "./WaitingRoom.scss";
import GameRoom from "../GameRoom/GameRoom";
import TransitionMessage from "../TransitionMessage/TransitionMessage";
import {
  IServerMessage,
  IRoomInfo,
  IPlayers,
  IReadyPlayers,
  ITrivia,
  IScores,
} from "../../interfaces";

interface WaitingRoomProps {
  wsService: RefObject<ReturnType<typeof createWebSocketService>>;
  serverMessage: IServerMessage[];
  setServerMessage: React.Dispatch<React.SetStateAction<IServerMessage[]>>;
  roomInfo: {
    roomName: string;
    question_count: number;
  };
  setRoomInfo: React.Dispatch<React.SetStateAction<IRoomInfo>>;
  currentUser: string;
  setEnterGame: React.Dispatch<React.SetStateAction<boolean>>;
  sessionId: string;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({
  wsService,
  serverMessage,
  setServerMessage,
  roomInfo,
  setRoomInfo,
  currentUser,
  setEnterGame,
  sessionId,
}) => {
  const [gameId, setGameId] = useState("");
  const [userReady, setUserReady] = useState(false);
  const [trivia, setTrivia] = useState<ITrivia | null>(null);
  const [finalScores, setFinalScores] = useState<IScores[]>([]);
  const [currentServerMsg, setCurrentServerMsg] =
    useState<IServerMessage | null>(null);
  const [clicked, setClicked] = useState(false);
  const [questionCount, setQuestionCount] = useState<number | undefined>();
  const [players, setPlayers] = useState<IPlayers[]>([]);

  useEffect(() => {
    serverMessage.forEach((msg) => {
      handleServerMessage(msg);
    });
  }, [serverMessage]);

  const handleServerMessage = (msg: IServerMessage) => {
    const playersArray: IPlayers[] = [];

    switch (msg.type) {
      case "game_player_enter":
        setGameId(msg.id);
        const readyPlayers: IReadyPlayers | undefined =
          msg.payload.players_ready;

        if (msg.payload.players) {
          // Check for instances where multiple users have the same username
          const findDuplicates = (array: string[]): string[] => {
            const prefixGroups: { [prefix: string]: string[] } = {};

            array.forEach((str) => {
              const prefix = str.split("_")[0]; // Get prefix before '_'
              if (!prefixGroups[prefix]) {
                prefixGroups[prefix] = [];
              }
              prefixGroups[prefix].push(str);
            });

            const duplicates: string[] = [];
            Object.values(prefixGroups).forEach((group) => {
              if (group.length > 1) {
                duplicates.push(...group);
              }
            });

            return duplicates;
          };

          const duplicates = findDuplicates(msg.payload.players);

          // Other users with the same name as currentUser will have their sessionId displayed
          msg.payload.players.forEach((ele) => {
            const player = {
              name:
                duplicates.includes(ele) && ele !== currentUser + sessionId
                  ? ele
                  : ele.split("_")[0],
              ready: readyPlayers?.[ele] || false,
              serverName: ele,
            };
            playersArray.push(player);
          });

          setQuestionCount(msg.payload.question_count);
          setPlayers(playersArray);
        }
        break;

      case "game_player_join":
        if (msg.payload.player) {
          const name = msg.payload.player.split("_")[0];

          // Added this check as a bug fix to prevent multiple instance of same users from being pushed into the same list
          const exist = players.some((ele) => {
            return ele.serverName === msg.payload.player;
          });

          // Check if other users have the the same username
          const shareSameName = players.some((ele) => {
            return ele.name === name;
          });

          // Other users with the same username as the current user will have their sessionId displayed with their username
          if (!exist) {
            playersArray.push({
              name: shareSameName ? msg.payload.player : name,
              ready: false,
              serverName: msg.payload.player,
            });
          }

          setPlayers([...players, ...playersArray]);
        }
        break;

      case "game_player_ready":
        const newPlayersList = players.map((ele) => {
          if (ele.serverName === msg.payload.player) {
            ele.ready = true;
          }
          return ele;
        });
        setPlayers(newPlayersList);
        break;

      case "game_question":
        if (msg.payload) {
          setTrivia({
            id: msg.payload.id,
            question: msg.payload.question,
            options: msg.payload.options,
            seconds: msg.payload.seconds || 30,
          });
        }
        break;

      case "game_player_leave":
        const filteredPlayers = players.filter((ele) => {
          return ele.serverName !== msg.payload.player;
        });
        setPlayers(filteredPlayers);
        break;

      case "game_end":
        if (msg.payload.scores) {
          setFinalScores(msg.payload.scores);
        }
        break;

      default:
        break;
    }

    setCurrentServerMsg(msg);
  };

  const handleReadyClick = () => {
    if (wsService.current) {
      const payload = {
        payload: { game_id: gameId },
        type: "ready",
      };
      wsService.current.send(payload);
      setUserReady(true);
    }
  };

  const handleStart = () => {
    setClicked(true);
    if (wsService.current) {
      const payload = {
        payload: { game_id: gameId },
        type: "start",
      };
      wsService.current.send(payload);
    }
  };

  return (
    <>
      {trivia ? (
        <GameRoom
          trivia={trivia}
          setTrivia={setTrivia}
          players={players}
          setPlayers={setPlayers}
          wsService={wsService}
          gameId={gameId}
          currentServerMsg={currentServerMsg}
          currentUser={currentUser}
          setEnterGame={setEnterGame}
          finalScores={finalScores}
          setFinalScores={setFinalScores}
          setServerMessage={setServerMessage}
          questionCount={questionCount}
          setRoomInfo={setRoomInfo}
          sessionId={sessionId}
        />
      ) : (
        <div id="waiting-room-container">
          <h2>WAITING ROOM - {roomInfo.roomName.toUpperCase()}</h2>
          <span id="start-exit-buttons">
            {players[0]?.name === currentUser && (
              <button
                id="start-button"
                onClick={handleStart}
                disabled={!players.every((ele) => ele.ready) || clicked}
              >
                START
              </button>
            )}
          </span>
          <section id="user-item-container">
            {players.length > 0 &&
              players.map((player, i) => (
                <div
                  key={i}
                  className={`user-item ${
                    player.name === currentUser ? "currentUser" : ""
                  }`}
                >
                  <p>{player.name}</p>
                  <p className={`${player.ready ? "disabled" : ""}`}>
                    {player.ready ? "READY" : "NOT READY"}
                  </p>
                </div>
              ))}
          </section>
          <section id="waiting-room-indicator">
            {players.every((ele) => ele.ready) ? (
              (players[0]?.name === currentUser && (
                <TransitionMessage message={"ALL USERS READY - PLEASE START"} />
              )) || (
                <TransitionMessage message={"WAITING FOR PLAYER 1 TO START"} />
              )
            ) : !userReady ? (
              <button onClick={handleReadyClick} id="ready-button">
                READY
              </button>
            ) : (
              <TransitionMessage message={"WAITING..."} />
            )}
          </section>
        </div>
      )}
    </>
  );
};

export default WaitingRoom;
