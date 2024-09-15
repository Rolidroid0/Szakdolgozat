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