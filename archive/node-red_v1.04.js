// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: chalkboard-teacher;
//
// Created 2021 by Ranki <s.rankers@einfach-beraten.de>
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
// 1.04 (2021-05-04)
// 1.03 (2021-01-10)
// 1.02 (2021-01-09)
// 1.01 (2021-01-08)
// 1.0 (2021-01-06)
var version = "v1.04"; 											

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
	var clrWidgetBackground = "000000"; 						
	var txtclrWidgetTitle = "FFFFFF"; 							
	var txtclrWidgetFooter = "F2F2F2"; 							
	var txtclrElementTitle = "FFFFFF";							
	var txtclrElementData = "FFFFFF";							
	var txtclrElementCircle = "FFFFFF"; 						
	var clrElementCircleStroke = "A4A4A4"; 						
	var clrElementCircleFill = "FF0000";						
	var txtclrErrorTitle = "FF0000"; 							
	var txtclrErrorMsg = "FF0000"; 								
	var symclrSFSymbol_Default = "FFFFFF"; 						
	} 
else { 
	var clrWidgetBackground = "FFFFFF"; 						
	var txtclrWidgetTitle = "000000"; 							
	var txtclrWidgetFooter = "6E6E6E";							
	var txtclrElementTitle = "000000"; 							
	var txtclrElementData = "000000"; 							
	var txtclrElementCircle = "000000"; 						
	var clrElementCircleStroke = "A4A4A4";						
	var clrElementCircleFill = "FF0000"; 						
	var txtclrErrorTitle = "FF0000";							
	var txtclrErrorMsg = "FF0000";								
	var symclrSFSymbol_Default = "000000"; 						
	} 

// Definition of cirlce v1.03
  const canvSize = 50 
  const canvTextSize = canvSize / 4 
  
  const canvWidth = canvSize * 0.15 
  const canvRadius = Math.floor(canvSize / 2.5)  

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
let auth_necessary = false; 
// Specify your credentials
let username = "<username>";
let password = "<passcode>";

// Debugging
write2log("host: " + host,2); 
write2log("subfolder: " + subfolder,3); 
write2log("filename: " + filename,3); 
write2log("auth_necessary: " + auth_necessary,3); 

// Initialize runtime of script									
let update_time = new Date();									
update_time = update_time.toLocaleString();						
		
// Initialization of errormsg v1.01
var errormsg = []; 
var critical_errors = 0; 

// Initialization of filemanager								
  let fm = FileManager.local()
  let dir = fm.documentsDirectory()
  let path = fm.joinPath(dir, filename)

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
		widget.backgroundColor = new Color(clrWidgetBackground); 
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
	widget.backgroundColor = new Color(clrWidgetBackground); 

	await createWidgetHeader(widget); 
	const stack = widget.addStack(); 
	stack.layoutVertically(); 
	stack.topAlignContent(); 
	
	const title = stack.addText("Fehler:"); 
	title.font = Font.boldSystemFont(sizeErrorTitle); 
	title.textColor = new Color(txtclrErrorTitle); 						

	for (let err_msg_txt of errormsg) { 
		const msg = stack.addText(err_msg_txt); 
		msg.font = Font.boldSystemFont(sizeErrorMsg); 
		msg.textColor = new Color(txtclrErrorMsg); 						
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
				}
			catch(err) { 
					console.error(err); 
					write2log("no valid JSON",1); 
				} 
			if (typeof value == 'object') { 
				write2log("JSON: " + JSON.stringify(value),2); 
				counter = 99; 
				} 
		} 
		if (typeof value != 'object') { 
			write2log("Konnte die JSON-Daten nicht herunterladen."); 		
			value = JSON.parse(fm.readString(path), null);					
			if (!value) {													
				write2error("Function downloadData: Konnte Daten aus Cache nicht herstellen."); 				
				return "{}";												
			}																
			else {															
				update_time = update_time + " (cached)"						
				return value;												
			}
			} 
		else {
		    // Write JSON to iCloud file									
			fm.writeString(path, JSON.stringify(value, null, 2))			
			return value;
		}
    } catch(err) {
		write2log("Function downloadData: " + err); 						
		value = JSON.parse(fm.readString(path), null);						
		if (!value) {														
			write2error("Function downloadData: Konnte Daten aus Cache nicht herstellen."); 				
			return "{}";													
		}																	
		else {																
			update_time = update_time + " (cached)"							
			return value;													
		}
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
			if (typeof element == 'object') { 
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
			else 
				write2error("Function createWidget: Element wurde übersprungen, da es leer war (# " + counter + ").",0); 
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
	title.textColor = new Color(txtclrWidgetTitle); 						
	
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
		const updateEntry = widget.addText(update_time + ", " + version); 
		updateEntry.font = Font.systemFont(sizeWidgetFooter);
		updateEntry.textColor = new Color(txtclrWidgetFooter); 						
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
			title.textColor = new Color(txtclrElementTitle); 						
		} 
		else { 
			write2error("Konnte Elementtitel nicht laden."); 
		} 
		// Element data
		if (typeof element.data == 'object') { 
			if (element.data != null) 
				var data = element.data;
			else { 
				write2error("Elementdaten 'element.data' ist leer.",0); 
				var data = undefned;
			} 
			if (data.type != null) 
				var strType = data.type;
			else { 
				write2error("Elementdaten 'element.data.type' ist leer.",0); 
				var strType = "text"; 
			}
			if (data.value != null) 
				var strValue = data.value;
			else { 
				write2error("Elementdaten 'element.data.value' ist leer.",0); 
				var strValue = "0"; 
			} 
			// Configure data output from given datatype
			switch(strType) {
					case "number":
						write2log("switch datatype: number (" + strType + ")",3); 
						valueEntry = stack.addText(parseValue(strValue) + " " + data.unit);
						valueEntry.font = Font.systemFont(sizeElementData);
						valueEntry.textColor = new Color(txtclrElementData); 				
					break;
					case "circle": 
						write2log("switch datatype: circle (" + strType + ")",3); 
						valueEntry = stack.addImage(getDiagram(parseValue(strValue))); 
					break; 
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
							// check SFSymbols v1.04
							if (data.SFSymbol_ON == null)
								strSymbol = "lightbulb.fill";
							else
								strSymbol = data.SFSymbol_ON;
							// check SFSymbol colors 											
							if (data.SFSymbol_ON_Color == null) 								
								symclrSFSymbol = symclrSFSymbol_Default; 						
							else 																
								if (dark) 														
									symclrSFSymbol = invertColor(data.SFSymbol_ON_Color); 		
								else 															
									symclrSFSymbol = data.SFSymbol_ON_Color; 					
							}
						else if (strValue == "OFF") {
							if (data.SFSymbol_OFF == null)
								strSymbol = "lightbulb";
							else
								strSymbol = data.SFSymbol_OFF;
							// check SFSymbol colors 											
							if (data.SFSymbol_OFF_Color == null) 								
								symclrSFSymbol = symclrSFSymbol_Default; 						
							else 																
								if (dark) 														
									symclrSFSymbol = invertColor(data.SFSymbol_OFF_Color); 		
								else 															
									symclrSFSymbol = data.SFSymbol_OFF_Color; 					
							}
						write2log("SFSymbol: " + strSymbol,3); 
						var sym = SFSymbol.named(strSymbol).image; 								
						var col = new Color(symclrSFSymbol); 												
						var image = stack.addImage(await tintSFSymbol(sym, col)); 				
						write2log("Image: " + image,3); 
						image.imageSize = new Size(sizeElementSymbol, sizeElementSymbol);
					break;	
					case "SFSymbol":															
						write2log("switch datatype: SFSymbol (" + strType + ")",3); 			
						if (data.value == null)													
							strSymbol = "questionmark.square";									
						else																	
							strSymbol = data.value;												
						if (data.SFSymbol_Color == null) 										
							symclrSFSymbol = symclrSFSymbol_Default; 							
						else // ggf. noch prüfen, ob hexadecimal-Wert 							
							if (dark) 															
								symclrSFSymbol = new Color(invertColor(data.SFSymbol_Color));	
							else 																
								symclrSFSymbol = new Color(data.SFSymbol_Color); 				
						write2log("SFSymbol: " + strSymbol,3); 									
						var sym = SFSymbol.named(strSymbol).image; 								
						var col = symclrSFSymbol; 												
						var image = stack.addImage(await tintSFSymbol(sym, col)); 				
						write2log("Image: " + image,3); 										
						image.imageSize = new Size(sizeElementSymbol, sizeElementSymbol);		
					break;						
					default: // text
						write2log("switch datatype: default (" + strType + ")",3); 
						valueEntry = stack.addText(strValue.toString() + " " + data.unit);
						valueEntry.font = Font.systemFont(sizeElementData);
						valueEntry.textColor = new Color(txtclrElementData);					
			}
		}
		else { 
			write2error("Konnte Elementdaten nicht laden."); 
		} 
    } catch(err) {
            write2error("Function createElement (Element: " + element.name + "): " + err); 
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
	const canvas = new DrawContext()

	canvas.opaque = false  
	canvas.size = new Size(canvSize, canvSize)
	canvas.respectScreenScale = true

	// paint circle
	drawArc(
		new Point(canvSize / 2, canvSize / 2), // center
		canvRadius, // radius
		canvWidth, // width
		Math.floor(percentage * 3.6)  // degree
	)

	// Position of text
	const canvTextRect = new Rect(
		0, // minX
		canvSize/2 - canvTextSize / 2, // minY - center of circle - half of textsize = vertical/ horizonatl middle of circle
		canvSize, // maxX
		canvTextSize // maxY
		)
		
	// Formatting of text
	canvas.setTextAlignedCenter()
	canvas.setTextColor(new Color(txtclrElementCircle)) 				
	canvas.setFont(Font.boldSystemFont(canvTextSize)) 
	canvas.drawTextInRect(Math.round(Number.parseFloat(percentage)).toString() + " %", canvTextRect) 

	return canvas.getImage()

	function drawArc(ctr, rad, w, deg) {
		write2log("Function drawArc (ctr, rad, w, deg): " + ctr + ", " + rad + ", " + w + ", " + deg,1); 
		bgx = ctr.x - rad
		bgy = ctr.y - rad
		bgd = 2 * rad
		bgr = new Rect(bgx, bgy, bgd, bgd)
		
		canvas.setFillColor(new Color(clrElementCircleFill)) 			
		canvas.setStrokeColor(new Color(clrElementCircleStroke)) 		
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

async function tintSFSymbol(image, color) { 
/**
 * source: https://talk.automators.fm/t/define-the-color-of-a-sf-symbols-in-drawcontext/9897/3
 * @param {Image} image The image from the SFSymbol
 * @param {Color} color The color it should be tinted with
 */
  let html = `
  <img id="image" src="data:image/png;base64,${Data.fromPNG(image).toBase64String()}" />
  <canvas id="canvas"></canvas>
  `;
  
  let js = `
    let img = document.getElementById("image");
    let canvas = document.getElementById("canvas");
    let color = 0x${color.hex};

    canvas.width = img.width;
    canvas.height = img.height;
    let ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    let imgData = ctx.getImageData(0, 0, img.width, img.height);
    // ordered in RGBA format
    let data = imgData.data;
    for (let i = 0; i < data.length; i++) {
      // skip alpha channel
      if (i % 4 === 3) continue;
      // bit shift the color value to get the correct channel
      data[i] = (color >> (2 - i % 4) * 8) & 0xFF
    }
    ctx.putImageData(imgData, 0, 0);
    canvas.toDataURL("image/png").replace(/^data:image\\/png;base64,/, "");
  `;
  
  let wv = new WebView();
  await wv.loadHTML(html);
  let base64 = await wv.evaluateJavaScript(js);
  return Image.fromData(Data.fromBase64String(base64));
}

function invertColor(hex) { 
// Source: https://stackoverflow.com/questions/35969656/how-can-i-generate-the-opposite-color-according-to-current-color
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    // invert color components
    var r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
        g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
        b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
    // pad each with zeros and return
    return padZero(r) + padZero(g) + padZero(b);
}

function padZero(str, len) { 
 // Source: https://stackoverflow.com/questions/35969656/how-can-i-generate-the-opposite-color-according-to-current-color
	len = len || 2;
    var zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
}


function write2log(logdata, level = 0) { 
	if (debuglvl >= level) console.log(logdata);
	return "{}"; 
}

function write2error(err_msg_txt, critical = 1) { 
	if (critical == 1) 
		console.error(err_msg_txt); 
	else 
		console.warn(err_msg_txt); 
	errormsg.push(err_msg_txt);
	critical_errors = critical_errors + critical; 
	return "{}"; 
}
//////////////////////////////////////
// RELEASE NOTES
//////////////////////////////////////
//
// Version 1.04
// - typos corrected
// - Added general colour support for SFSymbols with function tintSFSymbol(image, color)
// - Added new type 'SFSymbol' (see example below)
// - Added color support for type switchSF (see example below)
// - Function to invert colors in darkmode (ggf. https://stackoverflow.com/questions/35969656/how-can-i-generate-the-opposite-color-according-to-current-color)
// - changed color definition to Hexadecimal-values only (w/o new Color())
// - Added cached data, if request fails
// - Reqorked node-red integration and widget-file example (see below)
//
// Version 1.03
// - minimal bugfixing
// - implementation of dataype 'circle'
// - change default for basic auhentication to 'false'
//
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
// - enable differentiated text colors
// - definition of text colors for different ranges of the data value (example: 0-25: green, 26-50: yellow; 51-75: orange, 76 - 100: red) 
// - cache information from last call and reuse, if connection failed
//
//////////////////////////////////////
// EXPECTED JSON-file (Example)
// Filename: scriptable.ioswidget
//////////////////////////////////////
// Content:
/*
[
    {
        "name": "number",
        "data": {
            "value": "21",
            "unit": "°C",
            "type": "number"
        }
    },
    {
        "name": "switch",
        "data": {
            "value": "ON",
            "unit": "",
            "type": "switch"
        }
    },
    {
        "name": "switch1",
        "data": {
            "value": "ON",
            "unit": "",
            "type": "switch1"
        }
    },
    {
        "name": "circle",
        "data": {
            "value": "73",
            "unit": "",
            "type": "circle"
        }
    },
    {
        "name": "switchSF",
        "data": {
            "value": "ON",
            "unit": "",
            "type": "switchSF",
            "SFSymbol_ON": "flame.fill",
            "SFSymbol_ON_Color": "FF000",
            "SFSymbol_OFF": "flame",
            "SFSymbol_OFF_Color": "FF0000"
        }
    },
    {
        "name": "SFSymbol",
        "data": {
            "value": "sun.max.fill",
            "unit": "",
            "type": "SFSymbol",
            "SFSymbol_Color": "F7FE2E"
        }
    },
    {
        "name": "SFSymbol",
        "data": {
            "value": "heart.fill",
            "unit": "",
            "type": "SFSymbol",
            "SFSymbol_Color": "FF0000"
        }
    },
    {
        "name": "text",
        "data": {
            "value": "Hello World!",
            "unit": "",
            "type": "text"
        }
    },
    {
        "name": "switchSF",
        "data": {
            "value": "ON",
            "unit": "",
            "type": "switchSF",
            "SFSymbol_ON": "person.fill.checkmark",
            "SFSymbol_ON_Color": "31B404",
            "SFSymbol_OFF": "person.fill.xmark",
            "SFSymbol_OFF_Color": "FF0000"
        }
    },
    {
        "name": "switchSF",
        "data": {
            "value": "OFF",
            "unit": "",
            "type": "switchSF",
            "SFSymbol_ON": "person.fill.checkmark",
            "SFSymbol_ON_Color": "31B404",
            "SFSymbol_OFF": "person.fill.xmark",
            "SFSymbol_OFF_Color": "FF0000"
        }
    }
]
*/
//////////////////////////////////////
// NODE-RED INTEGRATION (Example)
//////////////////////////////////////
/*
[
    {
        "id": "4c94df9d.412af",
        "type": "function",
        "z": "f04ebecf.ec2c3",
        "name": "create Scriptable Test",
        "func": "// Set widget name here\nmsg.topic = \"Test\";\n\n// Fill your variables, which you want to provide within the different widget elements\nvar valueNumber = \"21\";\nvar valueCircle = \"73\";\nvar valueSwitch = \"true\";\nvar valueSwitch1 = \"OFF\";\n\nvar valueSwitchSF = \"ON\";\nvar valueSwitchSF_Symbol_ON = \"flame.fill\";\nvar valueSwitchSF_Color_Symbol_ON = \"FF000\";\nvar valueSwitchSF_Symbol_OFF = \"flame\";\nvar valueSwitchSF_Color_Symbol_OFF = \"FF0000\";\nvar valueSwitchSF2 = \"ON\";\nvar valueSwitchSF2_Symbol_ON = \"person.fill.checkmark\";\nvar valueSwitchSF2_Color_Symbol_ON = \"31B404\";\nvar valueSwitchSF2_Symbol_OFF = \"person.fill.xmark\";\nvar valueSwitchSF2_Color_Symbol_OFF = \"FF0000\";\nvar valueSwitchSF3 = \"OFF\";\nvar valueSwitchSF3_Symbol_ON = \"person.fill.checkmark\";\nvar valueSwitchSF3_Color_Symbol_ON = \"31B404\";\nvar valueSwitchSF3_Symbol_OFF = \"person.fill.xmark\";\nvar valueSwitchSF3_Color_Symbol_OFF = \"FF0000\";\n\nvar valueText = \"Hello World!\";\nvar valueSFSymbol = \"sun.max.fill\";\nvar valueSFSymbol_Color = \"F7FE2E\";\n\nvar valueSFSymbol2 = \"heart.fill\";\nvar valueSFSymbol2_Color = \"FF0000\";\n\n// Maybe put some logic, if you have to change some values or derive symbols from values ...\nif (valueSwitch == \"true\")\n    valueSwitch = \"ON\";\nelse\n    valueSwitch = \"OFF\";\n\n// Initialize the array (here you have to define how many elements this widget will contain)\nmsg.payload = [0,1,2,3,4,5,6,7,8,9];\n\n// fill each element of the widget with data\nmsg.payload[\"0\"] = {name: \"number\", data: {value: valueNumber, unit: \"°C\", type: \"number\"}};\nmsg.payload[\"1\"] = {name: \"switch\", data: {value: valueSwitch, unit: \"\", type: \"switch\"}};\nmsg.payload[\"2\"] = {name: \"switch1\", data: {value: valueSwitch, unit: \"\", type: \"switch1\"}};\nmsg.payload[\"3\"] = {name: \"circle\", data: {value: valueCircle, unit: \"\", type: \"circle\"}};\n\nmsg.payload[\"4\"] = {name: \"switchSF\", data: {value: valueSwitchSF, unit: \"\", type: \"switchSF\", SFSymbol_ON: valueSwitchSF_Symbol_ON, SFSymbol_ON_Color: valueSwitchSF_Color_Symbol_ON, SFSymbol_OFF: valueSwitchSF_Symbol_OFF, SFSymbol_OFF_Color: valueSwitchSF_Color_Symbol_OFF}};\nmsg.payload[\"5\"] = {name: \"SFSymbol\", data: {value: valueSFSymbol, unit: \"\", type: \"SFSymbol\", SFSymbol_Color: valueSFSymbol_Color}};\nmsg.payload[\"6\"] = {name: \"SFSymbol\", data: {value: valueSFSymbol2, unit: \"\", type: \"SFSymbol\", SFSymbol_Color: valueSFSymbol2_Color}};\nmsg.payload[\"7\"] = {name: \"text\", data: {value: valueText, unit: \"\", type: \"text\"}};\n\nmsg.payload[\"8\"] = {name: \"switchSF\", data: {value: valueSwitchSF2, unit: \"\", type: \"switchSF\", SFSymbol_ON: valueSwitchSF2_Symbol_ON, SFSymbol_ON_Color: valueSwitchSF2_Color_Symbol_ON, SFSymbol_OFF: valueSwitchSF2_Symbol_OFF, SFSymbol_OFF_Color: valueSwitchSF2_Color_Symbol_OFF}};\nmsg.payload[\"9\"] = {name: \"switchSF\", data: {value: valueSwitchSF3, unit: \"\", type: \"switchSF\", SFSymbol_ON: valueSwitchSF3_Symbol_ON, SFSymbol_ON_Color: valueSwitchSF3_Color_Symbol_ON, SFSymbol_OFF: valueSwitchSF3_Symbol_OFF, SFSymbol_OFF_Color: valueSwitchSF3_Color_Symbol_OFF}};\n\n// return the message\nreturn msg;\n\n",
        "outputs": 1,
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "x": 360,
        "y": 720,
        "wires": [
            [
                "69fe36d6.4fd6f8",
                "fcef83b5.52589",
                "1d4c2418.9a267c"
            ]
        ]
    },
    {
        "id": "4fb60252.9c177c",
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
        "y": 720,
        "wires": [
            [
                "4c94df9d.412af"
            ]
        ]
    },
    {
        "id": "69fe36d6.4fd6f8",
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
        "y": 680,
        "wires": []
    },
    {
        "id": "1d4c2418.9a267c",
        "type": "json",
        "z": "f04ebecf.ec2c3",
        "name": "",
        "property": "payload",
        "action": "",
        "pretty": true,
        "x": 570,
        "y": 720,
        "wires": [
            [
                "6e7a1e1e.48e14"
            ]
        ]
    },
    {
        "id": "6e7a1e1e.48e14",
        "type": "file",
        "z": "f04ebecf.ec2c3",
        "name": "",
        "filename": "/home/pi/.node-red/public/scriptable/scriptable.ioswidget",
        "appendNewline": true,
        "createDir": false,
        "overwriteFile": "true",
        "encoding": "none",
        "x": 850,
        "y": 720,
        "wires": [
            []
        ]
    }
]
*/