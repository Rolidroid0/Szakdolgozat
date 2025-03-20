const otherCard = await essosCards.findOne<Card>({ sequence_number: newEndPosition, game_id: ongoingGame._id });

...

await essosCards.updateOne(
	{ _id: endCard._id, game_id: ongoingGame._id },
	{ $set: { sequence_number: newEndPosition } }
);

await essosCards.updateOne(
	{ _id: otherCard._id, game_id: ongoingGame._id },
	{ $set: { sequence_number: endCard.sequence_number } }
);
        
const shuffledCards = await essosCards.find<Card>({ game_id: ongoingGame._id }).toArray();