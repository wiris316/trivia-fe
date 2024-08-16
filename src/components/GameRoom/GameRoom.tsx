import React, { RefObject, useEffect, useRef, useState } from "react";
import { createWebSocketService } from "../../services/websocketService";
import {
  IPlayers,
  IRoomInfo,
  IScores,
  IServerMessage,
  ITrivia,
} from "../../interfaces";
import ScoreBoard from "../ScoreBoard/ScoreBoard";
import "./GameRoom.scss";

interface IGameRoomProps {
  trivia: ITrivia;
  setTrivia: React.Dispatch<React.SetStateAction<ITrivia | null>>;
  players: IPlayers[];
  setPlayers: React.Dispatch<React.SetStateAction<IPlayers[]>>;
  setRoomInfo: React.Dispatch<React.SetStateAction<IRoomInfo>>;
  wsService: RefObject<ReturnType<typeof createWebSocketService>>;
  gameId: string;
  currentServerMsg: IServerMessage | null;
  currentUser: string;
  setEnterGame: React.Dispatch<React.SetStateAction<boolean>>;
  setFinalScores: React.Dispatch<React.SetStateAction<IScores[]>>;
  finalScores: IScores[];
  setServerMessage: React.Dispatch<React.SetStateAction<IServerMessage[]>>;
  questionCount: number | undefined;
  sessionId: string;
}

const GameRoom: React.FC<IGameRoomProps> = ({
  trivia,
  setTrivia,
  wsService,
  gameId,
  currentServerMsg,
  currentUser,
  setEnterGame,
  finalScores,
  setFinalScores,
  setServerMessage,
  questionCount,
  setRoomInfo,
  players,
  sessionId
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(trivia.seconds);
  const [incorrectAnswer, setIncorrectAnswer] = useState<number | null>(null);
  const [clicked, setClicked] = useState(false);
  const currentQuestionCount = useRef<number>(0);
  const isInitialMount = useRef(true);

  useEffect(() => {
    setCountdown(trivia.seconds);
    setIncorrectAnswer(null);
    setSelectedOption(null);
    setClicked(false);

    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      currentQuestionCount.current += 1;
    }
  }, [trivia.id]);

  useEffect(() => {
    if (!countdown) return;

    const interval = setInterval(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown, trivia.id]);

  useEffect(() => {
    if (currentServerMsg) {
      if (
        currentServerMsg.type === "game_player_incorrect" &&
        currentServerMsg.payload.player === currentUser+sessionId
      ) {
        setIncorrectAnswer(selectedOption);
      }
    }
  }, [currentServerMsg]);

  const returnToLobby = () => {
    setServerMessage([]);
    setTrivia(null);
    setEnterGame(false);
    setFinalScores([])
    setRoomInfo({ roomName: "", question_count: questionCount || 3 });
  };

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleChange = (index: number) => {
    if (incorrectAnswer === null) {
      setSelectedOption(index);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setClicked(true);

    if (wsService.current) {
      const payload = {
        payload: {
          game_id: gameId,
          index: selectedOption,
          question_id: trivia.id,
        },
        type: "answer",
      };
      wsService.current.send(payload);
    }
  };

  return (
    <>
      {finalScores.length > 0 ? (
        <ScoreBoard
          finalScores={finalScores}
          returnToLobby={returnToLobby}
          players={players}
          sessionId={sessionId}
        />
      ) : (
        <div id="trivia-container">
          <section id="trivia-section">
            <span
              className={`trivia-note ${
                typeof incorrectAnswer === "number" ? "incorrect" : ""
              }`}
            >
              {incorrectAnswer ? (
                <p>Incorrect Answer. Waiting for other players to finish. </p>
              ) : (
                <p>Race to choose the correct answer!</p>
              )}
            </span>
            <span id="timer">
              <p>{formatTime(countdown)}</p>
            </span>
            <span id="question-count-display">
              <p>{`${currentQuestionCount.current} / ${questionCount}`}</p>
            </span>
          </section>
          <form id="trivia-form" onSubmit={handleSubmit}>
            <h4 id="question-header">{trivia.question}</h4>
            <span className="options-span">
              {trivia.options?.map((option, i) => (
                <div
                  key={option}
                  className={`radio-button-item ${
                    incorrectAnswer === i ? "incorrect" : ""
                  }`}
                  onClick={() => handleChange(i)}
                >
                  <input
                    type="radio"
                    name="options"
                    value={i}
                    checked={selectedOption === i}
                    onChange={() => handleChange(i)}
                    className="options-input"
                    required
                  />
                  {option}
                </div>
              ))}
            </span>
            <button
              id="submit-button"
              type="submit"
              disabled={incorrectAnswer !== null || clicked}
            >
              Submit
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default GameRoom;
