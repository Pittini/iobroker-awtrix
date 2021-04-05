const Version = "0.0.1" //vom 13.03.2021 - Skript um eine Awtrix als Melder zu verwenden

log("starting AwtrixControl V." + Version);
//setObject("mqtt.0.awtrix", { type: 'channel', common: { name: "Awtrix" }, native: {} });

//Datenpunkte
const BasicsPath = "mqtt.0.Awtrix1.basics";
const NotifyPath = "mqtt.0.Awtrix1.notify";
const SettingsPath = "mqtt.0.Awtrix1.settings";

const logging = true;

let AwtrixVolume = 20;
let AwtrixBrightness = 25;
let OldAtrixBrightness = AwtrixBrightness;
let InfoCycle1Refresh = 60 * 1000;
let InfoCycle2Refresh = 60 * 1000 * 5;
let InfoCycle3Refresh = 60 * 1000 * 60;

let GelbeTonneTage = getState('javascript.0.vis.muellkalender.gelbe_tonne_tage').val;
let GrueneTonneTage = getState('javascript.0.vis.muellkalender.gruene_tonne_tage').val;
let SchwarzeTonneTage = getState('javascript.0.vis.muellkalender.schwarze_tonne_tage').val;

let IntervalHandler1;
let IntervalHandler2;
let IntervalHandler3;

let AussenTemperatur = parseInt(getState('wiffi-wz.0.root.192_168_2_131.w_temperatur').val * 10) / 10; //Temp auf eine Nachkommastelle runden
let Temperature = parseInt(getState('linkeddevices.0.Klima.Wohnzimmer.temperature').val * 10) / 10; //Temp auf eine Nachkommastelle runden
let Humidity = parseInt(getState('linkeddevices.0.Klima.Wohnzimmer.humidity').val); //Hum zur Ganzzahl machen

let ValuesObj = { "name": "Tuerklingel", "force": true, "icon": 960, "moveIcon": false, "repeat": 2, "soundfile": 101, "text": "Türklingel", "color": [255, 0, 0] }
//Basic Topic - {"power": true} - {"switchTo":"Facebook"} - {"soundfile": 101}
//Settings Topic - {"Brightness":100}
//Notify Topic - {"name":"TestNotification","force":true,"icon":6,"moveIcon":true,"repeat":2,"soundfile":1,"text":"Totally Awesome","color":[0,255,0]} - {"remove":"TestNotification"}

init();

function init() {
    if (GelbeTonneTage == 1) TrashBinNotifications({ "name": "Muellabfuhr gelb", "force": true, "icon": 966, "moveIcon": false, "repeat": 2, "soundfile": 4, "text": "Gelbe Tonne!", "color": [255, 255, 0] });
    if (GrueneTonneTage == 1) TrashBinNotifications({ "name": "Muellabfuhr gruen", "force": true, "icon": 981, "moveIcon": false, "repeat": 2, "soundfile": 5, "text": "Grüne Tonne!", "color": [0, 255, 0] });
    if (SchwarzeTonneTage == 1) TrashBinNotifications({ "name": "Muellabfuhr schwarz", "force": true, "icon": 964, "moveIcon": false, "repeat": 2, "soundfile": 5, "text": "Schwarze Tonne!", "color": [80, 80, 80] });
    log("Gelb:" + GelbeTonneTage + " Grün:" + GrueneTonneTage + " Schwarz:" + SchwarzeTonneTage)

    SetBrightness(getState("wiffi-wz.0.root.192_168_2_131.w_lux").val);
    ShowTempHum();
    InfoCycle1();
    InfoCycle2();
    InfoCycle3();

}

function SendToAwtrix(AwtrixJson = {}, Destination) {
    let DestinationPath
    switch (Destination) {
        case "Basics":
            DestinationPath = BasicsPath
            break;
        case "Notify":
            DestinationPath = NotifyPath
            break;
        case "Settings":
            DestinationPath = SettingsPath
            break;
    }
    setState(DestinationPath, JSON.stringify(AwtrixJson));
    setStateDelayed(DestinationPath, "", 250)
}


function ShowTempHum() {
    SendToAwtrix({ "name": "TempHum", "force": true, "icon": 774, "moveIcon": false, "repeat": 2, "text": "Temp.: " + Temperature + "°C / " + AussenTemperatur + "°C - Hum.: " + Humidity + "%", "color": [0, 255, 0] }, "Notify")
}

function Doorbell() {
    SendToAwtrix({ "name": "Tuerklingel", "force": true, "icon": 960, "moveIcon": false, "repeat": 2, "soundfile": 101, "text": "Türklingel", "color": [255, 0, 0] }, "Notify")
}


function SetBrightness(Brightness) {
    if (Brightness > 2000) {
        AwtrixBrightness = 25
    } else if (Brightness > 500) {
        AwtrixBrightness = 20
    } else if (Brightness > 100) {
        AwtrixBrightness = 15
    } else if (Brightness > 10) {
        AwtrixBrightness = 10
    } else {
        AwtrixBrightness = 5
    };
    if (OldAtrixBrightness != AwtrixBrightness) {
        if (logging) log("Set Awtrix brightness to " + AwtrixBrightness)
        SendToAwtrix({ "Brightness": AwtrixBrightness }, "Settings")
        OldAtrixBrightness = AwtrixBrightness;
    }
}

function SetTextColor(Color = "255,255,0") {

    SendToAwtrix({ "TextColor": Color }, "Settings")


}

function SetVolume(Volume) {
    let Setting = { "Volume": Volume }
    AwtrixVolume = Volume
    SendToAwtrix(Setting, "Settings")
}

function TrashBinNotifications(Notifikation) {
    SendToAwtrix(Notifikation, "Notify")

}

function InfoCycle1() {
    IntervalHandler1 = setInterval(function () { // 
        ShowTempHum();

    }, InfoCycle1Refresh); //
}

function InfoCycle2() {
    IntervalHandler2 = setInterval(function () { // 


    }, InfoCycle2Refresh); //
}

function InfoCycle3() {
    IntervalHandler3 = setInterval(function () { // 
        if (GelbeTonneTage == 1) TrashBinNotifications({ "name": "Muellabfuhr gelb", "force": true, "icon": 966, "moveIcon": false, "repeat": 2, "soundfile": 5, "text": "Gelbe Tonne!", "color": [255, 255, 0] });
        if (GrueneTonneTage == 1) TrashBinNotifications({ "name": "Muellabfuhr gruen", "force": true, "icon": 981, "moveIcon": false, "repeat": 2, "soundfile": 5, "text": "Grüne Tonne!", "color": [0, 255, 0] });
        if (SchwarzeTonneTage == 1) TrashBinNotifications({ "name": "Muellabfuhr schwarz", "force": true, "icon": 964, "moveIcon": false, "repeat": 2, "soundfile": 5, "text": "Schwarze Tonne!", "color": [80, 80, 80] });

    }, InfoCycle3Refresh); //
}

on(NotifyPath, function (dp) { //Trigger für erzeugen
    if (logging) log(dp.state.val);
});

on('linkeddevices.0.Klima.Wohnzimmer.temperature', function (dp) { //Trigger für Temperatur erzeugen
    Temperature = parseInt(dp.state.val * 10) / 10;
});
on('linkeddevices.0.Klima.Wohnzimmer.humidity', function (dp) { //Trigger für Luftfeuchte erzeugen
    Humidity = parseInt(dp.state.val);
});
on('wiffi-wz.0.root.192_168_2_131.w_lux', function (dp) { //Trigger für Lux erzeugen
    SetBrightness(dp.state.val);
});
on('wiffi-wz.0.root.192_168_2_131.w_temperatur', function (dp) { //Trigger für Lux erzeugen
    AussenTemperatur = dp.state.val;
});





//Trigger für Mülltermine
on('javascript.0.vis.muellkalender.gelbe_tonne_tage'/*Tage bis Abfuhrtermin gelb*/, function (dp) { //Trigger für Müllabfuhr gelb erzeugen
    GelbeTonneTage = dp.state.val;
});
on('javascript.0.vis.muellkalender.gruene_tonne_tage'/*Tage bis Abfuhrtermin grün*/, function (dp) { //Trigger für Müllabfuhr grün erzeugen
    GrueneTonneTage = dp.state.val;
});
on('javascript.0.vis.muellkalender.schwarze_tonne_tage'/*Tage bis Abfuhrtermin schwarz*/, function (dp) { //Trigger für Müllabfuhr schwarz erzeugen
    SchwarzeTonneTage = dp.state.val;
});


onStop(function () { //Bei Scriptende alle Timer löschen
    clearInterval(IntervalHandler1);
    clearInterval(IntervalHandler2);
    clearInterval(IntervalHandler3);

}, 100);
