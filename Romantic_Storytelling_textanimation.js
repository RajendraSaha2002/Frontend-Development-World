const text = `Woh ek aise meaning ki tarah hai jise destiny ne waqt ke panno mein kahin chhupa kar rakha tha.
Uski smile mein woh warmth hai jo dil ke un kono tak pahunch jati hai jahan words nahi pahunch sakte.
Uska har step mere dil ki rhythm ke saath perfectly match karta hai.
Uska presence ordinary moments ko bhi hamesha ke liye memories mein badal deta hai.
Main shor machakar wish nahi karta; bas usey bohot deeply feel karta hoon.
Mujhe apni mornings mein uski hansi chahiye aur apni nights mein uska sukoon.
Sirf ek chapter ki tarah nahi, balki meri puri story ban kar.
Ek aisi presence jo hamesha saath rehne ke liye bani hai.`;

let i = 0;

function typeWriter() {
    const element = document.getElementById("animatedText");
    element.classList.add("typing");

    if (i < text.length) {
        element.innerHTML += text.charAt(i);
        i++;
        setTimeout(typeWriter, 30);
    }
}