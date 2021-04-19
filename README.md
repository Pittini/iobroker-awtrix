# iobroker-awtrix - BETAVERSION -  Dies ist ein Skript, kein Adapter!
## Steuere Deine Awtrix via iobroker


## Features:
Besteht aus zwei unabhängigen Skripten. Ihr könnt je nach Anforderung beide Scripte oder auch nur eines davon nutzen, es bestehen keine Abhängigkeiten.

### #1 **AwtrixConnector**
* Erstellt Datenpunkte für alle verfügbaren Werte und Einstellungen und erlaubt (soweit es die Awtrix zulässt) auch die Änderung der Werte, auch z.B. via Vis da Ihr Euch nicht ums zugrundeliegende JSON Format kümmern müßt, sondern direkt jeden Wert via Datenpunkt auslesen bzw. setzen könnt.
* Bietet die Möglichkeit Notifications via Datenpunkten zu senden.

### #2 **AtrixController**
* Sendet vordefinierte Notifications in bestimmten Intervallen. Z.b. Mülltermin einen Tag vor Abholung, Temperatur und Luftfeuchtigkeit alle x Minuten.
* Reagiert auf bestimmte Ereignisse wie Alarme, Türklingel, etc.
* Regelt die Helligkeit Deiner Awtrix nach Aussenhelligkeit (entsprechende Sensorik vorausgesetzt).

## Voraussetzung für beide Skripte:
* Die Verbindung zur Awtrix via mqtt muß funktionierend eingerichtet sein.  
* Der Javascript Adapter aka "Script Engine" sollte mind. V 4.8 oder höher sein.

## Installation Connector
Nachdem ihr das Skript in ein neues Js Projekt kopiert habt, speichern und starten.  
Bei Nutzung des Connectors werden für jeden Teilbereich nun im Skriptverzeichnis ein Channel erstellt mit allen nötigen Datenpunkten. 

![tut2.png](/admin/tut2.png)   

Dies sind: 
1. **MatrixInfo**, hier findet Ihr die verfügbaren Infos zur Matrix. Diese Felder sind readonly!
2. **Settings**, hier sind alle verfügbaren Settings gelistet und können auch gesetzt werden. Achtet beim setzen auf sinnvolle und erlaubte Werte.
3. **Notify**, hier könnt Ihr eine Benachrichtigung vorbereiten, sobald Text ins Feld "text" eingegeben wurde, wird die Nachricht abgeschickt. Welche Bedeutung die einzelnen Datenpunkte haben, kannst Du HIER https://awtrixdocs.blueforcer.de/#/de-de/api nachlesen. Beim ersten start des Skripts werden im Notify Channel funktionierende Defaultwerte eingetragen, sodass Ihr nur im Feld "text" etwas eingeben müsst und schon funktioniert das ganze. Selbstverständlich könnt Ihr diese Defaultwerte ändern.
4. Unter **Basics** findet ihr die allgemeinen Datenpunkte. Auch diese Werte können von Euch gesetzt/geändert werden (innerhalb der erlaubten Parameter).
5. **Info** ist wiederum readonly und beinhaltet einige Infos, wie Uptime, Version, usw.

## Installation Controller
Nachdem ihr das Skript in ein neues Js Projekt kopiert habt, solltet Ihr als erstes 
müßt Ihr im Einstellungsbereich eure Datenpunkte für die einzelnen Funktionen eintragen. Habt Ihr irgendwelche  Datenpunkte nicht oder wollt die entsprechende Funktion nicht, lasst die Felder für die ObjektIds einfach leer, d.h. Ihr lasst nur die beiden " stehen, diese dürfen NICHT entfernt werden.

**If you like it, please consider a donation:**
                                                                          
[![paypal](https://www.paypalobjects.com/en_US/DK/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=GGF786JBJNYRN&source=url) 

## Changelog Connector
### V0.1.0 (17.04.2021)
* Add: Notifications implementiert.
* Init Beta
### V0.0.1 (01.04.2021)
* Add: Init Alpha



## Changelog Controller
### V0.1.1 (19.04.2021)
* Fix: Aufgrund fehlerhafter Typo wurde humitidy nur bei Skriptstart aktualisiert.
### V0.1.0 (17.04.2021)
* Add: Init Beta
### V0.0.1 (01.04.2021)
* Add: Init Alpa
