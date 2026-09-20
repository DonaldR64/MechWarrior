const BoB = (() => {
    const version = '2025.4.7';
    if (!state.BoB) {state.BoB = {}};

    const pageInfo = {};
    const rowLabels = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","AA","AB","AC","AD","AE","AF","AG","AH","AI","AJ","AK","AL","AM","AN","AO","AP","AQ","AR","AS","AT","AU","AV","AW","AX","AY","AZ","BA","BB","BC","BD","BE","BF","BG","BH","BI"];

    let UnitArray = {}; 
    let HexMap = {}; 
    let activeUnitID;
    let currentPlayer = -1;
    let RoutArray = [];
    let MeleeArray = [];
    let MeleeInfo = {};
    let NameArray = {};
    let playerInfo = [];
    let FireInfo = {};
    let uncloaked = []; //unitIDs that 'uncloaked' this turn
    let moveInfo = {};
    let artFire = {};

    let HexSize, HexInfo, DIRECTIONS;

    //math constants
    const M = {
        f0: Math.sqrt(3),
        f1: Math.sqrt(3)/2,
        f2: 0,
        f3: 3/2,
        b0: Math.sqrt(3)/3,
        b1: -1/3,
        b2: 0,
        b3: 2/3,
    }

    const playerCodes = {
        "Don": "2520699",
        "DonAlt": "5097409",
        "Ted": "6951960",
        "Vic": "4892",
        "Ian": "4219310",
    }

    const PlayerIDs = () => {
        let players = Object.keys(playerCodes);
        for (let i=0;i<players.length;i++) {
            let roll20ID = playerCodes[players[i]];
            let playerObj = findObjs({_type:'player',_d20userid: roll20ID})[0];
            if (playerObj) {
                let info = {
                    name: players[i],
                    playerID: playerObj.get("id"),
                }
                playerInfo.push(info);
            }
        }
    }




    const DefineHexInfo = () => {
        HexSize = (70 * pageInfo.scale)/M.f0;

        if (pageInfo.type === "hex") {
            HexInfo = {
                size: HexSize,
                pixelStart: {
                    x: 35 * pageInfo.scale,
                    y: HexSize,
                },
                width: 70  * pageInfo.scale,
                height: pageInfo.scale*HexSize,
                xSpacing: 70 * pageInfo.scale,
                ySpacing: 3/2 * HexSize,
                directions: {
                    "Northeast": new Cube(1, -1, 0),
                    "East": new Cube(1, 0, -1),
                    "Southeast": new Cube(0, 1, -1),
                    "Southwest": new Cube(-1, 1, 0),
                    "West": new Cube(-1, 0, 1),
                    "Northwest": new Cube(0, -1, 1),
                },
            }




            DIRECTIONS = ["Northeast","East","Southeast","Southwest","West","Northwest"];
        } else if (pageInfo.type === "hexr") {
            HexInfo = {
                size: HexSize,
                pixelStart: {
                    x: HexSize,
                    y: 35 * pageInfo.scale,
                },
                width: oageInfo.scale*HexSize,
                height: 70  * pageInfo.scale,
                xSpacing: 3/2 * HexSize,
                ySpacing: 70 * pageInfo.scale,
                directions: {},
            }

            DIRECTIONS = ["North","Northeast","Southeast","South","Southwest","Northwest"];
        }




    }



    const SM = {
       moved: "status_Advantage-or-Up::2006462",
       rotate: "status_Turn::7236233",
       fired: "status_Shell::5553215",
       yellow: "status_yellow",
       red: "status_red",
       op: "status_Shield::2006495", 
       rout: "status_Fear-or-Afraid::2006486", 
       end: "status_interdiction",
       faust: "status_Faust::7220804",
       cp: "status_Plus-Transparent::2006399",
       prof: "status_strong", //change
       bomb: "status_chemical-bolt", //change
       cpm: "status_lightning-helix"
    }; 


    const TurnMarkers = ["","https://s3.amazonaws.com/files.d20.io/images/361055772/zDURNn_0bbTWmOVrwJc6YQ/thumb.png?1695998303","https://s3.amazonaws.com/files.d20.io/images/361055766/UZPeb6ZiiUImrZoAS58gvQ/thumb.png?1695998303","https://s3.amazonaws.com/files.d20.io/images/361055764/yXwGQcriDAP8FpzxvjqzTg/thumb.png?1695998303","https://s3.amazonaws.com/files.d20.io/images/361055768/7GFjIsnNuIBLrW_p65bjNQ/thumb.png?1695998303","https://s3.amazonaws.com/files.d20.io/images/361055770/2WlTnUslDk0hpwr8zpZIOg/thumb.png?1695998303","https://s3.amazonaws.com/files.d20.io/images/361055771/P9DmGozXmdPuv4SWq6uDvw/thumb.png?1695998303","https://s3.amazonaws.com/files.d20.io/images/361055765/V5oPsriRTHJQ7w3hHRBA3A/thumb.png?1695998303","https://s3.amazonaws.com/files.d20.io/images/361055767/EOXU3ujXJz-NleWX33rcgA/thumb.png?1695998303","https://s3.amazonaws.com/files.d20.io/images/361055769/925-C7XAEcQCOUVN1m1uvQ/thumb.png?1695998303"];


    const MoveMarkers = ["https://files.d20.io/images/344441274/R0eEVMFzhYmwv6rigIA7GA/thumb.png?1685718541","https://s3.amazonaws.com/files.d20.io/images/435360245/m3tKJi3Pqb_40g75O6ouSg/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360246/pXI3HBrGMZ05ldDfH-zYCQ/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360229/JKMY922qxhf0E3z1l10jQg/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360228/YDGEQNR_qVFprdHJSjYNPg/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360232/1TysQcieJ5zbgYvXV4pqiA/thumb.png?1743563857","https://s3.amazonaws.com/files.d20.io/images/435360240/KfCmoF5WyWTStCWOTPrkJg/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360230/zjvzMFGWotZUORDeIVXrEw/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360226/-TXBFvMfahwOIjXEuS0mTQ/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360237/gEr7oP4z0ByUKTXpvSHYQQ/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360241/2HAnTYlC0uVR6mqyMoaACA/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360244/CDOLr8RkQ-pPhwjaOHTbEA/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360243/023KSjjB8QHtrMNbuO3ENQ/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360242/xx2msq4HjqRN5dUaPl0vfA/thumb.png?1743563857","https://s3.amazonaws.com/files.d20.io/images/435360236/L-iuGURhzreq2t2mKOj3Qg/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360247/v2Y15K10F2qZK268wPzYyw/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360239/SXny1fVCh5PeYxLGtnoPTA/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360233/EdB3z27csNyykkc2lWTefw/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360227/JpFvEVLKlKV6n6JsE8zrVg/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360234/5b2XrhzPgfgjdoI5y97LnQ/thumb.png?174356385","https://s3.amazonaws.com/files.d20.io/images/435360238/_sWU7YtYJsWT1NZC-wb80Q/thumb.png?1743563857","https://s3.amazonaws.com/files.d20.io/images/435360231/n7HVTuMwWch59Aofq1v96w/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360235/yVtSNUPJOkxq0n2_FknMcA/thumb.png?1743563856"];



    let outputCard = {title: "",subtitle: "",nation: "",body: [],buttons: [],};

    const Nations = {
        "Soviet Union": {
            "image": "https://s3.amazonaws.com/files.d20.io/images/372890060/d9Xvvn6MTQA4bOVieBVxcg/thumb.png?1703639776",
            "backgroundColour": "#FF0000",
            "titlefont": "Anton",
            "fontColour": "#000000",
            "borderColour": "#FFFF00",
            "borderStyle": "5px groove",
            "dice": "Soviet",
            "concealedID": "-OLzxAEGCLYfjkIyjLIl",
        },
        "Germany": {
            "image": "https://s3.amazonaws.com/files.d20.io/images/329415788/ypEgv2eFi-BKX3YK6q_uOQ/thumb.png?1677173028",
            "backgroundColour": "#000000",
            "titlefont": "Bokor",
            "fontColour": "#FFFFFF",
            "borderColour": "#000000",
            "borderStyle": "5px double",
            "dice": "Germany",
            "concealedID": "-OLzxUgOZpW3PxHMCJMa",
        },






        "Neutral": {
            "image": "",
            "dice": "Neutral",
            "backgroundColour": "#FFFFFF",
            "titlefont": "Arial",
            "fontColour": "#000000",
            "borderColour": "#006600",
            "borderStyle": "5px ridge",
            "dice": "Neutral",
        },

    };


    //SC is satchel charge
    
    const TerrainInfo = {
       "Wood Building": {height: 1, hinderance: 0, beneficial: true, fpModifiers: {Infantry: -1,Gun: -1,Mortar: -1,Artillery: -1,Air: -1,SC: 1,Flame: 0,}, movementCost: {Infantry: 2, Vehicle: false}},
       "Stone Building": {height: 1, hinderance: 0, beneficial: true, fpModifiers: {Infantry: -2,Gun: -2,Mortar: -2,Artillery: -2,Air: -2,SC: 2,Flame: 0,}, movementCost: {Infantry: 2, Vehicle: false}},
       "Woods": {height: 1, hinderance: 0, beneficial: true, fpModifiers: {Infantry: -1,Gun: -1,Mortar: 1,Artillery: 1,Air: false,SC: 1,Flame: 0,}, movementCost: {Infantry: 2, Vehicle: false}},
       "Hill 1": {height: 1, hinderance: 0, beneficial: false,  fpModifiers: {Infantry: 0,Gun: 0,Mortar: 0,Artillery: 0,Air: 0,SC: 0,Flame: 0,}, movementCost: {Infantry: 1, Vehicle: 1}}, 
       "Hill 2": {height: 2, hinderance: 0, beneficial: false,fpModifiers: {Infantry: 0,Gun: 0,Mortar: 0,Artillery: 0,Air: 0,SC: 0,Flame: 0,}, movementCost: {Infantry: 1, Vehicle: 1}}, 
       "Hill 3": {height: 3, hinderance: 0, beneficial: false,fpModifiers: {Infantry: 0,Gun: 0,Mortar: 0,Artillery: 0,Air: 0,SC: 0,Flame: 0,}, movementCost: {Infantry: 1, Vehicle: 1}}, 
       "Wheatfield": {height: 0, hinderance: 0.5, beneficial: true, fpModifiers: {Infantry: -1,Gun: -1,Mortar: 0,Artillery: 0,Air: -1,SC: -1,Flame: 0,}, movementCost: {Infantry: 1.5, Vehicle: 1}}, 
       "Orchard": {height: 0, hinderance: 0.5, beneficial: true,fpModifiers: {Infantry: 0,Gun: 0,Mortar: 0,Artillery: 0,Air: 0,SC: 0,Flame: 0,}, movementCost: {Infantry: 1, Vehicle: 1}}, 
        "Foxholes": {height: 0, hinderance: 0, beneficial: true,fpModifiers: {Infantry: -2,Gun: -2,Mortar: -4,Artillery: -4,Air: -2,SC: +2,Flame: 0,}, movementCost: {Infantry: 1, Vehicle: 1}},
        "Road": {height: 0, hinderance: 0, beneficial: false,fpModifiers: {Infantry: 0,Gun: 0,Mortar: 0,Artillery: 0,Air: 0,SC: 0,Flame: 0,}, movementCost: {Infantry: 2/3, Vehicle: .5}},

    }








    //line line collision where line1 is pt1 and 2, line2 is pt 3 and 4
    const lineLine = (pt1,pt2,pt3,pt4) => {
        //calculate the direction of the lines
        uA = ( ((pt4.x-pt3.x)*(pt1.y-pt3.y)) - ((pt4.y-pt3.y)*(pt1.x-pt3.x)) ) / ( ((pt4.y-pt3.y)*(pt2.x-pt1.x)) - ((pt4.x-pt3.x)*(pt2.y-pt1.y)) );
        uB = ( ((pt2.x-pt1.x)*(pt1.y-pt3.y)) - ((pt2.y-pt1.y)*(pt1.x-pt3.x)) ) / ( ((pt4.y-pt3.y)*(pt2.x-pt1.x)) - ((pt4.x-pt3.x)*(pt2.y-pt1.y)) );
        if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
            intersection = {
                x: (pt1.x + (uA * (pt2.x-pt1.x))),
                y: (pt1.y + (uA * (pt2.y-pt1.y)))
            }
            return intersection;
        }
        return;
    }
   
 
  

    const TranslateHexLabels = (startLabel) => {
        let startLetter = startLabel.replace(/[0-9]/g, '')
        startLetter = rowLabels.indexOf(startLetter);
        let startNumber = parseInt(startLabel.replace(/[^\d]/g,""));
        let endLetter,endNumber,endLabel;
        if (pageInfo.name === "Map 20") {
            endLetter = 9 - startLetter;
            endNumber = (endLetter % 2 === 0) ? startNumber - 1:startNumber - 2; //shifted 
            endLetter = rowLabels[endLetter];
            endLabel = endLetter + endNumber;
        }





        return endLabel;
    }









    //Classes
    class Point {
        constructor(x,y) {
            this.x = x;
            this.y = y;
        };
        toOffset() {
            let cube = this.toCube();
            let offset = cube.toOffset();
            return offset;
        };
        toCube() {
            let x = this.x - HexInfo.pixelStart.x;
            let y = this.y - HexInfo.pixelStart.y;
            let q = (M.b0 * x + M.b1 * y) / HexInfo.size;
            let r = (M.b3 * y) / HexInfo.size;

            let cube = new Cube(q,r,-q-r).round();
            return cube;
        };
        distance(b) {
            return Math.sqrt(((this.x - b.x) * (this.x - b.x)) + ((this.y - b.y) * (this.y - b.y)));
        }
    }

    class Offset {
        constructor(col,row) {
            this.col = col;
            this.row = row;
        }
        label() {
            let label = rowLabels[this.row] + (this.col + 1).toString();
            return label;
        }
        toCube() {
            let q = this.col - (this.row - (this.row&1)) / 2;
            let r = this.row;
            let cube = new Cube(q,r,-q-r);
            cube = cube.round(); 
            return cube;
        }
        toPoint() {
            let cube = this.toCube();
            let point = cube.toPoint();
            return point;
        }
    };

    class Cube {
        constructor(q,r,s) {
            this.q = q;
            this.r =r;
            this.s = s;
        }

        add(b) {
            return new Cube(this.q + b.q, this.r + b.r, this.s + b.s);
        }
        angle(b) {
            //angle between 2 hexes
            let origin = this.toPoint();
            let destination = b.toPoint();

            let x = Math.round(origin.x - destination.x);
            let y = Math.round(origin.y - destination.y);
            let phi = Math.atan2(y,x);
            phi = phi * (180/Math.PI);
            phi = Math.round(phi);
            phi -= 90;
            phi = Angle(phi);
            return phi;
        }        
        subtract(b) {
            return new Cube(this.q - b.q, this.r - b.r, this.s - b.s);
        }
        static direction(direction) {
            return HexInfo.directions[direction];
        }
        neighbour(direction) {
            //returns a hex (with q,r,s) for neighbour, specify direction eg. hex.neighbour("NE")
            return this.add(HexInfo.directions[direction]);
        }
        neighbours() {
            //all 6 neighbours
            let results = [];
            for (let i=0;i<DIRECTIONS.length;i++) {
                results.push(this.neighbour(DIRECTIONS[i]));
            }
            return results;
        }

        len() {
            return (Math.abs(this.q) + Math.abs(this.r) + Math.abs(this.s)) / 2;
        }
        distance(b) {
            return this.subtract(b).len();
        }
        lerp(b, t) {
            return new Cube(this.q * (1.0 - t) + b.q * t, this.r * (1.0 - t) + b.r * t, this.s * (1.0 - t) + b.s * t);
        }
        linedraw(b) {
            //returns array of hexes between this hex and hex 'b'
            var N = this.distance(b);
            var a_nudge = new Cube(this.q + 1e-06, this.r + 1e-06, this.s - 2e-06);
            var b_nudge = new Cube(b.q + 1e-06, b.r + 1e-06, b.s - 2e-06);
            var results = [];
            var step = 1.0 / Math.max(N, 1);
            for (var i = 0; i < N; i++) {
                results.push(a_nudge.lerp(b_nudge, step * i).round());
            }
            return results;
        }
        label() {
            let offset = this.toOffset();
            let label = offset.label();
            return label;
        }
        radius(rad) {
            //returns array of hexes in radius rad
            //Not only is x + y + z = 0, but the absolute values of x, y and z are equal to twice the radius of the ring
            let results = [];
            let h;
            for (let i = 0;i <= rad; i++) {
                for (let j=-i;j<=i;j++) {
                    for (let k=-i;k<=i;k++) {
                        for (let l=-i;l<=i;l++) {
                            if((Math.abs(j) + Math.abs(k) + Math.abs(l) === i*2) && (j + k + l === 0)) {
                                h = new Cube(j,k,l);
                                results.push(this.add(h));
                            }
                        }
                    }
                }
            }
            return results;
        }

        ring(radius) {
            let results = [];
            let b = new Cube(-1 * radius,0,1 * radius);  //start at west 
            let cube = this.add(b);
            for (let i=0;i<6;i++) {
                //for each direction
                for (let j=0;j<radius;j++) {
                    results.push(cube);
                    cube = cube.neighbour(DIRECTIONS[i]);
                }
            }
            return results;
        }

        round() {
            var qi = Math.round(this.q);
            var ri = Math.round(this.r);
            var si = Math.round(this.s);
            var q_diff = Math.abs(qi - this.q);
            var r_diff = Math.abs(ri - this.r);
            var s_diff = Math.abs(si - this.s);
            if (q_diff > r_diff && q_diff > s_diff) {
                qi = -ri - si;
            }
            else if (r_diff > s_diff) {
                ri = -qi - si;
            }
            else {
                si = -qi - ri;
            }
            return new Cube(qi, ri, si);
        }
        toPoint() {
            let x = (M.f0 * this.q + M.f1 * this.r) * HexInfo.size;
            x += HexInfo.pixelStart.x;
            let y = 3/2 * this.r * HexInfo.size;
            y += HexInfo.pixelStart.y;
            let point = new Point(x,y);
            return point;
        }
        toOffset() {
            let col = this.q + (this.r - (this.r&1)) / 2;
            let row = this.r;
            let offset = new Offset(col,row);
            return offset;
        }


     
    };

    class Hex {
        constructor(point) {
            this.centre = point;
            let offset = point.toOffset();
            this.offset = offset;
            this.tokenIDs = []
            this.cube = offset.toCube();
            this.label = offset.label();
            this.mapLabel = TranslateHexLabels(this.label);
            this.terrain = "Open";
            this.height = 0; //top top of hex
            this.elevation = 0; //baselevel
            this.beneficial = false;
            this.offboard = false;
            this.smoke = false; //false,true or "Dispersed"
            this.smokeID = "";
            this.fpModifiers = {
                Infantry: 0,
                Gun: 0,
                Mortar: 0,
                Artillery: 0,
                Air: 0,
                SC: 0,
                Flame: 0,
            }
            this.movementCost = {
                Infantry: 1,
                Vehicle: 1,
            }
            HexMap[this.label] = this;

        }
    }

    class Unit {
        constructor(tokenID) {
            let token = findObjs({_type:"graphic", id: tokenID})[0];
            let tokenName = token.get("name");
            let charID = token.get("represents");
            let char = getObj("character", charID); 
            let charName = char.get("name");
            if (charName.includes("Concealed")) {
                let info = state.BoB.concealedUnitInfo[tokenID];
                if (info) {
                    charID = info.characterID;
                    char = getObj("character",charID);
                    tokenName = info.name;
                } else {
                    sendChat("","? Error with Concealed Unit");
                    return;
                }
            }



            let attributeArray = AttributeArray(char.id);  
            let nation = attributeArray.nation || "Neutral";
            let player;
            let type = attributeArray.type;
            if (state.BoB.nations[0] === "" || state.BoB.nations[1] === "") {
                sendChat("","Run Setup First");
                return;
            }
            if (state.BoB.nations[0] === nation) {
                state.BoB.nations[0] = nation;
                player = 0;
            } else if (state.BoB.nations[1] === nation) {
                state.BoB.nations[1] = nation;
                player = 1;
            } else if (charName === "Smoke" || charName === "Target") {
                player = 2;
            } else {
                sendChat("","Error with Nation");
                return;
            }

            let location = new Point(token.get("left"),token.get("top"));
            let cube = location.toCube();
            let hexLabel = cube.label();
            let openTopped = false;
            let armourF,armourSR;

            let movement = 5;
            if (type === "Weapons Team") {
                movement = 4;
            }
            if (type === "Gun") {
                movement = 0;
            }
            
            armourF = parseInt(attributeArray.armourF) || "Nil";
            armourSR = parseInt(attributeArray.armourSR) || "Nil";
            if (type === "Armoured Vehicle" || type === "Unarmoured Vehicle") {
                movement = parseInt(attributeArray.movement) || "Nil";
            }

            let proficiency = parseInt(attributeArray.proficiency);
            let accuracy = parseInt(attributeArray.accuracy);

            let special = attributeArray.special || " ";
            special = special.split(",");

    
            let rearVuln = special.find((element) => element.includes("Rear")) || "None";
            if (isNaN(rearVuln)) {
                rearVuln = false;
            } else {
                rearVuln = parseInt(rearVuln.replace(/[^\d]/g,""));
            }

            let transportSpecial = attributeArray.transportSpecial || " ";
            transportSpecial = transportSpecial.split(",");
            let transport = (transportSpecial.includes("Transport")) ? true:false;
            let transportMovement = parseInt(attributeArray.transportMP);
            let mounted = false;
            if (state.BoB.mountedUnitInfo[tokenID]) {
                mounted = true;
            }


            if (special.includes("Open-Topped") || special.includes("Open Topped") || transportSpecial.includes("Open-Topped") || transportSpecial.includes("Open Topped")) {
                openTopped = true;
            }


            let weapons = {};
            //1 is main squad or WT weapon, 2 is reduced weapon, 3 is a SATW, 4 is a Gun/tank Gun/Artillery etc
            //reduced SATW # in notes of SATW
            for (let i=1;i<6;i++) {
                let weaponName = attributeArray["weapon" + i + "name"]
                let equipped = attributeArray["weapon" + i + "equipped"];
                if (equipped !== "Equipped") {continue};
                let weaponGroup = attributeArray["weapon" + i + "group"];
                let range = attributeArray["weapon" + i + "range"] || "1000";
                let minRange,normalRange,longRange;
                if (range.includes("/")) {
                    range = range.split("/");
                    //most Infantry weapons
                    minRange = 1;
                    normalRange = parseInt(range[0]);
                    longRange = parseInt(range[1]);
                } else if (range.includes("-")) {
                    //things like Mortars with a minimum range
                    range = range.split("-");
                    minRange = Math.max(1,parseInt(range[0]));
                    normalRange = parseInt(range[1]);
                    longRange = normalRange;
                } else if (range.includes(">")) {
                    range = range.replace(">","");
                    minRange = parseInt(range);
                    normalRange = 1000;
                    longRange = 1000;
                } else {
                    //things like SATWs with no long range
                    minRange = 1;
                    normalRange = 1000;
                    longRange = 1000;
                }

                let sound, wtype;
                let normalFP = attributeArray["weapon" + i + "firepower"] || 0;
                let profFP = attributeArray["weapon" + i + "proffirepower"] || 0;

                let notes = attributeArray["weapon" + i + "notes"] || " ";
                notes = notes.split(",");
                let meleeFP = notes.find((e) => {
                    return e.includes("Melee");
                })
                if (!meleeFP || meleeFP === undefined) {
                    meleeFP = normalFP;
                }
                if (type === "Weapons Team" || type === "Gun") {
                    meleeFP = 2;
                }
                meleeFP = parseInt(meleeFP);

                let at = attributeArray["weapon" + i + "at"] || 0;
                let he = attributeArray["weapon" + i + "he"] || 0;

//alter below for weapon groups

                if (i === 1) {
                    if (weaponGroup === "Infantry") {
                        sound = "Small Arms";
                    }
                    if (type === "Weapons Team" && charName.includes("MG")) {
                        sound = "MG"
                    }
                    if (weaponGroup === "Mortar") {
                        sound = "Mortar";
                    }
                
                    if (weaponGroup === "SC") {
                        sound = "Explosion";
                    }
                    wtype = "Main";
                }
                if (i === 2) {
                    if (type === "Weapons Team") {
                        meleeFP = 1;
                    }
                    weaponName = weapons.Main.name;
                    weaponGroup = weapons.Main.group;
                    sound = weapons.Main.sound;
                    wtype = "Reduced";
                }

                if (i === 3) {
                    sound = "Handheld AT";
                    if (weaponName.includes("Rifle")) {
                        sound = "Hit";
                    }
                    weaponGroup = "SATW"
                    wtype = "SATW";
                    let special = ["Panzerschreck,","PIAT","Bazooka"];
                    let flag = false;
                    _.each(special,sp => {
                        if (weaponName.includes(sp)) {flag = true};
                    })
                    if (type === "Infantry Squad" && flag === true) {
                        special.push("Squad SATW")
                    }
                }

                if (i === 4) {
                    if (weaponGroup === "Gun") {
                        sound = "Gun"
                    } 
                    //other sounds here


                    wtype = "Main";
                }
                if (i === 5) {
                    if (type === "Aircraft") {
                        wtype = "MGs";
                        sound = "MG";
                    } else {
                        wtype = "Flame";
                        minRange = 0
                        normalRange = 1;
                        longRange = 2;
                        sound = "Flamethrower";
                    }
    
                }



                weapons[wtype] = {
                    name: weaponName,
                    type: wtype,
                    group: weaponGroup,
                    sound: sound,
                    minRange: minRange,
                    normalRange: normalRange,
                    longRange: longRange,
                    normalFP: normalFP,
                    profFP: profFP,
                    meleeFP: meleeFP,
                    at: at,
                    he: he,
                    notes: notes, //will be an array
                }


            }

            let tsides = token.get("sides");
            tsides = tsides.split("|");
            let sides = [];
            _.each(tsides,tside => {
                if (tside) {
                    let side = tokenImage(tside);
                    sides.push(side);
                }
            })

            let currentSide = token.get('currentSide');
            let status;

            if (currentSide === 0) {
                status = "Full";
            }
            if (currentSide === 1 && sides.length > 2) {
                status = "Reduced";
            }
            if (currentSide === 1 && sides.length === 2 || currentSide === 2 && sides.length > 2) {
                status = "Concealed";
            }

            if (mounted === true && status !== "Concealed") {
                currentSide = sides.length - 1;
                status = state.BoB.mountedUnitInfo[tokenID].status;
            }


            let group;
            if (type === "Infantry Squad" || type === "Weapons Team" || type === "Concealed Unit") {
                group = "Infantry";
            } else if (type === "Gun") {
                group = "Gun";
            } else if (type === "Artillery") {
                group = "Artillery";
            } else if (type === "Aircraft") {
                group = "Aircraft";
            } else if (type === "Armoured Vehicle" || type === "Unarmoured Vehicle") {
                group = "Vehicle";
            }
            if (mounted === true && status !== "Concealed") {
                group = "Vehicle";
                status = "Full";
                movement = transportMovement;
            }


            let casFull = attributeArray.casualtyF || " ";
            casFull = casFull.split("/");
            let casRed = attributeArray.casualtyR || "";
            casRed = casRed.split("/");
            let morFull = attributeArray.moraleF || " ";
            morFull = morFull.split("/");
            let morRed = attributeArray.moraleR || " ";
            morRed = morRed.split("/");

            this.name = tokenName;
            this.id = tokenID;
            this.charID = charID;
            this.charName = charName;
            this.nation = nation;
            this.player = player;
            this.cube = cube;
            this.hexLabel = hexLabel;
            this.offboard = false;

            this.transport = transport;
            this.transportMovement = transportMovement;
            this.transportSpecial = transportSpecial;
            this.mounted = mounted;

            this.token = token;
            this.dice = Nations[nation].dice;

            this.type = type;
            this.group = group;
            this.casualtyFull = casFull;
            this.casualtyReduced = casRed;
            this.moraleFull = morFull;
            this.moraleReduced = morRed;

            this.movement = movement;
            this.proficiency = proficiency;
            this.accuracy = accuracy;
            this.armourF = armourF;
            this.armourSR = armourSR;
            this.openTopped =  openTopped;
            this.rearVuln = rearVuln;

            this.weapons = weapons;
            this.special = special;

            this.sides = sides;
            this.status = status;
            this.currentSide = currentSide;

            this.routCheck = ""; //used to track certain things in morale

            this.distMoved = 0;
            this.moveCost = 0;
            this.startHexLabel = hexLabel;
            this.startRotation = token.get('rotation');
            this.moveArray = [];

            this.artAttack = [];



            UnitArray[tokenID] = this;
            HexMap[hexLabel].tokenIDs.push(tokenID);
            if (HexMap[hexLabel].offboard === true) {
                this.offboard = true;
            }



        }


        Reduce() {
            if (this.status === "Reduced") {
                this.Destroy();
                return false;
            } else {
                this.status = "Reduced";
                let level = 0;
                if (this.token.get(SM.red) === true) {level = 2};
                if (this.token.get(SM.yellow) === true) {level = 1};
                let morale = this.moraleReduced[level] || 11;
                this.currentSide = 1;
                this.token.set({
                    currentSide: 1,
                    imgsrc: this.sides[1],
                    bar1_value: morale,
                })
                if (this.weapons.Reduced) {
                    this.token.set("bar3_value",(this.weapons.Reduced.normalFP + "/" + this.weapons.Reduced.profFP));
                } 
                return true;
            }
        }

        Destroy() {
            this.token.set({
                layer: "map",
                statusmarkers: "",
            })
            this.token.set("status_dead",true);
            toFront(this.token);
            let hex = HexMap[this.hexLabel];
            hex.tokenIDs.splice(hex.tokenIDs.indexOf(this.id),1);
        }

        GainConceal() {
            let currentSide = this.sides.length - 1;
            state.BoB.concealedUnitInfo[this.id] = {
                name: this.name,
                status: this.status,
                mounted: this.mounted,
                characterID: this.charID,
            }
            let auraC = this.token.get("aura1_color");

            this.status = "Concealed";

            this.token.set({
                currentSide: currentSide,
                imgsrc: this.sides[currentSide],
                width: 60,
                height: 60,
                bar1_value: 0,
                bar2_value: 0,
                bar3_value: 0,
                name: "",
                showname: false,
                aura1_color: auraC,
                aura1_radius: 0.05,
                fliph: false,
                represents: Nations[this.nation].concealedID,
                statusmarkers: "",
                rotation: 0,
            })
        }

        LoseConceal() {
            if (this.status !== "Concealed") {return};
            let info = state.BoB.concealedUnitInfo[this.id];
            let name = info.name;
            this.status = info.status;
            let charID = info.characterID;
            state.BoB.concealedUnitInfo[this.id] = "";
            let currentSide;
            if (this.status === "Full") {
                currentSide = 0;
            } else if (this.status === "Reduced") {
                currentSide = 1;
            }

            if (info.mounted === true) {
                currentSide = this.sides.length - 1;
                this.type = "Armoured Vehicle";
                this.group = "Vehicle";
                

            }


            let aura1C = this.token.get("aura1_color");
            let aura1R = 0.05;
            uncloaked.push(this.id);

            let move = this.movement;
            let b1,b3,dim;
            let flipH = false;
            if (this.type.includes("Infantry") || this.type.includes("Weapons Team") || this.type === "Gun") {
                let pos = 0;
                if (this.token.get(SM.yellow) === true) {pos = 1};
                if (this.token.get(SM.red) === true) {pos = 2};
                b1 = parseInt(this.moraleFull.split("/")[pos]) || "Unk";
                b3 = this.weapons.Main.normalFP + "/" + this.weapons.Main.profFP || "Unk";
                if (this.status === "Reduced") {
                    b1 = parseInt(this.moraleReduced.split("/")[pos]) || "Unk";
                    if (this.weapons.Reduced) {
                        b3 = this.weapons.Reduced.normalFP + "/" + this.weapons.Reduced.profFP || "Unk";
                    }
                }
                dim = 60;
                if (this.type === "Gun") {
                    dim = 100;
                    aura1R = -.05
                }
                if (state.BoB.routEdges[this.player] === "Right") {
                    flipH = true;
                }
                if (this.weapons.SATW) {
                    this.token.set(SM.faust,true);
                }            
            }
            if (this.type === "Armoured Vehicle") {
                b1 = this.proficiency || "Unk";
                b3 = this.weapons.Main.at + "/" + this.weapons.Main.he || "Unk";
                aura1R = -.05
                dim = 100;
            }

            this.token.set({
                currentSide: currentSide,
                imgsrc: this.sides[currentSide],
                bar1_value: b1,
                bar2_value: move,
                bar3_value: b3,
                name: name,
                showname: true,
                fliph: flipH,
                represents: charID,
                width: dim,
                height: dim,
                aura1_color: aura1C,
                aura1_radius: aura1R,
            })

        }

        Suppress(level) {
            let ml;
            if (this.token.get(SM.red) === true) {
                outputCard.body.push("[#FF0000]" + this.name + " remains fully suppressed[/#]");
                ml = 2;
            }
            if (this.token.get(SM.yellow) === true || level === 2) {
                outputCard.body.push("[#FF0000]" + this.name + " is now fully suppressed[/#]");
                this.token.set(SM.yellow,false);
                this.token.set(SM.red,true);
                ml = 2;
            }
            if (this.token.get(SM.yellow) === false && this.token.get(SM.red) === false && level === 1) {
                outputCard.body.push("[#FF0000]" + this.name + " is suppressed[/#]");
                this.token.set(SM.yellow,true);
                ml = 1;
            }
            let morale = this.moraleFull[ml];
            if (this.status === "Reduced") {
                morale = this.moraleReduced[ml];
            }
            this.token.set("bar1_value",morale);

            if (this.id === activeUnitID && this.mounted === false) {
                this.MoveSuppress("initial");
            }
        }

        MoveSuppress(pass) {
            outputCard.body.push("[#FF0000]The unit takes an immediate Morale Check[/#]");
            let moraleCheck = MoraleCheck(this,0);
            outputCard.body.push("Morale Check: " + moraleCheck.ddRoll + " vs " + moraleCheck.target);
            if (moraleCheck.result === false) {
                let again = (pass === "reentry") ? " again ":" ";
                outputCard.body.push("[#FF0000]" + this.name + " fails its Morale Check" + again +  "and must stay where it is.[/#]")
                outputCard.body.push("It's Activation is Over");
                this.token.set(SM.end,true);
                if (pass === "initial" && state.BoB.command[unit.player] > 0) {
                    ButtonInfo("Reroll Morale Check","!RerollMorale;SuppressMove;" + this.id);
                }
            } else {
                outputCard.body.push("Unit can continue its movement");
            }
        }

        Mount() {
            state.BoB.mountedUnitInfo[this.id] = {
                status: this.status,
                group: this.group,
                move: this.movement,
            }
            this.mounted = true;
            this.status = "Full";
            this.group = "Vehicle";
            this.currentSide = this.sides.length - 1;
            let auraC = this.token.get("aura1_color");
            let name = this.name + " (Mounted)";
            
            this.movement = this.transportMovement;
            let remainingMove = 0;
            if (state.BoB.mountedUnitInfo[this.id].group === "Infantry") {
                remainingMove = Math.floor(this.transportMovement/2);
            }


            this.group = "Vehicle";
            this.token.set({
                currentSide: this.currentSide,
                imgsrc: this.sides[this.currentSide],
                width: 70,
                height: 82,
                bar2_value: remainingMove,
                name: name,
                showname: true,
                aura1_color: auraC,
                aura1_radius: 0.05,
                fliph: false,
                rotation: 0,
            })


        }

        Dismount() {
            let info = state.BoB.mountedUnitInfo[this.id];
            let remainingMove;
            let carrierMovement = this.movement;
            this.status = info.status;
            this.group = info.group;
            this.movement = info.move;
            this.mounted = false;

            let w,h;
            if (this.group === "Infantry") {
                if (parseInt(this.token.get("bar2_value")) === carrierMovement) {
                    remainingMove = 2;
                } else {
                    remainingMove = 0;
                }
                w = h = 60;
            } else if (this.group === "Gun") {
                remainingMove = 0;
                w = 70;
                h = 82;
            }

            this.currentSide = (this.status === "Full") ? 0:1;
            let auraC = this.token.get("aura1_color");
            let name = this.name.replace(" (Mounted)","");

            this.token.set({
                currentSide: this.currentSide,
                imgsrc: this.sides[this.currentSide],
                width: w,
                height: h,
                bar2_value: remainingMove,
                name: name,
                showname: true,
                aura1_color: auraC,
                aura1_radius: 0.05,
                fliph: false,
                rotation: 0,
            })

            delete state.BoB.mountedUnitInfo[this.id];
        }


        
    }




    //Various Functions
    const simpleObj = (o) => {
        let p = JSON.parse(JSON.stringify(o));
        return p;
    };

    const getCleanImgSrc = (imgsrc) => {
        let parts = imgsrc.match(/(.*\/images\/.*)(thumb|med|original|max)([^?]*)(\?[^?]+)?$/);
        if(parts) {
            return parts[1]+'thumb'+parts[3]+(parts[4]?parts[4]:`?${Math.round(Math.random()*9999999)}`);
        }
        return;
    };

    const tokenImage = (img) => {
        //modifies imgsrc to fit api's requirement for token
        img = getCleanImgSrc(img);
        img = img.replace("%3A", ":");
        img = img.replace("%3F", "?");
        img = img.replace("med", "thumb");
        return img;
    };

    const stringGen = () => {
        let text = "";
        let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < 6; i++) {
            text += possible.charAt(Math.floor(randomInteger(possible.length)));
        }
        return text;
    };

    const findCommonElements = (arr1,arr2) => {
        //iterates through array 1 and sees if array 2 has any of its elements
        //returns true if the arrays share an element
        return arr1.some(item => arr2.includes(item));
    };


    const DeepCopy = (variable) => {
        variable = JSON.parse(JSON.stringify(variable))
        return variable;
    };

    const PlaySound = (name) => {
        let sound = findObjs({type: "jukeboxtrack", title: name})[0];
        if (sound) {
            sound.set({playing: true,softstop:false});
        }
    };


    //Retrieve Values from Character Sheet Attributes
    const Attribute = (character,attributename) => {
        //Retrieve Values from Character Sheet Attributes
        let attributeobj = findObjs({type:'attribute',characterid: character.id, name: attributename})[0]
        let attributevalue = "";
        if (attributeobj) {
            attributevalue = attributeobj.get('current');
        }
        return attributevalue;
    };

    const AttributeArray = (characterID) => {
        let aa = {}
        let attributes = findObjs({_type:'attribute',_characterid: characterID});
        for (let j=0;j<attributes.length;j++) {
            let name = attributes[j].get("name")
            let current = attributes[j].get("current")   
            if (!current || current === "") {current = " "} 
            aa[name] = current;
            let max = attributes[j].get("max")   
            if (!max || max === "") {max = " "} 
            aa[name + "_max"] = max;
        }
        return aa;
    };

    const AttributeSet = (characterID,attributename,newvalue,max) => {
        if (!max) {max = false};
        let attributeobj = findObjs({type:'attribute',characterid: characterID, name: attributename})[0]
        if (attributeobj) {
            if (max === true) {
                attributeobj.set("max",newvalue)
            } else {
                attributeobj.set("current",newvalue)
            }
        } else {
            if (max === true) {
                createObj("attribute", {
                    name: attributename,
                    current: newvalue,
                    max: newvalue,
                    characterid: characterID,
                });            
            } else {
                createObj("attribute", {
                    name: attributename,
                    current: newvalue,
                    characterid: characterID,
                });            
            }
        }
    };

    const DeleteAttribute = (characterID,attributeName) => {
        let attributeObj = findObjs({type:'attribute',characterid: characterID, name: attributeName})[0]
        if (attributeObj) {
            attributeObj.remove();
        }
    }




    const ButtonInfo = (phrase,action,inline) => {
        //inline - has to be true in any buttons to have them in same line -  starting one to ending one
        if (!inline) {inline = false};
        let info = {
            phrase: phrase,
            action: action,
            inline: inline,
        }
        outputCard.buttons.push(info);
    };

    const SetupCard = (title,subtitle,nation) => {
        outputCard.title = title;
        outputCard.subtitle = subtitle;
        outputCard.nation = nation;
        outputCard.body = [];
        outputCard.buttons = [];
        outputCard.inline = [];
    };

    const DisplayDice = (roll,tablename,size) => {
        roll = roll.toString();
        let table = findObjs({type:'rollabletable', name: tablename})[0];
        if (!table) {
            table = findObjs({type:'rollabletable', name: "Neutral"})[0];
        }
        let obj = findObjs({type:'tableitem', _rollabletableid: table.id, name: roll })[0];        
        let avatar = obj.get('avatar');
        let out = "<img width = "+ size + " height = " + size + " src=" + avatar + "></img>";
        return out;
    };

    const Angle = (theta) => {
        while (theta < 0) {
            theta += 360;
        }
        while (theta >= 360) {
            theta -= 360;
        }
        return theta
    }   

    const Facing = (reference,unit1,unit2) => {
        if (!unit1) {
            unit1 = FireInfo.shooterUnit;
        }
        if (!unit2) {
            unit2 = FireInfo.targetUnit;
        }
        if (!unit1 || !unit2) {
            sendChat("","Error in Facing")
            return "Front";
        }
    
        let hex1 = HexMap[unit1.hexLabel];
        let hex2 = HexMap[unit2.hexLabel];

        if (hex1.cube.distance(hex2.cube) === 0) {
            return "Rear";
        }

        let h1h2 = hex1.cube.angle(hex2.cube);
        let rot1 = Angle(unit1.token.get("rotation"));
        let rot2 = Angle(unit2.token.get("rotation"));
    
        let angle1to2 = Angle(h1h2 - rot1);
        let h2h1 = hex2.cube.angle(hex1.cube);
        let angle2to1 = h2h1 - rot2;
        let facing, angle;
    
        
        if (reference === "Target") {
            angle = angle2to1;
        }
        if (reference === "Shooter") {
            angle = angle1to2;
        }
    
        if (angle <= 60 || angle >= 300) {
            facing = "Front";
        }
        if ((angle > 60 && angle <= 120) || (angle >= 240 && angle < 300)) {
            facing = "Side";
        }
        if (angle > 120 && angle < 240) {
            facing = "Rear";
        }
    
        return facing;
    }




    const RotatePoint = (cX,cY,angle, p) => {
        //cx, cy = coordinates of the centre of rotation
        //angle = clockwise rotation angle
        //p = point object
        let s = Math.sin(angle);
        let c = Math.cos(angle);
        // translate point back to origin:
        p.x -= cX;
        p.y -= cY;
        // rotate point
        let newX = p.x * c - p.y * s;
        let newY = p.x * s + p.y * c;
        // translate point back:
        p.x = Math.round(newX + cX);
        p.y = Math.round(newY + cY);
        return p;
    }


    const PrintCard = (id) => {
        let output = "";
        if (id) {
            let playerObj = findObjs({type: 'player',id: id})[0];
            let who = playerObj.get("displayname");
            output += `/w "${who}"`;
        } else {
            output += "/desc ";
        }

        if (!outputCard.nation || !Nations[outputCard.nation]) {
            outputCard.nation = "Neutral";
        }

        //start of card
        output += `<div style="display: table; border: ` + Nations[outputCard.nation].borderStyle + " " + Nations[outputCard.nation].borderColour + `; `;
        output += `background-color: #EEEEEE; width: 100%; text-align: center; `;
        output += `border-radius: 1px; border-collapse: separate; box-shadow: 5px 3px 3px 0px #aaa;;`;
        output += `"><div style="display: table-header-group; `;
        output += `background-color: ` + Nations[outputCard.nation].backgroundColour + `; `;
        output += `background-image: url(` + Nations[outputCard.nation].image + `), url(` + Nations[outputCard.nation].image + `); `;
        output += `background-position: left,right; background-repeat: no-repeat, no-repeat; background-size: contain, contain; align: center,center; `;
        output += `border-bottom: 2px solid #444444; "><div style="display: table-row;"><div style="display: table-cell; padding: 2px 2px; text-align: center;"><span style="`;
        output += `font-family: ` + Nations[outputCard.nation].titlefont + `; `;
        output += `font-style: normal; `;

        let titlefontsize = "1.4em";
        if (outputCard.title.length > 12) {
            titlefontsize = "1em";
        }

        output += `font-size: ` + titlefontsize + `; `;
        output += `line-height: 1.2em; font-weight: strong; `;
        output += `color: ` + Nations[outputCard.nation].fontColour + `; `;
        output += `text-shadow: none; `;
        output += `">`+ outputCard.title + `</span><br /><span style="`;
        output += `font-family: Arial; font-variant: normal; font-size: 13px; font-style: normal; font-weight: bold; `;
        output += `color: ` +  Nations[outputCard.nation].fontColour + `; `;
        output += `">` + outputCard.subtitle + `</span></div></div></div>`;

        //body of card
        output += `<div style="display: table-row-group; ">`;

        let inline = 0;

        for (let i=0;i<outputCard.body.length;i++) {
            let out = "";
            let line = outputCard.body[i];
            if (!line || line === "") {continue};
            if (line.includes("[INLINE")) {
                let end = line.indexOf("]");
                let substring = line.substring(0,end+1);
                let num = substring.replace(/[^\d]/g,"");
                if (!num) {num = 1};
                line = line.replace(substring,"");
                out += `<div style="display: table-row; background: #FFFFFF;; `;
                out += `"><div style="display: table-cell; padding: 0px 0px; font-family: Arial; font-style: normal; font-weight: normal; font-size: 14px; `;
                out += `"><span style="line-height: normal; color: #000000; `;
                out += `"> <div style='text-align: center; display:block;'>`;
                out += line + " ";

                for (let q=0;q<num;q++) {
                    let info = outputCard.inline[inline];
                    out += `<a style ="background-color: ` + Nations[outputCard.nation].backgroundColour + `; padding: 5px;`
                    out += `color: ` + Nations[outputCard.nation].fontColour + `; text-align: center; vertical-align: middle; border-radius: 5px;`;
                    out += `border-color: ` + Nations[outputCard.nation].borderColour + `; font-family: Tahoma; font-size: x-small; `;
                    out += `"href = "` + info.action + `">` + info.phrase + `</a>`;
                    inline++;                    
                }
                out += `</div></span></div></div>`;
            } else {
                line = line.replace(/\[hr(.*?)\]/gi, '<hr style="width:95%; align:center; margin:0px 0px 5px 5px; border-top:2px solid $1;">');
                line = line.replace(/\[\#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})\](.*?)\[\/[\#]\]/g, "<span style='color: #$1;'>$2</span>"); // [#xxx] or [#xxxx]...[/#] for color codes. xxx is a 3-digit hex code
                line = line.replace(/\[[Uu]\](.*?)\[\/[Uu]\]/g, "<u>$1</u>"); // [U]...[/u] for underline
                line = line.replace(/\[[Bb]\](.*?)\[\/[Bb]\]/g, "<b>$1</b>"); // [B]...[/B] for bolding
                line = line.replace(/\[[Ii]\](.*?)\[\/[Ii]\]/g, "<i>$1</i>"); // [I]...[/I] for italics
                let lineBack,fontcolour;
                if (line.includes("[F]")) {
                    let ind1 = line.indexOf("[F]") + 3;
                    let ind2 = line.indexOf("[/f]");
                    let fac = line.substring(ind1,ind2);
                    if (Nations[fac]) {
                        lineBack = Nations[fac].backgroundColour;
                        fontcolour = Nations[fac].fontColour;
                    }
                    line = line.replace("[F]" + fac + "[/f]","");

                } else {
                    lineBack = (i % 2 === 0) ? "#D3D3D3": "#EEEEEE";
                    fontcolour = "#000000";
                }
                out += `<div style="display: table-row; background: ` + lineBack + `;; `;
                out += `"><div style="display: table-cell; padding: 0px 0px; font-family: Arial; font-style: normal; font-weight: normal; font-size: 14px; `;
                out += `"><span style="line-height: normal; color:` + fontcolour + `; `;
                out += `"> <div style='text-align: center; display:block;'>`;
                out += line + `</div></span></div></div>`;                
            }
            output += out;
        }

        //buttons
        if (outputCard.buttons.length > 0) {
            for (let i=0;i<outputCard.buttons.length;i++) {
                let info = outputCard.buttons[i];
                let inline = info.inline;
                if (i>0 && inline === false) {
                    output += '<hr style="width:95%; align:center; margin:0px 0px 5px 5px; border-top:2px solid $1;">';
                }
                let out = "";
                let borderColour = Nations[outputCard.nation].borderColour;
                
                if (inline === false || i===0) {
                    out += `<div style="display: table-row; background: #FFFFFF;; ">`;
                    out += `<div style="display: table-cell; padding: 0px 0px; font-family: Arial; font-style: normal; font-weight: normal; font-size: 14px; `;
                    out += `"><span style="line-height: normal; color: #000000; `;
                    out += `"> <div style='text-align: center; display:block;'>`;
                }
                if (inline === true) {
                    out += '<span>     </span>';
                }
                out += `<a style ="background-color: ` + Nations[outputCard.nation].backgroundColour + `; padding: 5px;`
                out += `color: ` + Nations[outputCard.nation].fontColour + `; text-align: center; vertical-align: middle; border-radius: 5px;`;
                out += `border-color: ` + borderColour + `; font-family: Tahoma; font-size: x-small; `;
                out += `"href = "` + info.action + `">` + info.phrase + `</a>`
                
                if (inline === false || i === (outputCard.buttons.length - 1)) {
                    out += `</div></span></div></div>`;
                }
                output += out;
            }

        }

        output += `</div></div><br />`;
        sendChat("",output);
        outputCard = {title: "",subtitle: "",nation: "",body: [],buttons: [],};
    }

    //related to building hex map
    const LoadPage = () => {
        //build Page Info and flesh out Hex Info
        pageInfo.page = getObj('page', Campaign().get("playerpageid"));
        pageInfo.name = pageInfo.page.get("name");
        pageInfo.scale = pageInfo.page.get("snapping_increment");
        pageInfo.width = pageInfo.page.get("width") * 70;
        pageInfo.height = pageInfo.page.get("height") * 70;
        pageInfo.type = pageInfo.page.get("grid_type");

    }

    const BuildMap = () => {
        let startTime = Date.now();
        HexMap = {};
        //builds a hex map, assumes Hex(V) page setting
        let halfToggleX = 35 * pageInfo.scale;
        let rowLabelNum = 0;
        let columnLabel = 1;

        let startX = HexInfo.pixelStart.x;
        let startY = HexInfo.pixelStart.y;

        for (let j = startY; j <= pageInfo.height;j+=HexInfo.ySpacing){
            for (let i = startX;i<= pageInfo.width;i+=HexInfo.xSpacing) {
                let point = new Point(i,j);     
                let hex = new Hex(point);
                columnLabel++;
            }
            startX += halfToggleX;
            halfToggleX = -halfToggleX;
            rowLabelNum += 1;
            columnLabel = 1
        }

        //terrain
        AddTerrain();    
        AddTokens();        
        let elapsed = Date.now()-startTime;
        log("Hex Map Built in " + elapsed/1000 + " seconds");
    };

    const AddTerrain = () => {
        let mapTokenArray = findObjs({_pageid: Campaign().get("playerpageid"),_type: "graphic",_subtype: "token",layer: "map",});
        _.each(mapTokenArray,token => {
            let name = token.get("name");
            if (name === "Map") {
                DefineOffboard(token);
            }
            if (name === "Smoke" || name === "Dispersed Smoke") {
                let centre = new Point(token.get("left"),token.get('top'));
                let centreLabel = centre.toCube().label();
                let hex = HexMap[centreLabel];
                if (name === "Smoke") {
                    hex.smoke = true;
                } else {
                    hex.smoke = "Dispersed";
                }
                hex.smokeID = token.id;
            }
            let terrain = TerrainInfo[name];
            if (terrain) {
                let centre = new Point(token.get("left"),token.get('top'));
                let centreLabel = centre.toCube().label();
                let hex = HexMap[centreLabel];
                AddTerrain2(name,terrain,hex);
            }
        })  
    }

    const AddTerrain2 = (type,terrain,hex) => {
        if (hex.terrain.includes(type)) {
            return;
        } 
        if (hex.terrain === "Open") {
            hex.terrain = type;
            hex.movementCost = terrain.movementCost;
            hex.fpModifiers = terrain.fpModifiers;
        } else {
            hex.terrain += ", " + type;
        }

        if (terrain.blocksLOS === true) {
            hex.blocksLOS = true;
        }
        if (terrain.beneficial === true) {
            hex.beneficial = true;
        }
        if (type.includes("Hill") === false) {
            let modifiers = ["Infantry","Gun","Mortar","Artillery","Air","SC","Flame"];
            _.each(modifiers,modifier => {
                if (hex.fpModifiers[modifier] === false || terrain.fpModifiers[modifier] === false) {
                    hex.fpModifiers[modifier] = false;
                } else {
                    hex.fpModifiers[modifier] = Math.min(hex.fpModifiers[modifier],terrain.fpModifiers[modifier]);
                }
            })
            if (hex.terrain.includes("Woods") && hex.terrain.includes("Foxholes")) {
                hex.fpModifiers.Mortar = -2;
                hex.fpModifiers.Artillery = -2;
            }
            let moveTypes = ["Infantry","Vehicle"];
            _.each(moveTypes,moveType => {
                if (terrain.movementCost[moveType] === false) {
                    hex.movementCost[moveType] = false;
                } else {
                    hex.movementCost[moveType] = Math.min(hex.movementCost[moveType],terrain.movementCost[moveType]);
                }
            })
            hex.height = hex.elevation + terrain.height;
            hex.hindrance = Math.max(hex.hindrance,terrain.hindrance);
        } else {
            hex.height += terrain.height;
            hex.elevation = terrain.elevation;
        }
    }
     
    const AddTokens = () => {
        //add tokens on token layer
        UnitArray = {};
        //create an array of all tokens
        let start = Date.now();
        let tokens = findObjs({
            _pageid: Campaign().get("playerpageid"),
            _type: "graphic",
            _subtype: "token",
            layer: "objects",
        });

        let c = tokens.length;
        let s = (1===c?'':'s');     
        
        tokens.forEach((token) => {
            let character = getObj("character", token.get("represents"));      
            let list = ["Foxholes","Smoke","Dispersed Smoke"];
            if (list.includes(character.get("name"))) {return};
            if (character === null || character === undefined) {return};


            let unit = new Unit(token.id);
            unit.name = token.get("name");










        });

        //add smoke or others




        let elapsed = Date.now()-start;
        log(`${c} token${s} checked in ${elapsed/1000} seconds - ` + Object.keys(UnitArray).length + " placed in Unit Array");



    }

    const DefineOffboard = (token) => {
        let centre = new Point(token.get("left"),token.get('top'));
        let halfW = token.get("width")/2;
        let halfH = token.get("height")/2;
        let minX = centre.x - halfW;
        let maxX = centre.x + halfW;
        let minY = centre.y - halfH;
        let maxY = centre.y + halfH;
        _.each(HexMap,hex => {
            if (hex.centre.x < minX || hex.centre.x > maxX || hex.centre.y < minY || hex.centre.y > maxY) {
                hex.terrain = "Offboard";
                hex.offboard = true;
            }
        })
    }




    const translatePoly = (poly) => {
        //translate points in a path2 polygon to map points
        let points = JSON.parse(poly.get("points"));
        let c = new Point(poly.get("x"),poly.get("y")); //actual point on map
        //find dimensions of path2 'box'
        let minX = Infinity;
        let minY = Infinity;
        let maxX = 0;
        let maxY = 0;
        _.each(points,point => {
            minX = Math.min(minX,point[0]);
            minY = Math.min(minY,point[1]);
            maxX = Math.max(maxX,point[0]);
            maxY = Math.max(maxY,point[1]);
        });
    //log(minX + " , " + minY)
    //log(maxX + " , " + maxY)
    
        let dx = Math.abs(maxX - minX)/2;
        let dy = Math.abs(maxY - minY)/2;
    //log("Deltas: " + dx + " , " + dy)
    
        let topLeft = new Point(c.x - dx, c.y - dy);
        let zero = new Point(topLeft.x + Math.abs(minX),topLeft.y + Math.abs(minY));
    //log("Top Left: " + topLeft)
    //log("Zero Point: " + zero) 

        let mapPoints = [];
        _.each(points,point => {
            let x = point[0] + zero.x;
            let y = point[1] + zero.y
            mapPoints.push(new Point(x,y));
        })
    
        return mapPoints;
    }
    
    const PolyHexes = (mapPoints) => {
        //which hexes are in the polygon
        let labels = [];
        _.each(HexMap,hex => {
            let check = pointInPolygon(hex.centre,mapPoints);
            if (check === true) {
                labels.push(hex.label);
            }
        })
        return labels;
    }


    const pointInPolygon = (point,vertices) => {
        //evaluate if point is in the polygon
        collision = false
        len = vertices.length - 1
        for (let c=0;c<len;c++) {
            vc = vertices[c];
            vn = vertices[c+1]
            if (((vc.y >= point.y && vn.y < point.y) || (vc.y < point.y && vn.y >= point.y)) && (point.x < (vn.x-vc.x)*(point.y-vc.y)/(vn.y-vc.y)+vc.x)) {
                collision = !collision
            }
        }
        return collision
    }


    const XHEX = (point) => {
        //makes a small group of points for checking around centre
        let points = [point];
        points.push(new Point(point.x - 20,point.y - 20));
        points.push(new Point(point.x + 20,point.y - 20));
        points.push(new Point(point.x + 20,point.y + 20));
        points.push(new Point(point.x - 20,point.y + 20));
        return points;
    }



    //game functions
    const ClearState = (msg) => {
        //clear arrays
        UnitArray = {};
        HexMap = {}; 
        activeUnitID = "";
        currentOPS = 0;
        currentPlayer = -1;
        RoutArray = [];
        MeleeArray = [];
        MeleeInfo = {};

        //clear token info
        let tokens = findObjs({
            _pageid: Campaign().get("playerpageid"),
            _type: "graphic",
            _subtype: "token",
            layer: "objects",
        })
       

        tokens.forEach((token) => {
            if (token.get("name").includes("Objective") === true) {return};
    

            token.set({
                name: "",
                tint_color: "transparent",
                aura1_color: "transparent",
                aura1_radius: 0,
                aura2_color: "transparent",
                aura2_radius: 0,
                showplayers_bar1: true,
                showname: true,
                showplayers_aura1: true,
                bar3_value: 0,
                bar3_max: "",
                bar2_value: 0,
                bar2_max: "",
                bar1_value: 0,
                bar1_max: "",
                gmnotes: "",
                statusmarkers: "",
                tooltip: "",
                rotation: 0,
            });                
        });
    
        state.BoB = {
            nations: ["",""],
            playerInfo: ["",""],
            turn: 0,
            phase: "Melee",
            command: [0,0], //command points available THIS turn
            CP: [0,0], //the # per turn
            OR: [0,0], //min
            ORM: [0,0], //max
            currentOP: [0,0],
            routEdges: ["",""],
            endTurn: 10,
            setupPlayer: -1,
            concealedUnitInfo: {},
            mountedUnitInfo: {},
        }
    






        CleanMap("All");
        BuildMap();
        sendChat("","Cleared State/Arrays");
    }

    const PlaceFoxholes = () => {
        let tokenArray = findObjs({_pageid: Campaign().get("playerpageid"),_type: "graphic",_subtype: "token",layer: "objects"});
        _.each(tokenArray,token => {
            if (token.get("name") === "Foxholes") {
                token.set("layer","map");
                toFront(token);
            }
        })
        BuildMap();
    }





    const CleanMap = (type) => {
        let mapTokenArray = findObjs({_pageid: Campaign().get("playerpageid"),_type: "graphic",_subtype: "token",layer: "map",});
        //remove dead
        _.each(mapTokenArray,token => {
            let id = token.get("id");
            if (token.get("status_dead") === true) {
                let unit = UnitArray[id];
                let hex = HexMap[unit.hexLabel];
                if (unit) {delete UnitArray[id]};
                token.remove();
                ArrangeTokens(hex);
            }
        });
        if (type) {
            if (type === "All") {
                list = ["Foxholes","Smoke","Dispersed Smoke","Map Marker","Artillery Marker"]; //names of tokens to remove
            } else {
                list = [type];
            }
            _.each(mapTokenArray,token => {
                let id = token.get("id");
                if (list.includes(token.get("name"))) {
                    token.remove();
                }
            });
        }






    }

    const Conceal = (msg) => {
        //start of game
        //during game is handled automatically
        if (!msg.selected) {
            sendChat("","Pick a Unit to Do this")
            return;
        } 
        let id = msg.selected[0]._id
        let selected = UnitArray[id];
        _.each(UnitArray,unit => {
            if (unit.nation === selected.nation) {
                let hex = HexMap[unit.hexLabel];
                if (hex.beneficial || InLOS(unit) === false) {
                    unit.GainConceal();
                }
            }
        })
    }

    const InLOS = (unit) => {
        //does someone have LOS to this unit
        let los = false;
        let keys = Object.keys(UnitArray);
        for (let i=0;i<keys.length;i++) {
            let unit2 = UnitArray[keys[i]];
            if (unit2.player !== unit.player && unit2.offboard === false && unit2.group !== "Aircraft" || unit2.group !== "Artillery") {
                let losResult = LOS(unit2,unit);
                if (losResult.los === true) {
                    los = true;
                    break;
                }
            }
        }
        return los;
    }

    const CheckConcealment = (moveUnit) => {
        let startTime = Date.now();
        let flag = false;
        if (moveUnit && moveUnit.status === "Concealed") {
            //on movement, has unit mved next to Infantry or Gun not in melee
            let hex = HexMap[moveUnit.hexLabel];
            let neighbourCubes = hex.cube.neighbours();
            let adjacent = false;
            let adjacentUnits = [];
            for (let i=0;i<6;i++) {
                let cube = neighbourCubes[i];
                let adjHex = HexMap[cube.label()];
                if (adjHex) {
                    let adjIDs = adjHex.tokenIDs;
                    _.each(adjIDs,id2 => {
                        let unit2 = UnitArray[id2];
                        if (unit2.player !== moveUnit.player && (unit2.group === "Infantry" || unit2.group === "Gun") && unit2.offboard === false) {
                            if (CCCheck(unit2) === false) {
                                adjacent = true;
                                adjacentUnits.push(unit2);
                            }
                        }
                    })
                }
            }
            if (adjacent === true) {
                moveUnit.LoseConceal();
                flag = true;
                _.each(adjacentUnits,adjacentUnit => {
                    if (adjacentUnit.status === "Concealed" && (moveUnit.group === "Infantry" || moveUnit.group === "Gun")) {
                        adjacentUnit.LoseConceal();
                    }
                })
            }
            if (moveUnit.group === "Vehicle") {
                flag = true;
                moveUnit.LoseConceal();
            }
        }
        //checks units that are concealed, if in open ground are they in LOS 
        let keys = Object.keys(UnitArray);
        for (let i=0;i<keys.length;i++) {
            let unit = UnitArray[keys[i]];
            let hex = HexMap[unit.hexLabel];
            if (unit.status === "Concealed" && (hex.beneficial === false || unit.group === "Vehicle") && unit.offboard === false) {
                let los = InLOS(unit);
                if (los === true) {
                    flag = true;
                    unit.LoseConceal();
                }
            }   
        }
        let elapsed = Date.now()-startTime;
        log("Check Concealment Done in " + elapsed/1000 + " seconds");
        return flag;
    }







    const RollD6 = (msg) => {
        let Tag = msg.content.split(";");
        PlaySound("Dice");
        let roll = randomInteger(6);
        if (Tag.length === 1) {
            let playerID = msg.playerid;
            let nation = "Neutral";
            if (msg.selected) {
                let id = msg.selected[0]._id;
                if (id) {
                    let tok = findObjs({_type:"graphic", id: id})[0];
                    let char = getObj("character", tok.get("represents")); 
                    nation = Attribute(char,"nation");
                    if (!state.BoB.players[playerID] || state.BoB.players[playerID] === undefined) {
                        state.BoB.players[playerID] = nation;
                    }
                }
            } else if (!state.BoB.players[playerID] || state.BoB.players[playerID] === undefined) {
                sendChat("","Click on one of your Units then select Roll again");
                return;
            } else {
                nation = state.BoB.players[playerID];
            }
            let res = "/direct " + DisplayDice(roll,Nations[nation].dice,40);
            sendChat("player|" + playerID,res);
        } else {
            let type = Tag[1];
            //type being used for times where fed back by another function
        }
    }

    const AddUnits = (msg) => {
        if (!msg.selected) {return};
        let tokenIDs = [];
        for (let i=0;i<msg.selected.length;i++) {
            tokenIDs.push(msg.selected[i]._id);
        }
        _.each(tokenIDs,id => {
            let unit = new Unit(id);
        
            if (unit) {
                let name = unit.charName;
                name = name.replace("Soviet ","");
                name = name.replace("German ","");
                name = name.replace("US ","");
                name = name.split("//")[0];
                name = name.trim();
                if (NameArray[name]) {
                    NameArray[name]++;
                    name += " " + NameArray[name];
                } else {
                    NameArray[name] = 1;
                    name += " 1";
                }


                unit.name = name;
                //set morale and casualty to max
                let move = unit.movement;
                let b1 = "-",b3 = "-";
                if (unit.group === "Infantry" || unit.group === "Gun") {
                    b1 = parseInt(unit.moraleFull[0]) || "-";
                    if (unit.weapons.Main) {
                        b3 = unit.weapons.Main.normalFP + "/" + unit.weapons.Main.profFP;
                    }
                }
                if (unit.group === "Vehicle" || unit.group === "Aircraft" || unit.group === "Artillery")  {
                    b1 = unit.proficiency || "Unk";
                    b3 = unit.weapons.Main.at + "/" + unit.weapons.Main.he || "Unk";
                }

                let ar = 0.05;
                if (unit.token.get("width") > 70) {
                    ar = -.05;
                }

                let flipH = false;
                if (state.BoB.routEdges[unit.player] === "Right") {
                    flipH = true;
                }
                if (name.includes("Decoy") || name.includes("Conceal"))  {
                    flipH = false;
                }


                unit.token.set({
                    bar1_value: b1,
                    bar1_max: "",
                    bar2_value: move,
                    bar2_max: "",
                    bar3_value: b3,
                    bar3_max: "",
                    aura1_color: "#00FF00",
                    aura1_radius: ar,
                    tint_color: "transparent",
                    name: name,
                    statusmarkers: "",
                    gmnotes: "",
                    fliph: flipH,
                    rotation: 0,
                })

                if (unit.weapons.SATW) {
                    unit.token.set(SM.faust,true);
                }

            } else {
                sendChat("","Unit not added, likely need to Clear State");
            }

            



        })        


        sendChat("","Units Added")











    }




    const TokenInfo = (msg) => {
        if (!msg.selected) {
            sendChat("","No Token Selected");
            return;
        };
        let playerID = msg.playerid;

        let id = msg.selected[0]._id;
        let unit = UnitArray[id];
        let token = unit.token;
        if (!unit) {
            sendChat("","Not in Array Yet");
            return
        }
        let hex = HexMap[unit.hexLabel];
        let nation = unit.nation;
        if (!nation) {nation = "Neutral"};
        let owningPlayerID = state.BoB.playerInfo[unit.player] || "Nil";

        let extra = [];
        let two = "";
        if (unit.status === "Concealed" && owningPlayerID === playerID) {
            let info = state.BoB.concealedUnitInfo[id];
            extra.push("Concealed Unit");
            extra.push("Is " + info.name);
            extra.push("Status: " + info.status);
        }
        SetupCard(token.get("name"),"",unit.nation);
        _.each(extra,ex => {
            outputCard.body.push(ex);
        })
        outputCard.body.push("Movement: " + unit.movement);
        outputCard.body.push("MP Used: " + unit.moveCost);
        outputCard.body.push("[hr]");
        outputCard.body.push("Terrain: " + hex.terrain);
        ButtonInfo("Terrain Info","!HexData;" + unit.id + ";" + playerID);
        PrintCard(playerID);
        
    }

    const CheckLOS = (msg) => {
        let Tag = msg.content.split(";");
        let unit1 = UnitArray[Tag[1]];
        let unit2 = UnitArray[Tag[2]];
        if (unit1.type === "Artillery") {
            unit2 = unit1;
        }
        if (!unit1 || !unit2) {
            sendChat("","Invalid Units")
            return;
        }

        let losResult = LOS(unit1,unit2);
        let validResult = ValidTarget(unit1,unit2,"Main","Normal");
        FireInfo = {
            shooterUnit: unit1,
            targetUnit: unit2,
            losResult: losResult,
            validResult: validResult,
            fireMods: {},
            profMods: {},
        }


        SetupCard(unit1.name,"LOS",unit1.nation);
        if (unit1.type !== "Artillery") {
            let dist = losResult.distance;
            dist = dist + " Hexes (" + dist*40 + " yards)";
            outputCard.body.push("Distance: " + dist);
        } 

        if (losResult.los === true && validResult.validTarget === true) {
            outputCard.body.push("There is LOS to the Target");
            if (losResult.directedFire === true) {
                outputCard.body.push("Directed Fire by Forward Observer");
            }
            outputCard.body.push("The Target is a Valid Target")
            if (unit1.group === "Infantry" || unit1.group === "Gun") {
                let morale = parseInt(unit1.token.get("bar1_value"));
                if (morale < 10) {
                    outputCard.body.push("Morale Check Needed vs. Morale of " + morale);
                }
                if (unit1.weapons.satw) {
                    morale = SATWMoraleMods().mod + morale;
                    outputCard.body.push("For SATW vs Morale of " + morale);
                }
            } 
            if (unit1.group === "Gun" || unit1.group === "Vehicle") {
                profMods = ProfMods();
                if (profMods.profCheckFlag === true) {
                    outputCard.body.push(profMods.profTips + " A Proficiency Check is needed vs. " + profMods.prof)
                }





            }
            if (unit1.type === "Artillery") {
                outputCard.body.push("A Proficiency Check is needed, " + unit1.proficiency + " or less" );
                let profMod = 0;
                if (unit1.nation === "Soviet Union" || unit1.nation === "Japanese") {
                    profMod = 5
                } else if (unit1.nation === "USA") {
                    profMod = 2;
                } else if (unit1.nation === "Germany" || unit1.nation === "Italy" || unit1.nation === "UK") {
                    profMod = 3;
                }
                let needed = unit1.proficiency - profMod;
                outputCard.body.push("For OP Fire, " + needed + " or less");
                if (unit1.type === "Artillery") {
                    outputCard.body.push("The Accuracy # is " + unit1.accuracy);
                }
            }
  




            outputCard.body.push("[hr]")
            let types = ["Normal","Assault","OP","FinalOP"];

            if (unit1.group === "Infantry" && (unit2.group === "Infantry" || unit2.group === "Gun")) {
                outputCard.body.push("Weapon is " + validResult.weapon.name);
                for (let i=0;i<types.length;i++) {
                    validResult.fireType = types[i];
                    let fireMods = FireMods();
                    outputCard.body.push(fireMods.fpTips + " " + types[i] + " Fire: " + fireMods.fp + " FP")
                }
            }
            if (unit1.group === "Vehicle") {
                let facing = Facing("Shooter");
                outputCard.body.push("Target is in the " + facing + " Facing");
            }
            if (unit2.group === "Vehicle") {
                let facing = Facing("Target");
                outputCard.body.push("Striking " + facing + " Armour");
            }
            if (unit1.group === "Vehicle" && (unit2.group === "Infantry" || unit2.group === "Gun")) {
                outputCard.body.push("Weapon is " + validResult.weapon.name);
                for (let i=0;i<types.length;i++) {
                    validResult.fireType = types[i];
                    let fireMods = FireMods();
                    let profMods = ProfMods();
                    FireInfo.fireMods = fireMods;
                    FireInfo.profMods = profMods;
                    if (profMods.profCheckFlag === true) {
                        outputCard.body.push(profMods.profTips + " Proficiency Test vs. " + profMods.prof);
                    }
                    outputCard.body.push(fireMods.fpTips + " " + types[i] + " HE Fire: " + fireMods.fp + " FP")
                }
            }
            if (unit1.group === "Vehicle" && unit2.group === "Vehicle") {
                outputCard.body.push("Weapon is " + validResult.weapon.name);
                for (let i=0;i<types.length;i++) {
                    validResult.fireType = types[i];
                    let fireMods = FireMods();
                    let profMods = ProfMods();
                    FireInfo.fireMods = fireMods;
                    FireInfo.profMods = profMods;
                    if (profMods.profCheckFlag === true) {
                        outputCard.body.push(profMods.profTips + " Proficiency Test vs. " + profMods.prof);
                    }
                    outputCard.body.push(firemods.fpTips + " " + types[i] + " Net AT Roll vs " + fireMods.fp);
                }
            }
            if (unit1.type === "Artillery") {
                outputCard.body.push("Weapon is " + validResult.weapon.name);
                outputCard.body.push("Firepower vs. Infantry/Guns: " + validResult.weapon.he);
                outputCard.body.push("Firepower vs. Vehicles: " + validResult.weapon.at);
                outputCard.body.push("(Firepower is modified by Terrain)");
            }
        } else if (losResult.los === false) {
            outputCard.body.push("No LOS To Target");
            _.each(losResult.losReasons,reason => {
                outputCard.body.push(reason);
            })
        } else if (validResult.validTarget === false) {
            outputCard.body.push("Shooter has LOS to Target");
            outputCard.body.push("However, it is not a Valid Target");
            _.each(validResult.validReasons,reason => {
                outputCard.body.push(reason);
            })
        }
        PrintCard();
    }


    const LOS = (unit1,unit2) => {
        //does unit1 have Direct LOS to unit2, or if indirect === true, then that
        //Valid target and firepower calcs in other routines
        //smoke and hinderance done here due to LOS routine
        let hex1 = HexMap[unit1.hexLabel];
        let hex2 = HexMap[unit2.hexLabel];
        let losResult;

        if (unit1.weapons.Main.notes.includes("Mortar")) {
            //1st check normal fire
            losResult = LOS2(hex1,hex2);
            let origDistance = losResult.distance;
            if (losResult.los === false) {
                //directed fire - check neighbouring hexes, cant be impassable or enemy occupied
                let neighbourCubes = hex1.cube.neighbours();
                ncloop1:
                for (let i=0;i<neighbourCubes.length;i++) {
                    let hex = HexMap[neighbourCubes[i].label()];
                    if (hex.offboard === true) {continue};
                    if (hex.movementCost.Infantry === false) {continue};
                    if (hex.tokenIDs.length > 0) {
                        for (let t=0;t<hex.tokenIDs.length;t++) {
                            let u2 = UnitArray[hex.tokenIDs[t]];
                            if (u2) {
                                if (u2.player !== unit1.player) {
                                    continue ncloop1;
                                }
                            }
                        }
                    }
                    losResult = LOS2(hex,hex2,"Directed");
                    if (losResult.los === true) {
                        break;
                    }
                }
            }
            losResult.distance = origDistance;
            if (losResult.los === false) {
                losResult.losReasons.push("Neither Mortar nor the FO has LOS");
            }
        } else if (unit1.group === "Artillery") {
            //check LOS for a spotter
            let keys = Object.keys(UnitArray);
            for (let i=0;i<keys.length;i++) {
                let spotter = UnitArray[keys[i]];
                if (spotter.player !== unit1.player || spotter.group === "Vehicle" || spotter.group === "Artillery" || spotter.group === "Aircraft" || spotter.offboard === true) {
                    continue;
                }
                if (spotter.token.get(SM.red) === true) {continue};
                if (CCCheck(spotter) === true) {continue};
                let hex = HexMap[spotter.hexLabel];
                losResult = LOS2(hex,hex2);
                if (losResult.los === true) {
                    break;
                }
            }
            if (losResult.los === false) {
                losResult.losReasons.push("No Friendly Unit available to act as a Spotter");
            }
        } else {
            losResult = LOS2(hex1,hex2);
        }
        return losResult;
    }

    const LOS2 = (hex1,hex2,note) => {
        let directedFire = false;

        if (note === "Directed") {
            directedFire = true;
        }


        let elevation1 = hex1.elevation;
        let elevation2 = hex2.elevation;
    
        let los = true;
        let losReasons = [];
        let delta = elevation1 - elevation2;
    
        let distance = hex1.cube.distance(hex2.cube);
    
        let startHex = hex1;
        let endHex = hex2;
        if (delta < 0) {
            startHex = hex2;
            endHex = hex1;
        } 
        let interCubes = startHex.cube.linedraw(endHex.cube);
        let absDelta = Math.abs(delta);
    
        let hinderance = 0;
        let smoke = false;
        let dispersed = false;
        if (startHex.smoke === true || endHex.smoke === true) {
            smoke = true;
        }
        if (startHex.smoke === "Dispersed" || endHex.smoke === "Dispersed") {
            dispersed = true;
        }
    
        //will always be going from start to end
        //so if hex2 higher than hex 1 is target -> shooter in essence
        let blind = 0;
        for (let i=1;i<interCubes.length;i++) {
            blind = Math.max(blind - 1, 0);
            let interHex = HexMap[interCubes[i].label()];
            if (interHex.smoke === true) {
                smoke = true;
            }
            if (interHex.smoke === "Dispersed") {
                dispersed = true;
            }
            if (interHex.height > startHex.elevation) {
                los = false;
                losReasons.push("Intervening Terrain");
                break;
            }
            if (absDelta > 0 && interHex.height === startHex.elevation) {
                los = false;
                losReasons.push("Terrain blocks LOS to unit at lower elevations");
                break;
            }
            if (startHex.elevation > interHex.height && interHex.height > endHex.elevation) {
                //blind spots - blind will be a counter for those hexes in blind spots
                blind = i - (startHex.elevation - interHex.height);
            }
            if (interHex.hinderance > 0 && absDelta === 0) {
                if (unit2.group !== "Vehicle" || interHex.terrain.includes("Orchard")) {
                    //wheat fields dont provide hinderance to Vehicles
                    hinderance += interHex.hinderance;
                }
            }
        }
    
        if (blind > 0) {
            los = false;
            losReasons.push("Blind Spot from Higher Terrain");
        }
    
        if (smoke === false && dispersed === true) {
            smoke = "Dispersed";
        }
    
    
        let losResult = {
            los: los,
            losReasons: losReasons,
            distance: distance,
            delta: delta,
            smoke: smoke,
            hinderance: hinderance,
            directedFire: directedFire,
        }
    
        return losResult;
    }

    const HexData = (msg) => {
        let Tag = msg.content.split(";");
        let id = Tag[1];
        let playerID = Tag[2];
        let unit = UnitArray[id];
        let hex = HexMap[unit.hexLabel];
        let mapLabel = TranslateHexLabels(hex.label);
        SetupCard(mapLabel,"",unit.nation);
        outputCard.body.push("Terrain: " + hex.terrain.toString());
        outputCard.body.push("Height of Terrain in Hex: " + hex.height);
        outputCard.body.push("Elevation of Hex: " + hex.elevation);
        outputCard.body.push("Beneficial Terrain: " + hex.beneficial);
        outputCard.body.push("Smoke in Hex: " + hex.smoke);
        outputCard.body.push("[U]FP Modifiers[/u]");
        outputCard.body.push("Vs Infantry: " + hex.fpModifiers.Infantry);
        outputCard.body.push("Vs Guns: " + hex.fpModifiers.Gun);
        outputCard.body.push("Vs Mortar: " + hex.fpModifiers.Mortar);
        outputCard.body.push("Vs Artillery: " + hex.fpModifiers.Artillery);
        outputCard.body.push("Vs Air: " + hex.fpModifiers.Air);
        outputCard.body.push("Vs Flames: " + hex.fpModifiers.Flame);
        outputCard.body.push("[U]Movement Costs[/u]");
        outputCard.body.push("Infantry: " + hex.movementCost.Infantry);
        outputCard.body.push("Vehicle: " + hex.movementCost.Vehicle);
        PrintCard(playerID);
    }










    const ValidTarget = (unit1,unit2,weaponType,fireType) => {
        //is unit2 a valid target, and which weapon is being used and type of Fire
        let weapon;
        if (weaponType === "Main") {
            weapon = unit1.weapons.Main;
            if (unit1.status === "Reduced" && unit1.weapons.Reduced) {
                weapon = unit1.weapons.Reduced;
            }
        }
        if (weaponType === "SATW") {
            weapon = unit1.weapons.SATW;
        }
        if (weaponType === "Flame") {
            weapon = unit1.weapons.Flame;
        }
        if (weaponType === "MGs") {
            weapon = unit1.weapons.MGs;
        }
log(weapon)

        if (!fireType) {
            fireType = "Normal";
            if (unit1.type !== "Aircraft") {
                if (unit1.token.get(SM.moved) === true) {
                    unit1.token.set(SM.op,false);
                    fireType = "Assault";
                }
                if (activeUnitID !== unit1.id) {
                    fireType = "OP";
                    if (unit1.token.get("aura1_color") === "#000000") {
                        fireType = "FinalOP";
                    }
                }
            }
        }

        let distance = unit1.cube.distance(unit2.cube);

        let validTarget = true;
        let validReasons = [];
    
        if (distance < weapon.minRange && unit1.type !== "Aircraft" && unit1.type !== "Artillery") {
            validTarget = false;
            validReasons.push("Target is Too Close");
        }
        if (distance > weapon.longRange) {
            validTarget = false;
            validReasons.push("Target is Too Far");
        }
        if (fireType === "FinalOP") {
            if (unit1.token.get(SM.cp) === false && distance > 1) {
                validTarget = false;
                validReasons.push("Final OP Fire > 1 hex");
            } else if (unit1.token.get(SM.cp) === true && distance > weapon.normalRange) {
                validTarget = false;
                validReasons.push("Final OP Fire with CP > Normal Range");
            } else if (weapon.type === "SATW") {
                validTarget = false;
                validReasons.push("Unable to Fire SATW for FinalOP Fire");
            }
        }
        if (weaponType === "SATW" && unit2.group !== "Vehicle") {
            validTarget = false;
            validReasons.push("Target is not a Vehicle");
        }    
        if (CCCheck(unit1) === true && unit1.group !== "Artillery" && unit1.group !== "Aircraft") {
            validTarget = false;
            validReasons.push("Can't fire while in Melee");
        }
    
        if (CCCheck(unit2) === true && unit1.group !== "Artillery" && unit1.group !== "Aircraft") {
            validTarget = false;
            validReasons.push("Can't fire into a Melee");
        }
    
        if (weapon.notes.includes("Mortar")) {
            let hex1 = HexMap[unit1.hexLabel];
            let list = ["Building","Pillbox","Swamp"];
            for (let i=0;i<list.length;i++) {
                if (hex1.terrain.includes(list[i])) {
                    validTarget = false;
                    validReasons.push("Can't fire from within a " + list[i]);
                    break;
                }
            }
        }

        if (unit1.name.includes("JU-87G") && unit2.group !== "Vehicle") {
            validTarget = false;
            validReasons.push("JU-87G Can only attack Vehicles");
        }



        if (unit1.group === "Vehicle") {
            let facing = Facing("Shooter",unit1,unit2);
            if (facing !== "Front") {
                validTarget = false;
                validReasons.push("Not in Front Arc");
            }
        }


        let validResult = {
            weapon: weapon,
            fireType: fireType,
            validTarget: validTarget,
            validReasons: validReasons,
        }
        return validResult;
    }











    const CCCheck = (unit) => {
        let hex = HexMap[unit.hexLabel];
        let result = false;
        if (unit.type === "Artillery" || unit.type === "Aircraft") {
            return result;
        }
        let possibles = hex.tokenIDs;
        _.each(possibles,possible => {
            let u2 = UnitArray[possible];
            if (u2) {
                if (u2.nation !== unit.nation && u2.type !== "Aircraft" && u2.type !== "Artillery") {
                    result = true;
                }
            } else {
                possibles.splice(possibles.indexOf(possible),1);
            }
        })
        return result;
    }


    const MoraleCheck = (unit,mod,reason) => {
        let result = true;
        let morale = parseInt(unit.token.get("bar1_value"));
        let roll = randomInteger(10);
        let target = morale + mod;
        if (roll > target) {
            result = false;
        }
        let ddRoll = DisplayDice(roll,unit.dice,36);
        if (unit.type === "Vehicle" || unit.type === "Artillery" || unit.type === "Aircraft") {
            result = true;
            target = 11;
            morale = 11;
        }
        let info = {
            mod: mod,
            reason: reason,
            result: result,
            roll: roll,
            ddRoll: ddRoll,
            target: target,
        }
        return info;
    }


    const OPSCheck = (unit) => {
        if (unit.group === "Infantry" || unit.status === "Concealed" || unit.mounted === true) {
            state.BoB.currentOP[unit.player]++;
        } else {
            state.BoB.currentOP[unit.player] += 3;
        }
        let otherOPS = 0;
        let ownOPS = 0;
        let p2 = unit.player === 0 ? 1:0;
        _.each(UnitArray,uni => {
            if (uni.offboard === false || unit.tyoe === "Artillery" && unit.type === "Aircraft") {
                if (uni.token.get("aura1_color") === "#00FF00") {
                    if (uni.player !== unit.player) {
                        otherOPS++;
                    } else {
                        ownOPS++;
                    }
                }
            }
        })
        outputCard.body.push("[hr]");
        outputCard.body.push("Operations Used: " + state.BoB.currentOP[unit.player]);
        if (state.BoB.currentOP[unit.player] >= state.BoB.ORM[unit.player] && otherOPS > 0) {
            outputCard.body.push("Maximum Operations Hit");
            outputCard.body.push("Pass to Other Player");
        } else if (state.BoB.currentOP[unit.player] >= state.BoB.OR[unit.player] && otherOPS > 0 && ownOPS > 0) {
            outputCard.body.push("Minimum Operations Met, can Pass to Other Player if Desired");
            outputCard.body.push("Maximum Operations is " + state.BoB.ORM[unit.player]);
        } else if (otherOPS === 0 && ownOPS > 0) {
            state.BoB.currentOP[unit.player] = 0;
            outputCard.body.push("Other Player has no further unactivated units, you can continue");
        } else if (otherOPS === 0 && ownOPS === 0) {
            outputCard.body.push("No further activations for either player after this one. Click Next Phase when done this activation");
        } else if (ownOPS === 0 && otherOPS > 0) {
            outputCard.body.push("Pass to other Player when done this Activation");
        }

    }

    const Activate = (msg) => {
        if (!msg.selected) {return};
        let id = msg.selected[0]._id;
        let unit = UnitArray[id];
        if (!unit) {return};
        let Tag = msg.content.split(";");
        let order = Tag[1];
        let hex = HexMap[unit.hexLabel];
        CleanMap("Map Marker");
        SetupCard(unit.name,order,unit.nation);
        let errorMsg = [];
        if (order === "Mount or Dismount") {
            if (unit.mounted === true) {
                order = "Dismount";
            } else {
                order = "Mount";
            }
        }

        if (order === "Mount" && hex.movementCost.Vehicle === false) {
            errorMsg.push("Unable to Mount in " + hex.terrain);
            if (CCCheck(unit) === true) {
                errorMsg.push("Unit is in a hex with an enemy unit and cannot Mount")
            }
        }
        if (order === "Dismount") {
            let info = state.BoB.mountedUnitInfo[unit.id];
            let remainingMove = parseInt(unit.token.get("bar2_value"));
            let carrierMove = unit.movement;
            if (remainingMove < Math.floor(carrierMove/2) && info.group === "Infantry") {
                errorMsg.push("Unable to Dismount as Transport Moved > 1/2");
            } else if (info.group === "Gun" && carrierMove < unit.movement) {
                errorMsg.push("Unable to Dismount as Carrier Moved");
            }
            if (CCCheck(unit) === true) {
                errorMsg.push("Unit is in a hex with an enemy unit and cannot Dismount")
            }
            if (errorMsg.length === 0 && id === activeUnitID) {
                //skip below
                Move(id,order,false);
            }
        }
        if (unit.token.get("aura1_color") === "#000000") {
            errorMsg.push("Unit has already been Activated");
        }
        let maxOPS = state.BoB.ORM[unit.player];
        let currentOPS = state.BoB.currentOP[unit.player];
        let cost = (unit.group === "Infantry" || unit.status === "Concealed") ? 1:3;

        let projectedOPS = currentOPS + cost;
        if (projectedOPS >= maxOPS) {
            errorMsg.push("Will Exceed # of Operations this Impulse");
            errorMsg.push("Pass to other Player");
        }
        if (errorMsg.length > 0) {
            _.each(errorMsg,m => {
                outputCard.body.push(m);
            })
            PrintCard();
            return;
        }

        let lastUnit = UnitArray[activeUnitID];
        if (lastUnit) {
            CheckLastUnit(lastUnit); //conceal unit if eligible and check for vehicles that go OP
            lastUnit.startHexLabel = lastUnit.hexLabel;
            lastUnit.startRotation = Angle(lastUnit.token.get('rotation'));
        }
        if (lastUnit && lastUnit.player !== unit.player) {
            //changing player with impulse, set OPs to 0
            state.BoB.currentOP[unit.player] === 0;
        }
        activeUnitID = id;
        unit.token.set("aura1_color","#000000");
        if (order === "Move" || order === "Retreat" || order === "Mount" || order === "Dismount") {
            unit.token.set(SM.moved,false);
            unit.token.set(SM.rotate,false);
            Move(id,order,false);
        } else if (order === "Fire") {
            outputCard.body.push("Select Target and Weapon");
        } else if (order === "Go on Overwatch") {
            unit.token.set(SM.op,true);
            unit.token.set("aura1_color","#000000");
            outputCard.body.push("Unit goes on Overwatch");
            outputCard.body.push("It will need to take a MC when it Fires");
        }
        OPSCheck(unit);
        PrintCard();
    }

    const CheckLastUnit = (unit) => {
        if (unit.group === "Vehicle" && unit.transportCapacity === 0) {
            if (unit.token.get(SM.moved) === false && unit.token.get(SM.fired) === false) {
                unit.token.set(SM.op,true);
            }
        }
        if (unit.group !== "Infantry" || unit.group !== "Gun" || unit.status === "Concealed") {return};
        if (unit.token.get(SM.op) === true || (unit.token.get(SM.fired) === false && unit.token.get(SM.rout) === false)) {
            if (InLOS(unit) === false) {
                unit.GainConceal();
            }
        }
    }






    const Move = (id,type,reentry) => {
        let unit = UnitArray[id];
        if (reentry === true) {
            outputCard.body.push("Command Point Used");
            outputCard.body.push("Remaining CP: " + state.BoB.command[unit.player]);
        }
        let moraleCheck = {result: true};
        if (unit.group === "Infantry" || unit.group === "Gun" || type === "Dismount") {
            let cc = CCCheck(unit);
            let mod = 0;
            let tip = "";
            if (cc === true) {
                outputCard.subtitle = "Withdrawal from Melee";
                mod = -3;
                tip = "<br>Withdrawal -3 to Morale";
            }
            if (type === "Retreat" && cc === false) {
                outputCard.subtitle = "Declared Retreat";
                mod = 4;
                tip = "<br>Declared Retreat +4 to Morale";
            }


            moraleCheck = MoraleCheck(unit,mod);
            if (tip !== "") {
                tip = '[🎲](#" class="showtip" title="' + tip + ')';
            }

            if (unit.morale < 10 || moraleCheck.target < 10) {
                outputCard.body.push(tip + " Morale Check: " + moraleCheck.ddRoll + " vs " + moraleCheck.target);
            }
        }


        if (moraleCheck.result === false) {
            let again = (reentry === true) ? " again ":" ";
            if (type === "Dismount") {
                outputCard.body.push("Unit fails its Morale Check" + again +  "but still Dismounts")
                outputCard.body.push("It's Activation is Over");
            } else {
                outputCard.body.push("Unit fails its Morale Check" + again +  "and must stay where it is.")
                outputCard.body.push("It's Activation is Over");
            }
            unit.token.set(SM.end,true);
            if (reentry === false && state.BoB.command[unit.player] > 0) {
                ButtonInfo("Reroll Morale Check","!RerollMorale;Move;" + unit.id + ";" + type);
            }
        } else {
            if (reentry === true) {
                outputCard.body.push("Unit passes its Morale Check this time");
                unit.token.set(SM.end,false);
            }
            if (type === "Dismount") {
                outputCard.body.push("The Unit Dismounts");
                if (unit.group === "Gun") {
                    outputCard.body.push("It may turn in the hex to face any direction for free");
                }
                uncloaked.push(unit.id);
                unit.Dismount();
            }
            if (type === "Mount") {
                outputCard.body.push("The Unit Mounts, it may turn in the hex to face any direction for free");
                uncloaked.push(unit.id);
                unit.Mount();
            }
            outputCard.body.push("Unit has " + unit.token.get("bar2_value") + " MPs");
            if (unit.group === "Infantry" && state.BoB.command[unit.player] > 0) {
                outputCard.body.push("A Command Point can be spent to increase that by 1");
            }
            if (type === "Retreat") {
                unit.token.set(SM.rout,true);
                outputCard.body.push("The Unit may not Assault Fire");
                outputCard.body.push("Move Unit according to Rout Rules");
            } else {
                unit.token.set(SM.moved,true);
                if (unit.type === "Weapons Team" && type !== "Mount") {
                    outputCard.body.push("The Unit may not Assault Fire");
                } else if (unit.weapons.Main.group !== "Mortar" && unit.group === "Infantry" && unit.nation === "Germany") {
                    outputCard.body.push("The Unit may also Assault Fire when done its movement");
                }
            }
        }
        //goes back to activate routine for OPSCheck and PrintCard
    }

    const FireMods = () => {
        let unit1 = FireInfo.shooterUnit;
        let unit2 = FireInfo.targetUnit;
        let validResult = FireInfo.validResult;
        let losResult = FireInfo.losResult;

        let weapon = validResult.weapon;
        let fireType = validResult.fireType;
        let delta = losResult.delta;
        let distance = losResult.distance;
        let smoke = losResult.smoke;
        let hinderance = losResult.hinderance;
        
        let targetFacing = Facing("Target");

        let targetHex = HexMap[unit2.hexLabel];
        let specials = ["Mortar","Flame","SC","Artillery"];
        let special = "Nil";
        if (specials.includes(weapon.type)) {
            special = weapon.type;
        }
        let fpTerrain = 0;
        let fpTerrainTips = "";
        let fpSituation = 0;
        let fpSituationTips = "";
        let sign;
        let baseFP,baseFPTips;
        let mountedUnit = false;

        if (unit2.group === "Vehicle" && unit1.group === "Infantry" && (weapon.type === "Main" || weapon.type === "Reduced") && unit2.mounted === true) {
            mountedUnit = true;
        }


        if ((unit1.group === "Gun" || unit1.group === "Vehicle") && (unit2.group === "Infantry" || unit2.group === "Gun")) {
            baseFP = weapon.he;
            baseFPTips = "Base HE FP: " + baseFP;

            if (unit1.special.includes("Small Calibre") && distance > 12) {
                baseFP = Math.floor(baseFP/2);
                baseFPTips += "<br>Small Calibre Gun/MGs at Range: 1/2 FP";
            }
        }

        if (unit1.type === "Artillery" || unit1.type === "Aircraft") {
            if (unit2.group === "Infantry" || unit2.group === "Gun") {
                baseFP = weapon.he;
                baseFPTips = "Base HE FP: " + baseFP;
            } else {
                baseFP = weapon.at;
                baseFPTips = "Base AT FP: " + weapon.at;
            }
            if (unit2.openTopped === true) {
                baseFP++;
                baseFPTips += "<br>Open Topped: +1 FP";
            } 
            if (unit2.type === "Unarmoured Vehicle") {
                baseFP++;
                baseFPTips += "<br>Unarmoured: +1 FP";
            }
            if (unit2.armourF > 3 && unit2.armourSR > 3) {
                baseFP--;
                baseFPTips += "<br>Heavy Armour: -1 FP";
            }
        }

        if (unit1.group === "Infantry" && (unit2.group !== "Vehicle" || (unit2.group === "Vehicle" && mountedUnit === true)) && weapon.type !== "Flame") {
            baseFP = weapon.normalFP;
            baseFPTips = "Base Normal FP: " + baseFP;

            if (fireType !== "Normal" ) {
                baseFP = weapon.profFP;
                baseFPTips = "Base Prof FP: " + baseFP;
                if (unit1.token.get(SM.prof) === true) {
                    baseFP++;
                    baseFPTips += "<brOP: CP +1 FP";
                }
                if (distance === 1) {
                    baseFP++;
                    baseFPTips += "<br>OP: Distance +1 FP";
                }
                if (unit1.token.get(SM.op) === true) {
                    baseFP++;
                    baseFPTips += "<br>OP: On Overwatch +1 FP";
                }
                if (baseFP > weapon.normalFP) {
                    baseFP = weapon.normalFP;
                    baseFPTips += "<br>(Maxed at Normal FP)";
                }
            }

            if (losResult.directedFire === true) {
                baseFP --;
                baseFPTips += "<br>Directed Fire -1 FP";
            }

            if (unit1.special.includes("Squad SATW")) {
                if (unit2.status !== "Concealed" && (unit2.type === "Gun" || unit2.type === "Weapons Team" || targetHex.terrain.includes("Pillbox"))) {
                    if (distance <= unit1.weapons.satw.normalRange) {
                        baseFP++;
                        baseFPTips += "<br>SATW " + unit1.weapons.satw.name + ": +1 FP";
                    }
                }
            }



            if (distance > weapon.normalRange) {
                baseFP = Math.min(baseFP/2);
                baseFPTips += "<br>Range: 1/2 Base FP rounded down";
            }

        }


        if (weapon.type === "Flame") {
            if (unit2.group === "Vehicle") {
                baseFP = weapon.at;
            } else {
                baseFP = weapon.he;
            }
            baseFPTips = "Base Flame FP: " + baseFP;
            if (distance === 2) {
                baseFP = Math.max(baseFP/2); //rounded up
                baseFPTips += "<br>Range: 1/2 Base FP,rounded up";
            }
        }



        if ((unit1.group === "Vehicle" || weapon.type === "SATW") && weapon.type !== "Flame" && unit2.group === "Vehicle") {
            baseFP = weapon.at;
            baseFPTips = "<br>Base AT FP: " + weapon.at;
            if (distance === 1) {
                baseFP++;
                baseFPTips += "<br>Adjacent +1 FP";
            }
            if (targetFacing === "Rear") {
                baseFP++;
                baseFPTips += "<br>Rear Armour +1 FP";
            }
            if (distance > 20) {
                baseFP--;
                baseFPTips += "<br>Range > 20 -1 FP";
            }
            if (distance > 30) {
                baseFP--;
                baseFPTips += "<br>Range > 30 -1 FP";
            }
        }


        //Terrain Modifiers
        if (unit1.group === "Infantry" && special === "Nil") {
            fpTerrain = targetHex.fpModifiers.Infantry;
        }
        if ((unit1.group === "Gun" || unit1.group === "Vehicle") && (unit2.group === "Infantry" || unit2.group === "Gun")) {
            fpTerrain = targetHex.fpModifiers.Gun;
        }
        if (special === "Mortar") {
            fpTerrain = targetHex.fpModifiers.Mortar;
        }
        if (special === "SC") {
            fpTerrain = targetHex.fpModifiers.SC;
        }
        if (unit1.type === "Artillery") {
            fpTerrain = targetHex.fpModifiers.Artillery;
        }
        if (unit1.type === "Aircraft") {
            fpTerrain = targetHex.fpModifiers.Air;
        }
    
        if (fpTerrain !== 0) {
            sign = (fpTerrain > 0) ? "+":"";
            fpTerrainTips += "<br>Terrain: " + sign + fpTerrain + " FP";
        }
        if (mountedUnit === true) {
            if (distance > 2 || (distance === 2 && delta <= 0)) {
                fpTerrain = -2;
                fpTerrainTips += "<br>Halftrack: -2 FP";
            }
        }

        if (special === "Nil" && delta !== 0 && fpTerrain === 0 && special === "Nil") {
            if (delta > 0) {
                fpTerrainTips += "<br>Firing at Lower Elevation +1 FP";
            } else if (unit1.group === "Infantry") {
                fpTerrainTips += "<br>Firing at Higher Elevation -1 FP";
            }
        }
    
        
        //Situational Modifiers
        if (unit2.status === "Concealed") {
            fpSituation--;
            fpSituationTips += "<br>Concealed Target: -1 FP";
        }
        if (distance === 1 && unit1.group === "Infantry" && special === "Nil") {
            fpSituation += 3;
            fpSituationTips += "<br>Adjacent +3 FP";
        }
        if (smoke === true && unit1.group === "Infantry" && weapon.type === "Flame" === false && weapon.type === "SC" === false) {
            fpSituation -= 1;
            fpSituationTips += "<br>Smoke -1 FP";
        }
        if (hinderance > 0 && unit1.group === "Infantry" && special === "Nil") {
            //if target is Vehicle, this was separated out in LOS
            hinderance = Math.ceil(hinderance); //rounded up
            fpSituation += hinderance;
            fpSituationTips += "<br>Hinderance +" + hinderance + " FP";
        }

        let openGround = targetHex.beneficial === true ? false:true;

        if (targetHex.terrain.includes("Foxholes")) {
            openGround = true;
            //moving in foxholes terrain counts as open ground
        }

        //trenches - will need to check prev hex moved from
        if (openGround === true && hinderance === 0 && fireType.includes("OP") && (special === "Nil" || weaapon.type === "Mortar") && smoke === false && unit1.group === "Infantry" && unit2.group === "Infantry") {
            if (losResult.distance < 5) {
                fpSituation += 4;
                fpSituationTips += "<br>Moving in Open Ground, Range 1-4: +4 FP";
            } else if (losResult.distance > 4 && losResult.distance < 9) {
                fpSituation += 2;
                fpSituationTips += "<br>Moving in Open Ground, Range 5-8: +2 FP";
            } 
        }

        if (openGround === true && unit1.group === "Artillery" && unit2.group === "Infantry") {
            fpSituation += 4;
            fpSituationTips += "<br>Moving in Open Ground: +4 FP";       
        }






        if (fireType === "FinalOP" && unit1.group === "Infantry") {
            fpSituation -= 2;
            fpSituationTips += "<br>Final OP Fire: -2 FP";
        }

        if (unit1.group === "Vehicle" && unit2.group === "Vehicle" && weapon.type !== "Flame") {
            if (targetFacing === "Front") {
                baseFP -= unit2.armourF;
                baseFPTips += "<br>Less Front Armour of "+ unit2.armourF;
            }
            if (targetFacing === "Side" || targetFacing === "Rear") {
                baseFP -= unit2.armourSR;
                baseFPTips += "<br>Less " + targetFacing + " Armour of " + unit2.armourSR;
            }
        }

        if (unit1.group === "Vehicle" && unit2.group === "Vehicle" && weapon.type === "Flame" && unit2.openTopped === true) {
            baseFP += 2;
            baseFPTips += "<br>Open Topped +2 FP";
        }



        //Rear Vulnerability
        if (unit1.group === "Infantry" && unit2.group === "Vehicle" && unit2.mounted === false && (weapon.type === "Main" || weapon.type === "Reduced)")) {
            if (Facing("Target") === "Rear" && unit2.rearVuln !== false) {
                fpTerrain = 0;
                fpTerrainTips = "";
                baseFP -= unit2.rearVuln;
                baseFPTips += "<br>Rear Vulnerability #: -" + unit2.rearVuln + " FP";
            } else {
                baseFP = 0;
                baseFPTips = "Small Arms vs Vehicle";
                fpTerrain = 0;
                fpTerrainTips = "";
            }
        }








        baseFP = parseInt(baseFP);
        terrainFP = parseInt(fpTerrain);
        situationFP = parseInt(fpSituation);
        let totalFP = baseFP + terrainFP + situationFP;




        if (terrainFP !== 0 || fpTerrainTips !== "") {
            baseFPTips += fpTerrainTips;
        } 
        if (situationFP !== 0 || fpSituationTips !== "") {
            baseFPTips += fpSituationTips;
        }   
        baseFPTips = '[🎲](#" class="showtip" title="' + baseFPTips + ')';




        let info = {
            fp: totalFP,
            fpTips: baseFPTips,
        }    
        return info;
    }
    
    const ProfMods = () => {
        let unit1 = FireInfo.shooterUnit;
        let unit2 = FireInfo.targetUnit;
        let validResult = FireInfo.validResult;
        let losResult = FireInfo.losResult;
    
        let fireType = validResult.fireType;
        let delta = losResult.delta;
        let distance = losResult.distance;
        let smoke = losResult.smoke;
        let hinderance = losResult.hinderance;
            
        let profCheckFlag = false;
        let prof,profTips;
    
    
        prof = parseInt(unit1.proficiency);
        profTips = "Base Proficiency: " + prof;
    
        if (unit1.group === "Gun" || unit1.group === "Vehicle") {
            if (delta < 0) {
                profCheckFlag = true;
                prof--;
                profTips += "<br>Firing at Higher Elevation: -1 Prof";
            }
            if (smoke === true) {
                profCheckFlag = true;
                prof--;
                profTips += "<br>Firing through Smoke: -1 Prof";
            }
            if (smoke === "Dispersed") {
                profCheckFlag = true;
                profTips += "<br>Firing through Dispersed Smoke: +0 Prof";
            }
            if (unit1.token.get(SM.op) === true) {
                profCheckFlag = true;
                prof++;
                profTips += "<br>Overwatch: +1 Prof";
            }
            if (unit2.type !== "Vehicle" && fireType === "OP") {
                profCheckFlag = true;
                profTips += "<br>OP Fire: +0 Prof";
            }
            if (unit2.type !== "Vehicle" && fireType === "FinalOP") {
                profCheckFlag = true;
                prof--;
                profTips += "<br>FinalOP Fire: -1 Prof";
            }
            if (unit2.type === "Vehicle" && unit2.get(SM.moved) === true) {
                profCheckFlag = true;
                if (fireType === "Normal") {
                    prof--;
                    profTips += "<br>Target Vehicle Moving: -1 Prof";
                } else if (fireType === "OP") {
                    prof -= 2;
                    profTips += "<br>OP Fire vs Moving Vehicle: -2 Prof"
                } else if (fireType === "FinalOP") {
                    prof -= 3;
                    profTips += "<br>FinalOP Fire vs Moving Vehicle: -3 Prof"
                }
            }
            if (unit1.token.get(SM.moved) === false && unit1.token.get(SM.rotate) === true) {
                profCheckFlag = true;
                prof--;
                profTips += "<br>Firing after Turning in Hex: -1 Prof"
            }
            if (unit1.token.get(SM.moved) === true && unit1.token.get(SM.op) === false) {
                profCheckFlag = true;
                prof -= 4;
                profTips += "<br>Firing after Moving: -4 FP"
            }
            if (distance > 5) {
                profCheckFlag === true;
                let dmod = Math.min(Math.floor((distance - 1)/10),3);
                prof -= dmod;
                profTips += "<br>Distance: " + distance + " Hexes: -" + dmod + " Prof";
            }
            if (hinderance > 0) {
                profCheckFlag === true;
                prof -= hinderance;
                profTips += "<br>Hinderance: -" + hinderance + " Prof";
            }
        }
        if (unit1.type === "Artillery") {
            profCheckFlag = true;
            if (fireType === "OP") {
                let profMod = 0;
                if (unit1.nation === "Soviet Union" || unit1.nation === "Japanese") {
                    profMod = 5
                } else if (unit1.nation === "USA") {
                    profMod = 2;
                } else if (unit1.nation === "Germany" || unit1.nation === "Italy" || unit1.nation === "UK") {
                    profMod = 3;
                }
                prof -= profMod;
                profTips += "<br>OP Fire -" + profMod + " Prof";
            }
            if (unit1.token.get(SM.op) === true) {
                profMod++;
                profTips += "<br>Overwatch +1 Prof";
            }
        
        }

        //target Vehicle directly behind wall or dike
        //nighttime
    
        profTips = '[🎲](#" class="showtip" title="' + profTips + ')';
    
        let info = {
            profCheckFlag: profCheckFlag,
            prof: prof,
            profTips: profTips,
        }
    

        return info;
    }
    


    const Fire = (msg) => {
        let Tag = msg.content.split(";");
        let shooterID = Tag[1];
        let targetID = Tag[2];
        let weaponType = Tag[3]; //Main, SATW, Flame
        let artType;

        let shooterUnit = UnitArray[shooterID];
        if (shooterUnit.type === "Artillery") {
            artType = Tag[2];
            targetID = shooterID;
            weaponType = "Main";
        }

        if (shooterUnit.type === "Aircraft") {
            weaponType = "Main";
            if (shooterUnit.token.get(SM.bomb) === true) {
                weaponType = "MGs";  //place SM.bom to true after 1st attack
            }
        }

        let targetUnit = UnitArray[targetID];
        SetupCard(shooterUnit.name,"Firing",shooterUnit.nation);

        let losResult = LOS(shooterUnit,targetUnit);
        let validResult = ValidTarget(shooterUnit,targetUnit,weaponType);

        if (losResult.los === false || validResult.validTarget === false) {
            if (losResult.los === false) {
                outputCard.body.push("No LOS To Target");
                _.each(losResult.losReasons,reason => {
                    outputCard.body.push(reason);
                })
            } else if (validResult.validTarget === false) {
                outputCard.body.push("Shooter has LOS to Target");
                outputCard.body.push("However, it is not a Valid Target");
                _.each(validResult.validReasons,reason => {
                    outputCard.body.push(reason);
                })
            }
            PrintCard();
            return;
        }

        if (shooterUnit.status === "Concealed") {
            shooterUnit.LoseConceal();
        }

        FireInfo = {
            shooterUnit: shooterUnit,
            targetUnit: targetUnit,
            losResult: losResult,
            validResult: validResult,
            fireMods: {},
            profMods: {},
            artType: artType,
        }

        if (shooterUnit.type === "Aircraft") {
            AirFire();
        } else if (shooterUnit.type === "Artillery") {
            ArtFire();
        } else {
            Fire2("initial");
        }
    }


    const Fire2 = (pass) => {
        //morale check if Infantry
        let shooterUnit = FireInfo.shooterUnit;
        //MC
        if (shooterUnit.group === "Infantry" || shooterUnit.group === "Gun") {
            let morale = parseInt(shooterUnit.token.get("bar1_value"));
            let tip = "Morale: " + morale;
            let mod = 0; // 
            if (FireInfo.validResult.weapon.type === "SATW") {
               let satwMod = SATWMoraleMods();
               mod += satwMod.mod;
               tip += satwMod.tip;
            }
            tip = '[🎲](#" class="showtip" title="' + tip + ')';

            let moraleCheck = MoraleCheck(shooterUnit,mod);
            if (morale < 10 || moraleCheck.target < 10) {
                outputCard.body.push(tip + " Morale Check: " + moraleCheck.ddRoll + " vs " + moraleCheck.target);
            }        
            if (moraleCheck.result === false) {
                let again = (pass === "reroll") ? " again ":" ";
                outputCard.body.push("Unit fails its Morale Check" + again + "and fails to fire");
                shooterUnit.token.set("aura1_color","#000000");
                if (state.BoB.command[shooterUnit.player] > 0 && pass === "initial") {
                    ButtonInfo("Reroll Morale Check","!RerollMorale;Fire;" + shooterUnit.id);
                }
                PrintCard();
                return;
            } 
        }
        Fire3();
    }

    const Fire3 = () => {   
        FireInfo.fireMods = FireMods();
        outputCard.body.push("[hr]");
        outputCard.body.push(FireInfo.validResult.weapon.name + " fire, using " + FireInfo.validResult.fireType + " Fire");

        if (FireInfo.shooterUnit.group === "Gun" || FireInfo.shooterUnit.group === "Vehicle") {
            FireInfo.profMods = ProfMods();
        }

        if (FireInfo.shooterUnit.group === "Infantry" && (FireInfo.targetUnit.group === "Infantry" || FireInfo.targetUnit.group === "Gun")) {
            HEFire();
        } else if ((FireInfo.shooterUnit.group === "Gun" || FireInfo.shooterUnit.group === "Vehicle") && (FireInfo.targetUnit.group === "Infantry" || FireInfo.targetUnit.group === "Gun")) {
            if (ProfCheck() === false) {
                outputCard.body.push(FireInfo.shooterUnit.name + " fails its Proficiency Check and is unable to get off an accurate shot");
                shooterUnit.token.set("aura1_color","#000000");
            } else {
                HEFire();
            }
        } else if ((FireInfo.shooterUnit.group === "Gun" || FireInfo.shooterUnit.group === "Vehicle") && FireInfo.targetUnit.group === "Vehicle") {
            if (ProfCheck() === false) {
                outputCard.body.push(FireInfo.shooterUnit.name + " fails its Proficiency Check and is unable to get off an accurate shot");
                FireInfo.shooterUnit.token.set("aura1_color","#000000");
            } else {
                ATFire();
            }
        } else if (FireInfo.shooterUnit.group === "Infantry" && FireInfo.targetUnit.group === "Vehicle") {
            InfantryVsVehicle();
        }





        PrintCard();
    }

    const InfantryVsVehicle = () => {
        //Close Assault is elsewhere
        let weapon = FireInfo.validResult.weapon;
        if (weapon.type === "SATW" || weapon.type === "Flame") {
            ATFire();
        } else if (FireInfo.targetUnit.mounted === true) {
            HEFire();
        } else if (Facing("Target") === "Rear" && unit2.rearVuln !== false) {
            RearVuln();
        } 
    }


    const SATWMoraleMods = () => {
        let shooterUnit = FireInfo.shooterUnit;
        let mod = 0;
        let tip = "";
        let satwInfo = FireInfo.validResult.weapon.notes.find((element) => {
            element.includes("SATW");
        })
        satn = satwInfo.replace("SATW","").replace(")","").trim();
        satn = satn.split("(");
        if (shooterUnit.status === "Full" || satn.length === 1) {
            satn = parseInt(satn[0]);
        }
        if (shooterUnit.status === "Reduced" && satn.length > 1) {
            satn = parseInt(satn[1]);
        }
        mod -= satn;
        tip += "<br>SATW #: -" + satn
        if (FireInfo.validResult.fireType === "OP") {
            mod -= 2;
            tip += "<br>OP Fire -2";
            if (shooterUnit.token.get(SM.op) === true) {
                mod++;
                tip += "<br>Overwatch +1";
            }
        }
        if (FireInfo.validResult.fireType === "Assault") {
            mod--;
            tip += "<br>Assault Fire -1";
        }
        if (FireInfo.losResult.smoke === true) {
            mod--;
            tip += "<br>Smoke -1";
        }
        if (FireInfo.losResult.hinderance > 0) {
            mod -= FireInfo.losResult.hinderance;
            tip += "<br>Hinderance -" + FireInfo.losResult.hinderance;
        }
        let names = ["Bazoonka","Panzerfaust","Panzerschreck"];
        for (let i=0;i<names.length;i++) {
            if (FireInfo.validResult.weapon.name.includes(names[i])) {
                let hex = HexMap[shooterUnit.hexLabel];
                if (hex.terrain.includes("Building") || hex.terrain.includes("Pillbox")) {
                    mod -= 2;
                    tip += "<br>Backblast issues -2";
                }
                break;
            }
        }
        let rangePenalty = -FireInfo.losResult.distance;
        if (FireInfo.validResult.weapon.name.includes("ATR")) {
            rangePenalty = Math.ceil(rangePenalty/5);
        }
        mod -= rangePenalty;
        tip += "<br>Range Penalty -" + rangePenalty;
        let info = {
            mod: mod,
            tip: tip,
        }
        return info;
    }

    const Spotter = () => {
        let id = msg.selected[0]._id;
        let artUnit = UnitArray[id];
        SetupCard(artUnit.name,"Spotter Check",artUnit.nation);
        let losResult = LOS(artUnit,artUnit);
        if (losResult.los === true) {
            outputCard.body.push("There is a Valid Spotter for this Hex");
        } else {
            _.each(losResult.losReasons,reason => {
                outputCard.body.push(reason);
            })
        }
        PrintCard();
    }

    const ArtFire = () => {
        let shooterUnit = FireInfo.shooterUnit;
        let targetHex = HexMap[shooterUnit.hexLabel];
        let proficiency = shooterUnit.proficiency;
        let profMod = 0;
        let fireType = FireInfo.fireType;
        let artType = FireInfo.artType;
        let profTips = "";
        if (fireType === "OP") {
            if (shooterUnit.nation === "Soviet Union" || shooterUnit.nation === "Japanese") {
                profMod = 5
            } else if (shooterUnit.nation === "USA") {
                profMod = 2;
            } else if (shooterUnit.nation === "Germany" || shooterUnit.nation === "Italy" || shooterUnit.nation === "UK") {
                profMod = 3;
            }
            profTips = shooterUnit.nation + " OP Fire -" + profMod;
        }
        let needed = proficiency - profMod;
        let profRoll = randomInteger(10);
        let profRollDD = DisplayDice(profRoll,shooterUnit.dice,36);
        if (profTips !== "") {
            profTips = '[🎲](#" class="showtip" title="' + profTips + ')';
        }

        outputCard.body.push(profTips + " Proficiency Roll: " + profRollDD + " vs. " + needed);
        if (profRoll > needed) {
            outputCard.body.push("The Artillery was not able to execute the Fire Mission...");
        } else {
            let accuracy = shooterUnit.accuracy;
            let accRoll = randomInteger(10);
            let accRollDD = DisplayDice(accRoll,shooterUnit.dice,36);
            outputCard.body.push("Accuracy Roll: " + accRollDD + " vs. " + accuracy);
            if (accRoll > accuracy) {
                outputCard.body.push("The Fire Mission is completed but drifts");
                let dir = DIRECTIONS[randomInteger(6) - 1]; //NE etc
                let dist = accRoll - accuracy;
                let cube = targetHex.cube;
                for (let i = 0;i<dist;i++) {
                    cube = cube.neighbour(dir);
                }                
                targetHex = HexMap[cube.label()];
                if (targetHex && targetHex.offboard === false) {
                    shooterUnit.token.set({
                        left: targetHex.centre.x,
                        top: targetHex.centre.top,
                    })
                    ChangeHex(shooterUnit,targetHex);
                } else {
                    outputCard.body.push("It drifts offboard");
                    PrintCard();
                    return;
                }
            } else {
                outputCard.body.push("The Fire Mission is completed and On Target");
            }
            ArtFire2();
        }
        PrintCard();
    }

    const ArtFire2 = (reentry) => {
        if (!reentry) {reentry = false}; //wil be true if comgin from changeGraphic
        let shooterUnit = FireInfo.shooterUnit;
        let targetHex = HexMap[shooterUnit.hexLabel];
        let targetHexes = [];
        targetHexes.push(targetHex);
        let neighbours = targetHex.cube.neighbours();
        _.each(neighbours,neighbour => {
            let hex = HexMap[neighbour.label()];
            if (hex && hex.offboard === false) {
                targetHexes.push(hex);
            }
        })

        if (FireInfo.artType === "Smoke") {
            ArtSmoke(targetHexes);
        } else {
            ArtHE(targetHexes);
        }
//mark used
//move offboard

    }

    const ArtSmoke = (targetHexes) => {
        for (let i=0;i<targetHexes.length;i++) {
            let hex = targetHexes[i];
            hex.smoke = true;
            hex.smokeID = CreateMarker(hex,"Smoke");
        }
    }

    const ArtHE = (targetHexes) => {
        let shooterUnit = FireInfo.shooterUnit;
        //resolve art fire against each hex, have to do fire mods for each hex/unit due to terrain etc
        for (let i=0;i<targetHexes.length;i++) {
            let hex = targetHexes[i];
            let targetUnits = [];
            for (let j=0;j<hex.tokenIDs.length;j++) {
                let unit = UnitArray[hex.tokenIDs[j]];
                if (unit && unit.id !== shooterUnit.id && unit.artAttack.includes(shooterUnit.id) === false) {
                    targetUnits.push(unit);
                }
            }

            if (targetUnits.length > 0) {
                let artRoll = randomInteger(10);
                outputCard.body.push("Hex " + hex.mapLabel + ": Roll: " + DisplayDice(artRoll,shooterUnit.dice,36));
                if (artRoll === 10) {
                    outputCard.body.push("No effect against this Hex");
                    continue;
                }
                for (let j=0;j<targetUnits.length;j++) {
                    unit = targetUnits[j];
                    outputCard.body.push("[hr]")
                    outputCard.body.push("Target Unit: " + unit.name);
                    FireInfo.targetUnit = unit;
                    unit.artAttack.push(shooterUnit.id); //as can only be hit once by this artillery unit this round
                    FireInfo.validResult = ValidTarget(shooterUnit,unit,"Main");
                    FireInfo.fireMods = FireMods();
                    if (unit.group === "Vehicle") {
                        ATFire(artRoll);
                    } else {
                        HEFire(artRoll,unit);
                    }   
                }
            }
            //place art markers in hex
            if (reentry === false) {
                CreateMarker(hex,"Artillery");
                //record artFire
                if (artFire[hex.label]) {
                    if (artFire[hex.label].includes(shooterUnit.id) === false) {
                        artFire[hex.label].push(shooterUnit.id);
                    }
                } else {
                    artFire[hex.label] = [shooterUnit.id];
                }
            }
        }
    }

    const AirFire = () => {
        let shooterUnit = FireInfo.shooterUnit;
        let targetHex = HexMap[shooterUnit.hexLabel];
        if (targetHex.fpModifiers.Air === false) {
            outputCard.body.push("Cannot Attack into " + targetHex.terrain);
            PrintCard();
            return;
        }
        let tokenIDs = targetHex.tokenIDs;
        let melee = false;
        for (let i=0;i<tokenIDs.length;i++) {
            let unit2 = UnitArray[tokenIDs[i]];
            if (unit2.id === shooterUnit.id) {continue};
            if (unit2.type === "Artillery" || unit2.type === "Aircraft") {continue};
            if (CCCheck(unit2) === true) {
                melee = true;
                break;
            }
        }
        if (melee === true) {
            outputCard.body.push("Cannot Attack into Melee");
            PrintCard();
            return;
        }
        let proficiency = shooterUnit.proficiency;
        let profRoll = randomInteger(10);
profRoll = 7;
        let profRollDD = DisplayDice(profRoll,shooterUnit.dice,36);
        outputCard.body.push("Proficiency Roll: " + profRollDD + " vs. " + proficiency);
        if (profRoll > (proficiency +1)) {
            outputCard.body.push("The Aircraft was not able to attack this turn");
//move offboard
        } else if (profRoll === (proficiency + 1)) {
            //check for alt targets
            AirFire2();
        } else {
            //attack routine
            AirFire3();
        }
        PrintCard();
    }


    const AirFire2 = () => {
        let shooterUnit = FireInfo.shooterUnit;
        let altTargets = {};
        let alternate = false;
        let closest = {friend: 100, enemy: 100};
        let keys = Object.keys(UnitArray);
        for (let i=0;i<keys.length;i++) {
            let unit = UnitArray[keys[i]];
            if (unit.id === shooterUnit.id) {continue};
            if (unit.type === "Artillery" || unit.type === "Aircraft") {continue};
            let dist = shooterUnit.cube.distance(unit.cube);
            let legal = HexMap[unit.hexLabel].fpModifiers.air;
            if (dist <= 5 && legal !== false) {
                if (unit.nation !== shooterUnit.nation) {
                    if (dist < closest.enemy) {
                        altTargets.enemy = unit;
                        closest.enemy === dist;
                        alternate = true;
                    }
                } else if (unit.nation === shooterUnit.nation) {
                    if (dist < closest.friend) {
                        altTargets.friend = unit;
                        closest.friend = dist;
                        alternate = true;
                    }
                }
            }
        }
        if (alternate === true) {
            let altTarget;
            //no need to redo valid target, same weapon etc.
            if (altTargets.friend) {
                outputCard.body.push("[#FF0000]The Plane attacks a nearby Friendly Unit by Mistake![/#]");
                altTarget = altTargets.friend;
            } else {
                outputCard.body.push("The Plane attacks a nearby Enemy Unit by Mistake");
                altTarget = altTargets.enemy;
            }
            outputCard.body.push("[hr]");
            targetHex = HexMap[altTarget.hexLabel];

            FireInfo.targetUnit = altTarget;
            shooterUnit.token.set({
                left: targetHex.centre.x,
                top: targetHex.centre.y,
            })
//PlaySound
            ChangeHex(shooterUnit,targetHex);
            AirFire3();
        } else {
            outputCard.body.push("The Aircraft was not able to attack this turn");
//move offboard
        }
        PrintCard();
    }

    const AirFire3 = () => {
        FireInfo.fireMods = FireMods();
        let shooterUnit = FireInfo.shooterUnit;
        //all units in hex lose concealment unless JU-87G
        //if JU87 then all infantry/guns gain a level of suppression
        let targetHex = HexMap[shooterUnit.hexLabel];

        if (shooterUnit.name.includes("JU-87G") === false) {
            let phrase = "Infanrty and Guns Lose Concealment";
            if (shooterUnit.special.includes("Terror")) {
                phrase += " and Gain Suppression";
            }
            outputCard.body.push(phrase);
            _.each(targetHex.tokenIDs,id => {
                let unit = UnitArray[id];
                if (unit.group === "Infantry" || unit.group === "Gun") {
                    unit.LoseConceal();
                    if (shooterUnit.special.includes("Terror")) {
                        unit.Suppress(1);
                    }
                }
            })
            outputCard.body.push("[hr]");
        }

        let fpRoll = randomInteger(10);
        outputCard.body.push("Firepower Roll: " + DisplayDice(fpRoll,FireInfo.shooterUnit.dice,36));
        HEFire(fpRoll,FireInfo.targetUnit);
        outputCard.body.push("[hr]");
        if (shooterUnit.special.includes("Fighter-Bomber") && fpRoll < 9) {
            outputCard.body.push("Fighter-Bomber circles around and can Attack again next turn");
            if (shooterUnit.token.get(SM.bomb) === false && shooterUnit.name.includes("Ju-87G") === false) {
                shooterUnit.token.set(SM.bomb,true);
                outputCard.body.push("Out of Bombs, it switches to its MGs");
            }
//move offboard

        } else {
            /*
            outputCard.body.push("The Aircraft returns to base");
            shooterUnit.token.remove();
            targetHex.tokenIDs.splice(targetHex.tokenIDs.indexOf(this.id),1);
            ArrangeTokens(targetHex);
            delete UnitArray[shooterUnit.id];
            */
        }



    }







    const ProfCheck = () => {
        let shooterUnit = FireInfo.shooterUnit;
        if (FireInfo.profMods.profCheckFlag === false) {
            //no prof. check needed
            return true;
        }
        let adjProf = FireInfo.profMods.prof;
        let profTips = FireInfo.profMods.profTips;
        let profRoll = randomInteger(10);
        outputCard.body.push(profTips + " Prof. Test: " + DisplayDice(profRoll,shooterUnit.dice,36) + " vs. " + adjProf);
        if (profRoll <= adjProf) {
            return true;
        } else {
            return false;
        }
    }

    const HEFire = (fpRoll,unit) => {
        let fireMods = FireInfo.fireMods;
        let shooterUnit = FireInfo.shooterUnit;
        if (!unit) {
            unit = FireInfo.targetUnit;
        }
        let weapon = FireInfo.validResult.weapon;
        let adjustedFP = fireMods.fp;
        outputCard.body.push(fireMods.fpTips + " Net Firepower: " + adjustedFP);    
        //1 die roll result, used vs all units in hex that are Infantry or Gun, for artillery is for hex and passed from artfire2
        if (shooterUnit.type !== "Artillery" && shooterUnit.type !== "Aircraft") {
            fpRoll = randomInteger(10);
            outputCard.body.push("Rolling: " + DisplayDice(fpRoll,FireInfo.shooterUnit.dice,36));
        }
        if ((fpRoll <= adjustedFP || fpRoll === 1) && fpRoll !== 10) {
            if (shooterUnit.type !== "Artillery" && shooterUnit.type !== "Aircraft") {
                if (unit.group === "Vehicle" && unit.mounted === true) {
                    HEFire2(unit,fpRoll,adjustedFP);
                } else {
                    let targetHex = HexMap[FireInfo.targetUnit.hexLabel];
                    _.each(targetHex.tokenIDs,tokenID => {
                        let unit2 = UnitArray[tokenID];
                        if (unit2.group !== "Vehicle" && unit2.group !== "Artillery" && unit2.group !== "Aircraft") {
                            HEFire2(unit2,fpRoll,adjustedFP);
                        } 
                    })
                }
            } else {
                HEFire2(unit,fpRoll,adjustedFP);
            }
        } else {
            outputCard.body.push("No Effect");
        }
        if (weapon.type === "Flame" && shooterUnit.group === "Infantry") {
            if (fpRoll < 4) {
                outputCard.body.push("[hr]");
                outputCard.body.push("The Flamethrower sputters and then is out of Fuel...");
//replace with normal Infantry of same type ?
            }
        }
    }

    HEFire2 = (unit,fpRoll,adjustedFP) => {
        let cn1, cn2;
        let level = 1;

        if (unit.type === "Infantry" || unit.type === "Weapons Team") {
            let status = DeepCopy(unit.status);
            if (status === "Concealed") {
                status = state.BoB.concealedUnitInfo[unit.id].status;
            }
            if (status === "Full") {
                cn1 = parseInt(unit.casualtyFull[0]);
                cn2 = parseInt(unit.casualtyFull[1]);
            }
            if (status === "Reduced") {
                cn1 = cn2 = parseInt(unit.casualtyReduced);
            }
            if (fpRoll + cn1 < adjustedFP) {
                level = 2;
            }
            if (fpRoll + cn2 < adjustedFP) {
                level = 3;
            }
        }

        if (unit.type === "Gun") {
            cn1 = unit.casualtyFull[0];
            if (shooterUnit.group === "Gun" || shooterUnit.group === "Vehicle" || shooterUnit.type === "Aircraft") {
                cn1 = parseInt(unit.casualtyFull[1]);
            }
            if (shooterUnit.group === "Infantry" && fireMods.fpTips.includes("SATW")) {
                cn1 = parseInt(unit.casualtyFull[1]);
            }
            if (weapon.type === "Flame") {
                cn1 = parseInt(unit.casualtyFull[1]);
            }


            if (fpRoll + cn1 < adjustedFP) {
                level = 3;
            }
            if (fpRoll === 1 && shooterUnit.type === "Artillery" && unit.status !== "Concealed") {
                level = 3;
            }
        }

        if (unit.status === "Concealed") {
            unit.LoseConceal();
        }

        if (unit.type === "Decoy") {
            outputCard.body.push("[#FF0000]A Decoy unit of several men is revealed as they scatter...[/#]");
            unit.Destroy();
        } else {
            if (level === 3) {
                outputCard.body.push("[#FF0000]" + unit.name + " is wiped out...[/#]");
                unit.Destroy();
            } else if (level === 2) {
                if (unit.status === "Reduced") {
                    outputCard.body.push("[#FF0000]" + unit.name + " suffers more casualties and is effectively wiped out[/#]");
                    unit.Destroy();
                } else {
                    outputCard.body.push("[#FF0000]"+ unit.name + " suffers casualties and is Reduced and Fully Suppressed[/#]");
                    unit.Suppress(2);
                    unit.Reduce();
                }
            } else if (level === 1) {
                unit.Suppress(1)
            }
        }
    }




    const ATFire = (artRoll) => {
        let fireMods = FireInfo.fireMods;
        let shooterUnit = FireInfo.shooterUnit;
        let targetUnit = FireInfo.targetUnit;
        let weapon = FireInfo.validResult.weapon;
        let noun = " Shot ";
        let verb = "Fails";
        let fpRoll = randomInteger(10);

        if (weapon.type === 'Flame') {
            noun = " Flames ";
            verb = "Fail";
        }
        if (shooterUnit.type === "Artillery") {
            noun = " Rounds ";
            verb = " Fail"
            fpRoll = artRoll; //same for whole hex, pass in
        }
        adjustedFP = fireMods.fp;
        outputCard.body.push(fireMods.fpTips + " Net Firepower: " + adjustedFP);    
        outputCard.body.push("Rolling: " + DisplayDice(fpRoll,FireInfo.shooterUnit.dice,36));

        if (fpRoll > adjustedFP || fpRoll === 10) {
            outputCard.body.push("The" + noun + verb + " to Penetrate the Armour");
        } else {    
            outputCard.body.push("[#FF0000]" + targetUnit.name + " is Destroyed by the" + noun + "[/#]");
            targetUnit.Destroy();
        }
    }

    const RearVuln = () => {
        let fireMods = FireInfo.fireMods;
        adjustedFP = fireMods.fp;
        outputCard.body.push(fireMods.fpTips + " Net Firepower: " + adjustedFP);    
        //1 die roll result, used vs all units in hex that are Infantry or Gun
        let fpRoll = randomInteger(10);
        if (fpRoll === 10 || fpRoll > adjustedFP) {
            outputCard.body.push("No Effect");
        } else {
            outputCard.body.push("[#FF0000]" + targetUnit.name + " is Destroyed by the" + noun + "[/#]");
            targetUnit.Destroy();
        }
    }


    const SetupSide = (msg) => {
        sendChat("","Clear State if not Done");
        let Tag = msg.content.split(";");
        let nation = Tag[1];
        let player = Tag[2] === "Yes" ? 0:1;
        let setupPlayer = Tag[3];

        let cp = parseInt(Tag[4]);
        let orMin = parseInt(Tag[5]) || 1;
        let orMax = parseInt(Tag[6]) || 1;
        let routEdge = Tag[7];
        let playerName = Tag[8];
        let playerID = -1;
        for (let i=0;i<playerInfo.length;i++) {
            if (playerInfo[i].name === playerName) {
                playerID = playerInfo[i].playerID;
            }
        }
    
        state.BoB.nations[player] = nation;
        state.BoB.CP[player] = cp;
        state.BoB.OR[player] = orMin;
        state.BoB.ORM[player] = orMax;
        state.BoB.routEdges[player] = routEdge;
        state.BoB.playerInfo[player] = playerID;

        SetupCard(nation,"Setup",nation);
        if (player === 0) {
            outputCard.body.push("Will be Moving First Each Turn");
        } else {
            outputCard.body.push("Will be Moving Second Each Turn");
        }
        if (setupPlayer === "Yes") {
            outputCard.body.push("Will Setup First");
            state.BoB.setupPlayer = player;
        }
        let s = cp === 1 ? "":"s";
        outputCard.body.push(cp + " Command Point" + s + " Per Turn");
        outputCard.body.push("Operational Range: " + orMin + " to " + orMax);
        outputCard.body.push("Rout Edge: " + routEdge);
        
        if (state.BoB.nations[0] !== "" && state.BoB.nations[1] !== "") {
            ButtonInfo("Set Turns","!SetupSide2;?{# of Turns|0}");
        }
    
        PrintCard();
    }
    
    const SetupSide2 = (msg) => {
        let Tag = msg.content.split(";");
        let turns = parseInt(Tag[1]);
        state.BoB.endTurn = turns;
        SetupCard("Turns","","Neutral");
        outputCard.body.push("Game lasts " + turns + " Turns");
        outputCard.body.push("Add Units Now");
        PrintCard();
    }

    const NextPhase = () => {
        let turn = state.BoB.turn;
        let phase = state.BoB.phase;
        let jump = false;
        if (turn === 0) {
            CheckConcealment();
            PlaceFoxholes();
            InitializeLocations();
        }
        CleanMap();
        CleanMap("Map Marker");
        if (phase === "Melee") {
            CleanMap("Artillery Marker")
            if (turn > state.BoB.endTurn) {
                SetupCard("End of Game","","Neutral");
                PrintCard();
                return;
            } else {
                EndTurnActivities();
                turn++;
                SetupCard("Turn " + turn,"Operations Phase","Neutral");
                outputCard.body.push("Starting Player defined by Scenario");
                outputCard.body.push("Second Player can use CP to preempt this");
                phase = "Operations";
            }
        } else if (phase === "Operations" || (phase === "Rout" && RoutArray.length > 0)) {
            if (phase === "Operations") {
                currentPlayer = 0;
            }
            BuildRoutArray();
            phase = "Rout";
            if (RoutArray.length > 0) {
                SetupCard("Rout Phase","Turn " + turn,"Neutral");
                ButtonInfo("Start Rout Phase","!RoutPhase");
            } else {
                jump = true;;
            }
        } else if (phase === "Rout" || (phase === "Melee" && MeleeArray.length > 0)) {
            BuildMeleeArray();
            phase = "Melee";
            if (MeleeArray.length > 0) {
                SetupCard("Melee Phase","Turn " + turn,"Neutral");
                ButtonInfo("Start Melee Phase","!MeleePhase;Start");
            } else {
               jump = true;
            }
        }
        state.BoB.phase = phase;
        state.BoB.turn = turn;
        if (jump === true) {
            NextPhase();
        } else {
            PrintCard();
        }
    }
    
    const EndTurnActivities = () => {
        //end of turn things
        //remove dispersed smoke counters and flip smoke to dispersed smoke
        _.each(HexMap,hex => {
            if (hex.smoke === "Dispersed") {
                let marker = findObjs({_type:"graphic", id: hex.smokeID})[0];
                if (marker) {
                    marker.remove();
                }
                hex.smoke = false;
                hex.smokeID = "";
            } else if (hex.smoke === true) {
                let marker = findObjs({_type:"graphic", id: hex.smokeID})[0];
                if (marker) {
                    marker.remove();
                }
                hex.smoke = "Dispersed";
                hex.smokeID = CreateMarker(hex,"Dispersed Smoke");
            }
        })
        //reduce suppression on all units, reset 'used', OP and Illumination
        _.each(UnitArray,unit => {
            let sms = ["rotate","fired","yellow","op","rout","end","cp","prof"];
            _.each(sms,sm => {
                unit.token.set(SM[sm],false);
            })
            if (unit.token.get(SM.red) === true) {
                unit.token.set(SM.red,false);
                unit.token.set(SM.yellow, true);
            }
            unit.token.set("aura1_color","#00FF00");
            unit.moveCost = 0;
            unit.distMoved = 0;
            let move = {
                hexLabel: unit.hexLabel,
                cost: 0,
                rotation: Angle(unit.token.get('rotation')),
                markerID: "",
            }
            unit.moveArray = [move];
            unit.startHexLabel = unit.hexLabel;
            unit.startRotation = Angle(unit.token.get('rotation'));
            unit.routCheck = "";
            if (unit.type === "Infantry Squad" || unit.type === "Weapons Team") {
                unit.token.set(SM.moved,false);
            }
            unit.artAttack = [];
    
            if ((unit.type === "Infantry Squad" || unit.type === "Weapons Team") && unit.token.get("currentSide") !== 2) {
                let morale = 11;
                if (unit.token.get("currentSide") <= 0 || unit.token.get("currentSide") === undefined) {
                    morale = parseInt(unit.moraleFull[0]);
                    if (unit.token.get(SM.yellow) === true) {
                        morale = parseInt(unit.moraleFull[1]);
                    }
                } else if (unit.token.get("currentSide") === 1) {
                    morale = parseInt(unit.moraleReduced[0]);
                    if (unit.token.get(SM.yellow) === true) {
                        morale = parseInt(unit.moraleReduced[1]);
                    }
                }
                unit.token.set("bar1_value",morale);
            }
        })
        //reset CP
        state.BoB.command[0] = state.BoB.CP[0];
        state.BoB.command[1] = state.BoB.CP[1];
        //reset OP
        state.BoB.currentOP = [0,0];
        //last unit things
        let lastUnit = UnitArray[activeUnitID];
        if (lastUnit) {
            CheckLastUnit(lastUnit); //conceal unit if eligible
        }
        activeUnitID = "";
        uncloaked = [];
    }

    const BuildRoutArray = () => {
        //build array of units that are subject to Rout Checks
        //will test each in RoutPhase routine when activated
        //Infantry and Guns only
        //first player has to do all his, then 2nd player
        //3 situations:
        //1 = They are in the same hex (and location) as an enemy unit.
        //2 = They are adjacent to an enemy unit that is not in Melee
        //3 = They are not in Beneficial Terrain (6.2) and are within 5 hexes of an enemy unit not in Melee whose LOS is not Hindered.
        RoutArray = [];
        let keys = Object.keys(UnitArray);
        for (let i=0; i<keys.length;i++) {
            let id1 = keys[i];
            let unit1 = UnitArray[id1];
            if (unit1.player !== currentPlayer) {continue};
            //tank or other
            if (unit1.type !== "Infantry" && unit1.type !== "Weapons Team" && unit1.type !== "Gun") {continue};
            let morale = parseInt(unit1.token.get("bar1_value"));
            if (morale === 10) {continue}; //will auto pass
            //check terrain
            let hex = HexMap[unit1.hexLabel];
            let beneficial = HexMap[unit1.hexLabel].beneficial;
            if (unit1.mounted === true) {beneficial = true};
            let elevation1 = hex.elevation;

            //1 - CC Check
            let result = CCCheck(unit1);
            if (result === false) {
                for (let j=0;j<keys.length;j++) {
                    let id2 = keys[j];
                    if (id2 === id1) {continue};
                    let unit2 = UnitArray[id2];
                    if (unit2.player === unit1.player) {continue};
                    if (CCCheck(unit2) === true) {continue};
                    let dist = unit1.cube.distance(unit2.cube);
                    if (dist === 1) {
                        unit1.routCheck = "Adjacent"
                        result = true;
                        break;
                    }
                    if (dist > 1 && dist <= 5 && beneficial === false && elevation1 <= HexMap[unit2.hexLabel].elevation) {
                        let losRes = LOS(unit1,unit2);
                        if (losRes.los === true && losRes.hinderance === 0) {
                            result = true;
                            break;
                        }
                    }
                }
            } else {
                unit1.routCheck = "Melee";
            }

            if (result === true) {
                RoutArray.push(unit1);
            }
        }
        //check other player
        if (RoutArray.length === 0 && currentPlayer === 0) {
            currentPlayer = 1;
            BuildRoutArray();
        }
    }

    const RoutPhase = () => {
        let unit = RoutArray.shift();
        let mod = 0;
        let tip = " ";
        if (unit) {
            sendPing(unit.token.get("left"),unit.token.get("top"), Campaign().get('playerpageid'), null, true); 
            if (unit.routCheck === "Melee") {
                if (state.BoB.nations.includes("Soviet Union") && state.BoB.nations.includes("Germany")) {
                    mod = 2;
                    tip = "No Quarter = +2 to Morale"
                }
            } 
            let moraleCheck = MoraleCheck(unit,mod,tip);
            RoutPhase2(unit,moraleCheck,"1st");
        } else {
            if (currentPlayer === 0) {
                currentPlayer = 1;
                BuildRoutArray();
            } 
        }
    }
    
    const RoutPhase2 = (unit,moraleCheck,pass) => {
        SetupCard(unit.name,"Rout Check",unit.nation);
        let tip = '[🎲](#" class="showtip" title="' + moraleCheck.reason + ') ';
        outputCard.body.push(tip + "Roll: " + moraleCheck.ddRoll + " vs. " + moraleCheck.target);
        if (moraleCheck.result === true) {   
            outputCard.body.push("Unit Passed");
        } else {
            let again = "[/#]";
            if (pass === "2nd") {
                again = " Again![/#]";
            }
            outputCard.body.push("[#FF0000]Unit Failed Morale Test" + again);
            if (pass === "1st" && state.BoB.command[unit.player] > 0) {
                let info = moraleCheck.mod + "/" + moraleCheck.reason;
                ButtonInfo("Reroll Morale Check","!RerollMorale;Rout;" + unit.id + ";" + info );
            } else {
                RoutUnit(unit);
            }
        }
        if (RoutArray.length === 0) {
            if (currentPlayer === 0) {
                currentPlayer = 1;
                BuildRoutArray(); 
                ButtonInfo("Next Unit (Other Player)","!RoutPhase");
            } else {
                ButtonInfo("Next Phase","!NextPhase");
            }
        } else {
            ButtonInfo("Next Unit","!RoutPhase");
        }
        if (pass === "2nd") {
            outputCard.body.push("[hr]");
            outputCard.body.push(state.BoB.command[unit.player] + " Command Points Left");
        }
        PrintCard();
    }
    
    const RoutUnit = (unit) => {
        outputCard.body.push("The Unit Routs!");
        if (unit.type === "Gun") {
            outputCard.body.push("The Crew abandon the Gun and Flee or Surrender");
            unit.Destroy();
        } else {
            unit.token.set(SM.rout,true);
            let threshold;
            let alive = true;
            if (unit.status === "Reduced" || unit.routCheck === "Melee" || unit.routCheck === "Adjacent") {
                threshold = unit.casualtyR;
            } else {
                threshold = unit.casualtyF.split("/")[1];
            }
            if (roll > threshold) {
                outputCard.body.push("The Unit is Fully Suppressed and Takes Casualties");
                unit.Suppress(2);
                alive = unit.Reduce();
                if (alive === false) {
                    outputCard.body.push("It Surrenders!");
                }
            }
            if (unit.routCheck === "Melee" && alive === true) {
                let tids = HexMap[unit.hexLabel].tokenIDs;
                let check = false;
                for (let i=0;i<tids.length;i++) {
                    let tid = tids[i];
                    if (tid === unit.id) {continue};
                    if (UnitArray[tid].player === unit.player) {
                        check = true;
                    }   
                }
                if (check === false) {
                    if (unit.charName.includes("SS") && state.BoB.nations.includes("Soviet Union") && (roll - target) === 1) {
                        outputCard.body.push("The SS Unit Remains in the Hex, but Takes Casualties");
                        alive = unit.Reduce();
                        if (alive === false) {
                            outputCard.body.push("It Surrenders!");
                        }
                    } else {
                        outputCard.body.push("The Unit Surrenders");
                        unit.Destroy();
                        alive = false;
                    }
                } else {
                    outputCard.body.push("If all Friendly Units in this Hex Rout, remove as they are destroyed/surrender rather than Rout");
                }
            }
            if (alive === true) {
                outputCard.body.push("Move Unit according to Rout rules");
            }
        }
    }


    const BuildMeleeArray = () => {
        MeleeArray = [];
        let keys = Object.keys(HexMap);
        for (let i=0;i<keys.length;i++) {
            let label = keys[i]
            let hex = HexMap[label];
            if (hex.tokenIDs.length > 0) {
                let side = -1;
                _.each(hex.tokenIDs,id => {
                    let unit = UnitArray[id];
                    if (unit) {
                        if (unit.type !== "Artillery" && unit.type !== "Aircraft") {
                            if (side === -1) {
                                side = unit.player;
                            } else if (side !== unit.player && MeleeArray.includes(label) === false) {
                                MeleeArray.push(label);
                            }
                        }
                    }
                    else {
                        hex.tokenIDs.splice(hex.tokenIDs.indexOf(id),1);
                    }
                })
            }
        }
    }

    const MeleePhase = () => {
        //Melee Array will be an array of hexes where melee is happening
        //iterate through each, resolving and button to advance to next or if none, to go to next phase
        let label = MeleeArray.shift();
        if (label) {
            let hex = HexMap[label];
            let units = [[],[]];
            for (let i=0;i<hex.tokenIDs.length;i++) {
                let id = hex.tokenIDs[i];
                let unit = UnitArray[id];
                units[unit.player].push(unit);
            }
            for (let p=0;p<2;p++) {
                units[p].sort((a,b) => {
                    if (a.weapons.Main.meleeFP < b.weapons.Main.meleeFP) {
                        return -1;
                    }
                    if (a.weapons.Main.meleeFP > b.weapons.Main.meleeFP) {
                        return 1;
                    }
                    let aStatus = a.status === "Reduced" ? 1:2;
                    let bStatus = b.status === "Reduced" ? 1:2;
                    if (aStatus > bStatus) {
                        return -1;
                    }
                    if (aStatus < bStatus) {
                        return 1;
                    }
                    return 0;
                })
                //sort units by meleeFP, lowest first, then status if equal FP - so that weaker melee units killed first and spread causalties into intact units first
            }



            MeleeInfo = {
                hex: hex,
                units: units,
                hits: [[],[]],
                translatedLabel: TranslateHexLabels(label),
                cp: [false,false],
            }
            sendPing(hex.centre.x,hex.centre.y, Campaign().get('playerpageid'), null, true);

            Melee();
        } else {
            NextPhase();
        }
    }

    const Melee = () => {
        PlaySound("Assault");
        for (let i=0;i<2;i++) {
            SetupCard("Melee","Hex " + MeleeInfo.translatedLabel,state.BoB.nations[i]);
            let p2 = (i===0) ? 1:0;
            let units = MeleeInfo.units[i];
            let enemyHP = 0;
            _.each(MeleeInfo.units[p2],u2 => {
                let hp = (u2.status === "Reduced" || u2.type === "Weapons Team" || u2.type === "Gun") ? 1:2;
                enemyHP += hp;
            })
            let totalHits = 0;
            //hits
            for (let j=0;j<units.length;j++) {
                let unit = units[j];
                let info = MeleeRolls(unit);
                let out = info.tip + " " + unit.name;
                if (info.hits === 0) {
                    out = "[#FF0000]" + out + " Missed[/#]";
                } else {
                    let s = info.hits === 1 ? "":"s";
                    out += " Scored " + info.hits + " Hit" + s;
                }
                outputCard.body.push(out);
                MeleeInfo.hits[i].push(info.hits);
                totalHits += info.hits;
            }
            //rerolls ?
            for (let j=0;j<units.length;j++) {
                let unit = units[j];
                let hits = MeleeInfo.hits[i][j];
                if (hits < 2 && state.BoB.command[unit.player] > 0 && totalHits < enemyHP) {
                    MeleeInfo.cp[i] = true;
                    ButtonInfo("Reroll " + unit.name,"!CommandPoint;Melee;Use;" + i + ";" + j);
                }
                
            }
            if (MeleeInfo.cp[i] === true) {
                ButtonInfo("No Rerolls","!CommandPoint;Melee;Skip;" + i);
            }
            PrintCard();
        }
        if (MeleeInfo.cp[0] === false && MeleeInfo.cp[1] === false) {
            ResolveMelee();
        }
    }
    
    const MeleeRolls = (unit) => {
        let mfp;
        if (unit.weapons.Reduced) {
            if (unit.status === "Reduced") {
                mfp = unit.weapons.Reduced.meleeFP;
            } else {
                mfp = unit.weapons.Main.meleeFP;
            }
        } else {
            mfp = unit.weapons.Main.meleeFP;
        }
        let hits = 0;
        let rolls = [];
        for (let r=0;r<2;r++) {
            let roll = randomInteger(10);
            if (roll <= mfp) {
                hits++;
            }
            rolls.push(roll);
        }
        let tip = "Rolls: " + rolls.toString() + " vs. Melee of " + mfp;
        tip = '[🎲](#" class="showtip" title="' + tip + ')';

        let info = {
            hits: hits,
            tip: tip,
            mfp: mfp,
        }
        return info;
    }


    const CommandPoint = (msg) => {
        let Tag = msg.content.split(";");
        let use = Tag[1];

        if (use === "Melee") {
            let action = Tag[2];
            let player = parseInt(Tag[3]);
            let p2 = (player === 0) ? 1:0;
            let unitNum = Tag[4];
            if (action === "Use" && MeleeInfo.cp[player] === true) {
                state.BoB.command[player]--;
                let unit = MeleeInfo.units[player][unitNum];
                SetupCard("Melee Reroll","",unit.nation);
                let info = MeleeRolls(unit);
                let out = info.tip + " " + unit.name;
                if (info.hits === 0) {
                    out = "[#FF0000]" + out + " Missed[/#]";
                } else {
                    let s = info.hits === 1 ? "":"s";
                    out += " Scored " + info.hits + " Hit" + s;
                }
                outputCard.body.push(out);
                outputCard.body.push(state.BoB.command[player] + " Command Points Remaining");
                PrintCard();
                MeleeInfo.hits[player][unitNum] = info.hits;
            }
            MeleeInfo.cp[player] = false;
            if (MeleeInfo.cp[p2] === false) {
                ResolveMelee();
            }
        }






    }

    const ResolveMelee = () => {
        //using MeleeInfo
        SetupCard("Melee Resolution","Hex " + MeleeInfo.translatedLabel,"Neutral");
        for (let p1 = 0;p1<2;p1++){
            let p2 = (p1===0) ? 1:0;
            let hits = 0;
            let units = MeleeInfo.units[p1];
            let num = units.length
            for (let i=0;i<MeleeInfo.hits[p2].length;i++) {
                hits += MeleeInfo.hits[p2][i];
            }            
            let hpu = Math.floor(hits/num);
            let rem = hits - (hpu * num);

            let header = false;
            for (let i=0;i<units.length;i++) {;
                let unit = units[i];
                let damage = (i===0) ? hpu + rem:hpu;
                if (damage === 0) {
                    continue;
                } else if (header === false) {
                    header = true;
                    outputCard.body.push("[U]" + state.BoB.nations[p1] + "[/u]");
                }
                let s = (damage === 1) ? "":"s";
                let line = unit.name + " takes " + damage + " Hit" + s;
                if (unit.type === "Weapons Team" || damage > 1 || unit.status === "Reduced" || unit.type === "Gun") {
                    line = "[#FF0000]" + line + " and is Destroyed[/#]";
                    unit.Destroy();
                } else {
                    line += " and is Reduced";
                    unit.Reduce();
                }
                outputCard.body.push(line);
            }
            outputCard.body.push("[hr]");
        }
        if (MeleeArray.length > 0) {
            ButtonInfo("Next Melee","!MeleePhase");
        } else {
            ButtonInfo("Next Phase","!NextPhase");
        }
        PrintCard();
    }

    const Mount = (msg) => {
        let id = msg.selected[0]._id;
        let unit = UnitArray[id];
        if (!unit) {return}
        SetupCard(unit.name,"",unit.nation);
        if (unit.mounted === true) {
            unit.Dismount();
        } else {
            unit.Mount();
        }
        PrintCard();
    }




    const SpendCP = (msg) => {
        let Tag = msg.content.split(";");
        let id = Tag[1];
        if (!id) {
            sendChat("","No Unit Selected");
            return;
        }
        let action = Tag[2];
        let unit = UnitArray[id];
        SetupCard(unit.name,"Command Point",unit.nation);
        if (state.BoB.command[unit.player] === 0) {
            outputCard.body.push("No CPs to Use");
        } else {
            if (action === "Move") {
                outputCard.body.push("Unit can add 1 MP");
                unit.token.set(SM.cpm,true);
            }
            if (action === "First") {
                outputCard.body.push("Unit can act before 1st Player");
            }
            if (action === "Final OP") {
                outputCard.body.push("Unit can do Final OP at up to its normal Range");
                unit.token.set(SM.cp,true);
            }
            if (action === "Prof") {
                outputCard.body.push("Unit will add 1 to its Prof FP");
                unit.token.set(SM.prof,true);
            }
            state.BoB.command[unit.player]--
        }
        PrintCard();
    }

    const CheckStatus = (msg) => {
        let playerID = msg.playerid;
        let nation;
        if (msg.selected) {
            let id = msg.selected[0]._id;
            let unit = UnitArray[id];
            nation = unit.nation;
        } else {
            nation = state.BoB.nations[state.BoB.playerInfo.indexOf(playerID)];
        }
        let player = state.BoB.nations[0] === nation ? 0:1;
        SetupCard(nation,"",nation);
        outputCard.body.push("Turn " + state.BoB.turn);
        outputCard.body.push("Phase: " + state.BoB.phase);
        outputCard.body.push("Current OPS Used: " + state.BoB.currentOP[player]);
        outputCard.body.push("Operations Range: " + state.BoB.OR[player] + " - " + state.BoB.ORM[player]);
        outputCard.body.push("[hr]");
        outputCard.body.push("Current Command Points: " + state.BoB.command[player]);
        outputCard.body.push("Command Points Per Turn: " + state.BoB.CP[player]);
        PrintCard();
    }


    const RerollMorale = (msg) => {
        //spend CP to reroll
        let Tag = msg.content.split(";");
        let source = Tag[1];
        let id = Tag[2];
        let unit = UnitArray[id];
        let info = Tag[3];
        state.BoB.command[unit.player]--;
        if (source === "Move") {
            Move(id,info,true);
        }
        if (source === "Fire") {
            SetupCard(shooterUnit.name,"Firing/Reroll Morale",shooterUnit.nation);
            Fire2("reroll");
        }
        if (source === "SuppressMove") {
            unit.MoveSuppress("reentry");
        }
        if (source === "Rout") {
            info = info.split("/");
            let mod = parseInt(info[0]);
            let reason = info[1];
            let moraleCheck = MoraleCheck(unit,mod,reason);
            RoutPhase2(unit,moraleCheck,"2nd");
        }     
    }

    const CloseAssault = () => {
        let hex = moveInfo.newHex;
        let attacker = moveInfo.unit;
        SetupCard(attacker.name,"Close Assault",attacker.nation);
        outputCard.body.push("If the Unit survives any OP fire and any Morale Checks, it may Close Assault");
        outputCard.body.push("Regardless, it must fall back to the previous Hex");
        outputCard.body.push("Click Button if Appropriate");
        ButtonInfo("Close Assault","!CloseAssault2;" + attacker.id);
        PrintCard();
    }

    const CloseAssault2 = (msg) => {
        let Tag = msg.content.split(";");
        let attackerID = Tag[1];
        let attacker = UnitArray[attackerID];
        let hex = HexMap[attacker.hexLabel];
        let defender;
        for (let i=0;i<hex.tokenIDs.length;i++) {
            let unit = UnitArray[hex.tokenIDs[i]];
            if (unit.player !== attacker.player) {
                defender = unit;
            }
        }
        if (defender) {
            SetupCard(attacker.name,"Close Assault",attacker.nation);
            let meleeFP = attacker.weapons.Main.meleeFP;
            if (attacker.status === "Reduced" && attacker.weapons.Reduced) {
                meleeFP = attacker.weapons.Reduced.meleeFP;
            }
            let tip = "Melee FP: " + meleeFP;
            if (defender.armourSR > 1 && defender.openTopped === false) {
                tip += "<br>Buttoned Up Armour -1 FP";
                meleeFP--;
            }
            tip = '[🎲](#" class="showtip" title="' + tip + ')';
            let roll = randomInteger(10);
            let ddRoll = DisplayDice(roll,attacker.dice,36);
            outputCard.body.push(tip + " Close Assault Roll: " + ddRoll + " vs " + meleeFP);
            if (roll <= meleeFP) {
                outputCard.body.push("The Close Assault destroys or disables the Vehicle");
                defender.Destroy();
            } else {
                outputCard.body.push("The Close Assault Fails");
            }
            outputCard.body.push("The Infantry Unit must drop back to its last hex");
            attacker.token.set(SM.fired,true);
            PrintCard();
        }
    }

    const Crushing = () => {
        let hex = moveInfo.newHex;
        let attacker = moveInfo.unit;
        SetupCard(attacker.name,"Crushing",attacker.nation);
        outputCard.body.push("If the Unit survives any OP fire, it may Crush the Gun");
        if (hex.terrain.includes("Woods") || hex.tokenIDs.length > 2) {
            outputCard.body.push("The Vehicle must fall back to its previous Hex when done");
        }
        outputCard.body.push("Click Button if Appropriate");
        ButtonInfo("CRUSH!","!Crushing2;" + attacker.id);
        PrintCard();
    }

    const Crushing2 = (msg) => {
        let Tag = msg.content.split(";");
        let attackerID = Tag[1];
        let attacker = UnitArray[attackerID];
        let hex = HexMap[attacker.hexLabel];
        let defender;
        for (let i=0;i<hex.tokenIDs.length;i++) {
            let unit = UnitArray[hex.tokenIDs[i]];
            if (unit.player !== attacker.player && unit.group === "Gun") {
                defender = unit;
            }
        }
        if (defender) {
            SetupCard(attacker.name,"Crushing",attacker.nation);
            let tip = "";
            let mod = 0;
            if (hex.terrain.includes("Woods")) {
                mod++;
                tip += "<br>Woods +1 to Result";
            }
            if (hex.tokenIDs.length > 2) {
                mod++;
                tip += "<br>Enemy Infanty +1 to Result";
            }
            if (tip !== "") {
                tip.replace("<br>","");
                tip = '[🎲](#" class="showtip" title="' + tip + ')';
            }
            let roll = randomInteger(10);
            let target = 10 - mod;
            let ddRoll = DisplayDice(roll,attacker.dice,36);
            outputCard.body.push(tip + " Disabling Roll: " + ddRoll + " vs. " + target + "+");
            if (roll < target) {
                outputCard.body.push("The Gun is Crushed and the Vehicle survives");
                if (hex.terrain.includes("Woods") || hex.tokenIDs.length > 2) {
                    outputCard.body.push("The Vehicle must fall back to its previous Hex");
                }
                defender.Destroy();
                attacker.token.set(SM.fired,true);
            } else {
                outputCard.body.push("[#FF0000]The Gun is Crushed, but the Vehicle is Immobilized and Abandoned in the Process[/#]");
                defender.Destroy();
                attacker.Destroy();
            }
            PrintCard();
        }
    }






    const Size = (msg) => {
        let tokenID = msg.selected[0]._id;
        let token = findObjs({_type:"graphic", id: tokenID})[0];
        /*
        token.set({
            width: 70,
            height: 80.8,
        })
        */
       token.set({
            width: 60,
            height: 60,
       })
    }

    const ChangeHex = (unit,newHex) => {
        let oldHex = HexMap[unit.hexLabel];
        let index = oldHex.tokenIDs.indexOf(unit.id);
        if (index > -1) {
            oldHex.tokenIDs.splice(index,1);
            ArrangeTokens(oldHex);
        }
        if (newHex) {
            newHex.tokenIDs.push(unit.id);
            unit.hexLabel = newHex.label;
            unit.location = newHex.centre;
            unit.cube = newHex.cube;
            if (newHex.offboard === true) {
                unit.offboard = true;
            }
            if (newHex.offboard === false) {
                unit.offboard = false;
            }
            ArrangeTokens(newHex);
        }
    }

    const ArrangeTokens = (hex) => {
        let positions = [[],[]]
        if (state.BoB.routEdges[0] === "Left" || state.BoB.routEdges[0] === "None") {
            positions[0] = [[-25,0],[-25,25],[-25,-25]];
            positions[1] = [[25,0],[25,-25],[25,25]];
        }
        if (state.BoB.routEdges[0] === "Right") {
            positions[1] = [[-25,0],[-25,25],[-25,-25]];
            positions[0] = [[25,0],[25,-25],[25,25]];
        }
        if (state.BoB.routEdges[0] === "Top") {
            positions[0] = [[0,-25],[-25,-25],[25,-25]];
            positions[1] = [[0,25],[25,25],[-25,25]];
        }
        if (state.BoB.routEdges[0] === "Bottom") {
            positions[1] = [[0,-25],[-25,-25],[25,-25]];
            positions[0] = [[0,25],[25,25],[-25,25]];
        }
        let pTs = [0,0];
        //remove any unitIDs where token not in hex, and judge if opposing sides
        for (let i=0;i<hex.tokenIDs.length;i++) {
            let tokenID = hex.tokenIDs[i];
            let unit = UnitArray[tokenID];
            if (!unit) {
                hex.tokenIDs.splice(hex.tokenIDs.indexOf(tokenID),1);
            } else {
                pTs[unit.player]++;
            }
        }

        let delta = [0,0];
        let current = [1,1];
        for (let i=0;i<hex.tokenIDs.length;i++) {
            let tokenID = hex.tokenIDs[i];
            let unit = UnitArray[tokenID];
            let p1 = unit.player;
            let p2 = (p1 === 0) ? 1:0;
            if (hex.tokenIDs.length === 1) {
                delta = [0,0];
            } else {
                if (pTs[0] === 0 || pTs[1] === 0) {
                    //only one nation in the hex
                    if (current[p1] < 3) {
                        delta = positions[p1][current[p1]];
                    } else if (current[p1] < 5) {
                        delta = positions[p2][current[p1]-2];
                    }
                } else {
                    //2 nations
                    if (pTs[p1] === 1) {
                        delta = positions[p1][0];
                    } else {
                        delta = positions[p1][current[p1]];
                    }
                }
            }

            unit.token.set({
                left: hex.centre.x + delta[0],
                top: hex.centre.y + delta[1],
            });
            current[p1]++;
        }
    }

    const AddAbility = (abilityName,action,charID) => {
        createObj("ability", {
            name: abilityName,
            characterid: charID,
            action: action,
            istokenaction: true,
        })
    }    


    const AddAbilities = (msg) => {
        if (!msg.selected) {
            sendChat("","No Token Selected");
            return;
        };
        let id = msg.selected[0]._id;
        let unit = UnitArray[id];
        if (!unit) {return};
        let abilityName,action;
        let abilArray = findObjs({_type: "ability", _characterid: unit.charID});

        //clear old abilities
        for(let a=0;a<abilArray.length;a++) {
            abilArray[a].remove();
        } 

        //activate    !Activate;?{Order|Move|Fire|Go on Overwatch|Retreat}
        action = "!Activate;?{Order|";
        if (unit.group === "Infantry") {
            action += "Move|Fire|Go on Overwatch|Retreat";

            if (unit.special.includes("Halftrack Transport")) {
                action += "|Mount or Dismount"
            }
            action += "}";
        }
        if (unit.group === "Gun") {
            action += "Fire|Go on Overwatch";
            if (unit.special.includes("Halftrack Transport")) {
                action += "|Mount"
            }
            action += "}";
        }
        if (unit.group === "Vehicle") {
            action += "Move|Fire|Go on Overwatch}";
        }
        if (unit.group === "Artillery") {
            action += "Fire|Go on Overwatch}";
        }
        if (unit.group === "Aircraft") {
            action = "!Activate;Fire";
        }
        abilityName = "Activate";
        AddAbility(abilityName,action,unit.charID);

        //fire !Fire;@{selected|token_id};@{target|token_id}  
        let weapons = unit.weapons;
        let wn = 1;
        _.each(weapons,weapon => {
            let type = weapon.type;
            if (type === "Reduced") {return};
            if (unit.group === "Artillery") {
                action = "!Fire;@{selected|token_id};Main";
                if (weapon.notes.includes("Smoke")) {
                    action = "!Fire;@{selected|token_id};?{Type|HE,Main|Smoke,Smoke}";
                } 
            } else {
                action =  "!Fire;@{selected|token_id};@{target|token_id};" + type;
            }
            abilityName = wn + ": Fire " + weapon.name;
            if (weapon.name.includes("Bomb")) {
                abilityName = wn + ": Drop " + weapon.name;
            }
            AddAbility(abilityName,action,unit.charID);
            wn++;
        })

        //CP  !SpendCP;@{selected|token_id};?{Spend CP|Increase MP,Move|Act First,First|Increase Final OP Range,Final OP|Increase Prof FP,Prof}
        abilityName = "Spend CP";
        if (unit.group === "Infantry") {
            action = "!SpendCP;@{selected|token_id};?{Spend CP|Increase MP,Move|Act First,First|Increase Final OP Range,Final OP|Increase Prof FP,Prof}";
        }
        if (unit.group === "Vehicle" || unit.group === "Gun" || unit.group === "Artillery" || unit.group === "Aircraft") {
            action = "!SpendCP;@{selected|token_id};?{Spend CP|Act First,First}";
        }
        AddAbility(abilityName,action,unit.charID);

        //tokeninfo
        abilityName = "Info";
        action = "!TokenInfo";
        AddAbility(abilityName,action,unit.charID);


        //LOS
        if (unit.group !== "Aircraft") {
            if (unit.group === "Artillery") {
                abilityName = "Check Spotter";
                action = "!CheckLOS;@{selected|token_id}";
            } else {
                abilityName = "Check LOS";
                action =  "!CheckLOS;@{selected|token_id};@{target|token_id}";
            }
            AddAbility(abilityName,action,unit.charID);
        }
 




        sendChat("","Abilities Added")
    }

    const CreateMarker = (hex,type,cost) => {
        let c = hex.centre;
        let img,width,height,deltaLeft,deltaTop,markerName;
        if (type === "Move") {
            cost = Math.round(cost);
            img = getCleanImgSrc(MoveMarkers[cost]);
            width = 25;
            height = 25;
            deltaLeft = 0;
            deltaTop = 50;
            markerName = "Map Marker";
        }  
        if (type === "Artillery") {
            img = "https://files.d20.io/images/435843856/p3gB7BciMn2bAiWi0Gj0dA/thumb.webm?1743879153";
            width = 140;
            height = 140;
            deltaLeft = 0;
            deltaTop = 0;
            markerName = "Artillery Marker"
        }
        if (type === "Smoke") {
            img = "https://files.d20.io/images/196609276/u8gp3vcjYAunqphuw6tgWw/thumb.png?1611938031";
            width = 140;
            height = 140;
            deltaLeft = 0;
            deltaTop = 0;
            markerName = "Smoke";
        }
        if (type === "Dispersed Smoke") {
            img = "https://files.d20.io/images/196609296/i7Z60RNt9RLwdAuC911UBw/thumb.png?1611938037";
            width = 140;
            height = 140;
            deltaLeft = 0;
            deltaTop = 0;
            markerName = "Dispersed Smoke";
        }


        let newToken = createObj("graphic", {
            left: c.x + deltaLeft,
            top: c.y + deltaTop,
            width: width,
            height: height, 
            name: markerName,
            pageid: Campaign().get("playerpageid"),
            imgsrc: img,
            layer: "map",
        })

        if (newToken) {
            toFront(newToken);
        } 

        return newToken.id;
    }






    const InitializeLocations = () => {
        _.each(UnitArray,unit => {
            unit.startHexLabel = unit.hexLabel;
            unit.startRotation = Angle(unit.token.get("rotation"));
            let move = {
                hexLabel: unit.hexLabel,
                cost: 0,
                rotation: Angle(unit.token.get("rotation")),
                markerID: "",
            }
            unit.moveArray = [move];
        })
    }


    const changeGraphic = (tok,prev) => {
        if (tok.get('subtype') === "token") {
            log(tok.get("name") + " moving in changeGraphic");
            if (tok.get("left") !== prev.left || tok.get("top") !== prev.top || tok.get("rotation") !== prev.rotation) { 
                let unit = UnitArray[tok.id];
                if (!unit) {return};
                let player = unit.player;
                let p2 = (player === 0) ? 1:0;
log(unit.nation)
log(player)

                let closeAssault = false;
                let crushing = false;

                let newLocation = new Point(tok.get("left"),tok.get("top"));
                let newHex = HexMap[newLocation.toOffset().label()];
                let prevHex = HexMap[unit.hexLabel];
                let prevRotation = Angle(prev.rotation);
                let newRotation = Angle(tok.get("rotation"));
                newRotation = parseInt(Math.round(newRotation/60) * 60);
log("Rotation: " + newRotation)
                let movementCost = newHex.movementCost[unit.group];
                let theta = prevHex.cube.angle(newHex.cube);
                theta = Angle(theta - newRotation);
                let distance = newHex.cube.distance(prevHex.cube);
                let unitMovement = unit.movement;
                let unitMovementUsed = unit.moveCost;
                let movementLeft = unitMovement - unitMovementUsed;
                if (tok.get(SM.cpm) === true) {
                    movementLeft++;
                }
                //check if in moveArray
                let concealedRevealed = false;
                let maIndex = unit.moveArray.map(e => e.hexLabel).indexOf(newHex.label);
                if (maIndex > -1) {
                    for (let i=maIndex;i<unit.moveArray.length;i++) {
                        let info = unit.moveArray[i];
                        if (info.flagged === true) {
                            concealedRevealed = true;
                            break;
                        }                            
                    }
                }

                if (state.BoB.turn === 0 || unit.type === "Aircraft" || unit.type === "Artillery" || unit.type === "System") {
                    ChangeHex(unit,newHex);
                    return;
                }
    
                //illegal movement
                let errorMsg;
                if (movementCost === false) {
                    errorMsg = "Unable to Enter That Hex";
                } 
                if (unit.type === "Gun" && newHex.terrain.includes("Building") && uncloaked.includes(unit.id) === false) {
                    errorMsg = "Guns in Buildings cannot change facing";
                }
                if (distance === 1 && maIndex < 0 && unit.group === "Vehicle" && ((theta > 60 && theta < 120) || (theta > 240 && theta < 300))) {
                    errorMsg = "Vehicle must turn";
                }
                if (distance > 0 && unit.group === "Gun") {
                    errorMsg = "Guns cannot move Hexes";
                }
                if (movementCost > movementLeft && maIndex < 0) {
                    //wlll only work for single hex movement
                    //for multi hex, the aStar will adjust the final Hex
                    errorMsg = "Insufficient MP to enter Hex";
                }
                if (concealedRevealed === true) {
                    errorMsg = "Cannot move back to that Hex as Concealed Units were Revealed";
                }
            
                let enemies = {Vehicle: 0,Gun: 0, Infantry: 0};
                let friends = {Vehicle: 0,Gun: 0, Infantry: 0};


                if (newHex.tokenIDs.length > 0) {
                    for (let i=0;i<newHex.tokenIDs.length;i++) {
                        let tid = newHex.tokenIDs[i];
                        if (tid === tok.id) {continue};
                        let possible = UnitArray[tid];
                        if (possible.player === player) {
                            friends[possible.group] += 1;
                        } else {
                            enemies[possible.group] += 1;
                        }
                    }
  
                    if (unit.group === "Infantry") {
                        if ((friends.Infantry + friends.Gun) > 1) {
                            errorMsg = "Will Exceed Stacking";
                        }
                        if (enemies.Vehicle > 0 && enemies.Infantry === 0) {
                            closeAssault = true;
                        }
                    } else if (unit.group === "Gun") {
                        if ((friends.Infantry + friends.Gun) > 1 || friends.Gun > 0) {
                            errorMsg = "Will Exceed Stacking";
                        }
                    } else if (unit.group === "Vehicle") {
                        if (friends.Vehicle > 0 || friends.Gun > 0) {
                            errorMsg = "Will Exceed Stacking";
                        }
                        if (enemies.Vehicle > 0 || enemies.Infantry > 0) {
                            errorMsg = "Cannot End in Hex with Enemy Infantry or Vehicles";
                        }
                        if (enemies.Gun > 0) {
//flesh out


                            crushing = true;
                        }
                    }
                }

                if (errorMsg) {
                    sendChat("",errorMsg);
                    tok.set({
                        left: prev.left,
                        top: prev.top,
                        rotation: prev.rotation,
                    })
                    return;
                }
    
                if (distance === 0) {
                    movementCost = 0;
                    //rotating in place or accidentally 'moved' while selecting
                    if (unit.group === "Infantry" || unit.status === "Concealed") {
                        newRotation = 0;
                    }; 

                    //Guns that are in buildings errored out above, otherwise free to rotate
                    if (unit.group === "Vehicle" || unit.group === "Gun") {
                        //check if accidentally moved, if not then +1 movement point per turn, unless free turn due to reveal conceal or mount/dismount
                        if (prevRotation !== newRotation && uncloaked.includes(unit.id) === false) {
                            let cost = Math.max(1,Math.min(3,Math.floor(Math.abs(newRotation/60 - prevRotation/60))));
                            unit.moveCost += cost;
                            let markerID = CreateMarker(newHex,"Move",unit.moveCost);
                            let move = {
                                hexLabel: newHex.label,
                                mapLabel: newHex.mapLabel,
                                cost: unit.moveCost,
                                rotation: newRotation,
                                markerID: markerID,
                                flagged: false, //no concealment revealed
                            }
                            unit.moveArray.push(move);
                            unit.token.set(SM.rotate,true);
                        }
                    };
                } else {    
                    moveInfo = {
                        prevHex: prevHex,
                        newHex: newHex,
                        unit: unit,
                        maIndex: maIndex,
                        distance: distance,
                        closeAssault: closeAssault,
                        crushing: crushing,
                    }
                    let index = uncloaked.indexOf(unit.id);
                    if (index > -1) {
                        uncloaked.splice(index,1);
                    }
                    //use aStar to determine cost, display markers etc
                    aStar();
                    let finalInfo = unit.moveArray[unit.moveArray.length - 1];
                    newHex = HexMap[finalInfo.hexLabel];
                    newRotation = finalInfo.rotation;
                    unit.moveCost = finalInfo.cost;
                    tok.set(SM.cpm,false);
                }
log("newRotation: " + newRotation)
                if (newRotation) {
                    tok.set("rotation",newRotation);
                }
                ChangeHex(unit,newHex);
                if (unit.moveCost > Math.floor(unit.movement/3)) {
                    tok.set(SM.moved,true);
                    tok.set(SM.rotate,false);
                }

                if (artFire[newHex.label]) {
                    let shooterUnit = UnitArray[artFire[newHex.label]];
                    if (unit.artAttack.includes(shooterUnit.id) === false) {
                        FireInfo = {
                            shooterUnit: shooterUnit,
                            targetUnit: unit,
                            losResult: LOS(shooterUnit,shooterUnit),
                            validResult: ValidTarget(shooterUnit,shooterUnit,"Main"),
                            fireMods: {},
                        }
                        SetupCard(unit.name,"Artillery",unit.nation);
                        outputCard.body.push("Unit Moves into Artillery Barrage");
                        ArtFire2(true);
                        PrintCard();
                    }
                }



    log(unit.moveArray)
    log(unit.moveCost)

                if (closeAssault === true) {
                    CloseAssault();
                }
                if (crushing === true) {
                    Crushing();
                }


            }
        }
    }


    const aStar = () => {
        let startHex = moveInfo.prevHex;
        let goalHex = moveInfo.newHex;
        let unit = moveInfo.unit;
        let maIndex = moveInfo.maIndex;
        let distance = moveInfo.distance;

        let group = DeepCopy(unit.group);
        let movement = unit.movement;
        let moveArray = unit.moveArray; //info on hexes visited this turn
        if (unit.status === "Concealed" && unit.group !== "Gun") {
            //won't be vehicle
            movement = 5; 
            group = "Infantry";
        }
    
        //check if moving back to a prev. hex in moveArray
        if (maIndex > -1) {
            unit.moveCost = moveArray[maIndex].cost;
            //no need to create new markers, but need to remove after index
            for (let i=(maIndex + 1);i<moveArray.length;i++) {
                let markerID = moveArray[i].markerID;
                let marker = findObjs({_type:"graphic", id: markerID})[0];
                if (marker) {
                    marker.remove();
                }
            }
            moveArray.length = (maIndex+1); //0 indexed array
            unit.moveArray = moveArray;
            unit.token.set("rotation",moveArray[maIndex].rotation);
            return;
        }
    
        //if not, find path to goal Hex
        let nodes = 1;
        let explored = [];
        let frontier = [{
            label: startHex.label,
            mapLabel: startHex.mapLabel,
            cost: unit.moveCost,
            estimate: distance, 
            tokenRotation: Angle(unit.token.get("rotation")),
        }];
        
        while (frontier.length > 0) {
            //sort paths in frontier by cost,lowest cost first
            //choose lowest cost path from the frontier
            //if more than one, choose one with highest cost       
            frontier.sort(function(a,b) {
                return a.estimate - b.estimate || b.cost - a.cost; //2nd part used if estimates are same
            })
            let node = frontier.shift();
            let nodeHex = HexMap[node.label];
            nodes++
            //add this node to explored paths
            explored.push(node);
            //if this node reaches goal, end loop
            if (node.label === goalHex.label) {
                break;
            }
            //generate possible next steps
            let next = HexMap[node.label].cube.neighbours();
            //for each possible next step
            for (let i=0;i<next.length;i++) {
                //calculate the cost of the next step 
                //by adding the step's cost to the node's cost
                let stepCube = next[i];
                let rotation = node.tokenRotation;
                let stepHexLabel = stepCube.label();
                let stepHex = HexMap[stepHexLabel];
                if (!stepHex) {continue};
                let costResults = HexCost(stepHex,rotation);
                if (costResults === -1) {continue};
                let stepHexCost = costResults.hexCost;
                rotation = costResults.rotation;
                let cost = stepHexCost + node.cost;
                //check if this step has already been explored
                let isExplored = (explored.find(e=> {
                    return e.label === stepHexLabel
                }));
                //avoid repeated nodes during the calculation of neighbours
                let isFrontier = (frontier.find(e=> {
                    return e.label === stepHexLabel
                }));
                //if this step has not been explored
                if (!isExplored && !isFrontier) {
                    let est = cost + stepHex.cube.distance(goalHex.cube);
                    //add the step to the frontier, using the cost and distance
                    frontier.push({
                        label: stepHex.label,
                        mapLabel: stepHex.mapLabel,
                        cost: cost,
                        estimate: est,
                        tokenRotation: rotation,
                    });
                }
            }
        }
    
        //If there are no paths left to explore or hit target hex
        if (explored.length > 0) {
            array = [];
            results = [];
            explored.sort((a,b) => {
                return b.cost - a.cost;
            })
            let last = explored.shift(); //end hex
            array.push(last);
            let finished = explored.length > 0 ? false:true;
    
            while (finished === false) {
                let lowestCost = last.cost;
                let current = 0;
                for (let i=0;i<explored.length;i++) {
                    let next = explored[i];
                    if (HexMap[next.label].cube.distance(HexMap[last.label].cube) === 1 && next.cost < lowestCost) {
                        lowestCost = next.cost;
                        current = i;
                    }
                }
                last = explored[current];
                explored.splice(current,1);
                array.push(last);
                if (last.label === startHex.label) {
                    finished = true;
                }
            }
            array.reverse();
    
            //redo costs and work out final rotations based on this final path
            //place markers
            //check concealment
            let cost = unit.moveCost;
            let rotation = array[0].tokenRotation;
            let prevHex = HexMap[array[0].label];
            if (unit.moveCost === 0) {
                let markerID = CreateMarker(prevHex,"Move",array[0].cost);
                let move = {
                    hexLabel: array[0].label,
                    mapLabel: array[0].mapLabel,
                    cost: 0,
                    rotation: array[0].tokenRotation,
                    markerID: markerID,
                    flagged: false,
                }
                moveArray.push(move);
            }

            for (let i=1;i<array.length;i++) {
                let nextHex = HexMap[array[i].label];
                let costResults = HexCost(nextHex,rotation);
                let hexCost = costResults.hexCost;
                let init = rotation;
                rotation = costResults.rotation;
                if (cost + hexCost > movement) {
                    break;
                }
                if (init !== rotation && unit.token.get(SM.moved) === false) {
                    unit.token.set(SM.rotate,true);
                } 
                cost += hexCost;
                let markerID = CreateMarker(nextHex,"Move",cost);
                unit.hexLabel = array[i].label;
                let flagged = CheckConcealment(unit);
                let move = {
                    hexLabel: array[i].label,
                    mapLabel: array[i].mapLabel,
                    cost: cost,
                    rotation: rotation,
                    markerID: markerID,
                    flagged: flagged,
                }
                moveArray.push(move);
                lastHex = nextHex;
            }
        } else {
            sendChat("","No Path")
        }
        return;
    }
    
    const HexCost = (currentHex,rotation) => {
        let prevHex = moveInfo.prevHex;
        let unit = moveInfo.unit;
        let group = unit.group;
        let totalDistance = moveInfo.distance;
        let goalHex = moveInfo.newHex;
        let player = unit.player;

        let hexCost = currentHex.movementCost[group];
        if (unit.mounted === true && unit.type === "Gun") {
            hexCost += .5;
        }
log("Initial cost: " + hexCost)
        if (currentHex.terrain.includes("Offboard") || hexCost === false || hexCost === undefined || isNaN(hexCost)) {return -1};
        

        let enemies = {Vehicle: 0,Gun: 0, Infantry: 0};

        if (currentHex.tokenIDs.length > 0) {
            for (let i=0;i<currentHex.tokenIDs.length;i++) {
                let tid = currentHex.tokenIDs[i];
                if (tid === unit.id) {continue};
                let possible = UnitArray[tid];
                if (possible.player !== player) {
                    enemies[possible.group] += 1;
                }
            }
        }

        if (currentHex.tokenIDs.length > 0) {
            if (group === "Infantry" && currentHex.label !== goalHex.label && (enemies.Vehicle > 0 || enemies.Gun > 0 || enemies.Infantry > 0)) {
                return -1;
            }
            if (group === "Vehicle") {   
                if (enemies.Vehicle > 0) {
                    return -1;
                }     
                if (enemies.Gun > 0 || enemies.Infantry > 0) {
                    if (currentHex.label === goalHex.label) {
                        return -1;
                    }
                    for (let i=0;i<currentHex.tokenIDs.length;i++) {
                        let id = currentHex.tokenIDs[i];
                        let uni = UnitArray[id];
                        if (uni.status === "Concealed") {
                            return -1;
                        }
                    }
                }
            }

            if (currentHex.label !== goalHex.label) {
                for (let i=0;i<currentHex.tokenIDs.length;i++) {
                    let unit2 = UnitArray[currentHex.tokenIDs[i]];
                    if (unit2.player !== player) {
                        return -1;
                    }
                }
            } else {
                if (group === "Vehicle") {
                    for (let i=0;i<currentHex.tokenIDs.length;i++) {
                        let unit2 = UnitArray[currentHex.tokenIDs[i]];
                        if (unit2.player !== player && unit2.status === "Concealed") {
                            return -1;
                        }
                    }
                }
            }
        }

        if (artFire[currentHex.label] && totalDistance > 1) {
            //avoid artillery fire unless moving singly
            return -1;
        }



        if (currentHex.elevation > prevHex.elevation) {
            if (group === "Infantry") {hexCost++};
            if (group === "Vehicle") {
                if (currentHex.terrain.includes("Road")) {
                    hexCost += 2;
                } else {
                    hexCost += 4;
                }
            }
        }
    
        //crossing obstacles here
    
        if (group === "Vehicle") {
            let theta = Angle(prevHex.cube.angle(currentHex.cube));
            theta = Angle(theta - rotation);
            if (totalDistance === 1) {
                if (theta >= 120 && theta <= 240) {
log("rear travel")
                    //rear travel of 1, side travel with distance 1 was errored out
                    hexCost *= 4;
               }
            } else if (totalDistance > 1) {
                if (theta > 60 && theta <= 120) {
                    hexCost++;
                    rotation += 60;
                } 
                if (theta >= 240 && theta < 300) {
                    hexCost++;
                    rotation -= 60;
                }
                if (theta > 120 && theta < 180) {
                    hexCost += 2;
                    rotation += 120;
                }
                if (theta >= 180 && theta < 240) {
                    hexCost += 2;
                    rotation -=  120;
                }
            }
        }
log("final hexCost: " + hexCost)

        let results = {
            hexCost: hexCost,
            rotation: rotation,
        }
        return results;
    }

    const destroyGraphic = (tok,prev) => {
        if (tok.get('subtype') === "token") {
            let id = tok.id;
            let unit = UnitArray[id];
            if (unit) {
                delete UnitArray[id];
            }
            let pt = new Point(tok.get("left"),tok.get("top"));
            let cube = pt.toCube();
            let label = cube.label();
            let hex = HexMap[label]
            let index = hex.tokenIDs.indexOf(id);
            if (index > -1) {
                hex.tokenIDs.splice(index,1);
                ArrangeTokens(hex);
            }
        }
    }








    const handleInput = (msg) => {
        if (msg.type !== "api") {
            return;
        }
        let args = msg.content.split(";");
        log(args);
    
        switch(args[0]) {
            case '!Dump':   
                log(pageInfo);
                log("STATE");
                log(state.BoB);
                log("Units");
                log(UnitArray);
                break;
            case '!ClearState':
                ClearState(msg);
                break;
            case '!AddUnits':
                AddUnits(msg);
                break;
            case '!TokenInfo':
                TokenInfo(msg);
                break;
            case '!CheckLOS':
                CheckLOS(msg);
                break;
            case '!Size':
                Size(msg);
                break;
            case '!Move':
                Move(msg);
                break;
            case '!SetupSide':
                SetupSide(msg);
                break;
            case '!SetupSide2':
                SetupSide2(msg);
                break;
            case '!NextPhase':
                NextPhase();
                break;
            case '!Fire':
                Fire(msg);
                break;
            case '!RoutPhase':
                RoutPhase();
                break;
            case '!MeleePhase':
                MeleePhase(msg);
                break;
            case '!ResolveMelee':
                ResolveMelee();
                break;
            case '!CommandPoint':
                CommandPoint(msg);
                break;
            case '!Conceal':
                Conceal(msg);
                break;
            case '!SpendCP':
                SpendCP(msg);
                break;
            case '!CheckStatus':
                CheckStatus(msg);
                break;
            case '!RerollMorale':
                RerollMorale(msg);
                break;
            case '!Activate':
                Activate(msg);
                break;
            case '!HexData':
                HexData(msg);
                break;
            case '!CloseAssault2':
                CloseAssault2(msg);
                break;
            case '!Crushing2':
                Crushing2(msg);
                break; 
            case '!AddAbilities':
                AddAbilities(msg);
                break;
            case '!Mount':
                Mount(msg);
                break;
        }
    };



    const registerEventHandlers = () => {
        on('chat:message', handleInput);
        on('change:graphic',changeGraphic);
        on('destroy:graphic',destroyGraphic);
    };
    on('ready', () => {
        log("===> Band of Brothers <===");
        log("===> Software Version: " + version + " <===")
        LoadPage();
        PlayerIDs();
        DefineHexInfo();
        BuildMap();
        registerEventHandlers();
        sendChat("","API Ready, Map Loaded")
        log("On Ready Done")
    });
    return {
        // Public interface here
    };






})();



