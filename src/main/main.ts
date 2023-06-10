/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import express from 'express';
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { encode } from '@nem035/gpt-3-encoder';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import {
  OpenAIKeyNotSetError,
  generate,
  testOpenAI,
} from './sentient-sims/openai';
import { getSettings, writeSettings } from './sentient-sims/directories';
import {
  getAppVersion,
  getModVersion,
  updateMod,
} from './sentient-sims/updater';
import Logger from './sentient-sims/logger';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

const logger = new Logger('main');

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  logger.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      webSecurity: false, // Disable web security
      allowRunningInsecureContent: true,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);

const expressApp = express();
expressApp.use(express.json());
const port = 25148;

expressApp.get('/health', (req, res) => {
  res.send('OK');
});

expressApp.get('/test-open-ai', async (req, res) => {
  try {
    const response = await testOpenAI();
    res.send(response);
  } catch (e: any) {
    if (e instanceof OpenAIKeyNotSetError) {
      res.status(400).send({ status: 'API key not set!' });
    } else {
      res.status(500).send({ error: `${e.name}: ${e.message}` });
    }
  }
});

expressApp.post('/api/v1/count', (req, res) => {
  res.json({ count: encode(req.body.prompt).length });
});

expressApp.post('/api/v1/generate', async (req, res) => {
  const { body } = req;
  const { prompt } = body;
  const maxLength = body.max_length;

  const response = await generate(maxLength, prompt);
  res.json(response);
});

expressApp.get('/send-logs', async (req, res) => {
  res.json({ message: 'Not implemented yet' });
});

expressApp.get('/settings', async (req, res) => {
  res.json(getSettings());
});

expressApp.get('/versions/mod', async (req, res) => {
  res.json(getModVersion());
});

expressApp.get('/versions/app', async (req, res) => {
  res.json(getAppVersion());
});

expressApp.post('/settings', async (req, res) => {
  writeSettings(req.body);
  res.json(getSettings());
});

expressApp.post('/update/mod', async (req, res) => {
  await updateMod(req.body);
  res.json({ done: 'done' });
});

expressApp.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
