import { Axios } from 'axios';
import { ILobbyGame, ILeaderboard } from '../interfaces';

class Api {
	url: string;
	client: Axios; 

	constructor(url: string) {
		if (url.endsWith('/')) {
			url = url.slice(0, -1);
		}

		this.url = url;
		this.client = new Axios({ baseURL: url });
	}

	fetchGameList = async (): Promise<ILobbyGame[]> => {
		try {
			const response = await this.client.get('/games');
			if (response.status != 200) {
				throw new Error('Failed to fetch game list');
			}
			return JSON.parse(response.data) as ILobbyGame[];
		} catch (error) {
			console.error('Error fetching game list:', error);
			throw error;
		}
  };
  
  fetchLeaderboard = async (): Promise<ILeaderboard[]> => {
    try {
      const response = await this.client.get('/leaderboard');
      if (response.status !== 200) {
        throw new Error('Failed to fetch game list');
      }
      return JSON.parse(response.data) 
    } catch (error) {
      console.error('Error in fetching leaderbaord', error)
      throw error;
    }
  }
}

const api = new Api("http://localhost:8080");

export default api;
