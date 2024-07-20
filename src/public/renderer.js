document.getElementById("redeemForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const playerIds = document
    .getElementById("playerIds")
    .value.split(",")
    .map((id) => id.trim());
  const giftcode = document.getElementById("giftcode").value;

  // Clear previous logs
  const log = document.getElementById("log");
  log.innerHTML = "";
  document.getElementById("progress").innerText = "0%";
  document.querySelector(".progress-bar span").style.width = "0%";

  try {
    // Call the redeem gift code function
    const results = await window.electron.redeemGiftCode({
      playerIds,
      giftcode,
    });

    // Log each player's info
    results.forEach((result) => {
      log.innerHTML += `<div class="log-entry">Player ID: ${result.playerId} - ${result.info}</div>`;
    });

    log.innerHTML +=
      "<div class='log-entry'>Gift codes redeemed successfully!</div>";
  } catch (error) {
    console.error("Error:", error);
    log.innerHTML += `<div class="log-entry">Error: ${error.message}</div>`;
  }
});

// Listen for progress updates
window.electron.onProgressUpdate((progress) => {
  document.getElementById("progress").innerText = `${progress}%`;
  document.querySelector(".progress-bar span").style.width = `${progress}%`;
});
