import React, { useEffect, useState } from "react";
import "./Leaderboard.scss";
import { ILeaderboard } from "../../interfaces";

interface LeaderBoardProps {
  leaderboardList: ILeaderboard[];
  setLeaderboardView: React.Dispatch<React.SetStateAction<boolean>>;
  setLeaderboardList: React.Dispatch<React.SetStateAction<ILeaderboard[]>>;
}

const LeaderBoard: React.FC<LeaderBoardProps> = ({
  leaderboardList,
  setLeaderboardView,
  setLeaderboardList
}) => {
  const [updatedList, setUpdatedList] = useState<ILeaderboard[]>([]);

  useEffect(() => {
    const sortedList: ILeaderboard[] = sort(leaderboardList);
    const filteredList: ILeaderboard[] = filter(sortedList);
    setUpdatedList(filteredList);
  }, [leaderboardList]);

  const sort = (leaderboardList: ILeaderboard[]): ILeaderboard[] => {
    return leaderboardList.sort((a, b) => {
      // Sort accuracy in descending order
      if (a.accuracy > b.accuracy) return -1;
      if (a.accuracy < b.accuracy) return 1;

      // Sort milliseconds in ascending order
      if (a.average_milliseconds < b.average_milliseconds) return -1;
      if (a.average_milliseconds > b.average_milliseconds) return 1;

      return 0; 
    });
  };
  
  const filter = (sortedList: ILeaderboard[]): ILeaderboard[] => {
    const leaderboardMap = new Map<string, ILeaderboard>();
  
    for (const player of sortedList) {
      const name = player.player_name.split('_')[0];
      if (!leaderboardMap.has(name)) {
        leaderboardMap.set(name, {...player, player_name: name});
      }
    }
  
    return [...leaderboardMap.values()];
  };

  const formatMilliseconds = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor(ms % 1000);
    return `${minutes}m ${seconds}s ${milliseconds}ms`;
  };

  const handleClose = () => {
    setLeaderboardView(false)
    setLeaderboardList([]);
  }
  
  return (
    <div id="table-overlay">
      <div className="table-container">
        <h2>˖ ݁𖥔 ݁˖ LEADERBOARD ˖ ݁𖥔 ݁˖</h2>
        <span className="scroll-container">
          {!updatedList.length ? (
            <p id="leaderboard-description">No Scores Available</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Best Score</th>
                  <th>Average time</th>
                </tr>
              </thead>
              <tbody>
                {updatedList.length > 0 && updatedList.map((item, index) => (
                  <tr key={index}>
                    <td>{item.player_name}</td>
                    <td>{`${item.correct_questions} / ${item.total_questions}`}</td>
                    <td>{formatMilliseconds(item.average_milliseconds)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </span>
        <button onClick={handleClose}>CLOSE</button>
      </div>
    </div>
  );
};

export default LeaderBoard;
