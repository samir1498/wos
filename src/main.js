import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "public", "index.html"));

  // Open the DevTools (optional)
  //   mainWindow.webContents.openDevTools();
}

// Handle Chrome path selection
ipcMain.handle("select-chrome", async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: "Select Chrome Executable",
      buttonLabel: "Select",
      properties: ["openFile"],
      filters: [{ name: "Applications", extensions: ["exe", "app"] }],
    });

    if (result.canceled || result.filePaths.length === 0) {
      throw new Error("No file selected");
    }

    console.log(`Selected Chrome executable path: ${result.filePaths[0]}`);
    return result.filePaths[0];
  } catch (error) {
    console.error("Failed to select Chrome executable:", error);
    throw error;
  }
});

// Handle gift code redemption
ipcMain.handle(
  "redeem-gift-code",
  async (event, { chromePath, playerIds, giftcode }) => {
    console.log(`Starting gift code redemption process...`);
    console.log(`Using Chrome executable at: ${chromePath}`);
    console.log(`Gift code: ${giftcode}`);
    console.log(`Player IDs: ${playerIds.join(", ")}`);

    try {
      const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: true, // Set to true if you don't want to see the browser window
      });

      const page = await browser.newPage();

      for (const playerId of playerIds) {
        console.log(`Processing Player ID: ${playerId}`);
        await page.goto("https://wos-giftcode.centurygame.com/");
        console.log(`Navigated to the gift code page`);

        await page.setViewport({ width: 1080, height: 1024 });

        const playerIdInput = await page.waitForSelector(
          'input[placeholder="Player ID"]'
        );
        await playerIdInput.type(playerId.toString());
        console.log(`Entered Player ID: ${playerId}`);

        const loginButton = await page.waitForSelector("div.btn.login_btn");
        await loginButton.click();
        console.log(`Clicked the login button`);

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

          console.log("Player Name:", playerName);
          console.log("Furnace Level:", furnaceLevel);
          console.log("State:", state);

          loggedIn = true;
        } catch (error) {
          console.error("Player info did not appear:", error);
        }

        console.log("Logged In:", loggedIn);

        if (loggedIn) {
          const giftCodeInput = await page.waitForSelector(
            'input[placeholder="Enter Gift Code"]'
          );
          await giftCodeInput.type(giftcode);
          console.log(`Entered gift code: ${giftcode}`);

          const confirmButton = await page.waitForSelector(
            "div.btn.exchange_btn"
          );
          await confirmButton.click();
          console.log(`Clicked the confirm button`);

          console.log("Gift Code Entered and Confirmed");
        } else {
          console.log("Failed to log in for Player ID:", playerId);
        }
      }

      await browser.close();
      console.log("Browser closed");
    } catch (error) {
      console.error("Error during automation:", error);
    }
  }
);

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
