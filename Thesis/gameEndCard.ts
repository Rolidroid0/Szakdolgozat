const endCard = await essosCards.findOne<Card>({ symbol: Symbol.End, game_id: ongoingGame._id });

const minPosition = Math.floor(cardCount / 2);
const maxPosition = cardCount - 1;
const newEndPosition = Math.floor(Math.random() * (maxPosition - minPosition + 1)) + minPosition;

const otherCard = await essosCards.findOne<Card>({ sequence_number: newEndPosition, game_id: ongoingGame._id });

if (!endCard || !otherCard) {
	console.error('Cards not found');
	return;
}

await essosCards.updateOne(
	{ _id: endCard._id, game_id: ongoingGame._id },
	{ $set: { sequence_number: newEndPosition } }
);

await essosCards.updateOne(
	{ _id: otherCard._id, game_id: ongoingGame._id },
	{ $set: { sequence_number: endCard.sequence_number } }
);