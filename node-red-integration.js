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