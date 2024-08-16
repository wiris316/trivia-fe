export interface ILobbyGame {
	id: string;
	name: string;
  question_count: number;
  player_count: number;
	state: 'waiting' | 'countdown' | 'question' | 'ended';
}

export interface ILeaderboard {
  player_name: string;
  accuracy: number;
  average_milliseconds: number,
  correct_questions: string,
  time_milliseconds?: string,
  total_questions: string,
  last_update?: Date
}

export interface IRoomInfo {
  roomName: string;
  question_count: number;
}

export interface IServerMessage {
  id: string;
  type: string;
  payload: IPayload;
  error?: string;
  player?: string;
}

export interface IScores {
  name: string;
  score: number;
}

export interface IPayload {
  name: string;
  players?: string[];
  player?: string;
  players_ready: {};
  question_count: number;
  id?: string;
  options?: string[];
  question?: string;
  state?: string;
  scores?: IScores[];
  seconds?: number;
}

export interface IPlayers {
  name: string;
  ready: boolean;
  time?: number;
  serverName?: string;
}

export interface IReadyPlayers {
  [key: string]: boolean;
}

export interface ITrivia {
  id: string | undefined;
  question: string | undefined;
  options: string[] | undefined;
  seconds: number;
}