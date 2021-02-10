// Deck generation
const suits = ["Hearts", "Diamonds", "Spades", "Clubs"];
const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

const getNumberName = numberValue => {
	switch (numberValue) {
		case 1:
			return "One";
		case 2:
			return "Two";
		case 3:
			return "Three";
		case 4:
			return "Four";
		case 5:
			return "Five";
		case 6:
			return "Six";
		case 7:
			return "Seven";
		case 8:
			return "Eight";
		case 9:
			return "Nine";
		case 10:
			return "Ten";
		default:
			return "Unknown";
	}
};

const getCard = (suit, rank) => {
	let value;
	let name;
	switch (rank.toLowerCase()) {
		case "a":
			value = 1;
			name = "Ace";
			break;
		case "k":
			value = 13;
			name = "King";
			break;
		case "q":
			value = 12;
			name = "Queen";
			break;
		case "j":
			value = 11;
			name = "Jack";
			break;
		default:
			value = parseInt(rank);
			name = getNumberName(value);
	}
	return {
		value,
		suit,
		rank,
		name,
		getName: () => `${name} of ${suit}`,
	};
};

const getSuitEmoji = card => {
	switch (card.suit.toLowerCase()) {
		case "hearts":
			return "♥️";
		case "diamonds":
			return "♦️";
		case "spades":
			return "♠️";
		case "clubs":
			return "♣️";
	}
};

const getDeck = () => {
	let cards = [];
	for (let r = 0; r < ranks.length; r++) {
		for (let s = 0; s < suits.length; s++) {
			cards.push(getCard(suits[s], ranks[r]));
		}
	}
	return cards;
};

// https://medium.com/swlh/the-javascript-shuffle-62660df19a5d
function stackShuffle(deck) {
	let count = deck.length;
	while (count) {
		deck.push(deck.splice(Math.floor(Math.random() * count), 1)[0]);
		count -= 1;
	}
}

function riffleShuffle(deck) {
	const cutDeckVariant = deck.length / 2 + Math.floor(Math.random() * 9) - 4;
	const leftHalf = deck.splice(0, cutDeckVariant);
	let leftCount = leftHalf.length;
	let rightCount = deck.length - Math.floor(Math.random() * 4);
	while (leftCount > 0) {
		const takeAmount = Math.floor(Math.random() * 4);
		deck.splice(rightCount, 0, ...leftHalf.splice(leftCount, takeAmount));
		leftCount -= takeAmount;
		rightCount = rightCount - Math.floor(Math.random() * 4) + takeAmount;
	}
	deck.splice(rightCount, 0, ...leftHalf);
}

const alternateShuffleDeck = (deck, shuffleCount) => {
	for (let i = 0; i < shuffleCount; i++) {
		stackShuffle(deck);
		riffleShuffle(deck);
	}
};

// Initialization
let deck = [];
let train = [];
let canPlay = true;
let highScores = [];

const prepareDeck = () => {
	deck = getDeck();
	alternateShuffleDeck(deck, 3);
};
prepareDeck();

// Add listener to game over input
const nameInput = document.getElementById("new-score-name");
nameInput.addEventListener("keydown", e => handleEnter(e));

// Event handlers
const handleEnter = e => {
	if (e.key === "Enter") {
		resetGame();
	}
};

// Game actions
const drawCard = () => {
	if (!canPlay) return;
	let newCard = deck.shift();
	// First card is always valid
	let isValid = train.length > 0 ? isValidToPlay(train[train.length - 1], newCard) : true;
	if (!isValid) {
		canPlay = false;
		showGameOver();
	}
	train.push(newCard);
	updateTrain(isValid);
};

const resetGame = () => {
	recordScore();
	clearTrain();
	prepareDeck();
	hideGameOver();
	canPlay = true;
};

const resetScores = () => {
	highScores = [];
	updateScores();
};

// Game rules
const isValidToPlay = (currentCard, newCard) => {
	// Potential upgrade: customize rules?
	if (currentCard.suit === newCard.suit) return true;
	if (currentCard.value <= newCard.value) return true;
	if (newCard.rank.toLowerCase() === "a") return true;
	return false;
};

// Display train
const updateTrain = isValid => {
	if (train.length < 1) return;
	let parent = document.getElementById("train-container");
	let newCard = createCard(train[train.length - 1], isValid);
	if (!isValid) {
		newCard.classList.add("invalid-card");
	}
	parent.appendChild(newCard);
};

const clearTrain = () => {
	train = [];
	let trainCards = document.getElementById("train-container");
	trainCards.innerHTML = "";
};

const createCard = (card, isValid) => {
	const cardContainer = document.createElement("div");
	cardContainer.classList.add("card-container", "card-size");
	const suitChar = getSuitEmoji(card);
	const content = document.createTextNode(`${card.rank} ${suitChar}`);
	cardContainer.appendChild(content);
	if (!isValid) {
		const invalidIndicator = document.createElement("div");
		invalidIndicator.innerHTML = "&#128683;"; // Prohibited emoji
		cardContainer.appendChild(invalidIndicator);
	}
	return cardContainer;
};

// Game over state
const HIDDEN = "hidden";

const showGameOver = () => {
	const nameInput = document.getElementById("new-score-name");
	nameInput.value = "";
	const newScore = document.getElementById("new-score");
	// This happens before the final (invalid) card is added to the train
	// so we don't need to worry about subtracting from the new score here
	newScore.innerHTML = train.length;
	const overlay = document.getElementById("overlay");
	overlay.classList.remove(HIDDEN);
	nameInput.focus();
};

const hideGameOver = () => {
	const overlay = document.getElementById("overlay");
	overlay.classList.add(HIDDEN);
};

// High scores
const recordScore = () => {
	const nameInput = document.getElementById("new-score-name");
	highScores.push({
		name: nameInput.value,
		// This happens after the final (invalid) card is added to the train
		// and we need to subtract one to account for it
		score: train.length - 1,
		rank: undefined,
		summary: getTrainSummary(),
	});
	updateScores();
};

const rankScores = () => {
	let rank = 0;
	highScores.sort((a, b) => b.score - a.score);
	highScores.forEach((s, i) => {
		if (i - 1 >= 0 && highScores[i - 1].score === s.score) {
			s.rank = rank;
		} else {
			s.rank = ++rank;
		}
	});
};

const updateScores = () => {
	rankScores();
	const scoresList = document.getElementById("scores-list");
	scoresList.innerHTML = "";
	// Recreating the header so its easier to clear the whole element above
	const header = createScoreHeader();
	scoresList.appendChild(header);
	highScores.forEach(s => scoresList.appendChild(createScoreEntry(s)));
};

const getTrainSummary = () => {
	return train.map((c, i) => {
		let cardSummary = `${c.rank}${getSuitEmoji(c)}`;
		if (i === train.length - 1) {
			cardSummary = `&#128683;${cardSummary}`;
		}
		return cardSummary;
	});
};

const createScoreHeader = () => {
	const header = createScoreEntry({
		rank: "Rank",
		name: "Name",
		score: "Score",
	});
	header.classList.add("score-list-header");
	return header;
};

const createScoreEntry = scoreEntry => {
	const listItem = document.createElement("li");
	const container = document.createElement("div");
	container.className = "score-container";
	listItem.appendChild(container);
	const rankContainer = document.createElement("div");
	rankContainer.textContent = scoreEntry.rank;
	container.appendChild(rankContainer);
	const nameContainer = document.createElement("div");
	nameContainer.textContent = scoreEntry.name;
	container.appendChild(nameContainer);
	const scoreContainer = document.createElement("div");
	scoreContainer.textContent = scoreEntry.score;
	container.appendChild(scoreContainer);
	if (scoreEntry.summary) {
		const summaryToolTip = document.createElement("span");
		summaryToolTip.classList.add("tooltip-text");
		summaryToolTip.appendChild(createSummaryList(scoreEntry.summary));
		container.appendChild(summaryToolTip);
	}
	return listItem;
};

const createSummaryList = summary => {
	const list = document.createElement("ul");
	list.classList.add("list-style-type-none");
	summary.forEach(c => {
		let listItem = document.createElement("li");
		listItem.innerHTML = c;
		list.appendChild(listItem);
	});
	return list;
};
