document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("player-input");
  const submitBtn = document.getElementById("submit-btn");
  const feedback = document.getElementById("feedback");

  // Expected answer
  const correctAnswer = "Hello, world!";

  // Event listener for submission
  submitBtn.addEventListener("click", () => {
    const playerAnswer = input.value.trim();

    if (playerAnswer === correctAnswer) {
      feedback.textContent = "Correct! You crossed the Syntax Swamp!";
      feedback.style.color = "green";
    } else {
      feedback.textContent = "Try again! Remember the default value for 'name'.";
      feedback.style.color = "red";
    }
  });
});
