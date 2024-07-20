import puppeteer from "puppeteer"; // Or 'puppeteer-core'

// Array of Player IDs to be entered
const playerIds = [17609528, 17609528, 17609528]; // Add more player IDs as needed

const giftcode = "test-gift-code";

// Function to perform login and gift code entry for a given player ID
async function redeemGiftCode(playerId) {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Chromium.app/Contents/MacOS/Chromium", // Ensure this path is correct
  });
  const page = await browser.newPage();

  try {
    // Navigate to the specified URL
    await page.goto("https://wos-giftcode.centurygame.com/");

    // Set screen size
    await page.setViewport({ width: 1080, height: 1024 });

    // Wait for the input field with the placeholder "Player ID" to be available
    const playerIdInput = await page.waitForSelector(
      'input[placeholder="Player ID"]'
    );

    // Type the Player ID into the input field
    await playerIdInput.type(playerId.toString());

    // Wait for the "Login" button to be available
    const loginButton = await page.waitForSelector("div.btn.login_btn");

    // Click the "Login" button
    await loginButton.click();

    // Initialize the loggedIn boolean variable
    let loggedIn = false;

    // Check if player info appears
    const playerNameSelector = ".roleInfo_con .name";
    const furnaceLevelSelector = ".roleInfo_con .other img.level_icon";
    const stateSelector = ".roleInfo_con .other:nth-child(3)";

    try {
      await page.waitForSelector(playerNameSelector, { timeout: 5000 });
      await page.waitForSelector(furnaceLevelSelector, { timeout: 5000 });
      await page.waitForSelector(stateSelector, { timeout: 5000 });

      const playerName = await page.$eval(playerNameSelector, (el) =>
        el.textContent.trim()
      );
      const furnaceLevel = await page.$eval(
        furnaceLevelSelector,
        (el) => el.src
      );
      const state = await page.$eval(stateSelector, (el) =>
        el.textContent.trim()
      );

      console.log("Player Name:", playerName);
      console.log("Furnace Level:", furnaceLevel);
      console.log("State:", state);
      // Set loggedIn to true if all elements are found
      loggedIn = true;
    } catch (error) {
      console.error("Player info did not appear:", error);
    }
    // Log the loggedIn status
    console.log("Logged In:", loggedIn);

    // Find the input field with the placeholder "Enter Gift Code" and fill it
    if (loggedIn) {
      const giftCodeInput = await page.waitForSelector(
        'input[placeholder="Enter Gift Code"]'
      );
      await giftCodeInput.type(giftcode);
      console.log("Gift Code Entered");

      // Wait for the "Confirm" button to be available and click it
      const confirmButton = await page.waitForSelector("div.btn.exchange_btn");
      await confirmButton.click();
      console.log("Confirm Button Clicked");
    }
  } finally {
    // Optionally, close the browser after the operations
    await browser.close();
  }
}

// Loop through each player ID and call the redeemGiftCode function
(async () => {
  for (const playerId of playerIds) {
    await redeemGiftCode(playerId);
  }
})();
