const gameState = {
  answer: "DOGGY",
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

function handleEnterPress() {
  if (gameState.currentGuess.length === 5) {
    compareGuessToAnswer();
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
  // Normalize the key value to uppercase to handle both uppercase and lowercase inputs
  const key = e.key.toUpperCase();

  // Check if the key is an alphabetic character between A-Z
  if (key >= "A" && key <= "Z" && key.length === 1) {
    addLetterToGuess(key);
  }
  // Check if the key is Enter
  else if (key === "ENTER") {
    handleEnterPress();
  }
  // Check if the key is Backspace or Delete
  else if (key === "BACKSPACE" || key === "DELETE") {
    delLetterFromGuess();
  }
  // Ignore other keys
}

function compareGuessToAnswer() {
  let correctAnswer = gameState.answer.split("");
  let guessedLetters = gameState.currentGuess;

  displayCorrectnessInGuess(correctAnswer, guessedLetters);
  displayCorrectnessInKeyboard(correctAnswer, guessedLetters);

  // Proceed to the next attempt or end the game
  if (guessedLetters.join("") === gameState.answer) {
    setTimeout(() => {
      alert("Congratulations! You've guessed the word!");
    }, 1); // Delay in milliseconds
  } else {
    gameState.attempt++;
    if (gameState.attempt === 7) {
      alert("Sorry, you've run out of chances to win!");
    } else {
      newGuess();
    }
  }
}

function displayCorrectnessInGuess(correctAnswer, guessedLetters) {
  // Arrays to keep track of letter statuses
  let letterStatuses = Array(5).fill("incorrect-letter"); // Default to grey
  let unmatchedAnswerLetters = correctAnswer.slice();

  // First pass: Check for correct letters in correct positions (green)
  for (let i = 0; i < 5; i++) {
    if (guessedLetters[i] === correctAnswer[i]) {
      letterStatuses[i] = "correct-letter-and-position"; // Mark as green
      unmatchedAnswerLetters[i] = null; // Remove matched letter
    }
  }

  // Second pass: Check for correct letters in wrong positions (yellow)
  for (let i = 0; i < 5; i++) {
    if (
      letterStatuses[i] !== "correct-letter-and-position" &&
      unmatchedAnswerLetters.includes(guessedLetters[i])
    ) {
      letterStatuses[i] = "incorrect-position"; // Mark as yellow

      // Remove the matched letter to prevent matching it again
      unmatchedAnswerLetters[
        unmatchedAnswerLetters.indexOf(guessedLetters[i])
      ] = null;
    }
  }

  // Apply the statuses to the letter squares
  letterSquares.forEach((square, i) => {
    square.classList.add(letterStatuses[i]);
  });
}

function displayCorrectnessInKeyboard(correctAnswer, guessedLetters) {
  for (let i = 0; i < keyboardButton.length; i++) {
    console.log(i);
  }

  // Makes all selected answers default to gray in keyboard
  for (let i = 0; i < 5; i++) {
    let keyboardButtonIndex = keyboardButton.findIndex(
      (button) => button.innerText === guessedLetters[i]
    );
    // 1st Pass: Makes all selected letters gray on keyboard
    keyboardButton[keyboardButtonIndex].classList.add("incorrect-letter");

    // 2nd Pass: Finds all selected letters in answer and makes yellow on keyboard
    if (correctAnswer.includes(guessedLetters[i])) {
      keyboardButton[keyboardButtonIndex].classList.remove("incorrect-letter");
      keyboardButton[keyboardButtonIndex].classList.add("incorrect-position");
    }
    if (guessedLetters[i] === correctAnswer[i]) {
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

function resetGame() {
  gameState.attempt = 0;
  newGuess();
}
