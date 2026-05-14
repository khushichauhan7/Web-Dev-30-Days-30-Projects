 let timerInterval = null;
    let running = false;

    // This stores the selected target date/time
    let targetTime = null;

    const daysEl    = document.getElementById('days');
    const hoursEl   = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const statusEl  = document.getElementById('statusText');

    function pad(n) {
      return String(n).padStart(2, '0');
    }

    // Update timer display
    function updateDisplay(diffSeconds) {

      if (diffSeconds < 0) diffSeconds = 0;

      const days    = Math.floor(diffSeconds / 86400);
      const hours   = Math.floor((diffSeconds % 86400) / 3600);
      const minutes = Math.floor((diffSeconds % 3600) / 60);
      const seconds = Math.floor(diffSeconds % 60);

      daysEl.textContent    = pad(days);
      hoursEl.textContent   = pad(hours);
      minutesEl.textContent = pad(minutes);
      secondsEl.textContent = pad(seconds);
    }

    // Main countdown function
    function tick() {

      const now = new Date().getTime();

      // Remaining milliseconds
      const remaining = targetTime - now;

      // Convert to seconds
      const totalSeconds = Math.floor(remaining / 1000);

      updateDisplay(totalSeconds);

      if (remaining <= 0) {
        clearInterval(timerInterval);
        running = false;
        statusEl.textContent = "Countdown Finished!";
      }
    }

    function startTimer() {

      if (running) return;

      const selectedDate = document.getElementById('targetDate').value;

      if (!selectedDate) {
        alert("Please select a date first.");
        return;
      }

      /*
        Set time to:
        00:00:00 AM
      */

      targetTime = new Date(selectedDate + "T00:00:00").getTime();

      // If selected date already passed
      if (targetTime <= new Date().getTime()) {
        alert("Please select a future date.");
        return;
      }

      running = true;

      statusEl.textContent = "Countdown Running...";

      tick();

      timerInterval = setInterval(tick, 1000);
    }

    function pauseTimer() {
      clearInterval(timerInterval);
      running = false;
      statusEl.textContent = "Paused";
    }

    function resetTimer() {

      clearInterval(timerInterval);

      running = false;

      updateDisplay(0);

      statusEl.textContent = "Reset Complete";
    }

    // Initial display
    updateDisplay(0);