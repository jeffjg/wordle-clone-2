const gameState = {
  answer: "", // Will be set to a new 5-letter word on load/reset
  currentGuess: [],
  activeLetterPosition: 0,
  correctLetterSet: new Set(),
  incorrectLetterSet: new Set(),
  attempt: 1,
};

const wordleGrid = document.getElementById("wordle-grid");
let activeRow = wordleGrid.querySelector("#row" + gameState.attempt);
let letterSquares = activeRow.querySelectorAll("span");
const keyboardButton = [...document.querySelectorAll("#keyboard .row button")];
let enterKey = document.getElementById("enter");
let deleteKey = document.getElementById("del");

const commonWords = [
  "APPLE",
  "BREAD",
  "CHAIR",
  "TABLE",
  "WATER",
  "HOUSE",
  "HEART",
  "MUSIC",
  "MONEY",
  "HAPPY",
  "LAUGH",
  "DANCE",
  "SMILE",
  "STONE",
  "LIGHT",
  "SOUND",
  "EARTH",
  "STORM",
  "NIGHT",
  "DREAM",
  "FAITH",
  "TRUST",
  "HONOR",
  "SPACE",
  "PEACE",
  "SUGAR",
  "SPICE",
  "SPOON",
  "KNIFE",
  "FROST",
  "FLAME",
  "SPARK",
  "CHARM",
  "GLORY",
  "PROUD",
  "BRAVE",
  "SWIFT",
  "QUICK",
  "CLEAR",
  "GLIDE",
  "SHINE",
  "FABLE",
  "TIGER",
  "EAGLE",
  "ZEBRA",
  "KOALA",
  "PANDA",
  "CROWN",
  "SWORD",
  "LASER",
  "SOLID",
  "MAGIC",
  "REALM",
  "OCEAN",
  "RIVER",
  "VALVE",
  "FLOCK",
  "WHEAT",
  "GRAIN",
  "TULIP",
  "ROSES",
  "LILAC",
  "DAISY",
  "POPPY",
  "BLOOM",
  "VIVID",
  "CIDER",
  "GRAPE",
  "MELON",
  "BERRY",
  "LEMON",
  "MANGO",
  "PEACH",
  "OLIVE",
  "APRON",
  "BRUSH",
  "CLOCK",
  "FRAME",
  "PHOTO",
  "PAPER",
  "GLASS",
  "FLASK",
  "COUCH",
  "SHELF",
  "PLANT",
  "GREEN",
  "PEARL",
  "CORAL",
  "CREEK",
  "BRICK",
  "METAL",
  "BOARD",
  "GRASS",
  "CLOUD",
  "SOLAR",
  "RADIO",
  "VIDEO",
  "NOISE",
  "VOICE",
  "CABIN",
];

// Handles keyboard clicks
keyboardButton.forEach((input) => {
  input.addEventListener("click", () => {
    let btnPressed = input.textContent;
    if (btnPressed === "ENTER") {
      handleEnterPress();
    } else if (btnPressed === "DEL") {
      delLetterFromGuess();
    } else {
      addLetterToGuess(btnPressed);
    }
  });
});

function addLetterToGuess(letter) {
  if (gameState.activeLetterPosition <= 4) {
    letter = letter.toUpperCase();
    letterSquares[gameState.activeLetterPosition].textContent = letter;
    gameState.currentGuess.push(letter);
    gameState.activeLetterPosition++;
  }
}

// Modifies handleEnterPress to be async so that it waits for the API validation
async function handleEnterPress() {
  if (gameState.currentGuess.length === 5) {
    let guessedLetters = gameState.currentGuess;
    const valid = await checkIfWord(guessedLetters);
    if (valid) {
      compareGuessToAnswer(guessedLetters);
    }
  } else {
    alert("Your answer must be 5 letters to submit.");
  }
}

function delLetterFromGuess(letter) {
  if (gameState.activeLetterPosition > 0) {
    letterSquares[gameState.activeLetterPosition - 1].textContent = "";
    gameState.currentGuess.pop(letter);
    gameState.activeLetterPosition--;
  }
}

window.addEventListener("keydown", handleKeyDown);

function handleKeyDown(e) {
  const key = e.key.toUpperCase();

  if (key >= "A" && key <= "Z" && key.length === 1) {
    addLetterToGuess(key);
  } else if (key === "ENTER") {
    handleEnterPress();
  } else if (key === "BACKSPACE" || key === "DELETE") {
    delLetterFromGuess();
  }
}

// This function uses the Dictionary API to validate the guessed word.
async function checkIfWord(guessedAnswer) {
  let guessedAnswerFull = guessedAnswer.join("");

  // Check if the word is exactly 5 letters long
  if (guessedAnswerFull.length !== 5) {
    alert("Word must be exactly 5 letters long.");
    return false;
  }

  // Construct the API URL (using lowercase as required by the API)
  const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${guessedAnswerFull.toLowerCase()}`;

  try {
    const response = await fetch(apiUrl);
    // If the word is not found, the API returns a non-OK response
    if (!response.ok) {
      alert(`${guessedAnswerFull} is not a valid English word.`);
      return false;
    }
    const data = await response.json();
    console.log(`${guessedAnswerFull} is a valid English word!`);
    return true;
  } catch (error) {
    console.error("Error checking the word:", error);
    return false;
  }
}

function compareGuessToAnswer(guessedAnswer) {
  let correctAnswer = gameState.answer.split("");

  displayCorrectnessInGuess(correctAnswer, guessedAnswer);
  displayCorrectnessInKeyboard(correctAnswer, guessedAnswer);

  if (guessedAnswer.join("") === gameState.answer) {
    setTimeout(() => {
      alert("Congratulations! You've guessed the word!");
      if (confirm("Would you like to start a new game?")) {
        resetGame();
      }
    }, 1);
  } else {
    gameState.attempt++;
    if (gameState.attempt === 7) {
      alert("Sorry, you've run out of chances to win!");
    } else {
      newGuess();
    }
  }
}

function displayCorrectnessInGuess(correctAnswer, guessedAnswer) {
  // Arrays to keep track of letter statuses
  let letterStatuses = Array(5).fill("incorrect-letter"); // Default to grey
  let unmatchedAnswerLetters = correctAnswer.slice();

  // First pass: Check for correct letters in correct positions (green)
  for (let i = 0; i < 5; i++) {
    if (guessedAnswer[i] === correctAnswer[i]) {
      letterStatuses[i] = "correct-letter-and-position"; // Mark as green
      unmatchedAnswerLetters[i] = null; // Remove matched letter
    }
  }

  // Second pass: Check for correct letters in wrong positions (yellow)
  for (let i = 0; i < 5; i++) {
    if (
      letterStatuses[i] !== "correct-letter-and-position" &&
      unmatchedAnswerLetters.includes(guessedAnswer[i])
    ) {
      letterStatuses[i] = "incorrect-position"; // Mark as yellow

      // Remove the matched letter to prevent matching it again
      unmatchedAnswerLetters[unmatchedAnswerLetters.indexOf(guessedAnswer[i])] =
        null;
    }
  }

  // Apply the statuses/colors to the letter squares
  letterSquares.forEach((square, i) => {
    square.classList.add(letterStatuses[i]);
  });
}

function displayCorrectnessInKeyboard(correctAnswer, guessedAnswer) {
  // Makes all selected answers default to gray on the keyboard
  for (let i = 0; i < 5; i++) {
    let keyboardButtonIndex = keyboardButton.findIndex(
      (button) => button.innerText === guessedAnswer[i]
    );
    // 1st Pass: Makes all selected letters gray on keyboard
    keyboardButton[keyboardButtonIndex].classList.add("incorrect-letter");

    // 2nd Pass: Finds all selected letters in answer and makes yellow on keyboard
    if (correctAnswer.includes(guessedAnswer[i])) {
      keyboardButton[keyboardButtonIndex].classList.remove("incorrect-letter");
      keyboardButton[keyboardButtonIndex].classList.add("incorrect-position");
    }
    if (guessedAnswer[i] === correctAnswer[i]) {
      keyboardButton[keyboardButtonIndex].classList.remove("incorrect-letter");
      keyboardButton[keyboardButtonIndex].classList.remove(
        "incorrect-position"
      );
      keyboardButton[keyboardButtonIndex].classList.add(
        "correct-letter-and-position"
      );
    }
  }
}

function newGuess() {
  activeRow = wordleGrid.querySelector("#row" + gameState.attempt);
  activeRow.classList.add("active");
  letterSquares = activeRow.querySelectorAll("span");
  gameState.currentGuess = [];
  gameState.activeLetterPosition = 0;
}

function generateNewWord() {
  const randomIndex = Math.floor(Math.random() * commonWords.length);
  const newWord = commonWords[randomIndex];
  gameState.answer = newWord;
  console.log(`New word is ${newWord}`);
  return newWord;
}

function resetGame() {
  // Removed the problematic line here:
  // Array.from(wordleGrid.querySelector("#row")).classList.remove("active");

  keyboardButton.forEach((button) => {
    button.classList.remove("correct-letter-and-position");
    button.classList.remove("incorrect-letter");
    button.classList.remove("incorrect-position");
  });

  wordleGrid.querySelectorAll("span").forEach((letter) => {
    letter.classList.remove("correct-letter-and-position");
    letter.classList.remove("incorrect-letter");
    letter.classList.remove("incorrect-position");
    letter.textContent = "";
  });

  for (let i = 1; i <= 6; i++) {
    const row = wordleGrid.querySelector(`#row${i}`);
    if (row) {
      row.classList.remove("active");
    }
  }

  gameState.attempt = 1;
  generateNewWord();
  newGuess();
}

// On initial load, generate the first word.
generateNewWord();
