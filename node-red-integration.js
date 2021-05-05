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