import React, { useEffect, useState } from "react";
import "./ScoreBoard.scss";
import { IPlayers, IScores} from "../../interfaces";

interface IScoreBoardProps {
  finalScores: IScores[];
  returnToLobby: () => void;
  players: IPlayers[];
  sessionId: string;
}

const ScoreBoard: React.FC<IScoreBoardProps> = ({
  finalScores,
  returnToLobby,
  players,
  sessionId
}) => {
  const [modifiedList, setModifiedList] = useState<IScores[]>([]);

  useEffect(() => {
    const list = modify(finalScores);
    setModifiedList(list);
  }, [finalScores])

  const modify = (finalScores: IScores[]): IScores[] => {
    finalScores.forEach((playerScore) => {
      const index = players.findIndex((player) => player.serverName === playerScore.name);
      if (index >= 0) {
        playerScore.name = players[index].name;
      }
    })
    return finalScores;
  }

  return (
    <div className="table-container">
      <h2>SCORE BOARD</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {modifiedList.map((item, index) => (
            <tr key={index}>
              <td>{sessionId === `_${item.name.split('_')[1]}` ? item.name.split('_')[0] : item.name}</td>
              <td>{item.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={returnToLobby}>Return to Lobby</button>
    </div>
  );
};

export default ScoreBoard;
