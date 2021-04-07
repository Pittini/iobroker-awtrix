const SkriptVersion = "0.0.2"; //vom 7.4.2021 / Link zu Git: https://github.com/Pittini/iobroker-awtrix / Forum: 

const praefix = "javascript.0.Awtrix1"; //Root für Skriptdatenpunkte
const Awtrix1Root = 'mqtt.0.Awtrix1'; //Root für Awtrix Datenpunkte innerhalb mqtt

const logging = true; //Logging aktivieren/deaktivieren





// Ab hier nichts mehr ändern!
log("Starting AwtrixControl V. " + SkriptVersion);

let Awtrix = { Basics: {}, Settings: {}, MatrixInfo: {}, Notify: {}, Info: {} };
let InitInProgress = true;

Awtrix.Notify = { "textToShow": "", multiColorText: "", fallingText: "", force: false, name: "IobrokerText", scrollSpeed: 60, icon: 1, color: [255, 255, 255], moveIcon: true, repeatIcon: false, duration: null, repeat: 1, rainbow: false, progress: null, progressColor: [], progressBackground: [], soundfile: 1, yeelight: [], barchart: [], linechart: [] }
Awtrix.Info = { installedApps: "", appList: "", version: 0, uptime: 0 }
Awtrix.Basics = { switchTo: "", disable: "", enable: "", app: "", showAnimation: "", soundfile: 0, timer: "", stopwatch: false, yeelight: "" }

init();

async function CreateDps() { //Wird durch Trigger aufgerufen sobald get settings ein Ergebnis liefert
    if (logging) log("Reaching CreateDps");
    try {
        // SETTINGS ----------------------------------------------------------------------------------
        for (let x in Awtrix.Settings) { //Alle properties in Settings durchgehen
            const id = praefix + ".Settings." + x;

            if (await existsStateAsync(id)) { //Wenn Datenpunkt schon vorhanden
                if (logging) log(`State ${id} already exists, skip creation and set actual data (${Awtrix.Settings[x]})`, 'info');
                await setStateAsync(id, Awtrix.Settings[x], true); //Aktuellen Wert schreiben
            } else { //ansonsten
                await createStateAsync(id, { name: x, type: typeof Awtrix.Settings[x], read: true, write: true, def: Awtrix.Settings[x] }); //Datenpunkt erzeugen, dann

                let stateObject = await getStateAsync(id);
                if (stateObject && typeof stateObject.val != "undefined") { //prüfen ob Wert vorhanden
                    log(`State '${id}' created, value: '${stateObject.val}'`)
                } else {
                    log(`Unable to get state value of '${id}'.`, 'error');
                };
            };

            on({ id: id, change: "ne", ack: false }, function (dp) { //Trigger für alle properties erzeugen, nur Triggern wenn Ack false
                if (typeof dp.state.val == "string") { //Strings verpacken in ""
                    Awtrix.Settings[x] = '"' + dp.state.val + '"';
                } else {
                    Awtrix.Settings[x] = dp.state.val;
                };
                if (logging) log("Triggered " + id + " value=" + dp.state.val)
                RefreshAwtrix(x);
            });

        };
        await setObjectAsync(praefix, { type: 'device', common: { name: "Awtrix" }, native: {} });
        await setObjectAsync(praefix + "." + "Settings", { type: 'channel', common: { name: "Settings" }, native: {} });

        // MATRIXINFO ------------------------------------------------------------------------------------------------------
        for (let x in Awtrix.MatrixInfo) { //Alle properties in Settings durchgehen
            const id = praefix + ".MatrixInfo." + x;

            if (await existsStateAsync(id)) { //Wenn Datenpunkt schon vorhanden
                if (logging) log(`State ${id} already exists, skip creation and set actual data (${Awtrix.MatrixInfo[x]})`, 'info');
                await setStateAsync(id, Awtrix.MatrixInfo[x], true); //Aktuellen Wert schreiben
            } else { //ansonsten
                await createStateAsync(id, { name: x, type: typeof Awtrix.MatrixInfo[x], read: true, write: false, def: Awtrix.MatrixInfo[x] }); //Datenpunkt erzeugen, dann

                const stateObject = await getStateAsync(id);
                if (stateObject && typeof stateObject.val != "undefined") { //prüfen ob Wert vorhanden
                    log(`State '${id}' created, value: '${stateObject.val}'`)
                } else {
                    log(`Unable to get state value of '${id}'.`, 'error');
                };
            };

        };
        await setObjectAsync(praefix + "." + "MatrixInfo", { type: 'channel', common: { name: "MatrixInfo" }, native: {} });


        // INFO ------------------------------------------------------------------------------------------------------
        for (let x in Awtrix.Info) { //Alle properties in Settings durchgehen
            const id = praefix + ".Info." + x;

            if (await existsStateAsync(id)) { //Wenn Datenpunkt schon vorhanden
                if (logging) log(`State ${id} already exists, skip creation and set actual data (${Awtrix.Info[x]})`, 'info');
                await setStateAsync(id, JSON.stringify(Awtrix.Info[x]), true); //Aktuellen Wert schreiben
            } else { //ansonsten
                await createStateAsync(id, { name: x, type: typeof Awtrix.Info[x], read: true, write: false, def: Awtrix.Info[x] }); //Datenpunkt erzeugen, dann

                const stateObject = await getStateAsync(id);
                if (stateObject && typeof stateObject.val != "undefined") { //prüfen ob Wert vorhanden
                    log(`State '${id}' created, value: '${stateObject.val}'`)
                } else {
                    log(`Unable to get state value of '${id}'.`, 'error');
                };
            };

        };
        await setObjectAsync(praefix + "." + "Info", { type: 'channel', common: { name: "Info" }, native: {} });


        // Notify ------------------------------------------------------------------------------------------------------
        for (let x in Awtrix.Notify) { //Alle properties in Notify durchgehen
            const id = praefix + ".Notify." + x;

            if (await existsStateAsync(id)) { //Wenn Datenpunkt schon vorhanden
                if (logging) log(`State ${id} already exists, skip creation})`, 'info');
              //  Awtrix.Notify[x] = await getStateAsync(id)//Aktuelle Werte einlesen

            } else { //ansonsten
                await createStateAsync(id, { name: x, type: typeof Awtrix.Notify[x], read: true, write: true, def: Awtrix.Notify[x] }); //Datenpunkt erzeugen, dann
            };

            on({ id: id, change: "any", ack: false }, function (dp) { //Trigger für alle properties erzeugen, nur Triggern wenn Ack false

                if (logging) log("Triggered " + id + " value=" + dp.state.val + " Notify=" + Awtrix.Notify[x]);
                if (x == "textToShow") SendNotification();
            });

        };
        await setObjectAsync(praefix + "." + "Notify", { type: 'channel', common: { name: "Notify" }, native: {} });

        // Basics ------------------------------------------------------------------------------------------------------
        for (let x in Awtrix.Basics) { //Alle properties in Basics durchgehen
            const id = praefix + ".Basics." + x;

            if (await existsStateAsync(id)) { //Wenn Datenpunkt schon vorhanden
                if (logging) log(`State ${id} already exists, skip creation})`, 'info');
                await setStateAsync(id, Awtrix.Basics[x], true); //Aktuellen Wert schreiben

            } else { //ansonsten
                await createStateAsync(id, { name: x, type: typeof Awtrix.Basics[x], read: true, write: true, def: Awtrix.Basics[x] }); //Datenpunkt erzeugen, dann
            };

            on({ id: id, change: "ne", ack: false }, function (dp) { //Trigger für alle properties erzeugen, nur Triggern wenn Ack false
                if (typeof dp.state.val == "string") { //Strings verpacken in ""
                    Awtrix.Basics[x] = '"' + dp.state.val + '"';
                } else {
                    Awtrix.Basics[x] = dp.state.val;
                };
                if (logging) log("Triggered " + id + " value=" + dp.state.val + " x=" + x);

                let DummyObj = dp.state.val;

                if (x == "power") {
                    Awtrix.Basics.power = DummyObj.powerState;
                    setStateAsync(Awtrix1Root + ".basics", '{"power":' + dp.state.val + "}");

                } else if ((x == "switchTo")) {
                    Awtrix.Basics.switchTo = DummyObj.switchTo;
                    setStateAsync(Awtrix1Root + ".basics", '{"switchTo":' + dp.state.val + "}");

                } else if ((x == "disable")) {
                    Awtrix.Basics.disable = DummyObj.disable;
                    setStateAsync(Awtrix1Root + ".basics", '{"disable":' + dp.state.val + "}");

                } else if ((x == "enable")) {
                    Awtrix.Basics.enable = DummyObj.enable;
                    setStateAsync(Awtrix1Root + ".basics", '{"enable":' + dp.state.val + "}");

                } else if ((x == "app")) {
                    Awtrix.Basics.app = DummyObj.app;
                    setStateAsync(Awtrix1Root + ".basics", '{"app":' + dp.state.val + "}");

                } else if ((x == "showAnimation")) {
                    Awtrix.Basics.showAnimation = DummyObj.showAnimation;
                    setStateAsync(Awtrix1Root + ".basics", '{"showAnimation":' + dp.state.val + "}");

                } else if ((x == "soundfile")) {
                    Awtrix.Basics.soundfile = DummyObj.soundfile;
                    setStateAsync(Awtrix1Root + ".basics", '{"soundfile":' + dp.state.val + "}");

                }

            });

        };
        await setObjectAsync(praefix + "." + "Basics", { type: 'channel', common: { name: "Basics" }, native: {} });

        InitInProgress = false;
    } catch (error) {
        log(`Unexpected error in CreateDps()- ${error}`, 'error');
    }
}

async function init() {
    if (logging) log("Reaching init");

    await CreateTrigger();
    await setStateAsync(Awtrix1Root + ".basics", '{"get":"settings"}'); //Aktuelle Einstellungen anfordern, eigentlicher Init erfolgt durch Trigger bei erstem Dateneingang
}

function RefreshAwtrix(x) {
    if (logging) log("Reaching RefreshAwtrix x=" + x);
    setState(Awtrix1Root + ".settings", '{' + x + ":" + Awtrix.Settings[x] + '}');
}

async function SendNotification() {
    if (logging) log("Reaching SendNotification");

    let TargetString = "{";

    for (let x in Awtrix.Notify) { //Alle properties in Notify durchgehen
        let DpData = await getStateAsync(praefix + ".Notify." + x);

       // log("x=" + x + " DpData=" + DpData.val)

        if (DpData.val != "" && typeof DpData.val != "undefined" && DpData.val != null) { //Wenn Datenpunkt nicht leer

            if (x == "textToShow") {
                TargetString += '"' + "text" + '"' + ":" + '"' + DpData.val + '"' + ","
            } else {
                if (typeof DpData.val == "string") {
                    TargetString += '"' + x + '"' + ":" + '"' + DpData.val + '"' + ","
                } else if (typeof DpData.val == "number" ||typeof DpData.val == "boolean") {
                    TargetString += '"' + x + '"' + ":" + DpData.val + ","
                } else {
                    TargetString += '"' + x + '"' + ":" + '[' + DpData.val + '],'
                };
            };
        };
    };
    TargetString = TargetString.substr(0, TargetString.length - 1) + '}'
    if (logging) log(TargetString, 'info');
    setState(Awtrix1Root+".notify",TargetString)
    return true;
}

function RefreshDatapoints() {
    if (logging) log("Reaching RefreshDatapoints");
    let Destination = "Settings";
    if (typeof Awtrix != "undefined") {
        setState(praefix + "." + Destination + "." + "ScrollSpeed", Awtrix.ScrollSpeed);
        setState(praefix + "." + Destination + "." + "Brightness", Awtrix.Brightness);
        setState(praefix + "." + Destination + "." + "AlarmFile", Awtrix.AlarmFile);
        setState(praefix + "." + Destination + "." + "AlarmIcon", Awtrix.AlarmIcon);
        setState(praefix + "." + Destination + "." + "TextColor", Awtrix.TextColor);
        setState(praefix + "." + Destination + "." + "Volume", Awtrix.Volume);
    };
}

let answerCounter = 0; //Zähler für Antworten beim Init
function CreateTrigger() {
    if (logging) log("Reaching CreateTrigger");
    on({ id: Awtrix1Root + ".response", change: "any", ack: true }, function (dp) { //Trigger für Response erzeugen
        if (logging) log("Response triggered dp.state.val=" + dp.state.val);

        let DummyObj = {};

        if (dp.state.val != "Hello from AWTRIX") { //Nicht als json parsbaren Text abfangen
            DummyObj = JSON.parse(dp.state.val);
        }

        //Auswerten zu welcher Frage die Antwort gehört
        //Settings
        if (dp.state.val.indexOf("VerboseLog") != -1) {
            if (logging) log("Got SettingsData, now gathering MatrixInfo: ");
            Awtrix.Settings = JSON.parse(dp.state.val);
            answerCounter++;
            setState(Awtrix1Root + ".basics", '{"get":"matrixInfo"}'); //Aktuelle MatrixInfo anfordern
        }
        //MatrixInfo
        else if (dp.state.val.indexOf("wifiquality") != -1) {
            if (logging) log("MatrixInfo: " + dp.state.val)
            Awtrix.MatrixInfo = JSON.parse(dp.state.val);
            answerCounter++;
            setState(Awtrix1Root + ".basics", '{"get":"powerState"}'); //Aktuelle Info anfordern
        }
        //Basics
        else if (dp.state.val.indexOf("powerState") != -1) {
            if (logging) log("powerState: " + DummyObj.powerState)
            if (DummyObj.powerState == "true") {
                Awtrix.Basics.power = true;
            } else {
                Awtrix.Basics.power = false;
            };

            answerCounter++;
            setState(Awtrix1Root + ".basics", '{"get":"appList"}'); //Aktuelle Info anfordern

            // Info
        } else if (dp.state.val.indexOf("Type") != -1) {
            if (logging) log("appList: " + dp.state.val)
            Awtrix.Info.appList = JSON.stringify(DummyObj);
            log("DummyObj=" + JSON.stringify(DummyObj));
            answerCounter++;
            setState(Awtrix1Root + ".basics", '{"get":"installedApps"}'); //Aktuelle Info anfordern

        } else if (dp.state.val.indexOf("Time") != -1) {
            if (logging) log("installedApps: " + dp.state.val)
            Awtrix.Info.installedApps = JSON.stringify(DummyObj);
            answerCounter++;
            setState(Awtrix1Root + ".basics", '{"get":"version"}'); //Aktuelle Info anfordern

        } else if (dp.state.val.indexOf("version") != -1) {
            if (logging) log("Version: " + dp.state.val)
            Awtrix.Info.version = DummyObj.version;
            answerCounter++;
            setState(Awtrix1Root + ".basics", '{"get":"uptime"}'); //Aktuelle Info anfordern

        } else if (dp.state.val.indexOf("uptime") != -1) {
            if (logging) log("Uptime: " + dp.state.val)
            Awtrix.Info.uptime = DummyObj.uptime;
            answerCounter++;

        } else if (dp.state.val.indexOf('{"success":false}') != -1) {
            if (logging) log("Unknown Error at answer #" + answerCounter, "error")

        }



        if (InitInProgress && answerCounter == 7) {
            CreateDps();
            answerCounter = 0;
        };
        //RefreshDatapoints();
    });
}

