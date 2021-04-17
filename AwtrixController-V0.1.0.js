const Version = "0.1.0" //vom 14.04.2021 - Skript um eine Awtrix als Melder zu verwenden

log("starting AwtrixControl V." + Version);

//Datenpunkte
const AwtrixMqttOid = "mqtt.0.Awtrix1"; //Hier die ObjektId zur Awtrix Mqtt ObjektId angeben

//setObject("AwtrixMqttOid", { type: 'channel', common: { name: "Awtrix" }, native: {} });

const logging = true; //Soll Logging aktiviert werden?

const ShowCombinedTempHum = true; //Soll Temperatur und Luftfeuchte zu einer Nachricht zusammengefasst werden?

const ActivateBrightnessControl = true; //Soll die Helligkeit der Awtrix adaptiv nach Aussenhelligkeit gesteuert werden? Macht nur Sinn wenn auch ein entsprechender Helligkeitssensor vorhanden ist!

const InfoCycle1Refresh = 60 * 1000 * 2; //Zyklus1 Zeit, die letzte Zahl steht für die Minuten
const InfoCycle2Refresh = 60 * 1000 * 5; //Zyklus2 Zeit, die letzte Zahl steht für die Minuten
const InfoCycle3Refresh = 60 * 1000 * 60; //Zyklus3 Zeit, die letzte Zahl steht für die Minuten

//Datenpunkte für noch verbleibende Tage bis Müllabfuhr (number), leer lassen wenn nicht vorhanden

const TrashbinYellowOid = "javascript.0.vis.muellkalender.gelbe_tonne_tage";
const TrashbinGreenOid = "javascript.0.vis.muellkalender.gruene_tonne_tage";
const TrashbinBlackOid = "javascript.0.vis.muellkalender.schwarze_tonne_tage";
const TrashbinBrownOid = "";
const TrashbinCycle = 2; //In welchem Zyklus soll die Nachricht wiederholt werden? Gültige Werte sind 1, 2 oder 3

//Datenpunkte für Temperatur und Luftfeuchtigkeit (number), leer lassen wenn nicht vorhanden
const TempOutDoorOid = "wiffi-wz.0.root.192_168_2_131.w_temperatur";
const TempIndoorOid = "linkeddevices.0.Klima.Wohnzimmer.temperature";
const HumidityOutdoorOid = "wiffi-wz.0.root.192_168_2_131.w_feuchte_rel";
const HumidityIndoorOid = "linkeddevices.0.Klima.Wohnzimmer.humidity";
const ClimateCycle = 1; //In welchem Zyklus soll die Nachricht wiederholt werden? Gültige Werte sind 1, 2 oder 3

//Datenpunkte für Alarme (true/false), leer lassen wenn nicht vorhanden
const FireAlertOid = "javascript.0.Alarme.Feuer.Alarm"; //
const WaterAlertOid = "javascript.0.Alarme.Wasser.Alarm";
const GasAlertOid = "javascript.0.Alarme.Gas.Alarm";
const CurrentfailAlertOid = "javascript.0.Alarme.Stromausfall.Alarm";
const HeatingfailAlertOid = "";
const AlertCycle = 1; //In welchem Zyklus soll die Nachricht wiederholt werden? Gültige Werte sind 1, 2 oder 3

//Datenpunkt für Türklingelsignalisierung (true/false), leer lassen wenn nicht vorhanden
const DoorbellOid = "zigbee.0.00158d000346cdda.contact";

// Datenpunkt für Aussenhelligkeitssensor (number) wenn vorhanden, leer lassen wenn nicht vorhanden
const LuxOid = "wiffi-wz.0.root.192_168_2_131.w_lux";




// Ab hier nix mehr ändern


let IntervalHandler1;
let IntervalHandler2;
let IntervalHandler3;

let Brightness = 0;
let AwtrixBrightness = 25;
let OldAtrixBrightness = AwtrixBrightness;


let Notifications = {
    "trashbin": {
        "yellow": {
            "oid": TrashbinYellowOid,
            "def": { "name": "Muellabfuhr gelb", "force": false, "icon": 966, "moveIcon": false, "repeat": 2, "soundfile": 4, "text": "Gelbe Tonne!", "color": [255, 255, 0] },
            "value": null,
            "destination": AwtrixMqttOid + ".notify",
            "showit": true
        },
        "green": {
            "oid": TrashbinGreenOid,
            "def": { "name": "Muellabfuhr gruen", "force": false, "icon": 981, "moveIcon": false, "repeat": 2, "soundfile": 5, "text": "Grüne Tonne!", "color": [0, 255, 0] },
            "value": null,
            "destination": AwtrixMqttOid + ".notify",
            "showit": true
        },
        "black": {
            "oid": TrashbinBlackOid,
            "def": { "name": "Muellabfuhr schwarz", "force": false, "icon": 964, "moveIcon": false, "repeat": 2, "soundfile": 5, "text": "Schwarze Tonne!", "color": [255, 255, 255] },
            "value": null,
            "destination": AwtrixMqttOid + ".notify",
            "showit": true
        },
        "brown": {
            "oid": TrashbinBrownOid,
            "def": { "name": "Muellabfuhr braun", "force": false, "icon": 964, "moveIcon": false, "repeat": 2, "soundfile": 5, "text": "Braune Tonne!", "color": [255, 255, 255] },
            "value": null,
            "destination": AwtrixMqttOid + ".notify",
            "showit": true
        }
    },
    "climate": {
        "tempoutdoor": {
            "oid": TempOutDoorOid,
            "def": { "name": "Temp", "force": false, "icon": 774, "moveIcon": false, "repeat": 2, "text": "Aussentemp.: ", "color": [0, 255, 0] },
            "value": null,
            "destination": AwtrixMqttOid + ".notify",
            "showit": true,
            "unit": "°C"
        },
        "tempindoor": {
            "oid": TempIndoorOid,
            "def": { "name": "Temp", "force": false, "icon": 774, "moveIcon": false, "repeat": 2, "text": "Innentemp.: ", "color": [0, 255, 0] },
            "value": null,
            "destination": AwtrixMqttOid + ".notify",
            "showit": true,
            "unit": "°C"
        },
        "humidityoutdoor": {
            "oid": HumidityOutdoorOid,
            "def": { "name": "Temp", "force": false, "icon": 774, "moveIcon": false, "repeat": 2, "text": "Luftfeuchte aussen: ", "color": [0, 255, 0] },
            "value": null,
            "destination": AwtrixMqttOid + ".notify",
            "showit": true,
            "unit": "%rH"
        },
        "humidityindoor": {
            "oid": HumidityIndoorOid,
            "def": { "name": "Temp", "force": false, "icon": 774, "moveIcon": false, "repeat": 2, "text": "Luftfeuchte innen: ", "color": [0, 255, 0] },
            "value": null,
            "destination": AwtrixMqttOid + ".notify",
            "showit": true,
            "unit": "%rH"
        }
    },
    "alerts": {
        "fire": {
            "oid": FireAlertOid,
            "def": { "name": "Feueralarm", "force": true, "icon": 1149, "moveIcon": false, "repeat": 2, "soundfile": 3, "text": "Feueralarm!", "color": [255, 0, 0] },
            "value": false,
            "destination": AwtrixMqttOid + ".notify",
            "showit": true
        },
        "water": {
            "oid": WaterAlertOid,
            "def": { "name": "Wasseralarm", "force": true, "icon": 328, "moveIcon": false, "repeat": 2, "soundfile": 3, "text": "Wasseralarm!", "color": [255, 0, 0] },
            "value": false,
            "destination": AwtrixMqttOid + ".notify",
            "showit": true
        },
        "gas": {
            "oid": GasAlertOid,
            "def": { "name": "Gasalarm", "force": true, "icon": 328, "moveIcon": false, "repeat": 2, "soundfile": 3, "text": "Gasalarm!", "color": [255, 0, 0] },
            "value": false,
            "destination": AwtrixMqttOid + ".notify",
            "showit": true
        },
        "current": {
            "oid": CurrentfailAlertOid,
            "def": { "name": "Stromausfall", "force": true, "icon": 328, "moveIcon": false, "repeat": 2, "soundfile": 3, "text": "Stromausfall!", "color": [255, 0, 0] },
            "value": false,
            "destination": AwtrixMqttOid + ".notify",
            "showit": true
        },
        "heating": {
            "oid": HeatingfailAlertOid,
            "def": { "name": "Heizungsausfall", "force": true, "icon": 375, "moveIcon": false, "repeat": 2, "soundfile": 3, "text": "Heizungsausfall!", "color": [255, 0, 0] },
            "value": false,
            "destination": AwtrixMqttOid + ".notify",
            "showit": true
        }
    },
    "doorbell": {
        "oid": DoorbellOid,
        "def": { "name": "Tuerklingel", "force": true, "icon": 960, "moveIcon": false, "repeat": 2, "soundfile": 101, "text": "Türklingel", "color": [255, 0, 0] },
        "value": false,
        "destination": AwtrixMqttOid + ".notify",
        "showit": true
    }
};


init();

function GetInitialValues() {
    //Müllabfuhr
    for (let x in Notifications.trashbin) {
        if (Notifications.trashbin[x].oid != "") Notifications.trashbin[x].value = getState(Notifications.trashbin[x].oid).val;
    };

    //Temperatur und Luftfeutigkeit
    for (let x in Notifications.climate) {
        if (Notifications.climate[x].oid != "" && x.indexOf("temp") != -1) Notifications.climate[x].value = parseInt(getState(Notifications.climate[x].oid).val * 10) / 10;
        if (Notifications.climate[x].oid != "" && x.indexOf("humidity") != -1) Notifications.climate[x].value = parseInt(getState(Notifications.climate[x].oid).val);

        if (Notifications.climate[x].oid != "") Notifications.climate[x].def.text = Notifications.climate[x].def.text + Notifications.climate[x].value + Notifications.climate[x].unit
    };

    //Alarme
    for (let x in Notifications.alerts) {
        if (Notifications.alerts[x].oid != "") Notifications.alerts[x].value = getState(Notifications.alerts[x].oid).val;
    };


    //Helligkeit
    if (LuxOid != "") Brightness = parseInt(getState(LuxOid).val);


    if (logging) log(Notifications);
}


function init() {
    GetInitialValues();

    SetBrightness();
    ShowTempHum();
    ShowTrashbinNotification();
    ShowAlertNotifications();

    InfoCycle1();
    InfoCycle2();
    InfoCycle3();

}


async function SendToAwtrix(AwtrixJson = {}, Destination = AwtrixMqttOid + ".notify") {
    if (logging) log(JSON.stringify(AwtrixJson))
    setState(Destination, JSON.stringify(AwtrixJson));
}

function ShowTempHum() {
    if (ShowCombinedTempHum) {

        SendToAwtrix({ "name": "TempHumIndoor", "force": false, "icon": 924, "moveIcon": false, "repeat": 2, "text": Notifications.climate.tempindoor.value + "°C / " + Notifications.climate.humidityindoor.value + "%rH", "color": [0, 255, 0] })
        SendToAwtrix({ "name": "TempHumOutdoor", "force": false, "icon": 912, "moveIcon": false, "repeat": 2, "text": Notifications.climate.tempoutdoor.value + "°C / " + Notifications.climate.humidityoutdoor.value + "%rH", "color": [0, 255, 0] })
    } else {
        if (Notifications.climate.tempoutdoor.showit == true) SendToAwtrix(Notifications.climate.tempoutdoor.def);
        if (Notifications.climate.tempindoor.showit == true) SendToAwtrix(Notifications.climate.tempindoor.def);

        if (Notifications.climate.humidityoutdoor.showit == true) SendToAwtrix(Notifications.climate.humidityoutdoor.def);
        if (Notifications.climate.humidityindoor.showit == true) SendToAwtrix(Notifications.climate.humidityindoor.def);

    }

    //  SendToAwtrix({ "name": "TempHum", "force": false, "icon": 774, "moveIcon": false, "repeat": 2, "text": "Temp.: " + Temperature + "°C / " + AussenTemperatur + "°C - Hum.: " + Humidity + "%", "color": [0, 255, 0] }, "Notify");
}

function ShowDoorbellNotification() {
    if (Notifications.doorbell.showit == true) SendToAwtrix(Notifications.doorbell.def);
}

function ShowTrashbinNotification() {
    for (let x in Notifications.trashbin) {
        if (Notifications.trashbin[x].value == 1) SendToAwtrix(Notifications.trashbin[x].def, Notifications.trashbin[x].destination);
    };
    if (logging) log("Gelb:" + Notifications.trashbin.yellow.value + " Grün:" + Notifications.trashbin.green.value + " Schwarz:" + Notifications.trashbin.black.value);
}

function ShowAlertNotifications() {
    for (let x in Notifications.alerts) {
        if (Notifications.alerts[x].value == true) SendToAwtrix(Notifications.alerts[x].def, Notifications.alerts[x].destination);
    };
}


function SetBrightness() {
    if (LuxOid != "" && ActivateBrightnessControl) {
        if (Brightness > 2000) {
            AwtrixBrightness = 30;
        } else if (Brightness > 500) {
            AwtrixBrightness = 25;
        } else if (Brightness > 100) {
            AwtrixBrightness = 20;
        } else if (Brightness > 10) {
            AwtrixBrightness = 15;
        } else {
            AwtrixBrightness = 10;
        };
        if (OldAtrixBrightness != AwtrixBrightness) { //Nur senden wenn Wert geändert
            if (logging) log("Set Awtrix brightness to " + AwtrixBrightness);

            setState(AwtrixMqttOid + ".settings", JSON.stringify({ "Brightness": AwtrixBrightness }));
            OldAtrixBrightness = AwtrixBrightness;
        };
    };
};


function InfoCycle1() {
    IntervalHandler1 = setInterval(function () { // 
        if (AlertCycle == 1) ShowAlertNotifications();
        if (TrashbinCycle == 1) ShowTrashbinNotification();
        if (ClimateCycle == 1) ShowTempHum();


    }, InfoCycle1Refresh); //
}

function InfoCycle2() {
    IntervalHandler2 = setInterval(function () { // 
        if (AlertCycle == 2) ShowAlertNotifications();
        if (TrashbinCycle == 2) ShowTrashbinNotification();
        if (ClimateCycle == 2) ShowTempHum();

    }, InfoCycle2Refresh); //
}

function InfoCycle3() {
    IntervalHandler3 = setInterval(function () { // 
        if (AlertCycle == 3) ShowAlertNotifications();
        if (TrashbinCycle == 3) ShowTrashbinNotification();
        if (ClimateCycle == 3) ShowTempHum();

    }, InfoCycle3Refresh); //
}


//Trigger
//Klimatrigger in Schleife erstellen
for (let x in Notifications.climate) {
    if (Notifications.climate[x].oid != "") {
        on(Notifications.climate[x].oid, function (dp) { //Trigger für Temperatur erzeugen
            if (x.indexOf("temp") != -1) Notifications.climate[x].value = parseInt(dp.state.val * 10) / 10;
            if (x.indexOf("humitity") != -1) Notifications.climate[x].value = parseInt(dp.state.val);
        });
    };
}

//Helligkeit
if (LuxOid != "") {
    on(LuxOid, function (dp) { //Trigger für Lux erzeugen
        Brightness = dp.state.val;
        SetBrightness();
    });
};

//Türklingel
if (Notifications.doorbell.oid != "") {
    on(Notifications.doorbell.oid, function (dp) { //Trigger für Türklingel erzeugen
        Notifications.doorbell.value = dp.state.val;
        if (dp.state.val) ShowDoorbellNotification();
    });
};

//Trigger für Mülltermine
for (let x in Notifications.trashbin) { //Trigger für Müllabfuhr in Schleife erzeugen um unterschiedliche Varianten der Notification zu ermöglichen ohne Codeänderung
    if (Notifications.trashbin[x].oid != "") {
        on(Notifications.trashbin[x].oid, function (dp) {
            Notifications.trashbin[x].value = dp.state.val;
        });
    };
};

// Trigger für Alarme
for (let x in Notifications.alerts) { //Trigger für Müllabfuhr in Schleife erzeugen um unterschiedliche Varianten der Notification zu ermöglichen ohne Codeänderung
    if (Notifications.alerts[x].oid != "") {
        on(Notifications.alerts[x].oid, function (dp) {
            Notifications.alerts[x].value = dp.state.val;
            if (dp.state.val) ShowAlertNotifications();
        });
    };
};


onStop(function () { //Bei Scriptende alle Intervalle löschen
    clearInterval(IntervalHandler1);
    clearInterval(IntervalHandler2);
    clearInterval(IntervalHandler3);
}, 100);



