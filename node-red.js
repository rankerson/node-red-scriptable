// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: chalkboard-teacher;
//
// Copyright (C) 2021 by Ranki <s.rankers@einfach-beraten.de>
//
// Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted.
//
// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
// INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER
// IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE
// OF THIS SOFTWARE.
//
// DESCRIPTION
// This scriptable shows data from node-red resp. an external JSON-string.
// See further details (example of JSON-file and node-red integration) at the end of the coding!
//
// Enjoy!
//
// VERSION (Release notes at the bottom)
//
// 1.02 (2021-01-09)
// 1.01 (2021-01-08)
// 1.0 (2021-01-06)
var version = "v1.02";

// START CODING
// BASIC SETTINGS
// Set Debug level for console (0 = Error, 1 = Info, 2 = More, 3 = All)
var debuglvl = 0;

// Definition of sizes (text and images)
var sizeWidgetTitleImage = 15;
var sizeWidgetTitle = 8;
var sizeWidgetFooter = 6;
var sizeElementTitle = 10;
var sizeElementData = 14;
var sizeElementSymbol = 14;
var sizeErrorTitle = 14; 
var sizeErrorMsg = 14; 

// Definition of colours and variation for darkmode 
var dark = Device.isUsingDarkAppearance(); 
write2log("DarkMode: " + dark,2); 
if (dark) { 
	var clrWidgetBackground = new Color('000000'); 
	var txtclrWidgetTitle = new Color('FFFFFF'); 
	var txtclrWidgetFooter = new Color('F2F2F2'); 
	var txtclrElementTitle = new Color('FFFFFF'); 
	var txtclrElementData = new Color('FFFFFF'); 
	var txtclrErrorTitle = new Color('FF0000'); 
	var txtclrErrorMsg = new Color('FF0000'); 
	} 
else { 
	var clrWidgetBackground = new Color('FFFFFF'); 
	var txtclrWidgetTitle = new Color('000000'); 
	var txtclrWidgetFooter = new Color('6E6E6E'); 
	var txtclrElementTitle = new Color('000000'); 
	var txtclrElementData = new Color('000000'); 
	var txtclrErrorTitle = new Color('FF0000'); 
	var txtclrErrorMsg = new Color('FF0000'); 
	} 

// Server (with ending "/")
let host = "<HOST URL and Port>";

// Subfolder (with ending "/")
let subfolder = "scriptable/";

// Filename with widgetdata in accurate format (see above)
let filename = "scriptable.ioswidget";

// Setting for maximum connection retry
let maxDownloadRetry = 3; 

// settings for basic authentification to get file from server
// Specify authentication string (Base64-codiert)
let auth_necessary = true;
// Specify your credentials
let username = "<username>";
let password = "<passcode>";

// Debugging
write2log("host: " + host,2); 
write2log("subfolder: " + subfolder,3); 
write2log("filename: " + filename,3); 
write2log("auth_necessary: " + auth_necessary,3); 

// Initialization of errormsg v1.01
var errormsg = []; 
var critical_errors = 0; 

// Authentication header
if (auth_necessary) var authheader = { "Authorization": "Basic " + btoa(username + ":" + password) };

// Read of Widget-parameter (Widget Name to get only parts of provided file)
let widgetName = args.widgetParameter; // result in console is always null
// Provide Standard widget name, if no widgt nam is presented in widgt paramters
if (widgetName == null) widgetName = "Übersicht";
write2log("widgetName: " + widgetName,3);

var widgetsData = await downloadData();

if (typeof widgetsData[widgetName] != 'object') { 
	write2error("JSON enthält keine Daten für Widget: " + widgetName); 
} 
else {
	write2log("widgetsData: " + JSON.stringify(widgetsData[widgetName]),3);
	var numElements = countProperties(widgetsData[widgetName]);
	// Determe max. count of elements per line (horizontally) calculated from number of elements in provided data
	var maxElementsLine = 2;
	switch (true) {
		case numElements < 4:
			maxElementsLine = 1;
		break;
		case numElements < 7:
			maxElementsLine = 2;
		break;
		case numElements < 13:
			maxElementsLine = 4;
		break;
	}

	// Create widget
		var widget = await createWidget(widgetsData[widgetName]);
		widget.backgroundColor = clrWidgetBackground; 
		// Determe size of widget output calculated from maxElementsLine (see above)
		switch (maxElementsLine) {
			case (1):
				widget.presentSmall();
			break;
			case (2):
				widget.presentSmall();
			break;
			case (4):
				widget.presentMedium(); 
			break;
			default:
				widget.presentLarge(); 
		}
} 
write2log("Anzahl Fehlermeldungen: " + errormsg.length,1); 
write2log("Anzahl kritischer Fehlermeldungen: " + critical_errors,1); 
// Wenn Abruch-Meldungen vorhanden sind, wird das ursprünglche Widget gelöscht
if (critical_errors > 0) widget = null; 

if ((critical_errors > 0) && (errormsg.length  != 0)) { 
	sizeErrorTitle = sizeErrorTitle - errormsg.length; 
	sizeErrorMsg = sizeErrorMsg - (errormsg.length * 2); 
	var widget = new ListWidget(); 
	widget.backgroundColor = clrWidgetBackground; 

	await createWidgetHeader(widget); 
	const stack = widget.addStack(); 
	stack.layoutVertically(); 
	stack.topAlignContent(); 
	
	const title = stack.addText("Fehler:"); 
	title.font = Font.boldSystemFont(sizeErrorTitle); 
	title.textColor = txtclrErrorTitle; 

	for (let err_msg_txt of errormsg) { 
		const msg = stack.addText(err_msg_txt); 
		msg.font = Font.boldSystemFont(sizeErrorMsg); 
		msg.textColor = txtclrErrorMsg; 
		stack.addSpacer(1); 
	} 

	await createWidgetFooter(widget); 
	widget.presentSmall(); 
} 

Script.setWidget(widget);
Script.complete();

async function downloadData() {
	write2log("Function downloadData",1);
    try{
		counter = 1; 
		while (counter <= maxDownloadRetry) { 
			write2log("Try to download JSON-data (" + counter + " of " + maxDownloadRetry + ")",3); 
			counter++; 
			
			let req = new Request(host + subfolder + filename);
			if (auth_necessary) req.headers = authheader;
			write2log("Request: " + JSON.stringify(req),3);

			var value = await req.loadString(); 
			try{ 
				value = JSON.parse(value); 
				} catch(err) { 
					console.error(err); 
					write2log("no valid JSON",1); 
				} 
			if (typeof value == 'object') { 
				write2log("JSON: " + JSON.stringify(value),2); 
				counter = 99; 
				} 
		} 
		if (typeof value != 'object') { 
			write2error("Konnte die JSON-Daten nicht herunterladen."); 
			return "{}"; 
		} 
		else 
			return value;
    } catch(err) {
        write2error("Function downloadData: " + err); 
        return "{}";
    }
}

async function createWidget(widgetsData){
	try{ 
		write2log("Function createWidget: " + JSON.stringify(widgetsData),1); 
		const widget = new ListWidget();
		
		await createWidgetHeader(widget);
		
		// Create widget content from downloaded data
		counter = 0;
		var hstack = widget.addStack();
		hstack.layoutHorizontally();
		
		for(let element of widgetsData) {
			counter++;
			write2log("Function createWidget (element): " + element.name,2); 
			// Create single elements with title and data
			await createElement(hstack, element);
			
			// Determe, if data is shown in a new column or new row
			if (counter % maxElementsLine != 0) {
				write2log("hstack.addSpacer",3); 
				hstack.addSpacer(15);
			}
			else {
				write2log("widget.addSpacer",3); 
				widget.addSpacer(1);
				write2log("widget.addStack",3); 
				hstack = widget.addStack();
				hstack.layoutHorizontally();
			}	
		}
		
		await createWidgetFooter(widget);
		
		return widget;
    } catch(err) { 
        write2error("Function createWidget: " + err); 
        return "{}"; 
    } 
}

async function createWidgetHeader(widget) { 
try{
	write2log("Function createWidgetHeader",1); 
	// Create widget title
	widget.addSpacer(1);
	const titlestack = widget.addStack(); 
	titlestack.layoutHorizontally(); 
	titlestack.topAlignContent(); 
	titlestack.centerAlignContent(); 
	
	const imgURL = "https://nodered.org/about/resources/media/node-red-icon.png";
	const imgReq = await new Request(imgURL);
	try{ 
		const img = await imgReq.loadImage();
		write2log("img: " + JSON.stringify(img),3); 
		let image = titlestack.addImage(img);
		image.imageSize = new Size(sizeWidgetTitleImage, sizeWidgetTitleImage);
	} catch(err) { 
		write2error("Konnte node-red Bild nicht herunterladen",0); 
	} 

	
	titlestack.addSpacer(4); 
	let title = titlestack.addText("node-red"); 
	title.font = Font.boldSystemFont(sizeWidgetTitle); 
	title.textColor = txtclrWidgetTitle; 
	
	widget.addSpacer(1);

    } catch(err) {
        write2error("Function createWidgetHeader: " + err); 
        return "{}";
    }
}

async function createWidgetFooter(widget) { 
	try{ 
		write2log("Function createWidgetFooter",1); 
		// Create widget footer (Update time of script)
		widget.addSpacer(2);
		var update_time = new Date();
		update_time = update_time.toLocaleString();
		const updateEntry = widget.addText(update_time + ", " + version);
		updateEntry.font = Font.systemFont(sizeWidgetFooter);
		updateEntry.textColor = txtclrWidgetFooter; 
		updateEntry.rightAlignText(); 
	    } catch(err) { 
        write2error("Function createWidgetFooter: " + err); 
        return "{}"; 
    } 
}

async function createElement(hstack, element) {

    try {
        write2log("Function createElement (element):" + JSON.stringify(element),1); 
        
        const stack = hstack.addStack();
		stack.layoutVertically();

		// Element title
		if (element.name != 'null') { 
			const title = stack.addText(element.name);
			title.font = Font.boldSystemFont(sizeElementTitle);
			title.textColor = txtclrElementTitle; 
		} 
		else { 
			write2error("Konnte Elementtitel nicht laden."); 
		} 
		// Element data
		if (typeof element.data == 'object') { 
			var data = element.data;
			var strType = data.type;
			var strValue = data.value;
			// Dark mode support for SFSymbols seems to be not very good as icons are not changed and b/w does not really fit to dark mode => change type to switch
			if (dark && strType == "switchSF")
					strType = "switch";
			// Configure data output from given datatype
			switch(strType) {
					case "number":
						write2log("switch datatype: number (" + strType + ")",3); 
						valueEntry = stack.addText(parseValue(strValue) + " " + data.unit);
						valueEntry.font = Font.systemFont(sizeElementData);
						valueEntry.textColor = txtclrElementData; 
					break;
					/*
					case "circle":
						write2log("switch datatype: circle (" + strType + ")",3); 
						valueEntry = stack.addImage(getDiagram(strValue));
					break;
					*/
					case "switch":
						write2log("switch datatype: switch (" + strType + ")",3); 
						if (strValue == "ON") {
							valueEntry = stack.addText('🟢');
							valueEntry.font = Font.systemFont(sizeElementSymbol);
							}
						else {
							valueEntry = stack.addText('🔴');
							valueEntry.font = Font.systemFont(sizeElementSymbol);
						}
					break;
					case "switch1":
						write2log("switch datatype: switch2 (" + strType + ")",3); 
						if (strValue == "ON") {
							valueEntry = stack.addText('✅ ');
							valueEntry.font = Font.systemFont(sizeElementSymbol);
							}
						else {
							valueEntry = stack.addText('❌');
							valueEntry.font = Font.systemFont(sizeElementSymbol);
						}
					break;
					case "switchSF":
						write2log("switch datatype: switchSF (" + strType + ")",3); 
						var strSymbol = "questionmark.square";
						if (strValue == "ON") {
							if (data.SFSymbol_ON == null)
								strSymbol = "lightbulb.fill";
							else
								strSymbol = data.SFSymbol_ON;
							}
						else if (strValue == "OFF") {
							if (data.SFSymbol_OFF == null)
								strSymbol = "lightbulb";
							else
								strSymbol = data.SFSymbol_OFF;
							}
						write2log("SFSymbol: " + strSymbol,3); 
						let image = stack.addImage(SFSymbol.named(strSymbol).image);
						write2log("Image: " + image,3); 
						image.imageSize = new Size(sizeElementSymbol, sizeElementSymbol);
					break;				
					default: // text
						write2log("switch datatype: default (" + strType + ")",3); 
						valueEntry = stack.addText(strValue.toString() + " " + data.unit);
						valueEntry.font = Font.systemFont(sizeElementData);
						valueEntry.textColor = txtclrElementData; 
			}
		}
		else { 
			write2error("Konnte Elementdaten nicht laden."); 
		} 
    } catch(err) {
            write2error("Function createElement: " + err); 
			return "{}"; 
	}
}

function parseValue(value) {
    try {
        write2log("Function parsingValue: " + value,1); 
        const number = Math.round(Number.parseFloat(value) * 100)/100;
        write2log("parsed " + value + " to " + number,2); 
        return number.toFixed(1);
    } catch(err) {
        write2error("Function parseValue: " + err,0); 
        return value;
    }
}

function getDiagram(percentage) {
	// Source: Chaeimg@Github (https://github.com/chaeimg/battCircle)
	// currently not in use
	write2log("Function getDiagram: " + percentage,1); 
	
	var textColor = new Color('EDEDED');
	var strokeColor = new Color('B0B0B0');
	var fillColor = new Color('EDEDED');

	
	function drawArc(ctr, rad, w, deg) {
		write2log("Function drawArc (ctr, rad, w, deg): " + ctr + ", " + rad + ", " + w + ", " + deg,1); 
		bgx = ctr.x - rad
		bgy = ctr.y - rad
		bgd = 2 * rad
		bgr = new Rect(bgx, bgy, bgd, bgd)
		
		canvas.setFillColor(fillColor)
		canvas.setStrokeColor(strokeColor)
		canvas.setLineWidth(w)
		canvas.strokeEllipse(bgr)
	  
		for (t = 0; t < deg; t++) {
		  rect_x = ctr.x + rad * sinDeg(t) - w / 2
		  rect_y = ctr.y - rad * cosDeg(t) - w / 2
		  rect_r = new Rect(rect_x, rect_y, w, w)
		  canvas.fillEllipse(rect_r)
		}
	  }
  function sinDeg(deg) {
    return Math.sin((deg * Math.PI) / 180)
  }
  
  function cosDeg(deg) {
    return Math.cos((deg * Math.PI) / 180)
  }
  const canvas = new DrawContext()
  const canvSize = 10 //200
  const canvTextSize = 2 //36
  
  const canvWidth = 0.5 //10
  const canvRadius = 4 //80
  
  canvas.opaque = false  
  canvas.size = new Size(canvSize, canvSize)
  canvas.respectScreenScale = true
    
  drawArc(
    new Point(canvSize / 2, canvSize / 2),
    canvRadius,
    canvWidth,
    Math.floor(percentage * 3.6)
  )

  const canvTextRect = new Rect(
    0,
    100 - canvTextSize / 2,
    canvSize,
    canvTextSize
  )
  canvas.setTextAlignedCenter()
  canvas.setTextColor(textColor)
  canvas.setFont(Font.boldSystemFont(canvTextSize))
  canvas.drawTextInRect(`${percentage}%`, canvTextRect)

  return canvas.getImage()
}

function countProperties(obj) {
// Source: https://stackoverflow.com/questions/956719/number-of-elements-in-a-javascript-object
// 
    var count = 0;
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            ++count;
    }
    return count;
}

function write2log(logdata, level = 0) { 
	if (debuglvl >= level) console.log(logdata);
	return "{}"; 
}

function write2error(err_msg_txt, critical = 1) { 
	console.error(err_msg_txt); 
	errormsg.push(err_msg_txt);
	critical_errors = critical_errors + critical; 
	return "{}"; 
}

// RELEASE NOTES
// Version 1.02
// - minimal bugfixing
// - manual dark mode does influence widget background color, but does not provide variable dark
// - enhaced error handling:
// 		- missing widget in JSON
//      - specify function in catch-error and write2error
//      - add critical error indicator in order to write errors w/o error msg to the user
//
// Version 1.01
// - enhanced color support of dark mode
// - seperated header and footer creation
// - separate logging and errors into separate functions
// - enhanced error handling
//
// Version 1.0
// - initial creation
//
// BACKLOG/ IDEAS
// - enable circle as datatype showing a circle with percentages filled
//
// EXPECTED JSON-file (Example)
// Filename: scriptable.ioswidget
// Content:
/*
{"<widgetName1>":[
	{
		"name":"<title element1>",
		"data":
			{
				"value":"10",
				"unit":"%",
				"type":"circle"
			}
	},
	{
		"name":"<title element2>",
		"data":
			{
				"value":"90",
				"unit":"%",
				"type":"circle"
			}
	},
	{
		"name":"<title element3>",
		"data":
			{
				"value":"ON",
				"unit":"",
				"type":"switch"
			}
	},
	{
		"name":"<title element4>",
		"data":
			{
				"value":"ON",
				"unit":"",
				"type":"switchSF",
				"SFSymbol_ON":"flame.fill", // optional
				"SFSymbol_OFF":"flame" 		// optional
			}
	}
	],
"<widgetName2>":[
	{
		"name":"<title element1>",
		"data":
			{
				"value":"130.123",
				"unit":"W",
				"type":"number"
			}
	},
	{
		"name":"<title element2>",
		"data":
			{
				"value":"2450.9871",
				"unit":"kWh",
				"type":"number"
			}
	}
	]
}
*/
// NODE-RED INTEGRATION (Example)
/*
[
    {
        "id": "f04ebecf.ec2c3",
        "type": "tab",
        "label": "Scriptable",
        "disabled": false,
        "info": ""
    },
    {
        "id": "95e061c3.7fd7d",
        "type": "file",
        "z": "f04ebecf.ec2c3",
        "name": "",
        "filename": "/home/pi/.node-red/public/scriptable/scriptable.ioswidget",
        "appendNewline": true,
        "createDir": false,
        "overwriteFile": "true",
        "encoding": "none",
        "x": 790,
        "y": 200,
        "wires": [
            []
        ]
    },
    {
        "id": "8fe4e276.a2116",
        "type": "join",
        "z": "f04ebecf.ec2c3",
        "name": "",
        "mode": "custom",
        "build": "object",
        "property": "payload",
        "propertyType": "msg",
        "key": "topic",
        "joiner": "\\n",
        "joinerType": "str",
        "accumulate": true,
        "timeout": "",
        "count": "3",
        "reduceRight": false,
        "reduceExp": "",
        "reduceInit": "",
        "reduceInitType": "",
        "reduceFixup": "",
        "x": 370,
        "y": 200,
        "wires": [
            [
                "881da3ad.dd72f",
                "35df4465.162d7c"
            ]
        ]
    },
    {
        "id": "881da3ad.dd72f",
        "type": "debug",
        "z": "f04ebecf.ec2c3",
        "name": "",
        "active": false,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "true",
        "targetType": "full",
        "statusVal": "",
        "statusType": "auto",
        "x": 510,
        "y": 160,
        "wires": []
    },
    {
        "id": "35df4465.162d7c",
        "type": "json",
        "z": "f04ebecf.ec2c3",
        "name": "",
        "property": "payload",
        "action": "",
        "pretty": false,
        "x": 510,
        "y": 200,
        "wires": [
            [
                "dc8b16c2.b6d4a8",
                "95e061c3.7fd7d"
            ]
        ]
    },
    {
        "id": "dc8b16c2.b6d4a8",
        "type": "debug",
        "z": "f04ebecf.ec2c3",
        "name": "",
        "active": false,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "true",
        "targetType": "full",
        "statusVal": "",
        "statusType": "auto",
        "x": 630,
        "y": 240,
        "wires": []
    },
    {
        "id": "264ce39f.0b3e5c",
        "type": "comment",
        "z": "f04ebecf.ec2c3",
        "name": "Payload to scriptable",
        "info": "Topic => Widget\nPayload => Widget Elemente\n\n{\"gas\":[\n\t{\n\t\t\"name\":\"Gasverbrauch\",\n\t\t\"data\":\n\t\t\t{\n\t\t\t\t\"value\":\"10\",\n\t\t\t\t\"unit\":\"%\",\n\t\t\t\t\"type\":\"circle\"\n\t\t\t}\n\t},\n\t{\n\t\t\"name\":\"Restkapazität\",\n\t\t\"data\":\n\t\t\t{\n\t\t\t\t\"value\":\"90\",\n\t\t\t\t\"unit\":\"%\",\n\t\t\t\t\"type\":\"circle\"\n\t\t\t}\n\t},\n\t{\n\t\t\"name\":\"Gasheizung\",\n\t\t\"data\":\n\t\t\t{\n\t\t\t\t\"value\":\"ON\",\n\t\t\t\t\"unit\":\"\",\n\t\t\t\t\"type\":\"switch\"\n\t\t\t}\n\t}\n",
        "x": 150,
        "y": 120,
        "wires": []
    },
    {
        "id": "27c7f3ba.d92f1c",
        "type": "link in",
        "z": "f04ebecf.ec2c3",
        "name": "Input4Scriptable",
        "links": [
            "3241cda9.b11db2",
            "2fc56eb3.a14272",
            "d0fb507a.8178",
            "d48ccc16.9854a"
        ],
        "x": 155,
        "y": 200,
        "wires": [
            [
                "8fe4e276.a2116"
            ]
        ]
    },
    {
        "id": "efe7a236.60784",
        "type": "function",
        "z": "f04ebecf.ec2c3",
        "name": "create Scriptable Übersicht",
        "func": "msg.topic = \"Übersicht\";\nstrBootTemp_Avg = global.get('Durchschnittstemperatur') || \"n.a.\";\nstrGashzg_Status = global.get('Gasheizung_status') || \"n.a.\";\nstrRestkapazität_human = global.get('gasheizungs_restkapazitaet_human') || \"n.a.\";\nstrBatteriespannung = global.get('bat_volt_inv') || \"n.a.\";\nstrBatterie_akt = global.get('inverter_WattsOut') || \"n.a.\";\nstrLandstrom_akt = global.get('Landstrom_Verbrauch_Current') || \"n.a.\";\nmsg.payload = [0,1,2,3,4,5];\nmsg.payload[\"0\"] = {name: \"Boot\", data: {value: strBootTemp_Avg, unit: \"°C\", type: \"number\"}};\nmsg.payload[\"1\"] = {name: \"Heizung\", data: {value: strGashzg_Status, unit: \"\", type: \"switchSF\", SFSymbol_ON: \"flame.fill\", SFSymbol_OFF: \"flame\"}};\nmsg.payload[\"2\"] = {name: \"Kapazität\", data: {value: strRestkapazität_human.substr(0,5), unit: \"h\", type: \"text\"}};\nmsg.payload[\"3\"] = {name: \"Spannung\", data: {value: strBatteriespannung, unit: \"V\", type: \"number\"}};\nmsg.payload[\"4\"] = {name: \"Batterie\", data: {value: strBatterie_akt, unit: \"W\", type: \"number\"}};\nmsg.payload[\"5\"] = {name: \"Landstrom\", data: {value: strLandstrom_akt, unit: \"W\", type: \"number\"}};\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "x": 380,
        "y": 360,
        "wires": [
            [
                "58c8d400.2a39bc",
                "3241cda9.b11db2"
            ]
        ]
    },
    {
        "id": "937e9a79.80b648",
        "type": "inject",
        "z": "f04ebecf.ec2c3",
        "name": "",
        "props": [
            {
                "p": "payload"
            },
            {
                "p": "topic",
                "vt": "str"
            }
        ],
        "repeat": "60",
        "crontab": "",
        "once": true,
        "onceDelay": 0.1,
        "topic": "",
        "payload": "",
        "payloadType": "date",
        "x": 140,
        "y": 360,
        "wires": [
            [
                "efe7a236.60784"
            ]
        ]
    },
    {
        "id": "58c8d400.2a39bc",
        "type": "debug",
        "z": "f04ebecf.ec2c3",
        "name": "",
        "active": false,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "true",
        "targetType": "full",
        "statusVal": "",
        "statusType": "auto",
        "x": 570,
        "y": 320,
        "wires": []
    },
    {
        "id": "3241cda9.b11db2",
        "type": "link out",
        "z": "f04ebecf.ec2c3",
        "name": "Output2Scriptable (Übersicht)",
        "links": [
            "27c7f3ba.d92f1c"
        ],
        "x": 555,
        "y": 360,
        "wires": []
    },
    {
        "id": "2a3824bd.64a33c",
        "type": "inject",
        "z": "f04ebecf.ec2c3",
        "name": "Reset",
        "props": [
            {
                "p": "payload"
            },
            {
                "p": "reset",
                "v": "true",
                "vt": "bool"
            }
        ],
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "topic": "",
        "payload": "",
        "payloadType": "date",
        "x": 130,
        "y": 160,
        "wires": [
            [
                "8fe4e276.a2116"
            ]
        ]
    },
    {
        "id": "b50b0bb3.19d498",
        "type": "function",
        "z": "f04ebecf.ec2c3",
        "name": "create Scriptable Temperatur",
        "func": "msg.topic = \"Temperatur\";\nstrBootTemp_Avg = global.get('Durchschnittstemperatur') || \"n.a.\";\nstrGashzg_Status = global.get('Gasheizung_status') || \"n.a.\";\nstrRestkapazität_human = global.get('gasheizungs_restkapazitaet_human') || \"n.a.\";\nstrRestkapazität_prozent = global.get('gasheizungs_restkapazitaet_proz') || \"n.a.\";\nmsg.payload = [0,1,2];\nmsg.payload[\"0\"] = {name: \"Boot\", data: {value: strBootTemp_Avg, unit: \"°C\", type: \"number\"}};\nmsg.payload[\"1\"] = {name: \"Gasheizung\", data: {value: strGashzg_Status, unit: \"\", type: \"switchSF\", SFSymbol_ON: \"flame.fill\", SFSymbol_OFF: \"flame\"}};\nmsg.payload[\"2\"] = {name: \"Gaskapazität\", data: {value: strRestkapazität_human + \" (\" + strRestkapazität_prozent + \" %)\", unit: \"\", type: \"text\"}};\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "x": 380,
        "y": 440,
        "wires": [
            [
                "85ec7387.c810c",
                "2fc56eb3.a14272"
            ]
        ]
    },
    {
        "id": "f341a5b3.5c8648",
        "type": "inject",
        "z": "f04ebecf.ec2c3",
        "name": "",
        "props": [
            {
                "p": "payload"
            },
            {
                "p": "topic",
                "vt": "str"
            }
        ],
        "repeat": "60",
        "crontab": "",
        "once": true,
        "onceDelay": 0.1,
        "topic": "",
        "payload": "",
        "payloadType": "date",
        "x": 140,
        "y": 440,
        "wires": [
            [
                "b50b0bb3.19d498"
            ]
        ]
    },
    {
        "id": "85ec7387.c810c",
        "type": "debug",
        "z": "f04ebecf.ec2c3",
        "name": "",
        "active": false,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "true",
        "targetType": "full",
        "statusVal": "",
        "statusType": "auto",
        "x": 570,
        "y": 400,
        "wires": []
    },
    {
        "id": "2fc56eb3.a14272",
        "type": "link out",
        "z": "f04ebecf.ec2c3",
        "name": "Output2Scriptable (Übersicht)",
        "links": [
            "27c7f3ba.d92f1c"
        ],
        "x": 555,
        "y": 440,
        "wires": []
    },
    {
        "id": "18b14f69.b23f81",
        "type": "function",
        "z": "f04ebecf.ec2c3",
        "name": "create Scriptable Strom",
        "func": "msg.topic = \"Strom\";\nstrBatteriespannung = global.get('bat_volt_inv') || \"n.a.\";\nstrBatterie_akt = global.get('inverter_WattsOut') || \"n.a.\";\nstrBatterie_ges = global.get('VerbrauchBatterie') || \"n.a.\";\nstrLandstrom_akt = global.get('Landstrom_Verbrauch_Current') || \"n.a.\";\nmsg.payload = [0,1,2,3];\nmsg.payload[\"0\"] = {name: \"Spannung\", data: {value: strBatteriespannung, unit: \"V\", type: \"text\"}};\nmsg.payload[\"1\"] = {name: \"aktuell\", data: {value: strBatterie_akt, unit: \"W\", type: \"number\"}};\nmsg.payload[\"2\"] = {name: \"Gesamt\", data: {value: strBatterie_ges, unit: \"kWh\", type: \"number\"}};\nmsg.payload[\"3\"] = {name: \"Landstrom\", data: {value: strLandstrom_akt, unit: \"W\", type: \"number\"}};\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "x": 370,
        "y": 520,
        "wires": [
            [
                "bf86818e.57ba5",
                "d48ccc16.9854a"
            ]
        ]
    },
    {
        "id": "603c52d4.4199ec",
        "type": "inject",
        "z": "f04ebecf.ec2c3",
        "name": "",
        "props": [
            {
                "p": "payload"
            },
            {
                "p": "topic",
                "vt": "str"
            }
        ],
        "repeat": "60",
        "crontab": "",
        "once": true,
        "onceDelay": 0.1,
        "topic": "",
        "payload": "",
        "payloadType": "date",
        "x": 140,
        "y": 520,
        "wires": [
            [
                "18b14f69.b23f81"
            ]
        ]
    },
    {
        "id": "bf86818e.57ba5",
        "type": "debug",
        "z": "f04ebecf.ec2c3",
        "name": "",
        "active": false,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "true",
        "targetType": "full",
        "statusVal": "",
        "statusType": "auto",
        "x": 560,
        "y": 480,
        "wires": []
    },
    {
        "id": "d48ccc16.9854a",
        "type": "link out",
        "z": "f04ebecf.ec2c3",
        "name": "Output2Scriptable (Übersicht)",
        "links": [
            "27c7f3ba.d92f1c"
        ],
        "x": 555,
        "y": 520,
        "wires": []
    }
]
*/