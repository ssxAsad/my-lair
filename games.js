// Sound Effects (Optional - uses browser beep or just console for now)
function playSound(type) {
    // In a full build, we would add Audio objects here
    // const click = new Audio('click.mp3');
    // click.play();
}

// Handle entering a game
function enterGame(url) {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        window.location.href = url;
    }, 500);
}

// Handle locked games
function lockedAlert(message) {
    // A custom styled alert or console log
    // For now, a visual shake effect on the card would be cool,
    // but a simple alert works for MVP.
    alert("ACCESS DENIED: " + message);
}

// On Load Animation
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.game-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        // Staggered fade in
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100); // 100ms delay between each card
    });
});