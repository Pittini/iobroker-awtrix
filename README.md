# iobroker-awtrix - ALPHAVERSION
Steuere Deine Awtrix via iobroker


## Features
Besteht aus zwei unabhängigen Skripten.

#1 AwtrixConnector
* Erstellt Datenpunkte für alle verfügbaren Werte und Einstellungen
* Bietet die Möglichkeit Notifications via Datenpunkten zu senden.

#2 AtrixController
* Sendet vordefinierte Notifications in bestimmten Intervallen. Z.b. Temperatur und Luftfeuchtigkeit alle x Minuten.

## Voraussetzung für beide Skripte
Die Verbindung zur Awtrix via mqtt muß funktionierend eingerichtet sein.

## Installation
Nachdem ihr das Skript in ein neues Js Projekt kopiert habt, speichern und starten.
Für jeden Teilbereich wird nun im Skriptverzeichnis ein Channel erstellt mit allen nötigen Datenpunkten. 

Dies sind: 
1. MatrixInfo, hier findet Ihr die verfügbaren Infos zur Matrix. Diese Felder sind readonly!
2. Settings, hier sind alle verfügbaren Settings gelistet und können auch gesetzt werden. 
3. Notify, hier könnt Ihr eine Benachrichtigung vorbereiten, sobald Text ins Feld text eingegeben wurde, wird die Nachricht abgeschickt. Welche Bedeutung die einzelenen Datenpunkte haben, kannst Du HIER nachlesen
4. Unter Basics findet ihr die allgemeinen Datenpunkte.

## Changelog
### V0.0.2 (09.04.2021)
* Add: Notifications implementiert.
### V0.0.1 (01.04.2021)
* Add: Init
