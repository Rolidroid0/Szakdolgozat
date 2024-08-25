import React, { useEffect, useState } from 'react';
import { Card } from '../../types/Card';
import './Cards.css';
import { API_BASE_URL } from '../../config/config';

interface CardsDisplayProps {
    playerId: string;
    onTradeSuccess: (additionalArmies: number) => void;
}

const CardsDisplay: React.FC<CardsDisplayProps> = ({ playerId, onTradeSuccess }) => {
    const [selectedCards, setSelectedCards] = useState<string[]>([]);
    const [playerCards, setPlayerCards] = useState<Card[]>([]);

    useEffect(() => {
        const loadPlayerCards = async () => {
            try {
                const cards = await fetchPlayerCards(playerId);
                setPlayerCards(cards);
            } catch (error) {
                console.error(error);
            }
        };

        loadPlayerCards();
    }, [playerId]);

    const handleCardClick = (cardId: string) => {
        if (selectedCards.includes(cardId)) {
            setSelectedCards(selectedCards.filter(id => id !== cardId));
        } else if (selectedCards.length < 3) {
            setSelectedCards([...selectedCards, cardId]);
        }
    };

    const handleTrade = async () => {
        try {
            const data = await tradeCardsForArmies(playerId, selectedCards);
            onTradeSuccess(data.additionalArmies);
            setSelectedCards([]);
        } catch (error) {
            console.error(error);
            alert(error);
        }
    };

    const tradeCardsForArmies = async (playerId: string, cardIds: string[]) => {
        const response = await fetch(`${API_BASE_URL}/api/cards/trade`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ playerId, cardIds }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error trading cards");
        }

        const data = await response.json();
        return data;
    }

    //KÜLÖN MAPPÁBA TENNI A FÜGGVÉNYT!!!
    const fetchPlayerCards = async (playerId: string): Promise<Card[]> => {
        const response = await fetch(`${API_BASE_URL}/api/cards/${playerId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error fetching player cards");
        }
    
        const cards: Card[] = await response.json();
        return cards;
    };

    return (
        <div className='cards-container'>
            <h3>Your Cards</h3>
            <div className='cards-list'>
                {playerCards.map((card) => (
                    <div
                        key={card._id}
                        className={`card ${selectedCards.includes(card._id) ? 'selected' : ''}`}
                        onClick={() => handleCardClick(card._id)}
                    >
                        {card.name}
                        {card.symbol}
                    </div>
                ))}
            </div>
            <button onClick={handleTrade} disabled={selectedCards.length !== 3}>
                Trade Selected Cards
            </button>
        </div>
    );
};

export default CardsDisplay;