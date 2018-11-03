const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');

let win;

function createWindow(){
    win = new BrowserWindow({width:960, height:720, icon:__dirname+'/www/images/app_icon_deltafab/res/mipmap-xhdpi/app_icon_deltafab.png'});
    // Yukarıda icon atama sırasında birkaç farklı şekilde denedim ama iconu göstermeyi BAŞARAMADIM!!!

    win.loadFile("index.html")

    // alttaki index.html'yi yükleme satırlarını izlediğim video da yazdılar. Yukarıdakileri ise,
    // github'dan çektiğim örnek uygulamanın main.js dosyasından kopyaladım. YUKARIDAKİ ÇOK DAHA RAHAT.

    // win.loadURL(url.format({
    //     pathname: path.join(__dirname, 'index.html'),
    //     protocol: 'file:',
    //     slashes: true
    // }));

    // devtools açmak için;
    // win.webContents.openDevTools();

    win.on('closed', () => {
        win = null;
    });
}

// create window fonksiyonunu çalıştırmak için;
app.on('ready', createWindow);

// Tüm pencereler kapandıktan  sonra programı Quit etmek için.

app.on('window-all-closed', () => {
   if(process.platform !== 'darwin'){
       app.quit();
   }
});

app.on('activate', () => {
    if(win === null)
        createWindow();
});