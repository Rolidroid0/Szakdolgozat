import React, { useEffect, useState } from 'react';
import { Card } from '../../types/Card';
import './Cards.css';
import { API_BASE_URL } from '../../config/config';
import { WebSocketService } from '../../services/WebSocketService';

interface CardsDisplayProps {
    playerId: string | null;
    onTradeSuccess: (additionalArmies: number) => void;
}

const CardsDisplay: React.FC<CardsDisplayProps> = ({ playerId, onTradeSuccess }) => {
    const [selectedCards, setSelectedCards] = useState<string[]>([]);
    const [playerCards, setPlayerCards] = useState<Card[]>([]);

    useEffect(() => {
        const loadPlayerCards = async () => {
            try {
                if (!playerId)
                { 
                    throw Error("No playerId");
                }
                const cards = await fetchPlayerCards(playerId);
                setPlayerCards(cards);
            } catch (error) {
                console.error(error);
            }
        };

        loadPlayerCards();

        const wsService = WebSocketService.getInstance();

        const cardsDisplayHandler = (message: any) => {
                if (message.action === 'cards-updated' && message.data.playerId === playerId) {
                    loadPlayerCards();
                }
        };

        wsService.registerHandler('cards-updated', cardsDisplayHandler);

        return () => {
            wsService.unregisterHandler('cards-updated', cardsDisplayHandler);
        };
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
            if (!playerId) {
                throw Error("No playerId");
            }
            const data = await tradeCardsForArmies(playerId, selectedCards);
            onTradeSuccess(data.additionalArmies);
            setSelectedCards([]);
            const cards = await fetchPlayerCards(playerId);
            setPlayerCards(cards);
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
            <h3 className='cards-title'>Your Cards</h3>
            <div className='cards-list'>
                {playerCards.map((card) => (
                    <div
                        key={card._id}
                        className={`card ${selectedCards.includes(card._id) ? 'selected' : ''} ${card.symbol.toLowerCase()}`}
                        onClick={() => handleCardClick(card._id)}
                    >
                        <div className='card-name'>{card.name}</div>
                        <div className='card-symbol'>{card.symbol}</div>
                        <div className="card-icon">
                            {card.symbol === 'knight' && '♞'}
                            {card.symbol === 'siegeEngine' && '🏹'}
                            {card.symbol === 'fortress' && '♜'}
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={handleTrade} disabled={selectedCards.length !== 3} className='trade-button'>
                Trade Selected Cards
            </button>
        </div>
    );
};

export default CardsDisplay;