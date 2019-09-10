const {
    shell,
    electron,
    Notification,
    Menu,
    Tray,
    nativeImage,
    globalShortcut,
    dialog,
    ipcMain,
    ipcRenderer
} = require('electron');

const app = require('electron').app;

const BrowserWindow = require('electron').BrowserWindow;
const url = require('url');
const utf8 = require('utf8');
const {
    resolve
} = require('path');
const path = require('path');
const fs = require('fs');
const os = require('os');
const {
    fork,
    spawn
} = require('child_process');



const platforms = {
    WINDOWS: 'WINDOWS',
    MAC: 'MAC',
    LINUX: 'LINUX',
    SUN: 'SUN',
    OPENBSD: 'OPENBSD',
    ANDROID: 'ANDROID',
    AIX: 'AIX',
};

const platformsNames = {
    win32: platforms.WINDOWS,
    darwin: platforms.MAC,
    linux: platforms.LINUX,
    sunos: platforms.SUN,
    openbsd: platforms.OPENBSD,
    android: platforms.ANDROID,
    aix: platforms.AIX,
};

const currentPlatform = platformsNames[os.platform()];

//const notifier = require('electron-native-notification');

const email = require('mailer');

//const Datastore = require('nedb');

const jetpack = require('fs-jetpack');

//const node_ssh = require('node-ssh');

//const powershell = require('node-powershell');




const ws_server = require('./ws_server');


process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;

console.log("Nombre d'arguments :" + process.argv.length.toString());


let win, serve;
var willQuitApp = false;
var trayIcon = null;
var traymenu = null;
var menu = null;
var app_context_menu;
var showGlpi = false;
var showMessagerie = false;
var showIpbxPDA = false;
var showAs400 = false;
var isWsStart = false;
var isPptgStart = false;

var userDataPath = null;
var username = "";
var userdata;

let port = 7000;
let iShouldQuit = app.requestSingleInstanceLock();

const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');


process.on("uncaughtException", (err) => {
    if (err.message == "write EBADF") {
        const messageBoxOptions = {
            type: "warning",
            title: "Une seule intance du programme est autorisée !",
            message: err.message
        };
        dialog.showMessageBox(messageBoxOptions);
    } else {
        const messageBoxOptions = {
            type: "error",
            title: "Erreur dans le programme !",
            message: err.message
        };
        //dialog.showMessageBox(messageBoxOptions);
        console.log("Error :", err.message);
    }

    //throw err;
});


console.log("Path =", __dirname);



console.log("Platform =", os.platform());

//console.log("Nom as400 =", config.as400.host);
if (os.platform == "win32") {

    console.log('Platforme :', currentPlatform);
    userDataPath = app.getPath('userData');
    username = userDataPath.split('\\')[2];

    console.log("Appdata :", userDataPath.split('\\')[2]);



}

ipcMain.on('memGatewayPwrsh', function(event, user, domain, password) {
    if (os.platform == "win32") {
        console.log(user + ',' + domain + ',' + password);
    } else {
        console.log('Cette fonctionalité nécessite une exécution sur un poste Windows');
    }
});



// chemin des  applis et icones
var iconPath = path.join(__dirname, './resources/electron/icons/icon512.png');

function createWindow() {


    win = new BrowserWindow({
        width: 1800,
        height: 1200,
        center: true,
        icon: iconPath,
        webPreferences: {
            nodeIntegration: true
        }
    })

    if (serve) {
        require('electron-reload')(__dirname, {
            electron: require(`${__dirname}/node_modules/electron`),
            hardResetMethod: 'exit'
        });
        win.loadURL('http://localhost:4200');
    } else {
        win.loadURL(url.format({
            pathname: path.join(__dirname, 'www/index.html'),
            protocol: 'file:',
            slashes: true
        }));
    }

    // initialisation des menus
    win.setMenu(null);

    app_context_menu = [{
            label: `Mode serveur (port:${port})`,
            type: 'checkbox',
            checked: isWsStart,
            accelerator: 'CmdOrCtrl+S',
            click: () => {
                if (!isWsStart) {
                    ws = new ws_server();
                    try {
                        ws.runServer(port);
                    } catch (error) {
                        console.log("Erreur d'execution", error);
                    }
                } else {
                    ws.stopServer();
                    ws = null;
                }
                isWsStart = !isWsStart;
                win.webContents.send('onWsStart', isWsStart);
            }
        }, {
            label: 'Quitter',
            accelerator: 'CmdOrCtrl+Q',
            click: () => {
                willQuitApp = true;
                if (process.platform != 'darwin')
                    app.quit();

            }
        }

    ];

    var helpMn = {
        label: '?',
        click: () => {
            shell.openExternal('http://www.hdcapp.pro/info.htm', error => {
                console.log("Impossible!", error);
            });
        }
    };

    var outilsWeb = {
        label: 'Outils Web...',
        submenu: [{
            label: 'Support GLPI...',
            accelerator: 'CmdOrCtrl+G',
            //role: 'undo'
            click: () => {
                shell.openExternal('http://eon.3hservices.net/glpi/', (error) => {
                    console.log("Ouverture du navigateur sur GLPI impossible!");
                })
            }
        }, {
            label: 'IBM I Acces Navigator...',
            accelerator: 'CmdOrCtrl+A',
            //role: 'undo'
            click: () => {
                shell.openExternal('https://10.21.0.200:2005/ibm/console/login.do?action=secure', (error) => {
                    console.log("Ouverture de IBM I  Access Navigator impossible!");
                })
            }
        }, {
            label: 'Messagerie Exchange Outlook...',
            accelerator: 'CmdOrCtrl+O',
            //role: 'undo'
            click: () => {
                shell.openExternal('https://mail.hdistribution.fr/owa/', (error) => {
                    console.log("Ouverture de la Messagerie Exchange impossible!");
                })
            }
        }, {
            label: 'Accès IPBX PDA...',
            accelerator: 'CmdOrCtrl+I',
            //role: 'undo'
            click: () => {
                shell.openExternal('https://10.21.110.1:8443/WebMgmtEE/WebManagement.html', (error) => {
                    console.log("Ouverture de IPBX PDA impossible!");
                })
            }
        }, {
            label: 'Accès IPBX MULTIGROS...',
            accelerator: 'CmdOrCtrl+M',
            //role: 'undo'
            click: () => {
                shell.openExternal('https://10.2.110.1:8443/WebMgmtEE/WebManagement.html', (error) => {
                    console.log("Ouverture de IPBX Multigros impossible!");
                })
            }
        }, {
            label: 'Accès IPBX GEANT BATELIERE...',
            accelerator: 'CmdOrCtrl+B',
            //role: 'undo'
            click: () => {
                shell.openExternal('https://10.4.110.1:8443/WebMgmtEE/WebManagement.html', (error) => {
                    console.log("Ouverture de IPBX GEANT BATELIERE impossible!");
                })
            }
        }]
    }


    var application_menu = [{
        label: 'Options',
        submenu: [{
                label: 'Actualiser',
                accelerator: 'CmdOrCtrl+R',
                //role: 'undo'
                click: () => {

                    //win.loadURL(path.join("file://", appPath));
                    if (serve) {
                        require('electron-reload')(__dirname, {
                            electron: require(`${__dirname}/node_modules/electron`),
                            hardResetMethod: 'exit'
                        });
                        win.loadURL('http://localhost:4200');
                    } else {
                        win.loadURL(url.format({
                            pathname: path.join(__dirname, 'www/index.html'),
                            protocol: 'file:',
                            slashes: true
                        }));
                    }
                }
            },
            {
                label: 'Ouvrir...',
                accelerator: 'CmdOrCtrl+O',
                click: () => {
                    dialog.showOpenDialog({
                        properties: ['openFile', 'openDirectory', 'multiSelections']
                    });
                }
            },
            {
                label: 'Dev',
                submenu: [{
                        label: 'Afficher',
                        accelerator: 'CmdOrCtrl+A',
                        click: () => {
                            try {
                                win.webContents.openDevTools();
                            } catch (error) {

                            }

                        }
                    },
                    {
                        label: 'Cacher',
                        accelerator: 'CmdOrCtrl+B',
                        click: () => {
                            try {
                                win.webContents.closeDevTools();
                            } catch (error) {

                            }

                        }
                    }
                ]
            },
            {
                label: 'Test mail...',
                accelerator: 'CmdOrCtrl+O',
                click: () => {
                    sendMail();
                }
            }, {
                label: 'A propos..',
                accelerator: 'CmdOrCtrl+A',
                click: () => {
                    try {
                        dialog.showMessageBox({
                            type: "info",
                            title: "Version de l'application",
                            message: `HDCApp version: ${app.getVersion()}`
                        });
                    } catch (error) {

                    }
                }
            }
        ]
    }];

    /*
    {
      label: 'Information utilisateur ?',
      click() {
        try {
          var user = (global.sharedObj.cred) ? global.sharedObj.cred : ""
          dialog.showMessageBox({
            type: "info",
            title: "Utilisateur du domaine",
            message: `Utilisateur du domaine : ${user.GUID}.\nMail : ${user.mail}\nNom : ${user.SurName}\nPrenom : ${user.GivenName}`
          });
        } catch (error) {

        }
      }
    },

    */


    if (process.platform == 'darwin') {}


    // defini une icon en barre de tache
    trayIcon = new Tray(nativeImage.createFromPath(iconPath));
    trayIcon.setToolTip('HDCApp:  Maintenance et Gestion  SI ');
    traymenu = Menu.buildFromTemplate(app_context_menu);

    trayIcon.setContextMenu(traymenu);

    // defini un menu pour l'application
    application_menu.push(outilsWeb);
    application_menu.push(helpMn);
    menu = Menu.buildFromTemplate(application_menu);

    Menu.setApplicationMenu(menu);

    win.webContents.openDevTools();

    // Emitted when the window is closed.
    // Emitted when the window is closed.

    trayIcon.on('click', (e) => {
        win.show();
    });

    win.on('close', (e) => {
        //willQuitApp = true;
        if (willQuitApp) {
            //server.close();
            // process.kill(child.pid);
            //process.kill(childSSH.pid);
            win = null;
            glpiWindow = null;
            mailsWindow = null;
            sshWindow = null;
            //process.exit(0);
        } else {
            e.preventDefault();
            win.hide();
        }
    });

}


try {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.

    if (!iShouldQuit) {
        app.quit();
    } else {


        app.on('second-instance', (event, commandLine, workingDirectory) => {
            // Someone tried to run a second instance, we should focus our window.
            if (win) {
                if (win.isMinimized())
                    win.restore();
                win.focus();
            }
        });

        app.on('ready', createWindow);


        app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {



            if (url === 'https://github.com') {
                // Logique de vérification et approuver automatiquement le certificat
                event.preventDefault()
                callback(true)
            } else {
                callback(false)
            }

        })

        // Quit when all windows are closed.
        app.on('window-all-closed', () => {
            // On OS X it is common for applications and their menu bar
            // to stay active until the user quits explicitly with Cmd + Q
            if (process.platform !== 'darwin') {
                app.quit()
            }
        })

        app.on('activate', () => {
            // On OS X it's common to re-create a window in the app when the
            // dock icon is clicked and there are no other windows open.
            if (win === null) {
                createWindow();
            }
        })
    }

} catch (e) {
    // Catch Error
    // throw e;
}
