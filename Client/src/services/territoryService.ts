import { API_BASE_URL } from "../config/config";
import { Territory } from "../types/Territory";


export const getTerritoryDetails = async (territoryId: string): Promise<Territory> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/territories/${territoryId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        return response.json();
    } catch (error) {
        console.error('Error fetching territory details: ', error);
        throw error;
    }
};

export const getManeuverableTerritories = async (playerId: string, territoryId: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/territories/maneuverable?playerId=${playerId}&territoryId=${territoryId}`);
        if (!response.ok) {
            throw new Error('Failer to fetch maneuverable territories');
        }
        return response.json();
    } catch (error) {
        console.error('Error fetching maneuverable territories: ', error);
        throw error;
    }
};