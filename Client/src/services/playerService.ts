import { API_BASE_URL } from "../config/config";
import { Player } from "../types/Player";


export const getPlayerDetails = async (playerId: string): Promise<Player> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/players/${playerId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        return response.json();
    } catch (error) {
        console.error('Error fetching player details: ', error);
        throw error;
    }
};