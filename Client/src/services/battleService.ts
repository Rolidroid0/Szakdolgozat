import { API_BASE_URL } from "../config/config";
import { Battle } from "../types/Battle";

export const getOngoingBattle = async (): Promise<Battle | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/battles/ongoing`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch ongoing battle');
        }

        const data = await response.json();

        if (data.message === 'No ongoing battle'){
            return null;
        }

        return data as Battle;
    } catch (error) {
        console.error('Error fetching ongoing battle: ', error);
        throw error;
    }
};

export const rollDice = async (playerId: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/battles/roll-dice`, { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ playerId }),
        });
    
        if (!response.ok) {
            throw new Error("Failed to roll dice");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error rolling dice: ", error);
    }
};