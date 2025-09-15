document.addEventListener("DOMContentLoaded", async () => {
    const otpDisplay = document.getElementById("otp-display");
    const timerDisplay = document.getElementById("timer-display");

const urlParams = new URLSearchParams(window.location.search);

const email = urlParams.get("email");

    if (email) {
        try {
            const response = await fetch(`/assets/php_file/getOTP.php?email=${email}`);
            const data = await response.json();

            if (data.success) {
                otpDisplay.textContent = data.otp;
            } else {
                otpDisplay.textContent = "No OTP found.";
            }
        } catch (error) {
            otpDisplay.textContent = "Error fetching OTP.";
        }
    } else {
        otpDisplay.textContent = "No email provided.";
    }

    let timeLeft = 300; // 5 minutes in seconds
    const timer = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `Expires in: ${minutes}:${seconds.toString().padStart(2, '0')}`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            timerDisplay.textContent = "OTP expired";
            otpDisplay.textContent = "******";
        }
    }, 1000);
});
