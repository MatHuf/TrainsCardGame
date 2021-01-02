// Deck generation
const suits = ["Hearts","Diamonds","Spades","Clubs"];
const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

const getNumberName = (numberValue) => {
  switch(numberValue){
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
}

const getCard = (suit, rank) => {
  let value;
  let name;
  switch(rank.toLowerCase()){
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

const getDeck = () => {
  let cards = [];
  for (let r = 0; r < ranks.length; r++){
    for (let s = 0; s < suits.length; s++){
      cards.push(getCard(suits[s], ranks[r]));
    }
  }
  return cards;
}

// https://medium.com/swlh/the-javascript-shuffle-62660df19a5d
function stackShuffle(deck) {
  let count = deck.length;
  while(count) {
    deck.push(deck.splice(Math.floor(Math.random() * count), 1)[0]);
    count -= 1;
  }
}

function riffleShuffle(deck) {
  const cutDeckVariant = deck.length / 2 + Math.floor(Math.random() * 9) - 4;
  const leftHalf = deck.splice(0, cutDeckVariant);
  let leftCount = leftHalf.length;
  let rightCount = deck.length - Math.floor(Math.random() * 4);
  while(leftCount > 0) {
    const takeAmount = Math.floor(Math.random() * 4);
    deck.splice(rightCount, 0, ...leftHalf.splice(leftCount, takeAmount));
    leftCount -= takeAmount;
    rightCount = rightCount - Math.floor(Math.random() * 4) + takeAmount;
  }
  deck.splice(rightCount, 0, ...leftHalf);
}

// Prepare deck
let deck = getDeck();
stackShuffle(deck);
riffleShuffle(deck);
stackShuffle(deck);
riffleShuffle(deck);
stackShuffle(deck);
riffleShuffle(deck);

let train = [];
let canPlay = true;
let highScores = [];

// Game actions
const drawCard = () => {
  if (!canPlay) return;
  let newCard = deck.shift();
  if (train.length > 0 && !isValidToPlay(train[train.length - 1], newCard)) {
    // TODO visually indicate last card on train doesn't match
    canPlay = false;
    showGameOver();
  }
  train.push(newCard);
  updateTrain();
}

const resetGame = () => {
  recordScore();
  clearTrain();
  hideGameOver();
  canPlay = true;
}

const resetScores = () => {
  highScores = [];
  updateScores();
}

// Game rules
const isValidToPlay = (currentCard, newCard) => {
  // TODO handle aces being both high and low
  if (currentCard.suit === newCard.suit) return true;
  if (currentCard.value <= newCard.value) return true;
  return false;
}

// Display train
const updateTrain = () => {
  if (train.length < 1) return;
  let parent = document.getElementById("train-container");
  parent.appendChild(createCard(train[train.length - 1]));
}

const clearTrain = () => {
  train = [];
  let trainCards = document.getElementById("train-container");
  trainCards.innerHTML = "";
}

const createCard = (card) => {
  const cardContainer = document.createElement("div");
  cardContainer.className = "card-container";
  let suitChar;
  switch (card.suit.toLowerCase()){
    case "hearts":
      suitChar = "♥";
      break;
    case "diamonds":
      suitChar = "♦";
      break;
    case "spades":
      suitChar = "♠";
      break;
    case "clubs":
      suitChar = "♣";
      break;
  }
  const content = document.createTextNode(`${card.rank} ${suitChar}`);
  cardContainer.appendChild(content);
  return cardContainer;
}

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
}

const hideGameOver = () => {
  const overlay = document.getElementById("overlay");
  overlay.classList.add(HIDDEN);
}

// High scores
// TODO handle without ordered list to account for ties
const recordScore = () => {
  const nameInput = document.getElementById("new-score-name");
  highScores.push({
    name: nameInput.value,
    // This happens after the final (invalid) card is added to the train
    // and we need to subtract one to account for it
    score: train.length - 1,
    rank: undefined,
  });
  updateScores();
}

const rankScores = () => {
  let rank = 0;
  highScores.sort((a,b) => b.score - a.score);
  highScores.forEach((s, i) => {
    if (i - 1 >= 0 && highScores[i - 1].score === s.score){
      s.rank = rank;
    } else {
      s.rank = ++rank;
    }
  });
}

const updateScores = () => {
  rankScores();
  const scoresList = document.getElementById("scores-list");
  scoresList.innerHTML = "";
  // Recreating the header so its easier to clear the whole element above
  const header = createScoreHeader();
  scoresList.appendChild(header);
  highScores.forEach(s => scoresList.appendChild(createScoreEntry(s)));
}

const createScoreHeader = () => {
  const header = createScoreEntry({
    rank: "Rank",
    name: "Name",
    score: "Score",
  });
  header.classList.add("score-list-header");
  return header;
}

const createScoreEntry = (scoreEntry) => {
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
  return listItem;
}