document.getElementById("selectChrome").addEventListener("click", async () => {
  try {
    const chromePath = await window.electron.selectChrome();
    console.log(
      "Selected Chrome folder:",
      chromePath + "/Contents/MacOS/Chromium"
    );
    if (chromePath) {
      document.getElementById("chromePath").value =
        chromePath + "/Contents/MacOS/Chromium";
    } else {
      alert("No Chrome folder selected.");
    }
  } catch (error) {
    console.error("Error selecting Chrome folder:", error);
    alert("Error selecting Chrome folder.");
  }
});

document.getElementById("redeemForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const playerIds = document
    .getElementById("playerIds")
    .value.split(",")
    .map((id) => id.trim());
  const giftcode = document.getElementById("giftcode").value;
  const chromePath = document.getElementById("chromePath").value;

  await window.electron.redeemGiftCode({ chromePath, playerIds, giftcode });
  alert("Gift codes redeemed successfully!");
});
