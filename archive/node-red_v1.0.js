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
// VERSION
// 1.0 (2021-01-06)
//

// START CODING
// BASIC SETTINGS
// Set Debug level for console (0 = Error, 1 = Info, 2 = More, 3 = All)
let debuglvl = 0;

// Definition of sizes (text and images)
var sizeWidgetTitleImage = 15;
var sizeWidgetTitle = 8;
var sizeWidgetFooter = 6;
var sizeElementTitle = 10;
var sizeElementData = 14;
var sizeElementSymbol = 14;

// Server (with ending "/")
let host = "<HOST URL and Port>";

// Subfolder (with ending "/")
let subfolder = "scriptable/";

// Filename with widgetdata in accurate format (see above)
let filename = "scriptable.ioswidget";

// settings for basic authentification to get file from server
// Specify authentication string (Base64-codiert)
let auth_necessary = false; // boolean
// Specify your credentials
let username = "<username>";
let password = "<passcode>";

// Debugging
if (debuglvl >= 2) console.log("host: " + host);
if (debuglvl >= 3) console.log("subfolder: " + subfolder);
if (debuglvl >= 3) console.log("filename: " + filename);
if (debuglvl >= 3) console.log("auth_necessary: " + auth_necessary);

// Authentication header
if (auth_necessary) var authheader = { "Authorization": "Basic " + btoa(username + ":" + password) };

// Read of Widget-parameter (Widget Name to get only parts of provided file)
let widgetName = args.widgetParameter; // result in console is always null
if (widgetName == null) widgetName = "Übersicht";
if (debuglvl >= 3) console.log("widgetName: " + widgetName);

var widgetsData = await downloadData();
if (debuglvl >= 3) console.log("widgetsData: " + JSON.stringify(widgetsData[widgetName]));

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
let widget = await createWidget(widgetsData[widgetName]);
Script.setWidget(widget);

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

Script.complete();

async function downloadData() {
  if (debuglvl >= 1) console.log("Function downloadData")
    try{
        let req = new Request(host + subfolder + filename);
        if (auth_necessary) req.headers = authheader;
		if (debuglvl >= 3) console.log(req)

        let value = JSON.parse(await req.loadString());
        if (debuglvl >= 2) console.log(JSON.stringify(value));

        return value;
    } catch(err) {
        console.error(err);
        return "{}";
    }
}

async function createWidget(widgetsData){
    if (debuglvl >= 1) console.log("Function createWidget: " + JSON.stringify(widgetsData));
	const widget = new ListWidget();
	
	// Create widget title
	widget.addSpacer();
	const imgURL = "https://nodered.org/about/resources/media/node-red-icon.png";
	const imgReq = await new Request(imgURL);
	const img = await imgReq.loadImage();
	if (debuglvl >= 3) console.log("img: " + img);
	let image = widget.addImage(img);
	image.imageSize = new Size(sizeWidgetTitleImage, sizeWidgetTitleImage);
	image.rightAlignImage();
	widget.addSpacer(1);
	
	// Create widget content from downloaded data
	var counter = 0;
	var hstack = widget.addStack();
	hstack.layoutHorizontally();
    
	for(let element of widgetsData) {
		counter++;
		if (debuglvl >= 2) console.log("Function createWidget (element): " + element.name);
		// Create single elements with title and data
        await createElement(hstack, element);
		
		// Determe, if data is shown in a new column or new row
		if (counter % maxElementsLine != 0) {
			if (debuglvl >= 3) console.log("hstack.addSpacer");
			hstack.addSpacer(15);
		}
		else {
			if (debuglvl >= 3) console.log("widget.addSpacer");
			widget.addSpacer(1);
			if (debuglvl >= 3) console.log("widget.addStack");
			hstack = widget.addStack();
			hstack.layoutHorizontally();
		}	
    }
	
	// Create widget footer (Update time of script)
	widget.addSpacer(2);
	var update_time = new Date();
	update_time = update_time.toLocaleString();
	const updateEntry = widget.addText(update_time);
	updateEntry.font = Font.systemFont(sizeWidgetFooter)
	updateEntry.Color = Color.gray()
	
	return widget;
}

async function createElement(hstack, element) {

    try {
        if (debuglvl >= 1) console.log("Function createElement (element):" + JSON.stringify(element));
        var data = element.data;
        
        const stack = hstack.addStack();
		stack.layoutVertically();

		// Element title
        const title = stack.addText(element.name);
        title.font = Font.boldSystemFont(sizeElementTitle);
        title.Color = Color.white();

		// Element data
		var strType = data.type;
		var strValue = data.value;
		// Configure data output from given datatype
		switch(strType) {
				case "number":
					if (debuglvl >= 3) console.log("switch datatype: number (" + strType + ")");
					valueEntry = stack.addText(parseValue(strValue) + " " + data.unit);
					valueEntry.font = Font.systemFont(sizeElementData);
					valueEntry.Color = Color.gray();
				break;
				/*
				case "circle":
					if (debuglvl >= 3) console.log("switch datatype: circle (" + strType + ")");
					valueEntry = stack.addImage(getDiagram(strValue));
				break;
				*/
				case "switch":
					if (debuglvl >= 3) console.log("switch datatype: switch (" + strType + ")");
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
					if (debuglvl >= 3) console.log("switch datatype: switch2 (" + strType + ")");
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
					if (debuglvl >= 3) console.log("switch datatype: switchSF (" + strType + ")");
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
					if (debuglvl >= 3) console.log("SFSymbol: " + strSymbol);
					let image = stack.addImage(SFSymbol.named(strSymbol).image);
					if (debuglvl >= 3) console.log("Image: " + image);
					image.imageSize = new Size(sizeElementSymbol, sizeElementSymbol);
					image.rightAlignImage();
				break;				
				default: // text
					if (debuglvl >= 3) console.log("switch datatype: default (" + strType + ")");
					valueEntry = stack.addText(strValue.toString() + " " + data.unit);
					valueEntry.font = Font.systemFont(sizeElementData);
					valueEntry.Color = Color.gray();
			}
        } catch(err) {
            console.error(err);
    }
}

function parseValue(value) {
    try {
        if (debuglvl >= 1) console.log("Function parsingValue: " + value);
        const number = Math.round(Number.parseFloat(value) * 100)/100;
        if (debuglvl >= 2) console.log("parsed " + value + " to " + number);
        return number.toFixed(1);
    } catch(err) {
        console.error(err);
        return value;
    }
}

/*
async function get(point) {
// wird m.E. nicht benötigt
    try {
        if (debuglvl >= 1) console.log("Function get: " + point);
        let req = new Request(host + subfolder + point);
        if (auth_necessary) req.headers = authheader;
        
        let value = await req.loadString();
        let json = JSON.parse(value);
        if (debuglvl >= 2) console.log("response: " + value);
        return json;
    } catch(err) {
        console.error(err);
        return "n/a";
    }
}
*/

function getDiagram(percentage) {
	// Source: Chaeimg@Github (https://github.com/chaeimg/battCircle)
	// currently not in use
	if (debuglvl >= 1) console.log("Function getDiagram: " + percentage);
	
	var textColor = new Color('EDEDED');
	var strokeColor = new Color('B0B0B0');
	var fillColor = new Color('EDEDED');

	
	function drawArc(ctr, rad, w, deg) {
		if (debuglvl >= 1) console.log("Function drawArc (ctr, rad, w, deg): " + ctr + ", " + rad + ", " + w + ", " + deg);
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
// RELEASE NOTES
//
// Version 1.0
// - initial creation
//
// BACKLOG/ IDEAS
// - enable circle as datatype showing a circle with percentages filled
// - more error handling :-)
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
