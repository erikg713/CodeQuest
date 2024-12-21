document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("player-input");
  const submitBtn = document.getElementById("submit-btn");
  const feedback = document.getElementById("feedback");
  const instruction = document.getElementById("instruction");
  const challengeElement = document.getElementById("challenge");

  // Challenges data
  const challenges = [
    {
      question: `
function greet(name) {
  return \`Hello, \${name || "world"}!\`;
}
      `,
      prompt: "What does greet() return if no name is provided?",
      answer: "Hello, world!",
    },
    {
      question: `
let x = 10;
x += 5;
x *= 2;
console.log(x);
      `,
      prompt: "What does the console log?",
      answer: "30",
    },
    {
      question: `
const fruits = ["apple", "banana", "cherry"];
console.log(fruits[1]);
      `,
      prompt: "What does the console log?",
      answer: "banana",
    },
  ];

  let currentChallengeIndex = 0;

  function loadChallenge() {
    const currentChallenge = challenges[currentChallengeIndex];
    challengeElement.innerHTML = `
      <pre>${currentChallenge.question}</pre>
      <p>${currentChallenge.prompt}</p>
      <input type="text" id="player-input" placeholder="Type your answer here">
      <button id="submit-btn">Submit</button>
    `;
    feedback.textContent = "";
    bindSubmitButton();
  }

  function bindSubmitButton() {
    const submitBtn = document.getElementById("submit-btn");
    const input = document.getElementById("player-input");

    submitBtn.addEventListener("click", () => {
      const playerAnswer = input.value.trim();

      if (playerAnswer === challenges[currentChallengeIndex].answer) {
        feedback.textContent = "Correct! Moving to the next challenge...";
        feedback.style.color = "green";
        setTimeout(() => {
          currentChallengeIndex++;
          if (currentChallengeIndex < challenges.length) {
            loadChallenge();
          } else {
            instruction.textContent = "Congratulations! You completed Syntax Swamp!";
            challengeElement.innerHTML = "";
          }
        }, 1000);
      } else {
        feedback.textContent = "Incorrect. Try again!";
        feedback.style.color = "red";
      }
    });
  }

  loadChallenge();
});
let score = 0;

function updateStats() {
  document.getElementById("score").textContent = score;
  document.getElementById("level").textContent = currentChallengeIndex + 1;
}

submitBtn.addEventListener("click", () => {
  const playerAnswer = input.value.trim();
  if (playerAnswer === challenges[currentChallengeIndex].answer) {
    score += 10;
    updateStats();
    // Move to the next level...
  }
});
