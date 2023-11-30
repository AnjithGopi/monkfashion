document.addEventListener('DOMContentLoaded', function () {
    let countdown = 10; // Set the initial countdown value in seconds

    function updateTimer() {
        document.getElementById('countdown').innerText = `Resend OTP in ${countdown} seconds`;

        if (countdown === 0) {
            document.getElementById('resend').innerText = 'You can resend OTP now';
        } else {
            countdown--;
            setTimeout(updateTimer, 1000); // Update every second
        }
    }

    // Start the timer when the page loads
    updateTimer();
});