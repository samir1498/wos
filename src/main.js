import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer-core";
import os from "os";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow;
let chromePath;

function determineChromePath() {
  const platform = os.platform();

  if (platform === "darwin") {
    chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  } else if (platform === "win32") {
    chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  } else if (platform === "linux") {
    chromePath = "/usr/bin/google-chrome";
  } else {
    throw new Error("Unsupported platform");
  }
}

function createWindow() {
  determineChromePath();

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "public", "index.html"));
}

// Handle gift code redemption
ipcMain.handle("redeem-gift-code", async (event, { playerIds, giftcode }) => {
  const results = [];

  try {
    if (!chromePath) {
      throw new Error("Chrome path is not set.");
    }

    console.log("Using Chrome executable at:", chromePath);

    const browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: true,
    });

    const page = await browser.newPage();

    for (const [index, playerId] of playerIds.entries()) {
      await page.goto("https://wos-giftcode.centurygame.com/");
      await page.setViewport({ width: 1080, height: 1024 });

      const playerIdInput = await page.waitForSelector(
        'input[placeholder="Player ID"]'
      );
      await playerIdInput.type(playerId.toString());

      const loginButton = await page.waitForSelector("div.btn.login_btn");
      await loginButton.click();

      let loggedIn = false;

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

        const info = `Player Name: ${playerName}, Furnace Level: ${furnaceLevel}, State: ${state}`;
        console.log("Player Info:", info);
        results.push({ playerId, info });

        loggedIn = true;
      } catch (error) {
        console.error("Player info did not appear:", error);
        results.push({ playerId, info: "Player info not available." });
      }

      if (loggedIn) {
        const giftCodeInput = await page.waitForSelector(
          'input[placeholder="Enter Gift Code"]'
        );
        await giftCodeInput.type(giftcode);

        const confirmButton = await page.waitForSelector(
          "div.btn.exchange_btn"
        );
        await confirmButton.click();

        console.log("Gift Code Entered and Confirmed");
      } else {
        console.log("Failed to log in for Player ID:", playerId);
      }

      // Send progress update to renderer
      const progress = Math.round(((index + 1) / playerIds.length) * 100);
      mainWindow.webContents.send("progress-update", progress);
    }

    await browser.close();
    return results;
  } catch (error) {
    console.error("Error during automation:", error);
    throw new Error(`Error: ${error.message}`);
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (mainWindow === null) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
