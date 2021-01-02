
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

let deck = getDeck();

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

stackShuffle(deck);
riffleShuffle(deck);
stackShuffle(deck);
riffleShuffle(deck);
stackShuffle(deck);
riffleShuffle(deck);

// Debug Deck
// deck.forEach(c => {
//   console.log(`${c.name} of ${c.suit} (${c.value})`);
// });

const drawCard = () => {
  return deck.shift();
}

const isValidToPlay = (currentCard, newCard) => {
  if (currentCard.suit === newCard.suit) return true;
  if (currentCard.value <= newCard.value) return true;
  return false;
}

const playGame = () => {
  let canPlay = true;
  let currentCard;
  // initial draw
  currentCard = drawCard();
  console.log(`Drew ${currentCard.getName()}`);

  while(canPlay && deck.length){
    let nextCard = drawCard();
    console.log(`Drew ${nextCard.getName()}`);
    if (isValidToPlay(currentCard, nextCard)){
      currentCard = nextCard;
    } else {
      console.log("Game over");
      canPlay = false;
    }
  }
}

playGame();