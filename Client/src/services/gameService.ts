import { API_BASE_URL } from "../config/config";
import { Game } from "../types/Game";


export const getGameDetails = async (): Promise<Game> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/games/ongoing`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        return response.json();
    } catch (error) {
        console.error('Error fetching game details: ', error);
        throw error;
    }
};