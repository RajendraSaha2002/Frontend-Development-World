document.getElementById("startBtn").addEventListener("click", () => {

    // Start typing
    typeWriter();

    // Animate boy walking
    const boy = document.querySelector(".boy");
    boy.classList.add("walk");

    // Show heart after delay
    setTimeout(() => {
        document.querySelector(".heart").classList.add("show-heart");
    }, 3000);
});