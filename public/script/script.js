
    // Remove error message after 3 seconds
    setTimeout(() => {
        const errorMessage = document.getElementById('span');
        if (errorMessage) {
            errorMessage.style.display = 'none';
        }
    }, 3000);
    setTimeout(() => {
        const sucessMessage = document.getElementById('sucessMessage');
        if (sucessMessage) {
            sucessMessage.style.display = 'none';
        }
    }, 3000);
