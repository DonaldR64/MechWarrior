const Main = (() => {
    const version = '2026.9.21';
    if (!state.MW) {state.MW = {}};

    const pageInfo = {};
    const rowLabels = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","AA","AB","AC","AD","AE","AF","AG","AH","AI","AJ","AK","AL","AM","AN","AO","AP","AQ","AR","AS","AT","AU","AV","AW","AX","AY","AZ","BA","BB","BC","BD","BE","BF","BG","BH","BI"];

    let HexSize, HexInfo, DIRECTIONS;
    let MapInfo = {};
    let UnitArray = {};

    let rangeBands = {
        Long: 21,
        Medium: 12,
        Short: 3,
    }

    let moveStatuses = {
        "Not Activated": "transparent",
        "Standstill": "#000000",
        "Move": "#00ff00",
        "Sprint": "#ffff00",
        "Jump": "#ff0000",
        "Charge": "#00ffff",
        "Death from Above": "#ff00ff",
    }

    const MoveMarkers = ["https://files.d20.io/images/344441274/R0eEVMFzhYmwv6rigIA7GA/thumb.png?1685718541","https://s3.amazonaws.com/files.d20.io/images/435360245/m3tKJi3Pqb_40g75O6ouSg/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360246/pXI3HBrGMZ05ldDfH-zYCQ/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360229/JKMY922qxhf0E3z1l10jQg/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360228/YDGEQNR_qVFprdHJSjYNPg/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360232/1TysQcieJ5zbgYvXV4pqiA/thumb.png?1743563857","https://s3.amazonaws.com/files.d20.io/images/435360240/KfCmoF5WyWTStCWOTPrkJg/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360230/zjvzMFGWotZUORDeIVXrEw/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360226/-TXBFvMfahwOIjXEuS0mTQ/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360237/gEr7oP4z0ByUKTXpvSHYQQ/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360241/2HAnTYlC0uVR6mqyMoaACA/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360244/CDOLr8RkQ-pPhwjaOHTbEA/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360243/023KSjjB8QHtrMNbuO3ENQ/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360242/xx2msq4HjqRN5dUaPl0vfA/thumb.png?1743563857","https://s3.amazonaws.com/files.d20.io/images/435360236/L-iuGURhzreq2t2mKOj3Qg/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360247/v2Y15K10F2qZK268wPzYyw/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360239/SXny1fVCh5PeYxLGtnoPTA/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360233/EdB3z27csNyykkc2lWTefw/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360227/JpFvEVLKlKV6n6JsE8zrVg/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360234/5b2XrhzPgfgjdoI5y97LnQ/thumb.png?174356385","https://s3.amazonaws.com/files.d20.io/images/435360238/_sWU7YtYJsWT1NZC-wb80Q/thumb.png?1743563857","https://s3.amazonaws.com/files.d20.io/images/435360231/n7HVTuMwWch59Aofq1v96w/thumb.png?1743563856","https://s3.amazonaws.com/files.d20.io/images/435360235/yVtSNUPJOkxq0n2_FknMcA/thumb.png?1743563856"];

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
                    "Northeast": new Cube(1,-1,0),
                    "East": new Cube(1,0,-1),
                    "Southeast": new Cube(0,1,-1),
                    "Southwest": new Cube(-1,1,0),
                    "West": new Cube(-1,0,1),
                    "Northwest": new Cube(0,-1,1),
                },
                halfToggleX: 35 * pageInfo.scale,
                halfToggleY: 0,
            }
            DIRECTIONS = ["Northeast","East","Southeast","Southwest","West","Northwest"];
        } else if (pageInfo.type === "hexr") {
            //Hex H or Flat Topped
            HexInfo = {
                size: HexSize,
                pixelStart: {
                    x: HexSize,
                    y: 35 * pageInfo.scale,
                },
                width: pageInfo.scale*HexSize,
                height: 70  * pageInfo.scale,
                xSpacing: 3/2 * HexSize,
                ySpacing: 70 * pageInfo.scale,
                directions: {
                    "North": new Cube(0, -1, 1),
                    "Northeast": new Cube(1, -1, 0),
                    "Southeast": new Cube(1,0,-1),
                    "South": new Cube(0,1,-1),
                    "Southwest": new Cube(-1,1,0),
                    "Northwest": new Cube(-1,0,1),
                },
                halfToggleX: 0,
                halfToggleY: 35 * pageInfo.scale,
            }
            DIRECTIONS = ["North","Northeast","Southeast","South","Southwest","Northwest"];
        }
    }

    let outputCard = {title: "",subtitle: "",side: "",body: [],buttons: [],};

    const Factions = {
        "ComStar": {
            "image": "https://files.d20.io/images/501598357/Mdio9JvkjVEkngGRJetqPw/thumb.png?1789867196",
            "dice": "White",
            "backgroundColour": "#90D5FF",
            "titlefont": "Anton",
            "fontColour": "#000000",
            "borderColour": "#ff0000",
            "borderStyle": "5px ridge",
            "names": ["Abbey","Abrams","Babcokc","Baker","Bell","Cameron","Carmichael","Davies","Drake","Dundee","Elm","Ferguson","Fischer","Garibaldi","Graham","Hartford","Highfield","Jenkins","Jepsen","Johnson","Kaminski","Kesselring","Lee","Marik","Marshall","Owens","Pascal","Robinson","Schneider","Thornton"],
            "ranks": ["Col. ","Maj. ","Cpt. ","Lt. ","",""],
        },
        "Clan Jade Falcon": {
            "image": "https://files.d20.io/images/501596890/57Ywz8MgvvNqOYv1vL0F0A/thumb.avif?1789866330",
            "dice": "Red",
            "backgroundColour": "#417944",
            "titlefont": "Arial",
            "fontColour": "#FFFFFF",
            "borderColour": "#341F50",
            "borderStyle": "5px double",
            "names": ["Bailey","Binetti","Calbot","Clees","Eodrap","Folker","Hazen","Helmer","Icaza","Isha","Littleton","Loudon","Malthus","Mattlov","Pryde","Roshak","Schtern","Sustan","Thastus","Viola"],
            "ranks": ["Col. ","Cpt. ","Com. ","PC. ","",""],

        },
        "Clan Wolf": {
            "image": "https://files.d20.io/images/501598815/dgUnUmoCtSayZJkw8eMWWA/thumb.avif?1789867478",
            "dice": "Red",
            "backgroundColour": "#ff0000",
            "titlefont": "Arial",
            "fontColour": "#000000",
            "borderColour": "#ff0000",
            "borderStyle": "5px double",
            "names": ["Calvert","Carson","Dernos","Feng","Hoskins","Jennings","Kerensky","Lager","Leroux","Mehta","Meredith","Nygren","Radick","Robbin","Saline","Shaw","Taylor","Torc","Vickers","Ward","Waters"],
            "ranks": ["Col. ","Cpt. ","Com. ","PC. ","",""],
        },
        "Clan Smoke Jaguar": {
            "image": "https://files.d20.io/images/501599772/_FilZT_hOdIB-rL4WUpJLA/thumb.avif?1789868051",
            "dice": "Red",
            "backgroundColour": "#545454",
            "titlefont": "Arial",
            "fontColour": "#ffffff",
            "borderColour": "#545454",
            "borderStyle": "5px double",
            "names": ["Bowen","Canto","Corbett","Dimitrov","Furey","Hoff","Howell","Ismirii","Kotare","Levi","Montezuma","Moon","Osis","Ott","Perez","Rippon","Showers","Stiles","Weaver","Wimmer","Yoshida"],
            "ranks": ["Col. ","Cpt. ","Com. ","PC. ","",""],
        },
        "Northwind Highlanders": {
            "image": "https://files.d20.io/images/501599833/Hx98oLbHV5JRWNLqWet13g/thumb.png?1789868093",
            "dice": "White",
            "backgroundColour": "#0018F9",
            "titlefont": "Arial",
            "fontColour": "#ffffff",
            "borderColour": "#ff0000",
            "borderStyle": "5px double",
            "names": ["Alan","Allistar","Armstrong","Campbell","Cambell-Stewart","Cook","Doohan","Duffy","Evans","Forest","Graham","Henderson","Jacobs","Jaffray","Kirkpatrick","Logan","MacLeod","MacGregor","McHenry","MacIntosh","McCallan","McGraw","Macpherson","Patterson","Reynolds","Roberts","Stirling","Wallace"],
            "ranks": ["Col. ","Maj. ","Cpt. ","Lt. ","",""],
        },





        "Neutral": {
            "image": "",
            "backgroundColour": "#FFFFFF",
            "titlefont": "Arial",
            "fontColour": "#000000",
            "borderColour": "#00FF00",
            "borderStyle": "5px ridge",
            "dice": "White",
        },

    };

    



    //terrain that is single object
    //blockLOS - Semi = semi solid, eg woods, stops after 3, solid = buildings - stops after 1
    //hills are covered by their elevation re blocking LOS


    const TerrainInfo = {
        "Hill 1": {elevation: 1, terrainHeight: 0, moveCost: 1},
        "Hill 2": {elevation: 2, terrainHeight: 0, moveCost: 1},
        "Hill 3": {elevation: 3, terrainHeight: 0, moveCost: 1},
        "Light Woods": {elevation: 0, terrainHeight: 2, moveCost: 2, blockLOS: "Semi", terrainModifier: 1},
        "Heavy Woods": {elevation: 0, terrainHeight: 2, moveCost: 3, blockLOS: "Semi", terrainModifier: 1},
        "Rough": {elevation: 0, terrainHeight: 0, moveCost: 2},
        "Water Depth 0": {elevation: 0, terrainHeight: 0, moveCost: 2, water: true, blockLOS: "Solid"},
        "Water Depth 1": {elevation: 0, terrainHeight: 1, moveCost: 2, water: true, blockLOS: "Solid"},
        "Water Depth 2": {elevation: 0, terrainHeight: 2, moveCost: 2, water: true, blockLOS: "Solid"},




    }


    function getKeyByValue(object, value) {
        return Object.keys(object).find(key => object[key] === value);
    }


    const SM = {
        immobile: "status_interdiction",
    }


    const Capit = (val) => {
        return String(val).charAt(0).toUpperCase() + String(val).slice(1);
    }

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

    const pointInPolygon = (point,vertices) => {
        //evaluate if point is in the polygon
        px = point.x
        py = point.y
        collision = false
        len = vertices.length - 1
        for (let c=0;c<len;c++) {
            vc = vertices[c];
            vn = vertices[c+1]
            if (((vc.y >= py && vn.y < py) || (vc.y < py && vn.y >= py)) && (px < (vn.x-vc.x)*(py-vc.y)/(vn.y-vc.y)+vc.x)) {
                collision = !collision
            }
        }
        return collision
    }

    const translatePoly = (poly) => {
        //translate points in a pathv2 polygon to map points
        let vertices = [];
        let points = JSON.parse(poly.get("points"));
        let centre = new Point(poly.get("x"), poly.get("y"));
        //covert path points from relative coords to actual map coords
        //define 'bounding box;
        let minX = Infinity,minY = Infinity, maxX = 0, maxY = 0;
        _.each(points,pt => {
            minX = Math.min(pt[0],minX);
            minY = Math.min(pt[1],minY);
            maxX = Math.max(pt[0],maxX);
            maxY = Math.max(pt[1],maxY);
        })
        //translate each point back based on centre of box
        let halfW = (maxX - minX)/2 + minX;
        let halfH = (maxY - minY)/2 + minY
        let zeroX = centre.x - halfW;
        let zeroY = centre.y - halfH;
        _.each(points,pt => {
            let x = Math.round(pt[0] + zeroX);
            let y = Math.round(pt[1] + zeroY);
            vertices.push(new Point(x,y));
        })
        return vertices;
    }

    //convert a token to an object with vertices (corners) with final being the first (used for token in token check)
    function tokenVertices(tok) {
      let corners = []
      let tokX = tok.get("left")
      let tokY = tok.get("top")
      let w = tok.get("width")
      let h = tok.get("height")
      let rot = tok.get("rotation") * (Math.PI/180)

      //define the four corners of the target token as new points
          //we will also rotate those corners appropirately around the target tok center
      corners.push(RotatePoint(tokX, tokY, rot, new Point( tokX-w/2, tokY-h/2 )))     //Upper left
      corners.push(RotatePoint(tokX, tokY, rot, new Point( tokX+w/2, tokY-h/2 )))     //Upper right
      corners.push(RotatePoint(tokX, tokY, rot, new Point( tokX+w/2, tokY+h/2 )))     //Lower right
      corners.push(RotatePoint(tokX, tokY, rot, new Point( tokX-w/2, tokY+h/2 )))     //Lower left
      corners.push(RotatePoint(tokX, tokY, rot, new Point( tokX-w/2, tokY-h/2 )))     //Upper left

      return corners
    }

    const polyLine = (vertices,pt1,pt2) => {
        //polygon / line collisions where typically pt1 is shooter and pt2 is target
        let len = (vertices.length - 1);
        let crossings = [];
        //go through each vertices, plus the next to create a line for checking intersection
        for (v=0;v<len;v++) {
            let pt3 = vertices[v];
            let pt4 = vertices[v+1];
            let point = lineLine(pt1,pt2,pt3,pt4);
            if (point) {
                crossings.push(point);
            }
        }
        return crossings;
    }



    function tokenMidPoints(tok) {
        //sends back mid points of longer axis of a token
        let corners = tokenVertices(tok);
        let line = [];
        if (tok.get("height") >= tok.get("width")) {
            line.push(new Point((corners[0].x + corners[1].x)/2,(corners[0].y + corners[1].y)/2));
            line.push(new Point((corners[2].x + corners[3].x)/2,(corners[2].y + corners[3].y)/2))
        } else {
            line.push(new Point((corners[1].x + corners[2].x)/2,(corners[1].y + corners[2].y)/2));
            line.push(new Point((corners[3].x + corners[4].x)/2,(corners[3].y + corners[4].y)/2))
        }
        return line;
    }

    function GetAbsoluteControlPt(controlArray, center, w, h, rot, scaleX, scaleY) {
        let len = controlArray.length;
        let point = new pt(controlArray[len-2], controlArray[len-1]);
        
        //translate relative x,y to actual x,y 
        point.x = scaleX*point.x + center.x - (scaleX * w/2);
        point.y = scaleY*point.y + center.y - (scaleY * h/2);
        
        point = RotatePoint(center.x, center.y, rot, point);
            
        return point;
    }

    function DegreesToRadians(degrees) {
        let pi = Math.PI;
        return degrees * (pi/180);
    }
    
    //cx, cy = coordinates of the center of rotation
    //angle = clockwise rotation angle
    //p = point object
    function RotatePoint(cX,cY,angle, p) {
        //cx, cy = coordinates of the center of rotation
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


    //Retrieve Values from character Sheet Attributes
    const Attribute = (characterID,attributename,max = false) => {
        //Retrieve Values from character Sheet Attributes
        let attributeobj = findObjs({type:'attribute',characterid: characterID, name: attributename})[0]
        let attributevalue = "";
        if (attributeobj && max === false) {
            attributevalue = attributeobj.get('current');
        } else if (attributeobj && max === true) {
            attributevalue = attributeobj.get('max');
        }
        return attributevalue;
    };

    const AttributeID = (characterID,attributename) => {
        let attributeobj = findObjs({type:'attribute',characterid: characterID, name: attributename})[0];
        return attributeobj.get("id");
    }

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

    const AttributeSet = (characterID,attributename,newvalue,max = false) => {
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
        return;
    };

    const DeleteAttribute = (characterID,attributeName) => {
        let attributeObj = findObjs({type:'attribute',characterid: characterID, name: attributeName})[0]
        if (attributeObj) {
            attributeObj.remove();
        }
    }

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
            let q,r;
            if (pageInfo.type === "hex") {
                q = (M.b0 * x + M.b1 * y) / HexInfo.size;
                r = (M.b3 * y) / HexInfo.size;
            } else if (pageInfo.type === "hexr") {
                q = (M.b3 * x) / HexInfo.size;
                r = (M.b1 * x + M.b0 * y) / HexInfo.size;
            }
            let cube = new Cube(q,r,-q-r).round();
            return cube;
        };
        distance(b) {
            return Math.sqrt(((this.x - b.x) * (this.x - b.x)) + ((this.y - b.y) * (this.y - b.y)));
        }
        label() {
            return this.toCube().label();
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
            let q,r;
            if (pageInfo.type === "hex") {
                q = this.col - (this.row - (this.row&1))/2;
                r = this.row;
            } else if (pageInfo.type === "hexr") {
                q = this.col;
                r = this.row - (this.col - (this.col&1))/2;
            }
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

    const Angle = (theta) => {
        while (theta < 0) {
            theta += 360;
        }
        while (theta >= 360) {
            theta -= 360;
        }
        return theta
    }   

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
            //angle between 2 cubes
            let origin = this.toPoint();
            let destifaction = b.toPoint();

            let x = Math.round(origin.x - destifaction.x);
            let y = Math.round(origin.y - destifaction.y);
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
            //returns array of hexes between this hex and hex 'b' excl. hex 'b'
            var N = this.distance(b);
            var a_nudge = new Cube(this.q + 1e-06, this.r + 1e-06, this.s - 2e-06);
            var b_nudge = new Cube(b.q + 1e-06, b.r + 1e-06, b.s - 2e-06);
            var results = [];
            var step = 1.0 / Math.max(N, 1);
            for (var i = 1; i < N; i++) {
                results.push(a_nudge.lerp(b_nudge, step * i).round());
            }
            return results;
        }

        linedraw2(b) {
            //returns array of hexes between this hex and hex 'b' incl. hex 'b', nudging other way from above 
            var N = this.distance(b);
            var a_nudge = new Cube(this.q - 1e-06, this.r - 1e-06, this.s + 2e-06);
            var b_nudge = new Cube(b.q - 1e-06, b.r - 1e-06, b.s + 2e-06);
            var results = [];
            var step = 1.0 / Math.max(N, 1);
            for (var i = 1; i < N; i++) {
                results.push(a_nudge.lerp(b_nudge, step * i).round());
            }
            return results;
        }



        label() {
            let offset = this.toOffset();
            let label = offset.label();
            return label;
        }

        spiralToCube(index) {
            if (index === 0) {
                return this;
            } else {
                let radius = (index === 0) ? 0:Math.floor((Math.sqrt(12 * index - 3) + 3) / 6);
                let startIndex = (radius === 0) ? 0: 1 + 3 * radius * (radius - 1);
                let ring = this.ring(radius);
                let pos = index - startIndex;
                return ring[pos];
            }
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
            let x,y;
            if (pageInfo.type === "hex") {
                x = (M.f0 * this.q + M.f1 * this.r) * HexInfo.size;
                y = 3/2 * this.r * HexInfo.size;
            } else if (pageInfo.type === "hexr") {
                x = 3/2 * this.q * HexInfo.size;
                y = (M.f1 * this.q + M.f0 * this.r) * HexInfo.size;
            }
            x += HexInfo.pixelStart.x;
            y += HexInfo.pixelStart.y;
            let point = new Point(x,y);
            return point;
        }
        toOffset() {
            let col,row;
            if (pageInfo.type === "hex") {
                col = this.q + (this.r - (this.r&1))/2;
                row = this.r;
            } else if (pageInfo.type === "hexr") {
                col = this.q;
                row = this.r + (this.q - (this.q&1))/2;
            }
            let offset = new Offset(col,row);
            return offset;
        }
        whatDirection(b) {
            let delta = new Cube(b.q - this.q,b.r - this.r, b.s - this.s);
            let dir = "Unknown";
            let keys = Object.keys(HexInfo.directions);
            for (let i=0;i<6;i++) {
                let d = HexInfo.directions[keys[i]];
                if (d.q === delta.q && d.r === delta.r && d.s === delta.s) {
                    dir = keys[i];
                }
            }
            return dir
        }

     
    };

    class Hex {
        constructor(point) {
            this.centre = point;
            let offset = point.toOffset();
            this.offset = offset;
            this.terrain = "Open";
            this.tokenIDs = [];
            this.cube = offset.toCube();
            this.label = offset.label();
            this.elevation = 0;
            this.terrainHeight = 0;
            this.building = false;
            this.water = false;
            this.offmap = false;

            this.blockLOS = false;
            this.moveCost = 1;
            this.road = false;
            this.terrainModifier = "";

            HexMap[this.label] = this;
        }

        distance(b) {
            let dist = this.cube.distance(b.cube);
            return dist;
        }




    }

    class Unit {
        constructor(id) {
            let token = findObjs({_type:"graphic", id: id})[0];
            let cube = (new Point(token.get("left"),token.get("top"))).toCube();
            let label = cube.label();
            let charID = token.get("represents");
            let char = getObj("character", charID); 

            let aa = AttributeArray(charID);
  
            this.charName = char.get("name");
            let name = token.get("name");
            if (!name || name === "") {
                name = this.charName;
            }
            this.name = name;
            this.hexLabel = label;

            this.id = id;
            this.charID = charID;
            let faction = aa.faction || "Neutral";
            this.faction = faction;
            let player = (state.MW.factions.indexOf(faction));
            if (player === -1) {
                if (faction === "Neutral") {
                    player = 2
                } else {
                    state.MW.factions.push(faction);
                    player = state.MW.factions.length - 1;
                }
            }
            this.player = player;
            this.token = token;
            this.type = aa.type;
            let heights = {BattleMech: 2};
            this.height = heights[this.type];
    
            this.move = parseInt(aa.move);
            this.moveMax = parseInt(aa.move_max);
            let moveSpecial = [];
            if (aa.movespecial && aa.movespecial.includes("j")) {
                moveSpecial.push("Jump");
            }
            this.moveSpecial = moveSpecial;
            this.jumpMax = aa.jumpmove_max || "";
            this.jumpMove = "";
            if (moveSpecial.includes("Jump")) {
                this.jumpMove = parseInt(aa.jumpmove) || this.move;
            }
            this.tmm = parseInt(aa.tmm) || 0;
            this.tmmMax = parseInt(aa.tmm_max) || 0;
            this.armour = parseInt(aa.armour) || 0;
            this.armourMax = parseInt(aa.armour_max) || 0;
            this.structure = parseInt(aa.structure) || 0;
            this.structureMax = parseInt(aa.structure_max) || 0;



            this.skill = parseInt(aa.skill) || 4;

            let weaponArray = [];
            let unitMaxRange = rangeBands["Short"];
            for (let w=1;w<4;w++) {
                let phrase = "weapon" + w;
                let wEquip = aa[phrase + "equipped"];
                if (wEquip === "Off") {continue};
                let wName = aa[phrase + "name"];
                if (!wName) {continue};
                let wType = aa[phrase + "type"];
                let wShort = aa[phrase + "short"];
                let wMed = aa[phrase + "medium"];
                let wLong = aa[phrase + "long"];
                let wShortMax = aa[phrase + "short_max"];
                let wMedMax = aa[phrase + "medium_max"];
                let wLongMax = aa[phrase + "long_max"];
                let wSpecial = aa[phrase + "special"] || " ";
                wSpecial = wSpecial.split(",").map(e => e.trim());
                let wMaxRange = rangeBands["Short"];
                if (wMedMax > 0) {
                    wMaxRange = rangeBands["Medium"];
                }
                if (wLongMax > 0) {
                     wMaxRange = rangeBands["Long"];
                }
                unitMaxRange = Math.max(unitMaxRange,wMaxRange);
                let info = {
                    name: wName,
                    phrase: phrase,
                    type: wType,
                    short: wShort,
                    shortMax: wShortMax,
                    medium: wMed,
                    mediumMax: wMedMax,
                    long: wLong,
                    longMax: wLongMax,
                    special: wSpecial,
                    maxRange: wMaxRange,
                }
                weaponArray.push(info);
            }
log(weaponArray)
            this.weaponArray = weaponArray;
            this.maxRange = unitMaxRange;

            let index = HexMap[label].tokenIDs.indexOf(id);
            if (index < 0) {
                HexMap[label].tokenIDs.push(id);
            }


            UnitArray[id] = this;    
    
        }


        Facing(b) {
            let facing = "Front";
            let targetArc = "Front";
            let shooterCube = HexMap[this.hexLabel].cube;
            let targetCube = HexMap[b.hexLabel].cube;
            let phi = Angle(shooterCube.angle(targetCube));
            phi = Angle(phi - this.token.get("rotation"));
            if (phi > 90 && phi < 270) {
                facing = "Rear";
            } 
            let gamma = Angle(targetCube.angle(shooterCube));
            gamma = Angle(gamma - b.token.get("rotation"));
            if (gamma >= 150 && gamma <= 210) {
                targetArc = "Rear";
            }
            return {facing: facing, targetArc: targetArc};
        }

        SetStatus(type) {
            this.token.set("aura1_color",moveStatuses[type]);
        }

        GetStatus() {
            let status = getKeyByValue(moveStatuses,this.token.get("aura1_color")) || "Unknown";
            return status;
        }




        Distance(b) {
            return HexMap[this.hexLabel].distance(HexMap[b.hexLabel]) - 1;
        }



    }


    summonToken = function(cID,point,size,rotation = 0,layer = "map",pID = pageInfo.page.get('id')) {
        let character = getObj("character", cID);
        if (!character) {
            sendChat("","No Character")
            return
        }
        let newToken;
        character.get('defaulttoken',function(defaulttoken){
            const dt = JSON.parse(defaulttoken);
            let img = dt.imgsrc || "";
            img = tokenImage(img);
            if(dt && img){
                dt.imgsrc=img;
                dt.left=point.x;
                dt.top=point.y;
                dt.rotation = rotation;
                dt.pageid = pID;
                dt.layer = layer;
                dt.width = size.w;
                dt.height = size.h;
                newToken = createObj("graphic", dt);
            } else {
                sendChat('','/w gm Cannot create token for <b>'+character.get('name')+'</b>');
            }
        });
        return newToken;
    }

    const AddAbility = (abilityName,action,characterID) => {
        let newObj = createObj("ability", {
            name: abilityName,
            characterid: characterID,
            action: action,
            istokenaction: true,
        })
        if (newObj) {return newObj.id};
    }    

    const AddAbilities = (unit) => {
        let abilityName,action;
        let abilArray = findObjs({_type: "ability", _characterid: unit.charID});
        //clear old abilities
        for(let a=0;a<abilArray.length;a++) {
            abilArray[a].remove();
        } 
        
        //movement/activation
        abilityName = "0: Activate";
        action = "!Activate;?{Order|Standstill|Move|Sprint|Charge";
        if (unit.moveSpecial.includes("Jump")) {
            action += "|Jump|Death from Above";
        }
        action += "}";
        AddAbility(abilityName,action,unit.charID);

        let w = 1;
        for (let i=0;i<unit.weaponArray.length;i++) {
            let weapon = unit.weaponArray[i];
            let abilityName = w + ": " + weapon.name;
            let action = "!Fire;@{selected|token_id};@{target|token_id};" + i;
            let special = weapon.special;
            if (special.includes("Indirect Fire")) {
                action += ";?{Aim|Direct|Indirect}";
            }
            let ov = special.find(e => e.includes("Overheat"));
            if (ov) {
                ov = ov.replace(/[^\d]/g,"");
                ovH = "";
                for (let o=0;o<=ov;o++) {
                    ovH += o + "|";
                }
                action += ";?{Overheat Points|" + ovH + "}";
            }




            AddAbility(abilityName,action,unit.charID);

        }



    }



    const InlineButtons = (array) => {
        let output = "";
        for (let i=0;i<array.length;i++) {
            let info = array[i];
            let inline = true;
            if (i>0 && inline === false) {
                output += '<hr style="width:95%; align:center; margin:0px 0px 5px 5px; border-top:2px solid $1;">';
            }
            let out = "";
            let borderColour = Factions[outputCard.side].borderColour;
            if (inline === false || i===0) {
                out += `<div style="display: table-row; background: #FFFFFF;; ">`;
                out += `<div style="display: table-cell; padding: 0px 0px; font-family: Arial; font-style: normal; font-weight: normal; font-size: 14px; `;
                out += `"><span style="line-height: normal; color: #000000; `;
                out += `"> <div style='text-align: center; display:block;'>`;
            }
            if (inline === true) {
                out += '<span>     </span>';
            }
            out += `<a style ="background-color: ` + Factions[outputCard.side].backgroundColour + `; padding: 5px;`
            out += `color: ` + Factions[outputCard.side].fontColour + `; text-align: center; vertical-align: middle; border-radius: 5px;`;
            out += `border-color: ` + borderColour + `; font-family: Tahoma; font-size: x-small; `;
            out += `"href = "` + info.action + `">` + info.phrase + `</a>`
            
            if (inline === false || i === (array.length - 1)) {
                out += `</div></span></div></div>`;
            }
            output += out;
        }
        return output;
    }

    const ButtonInfo = (phrase,action,inline = false) => {
        //inline - has to be true in any buttons to have them in same line -  starting one to ending one
        let info = {
            phrase: phrase,
            action: action,
            inline: inline,
        }
        outputCard.buttons.push(info);
    };

    const SetupCard = (title,subtitle,side) => {
        outputCard.title = title;
        outputCard.subtitle = subtitle;
        outputCard.side = side;
        outputCard.body = [];
        outputCard.buttons = [];
        outputCard.inline = [];
    };

    const DisplayDice = (roll,faction,size) => {
        roll = roll.toString();
        tablename = faction;
        if (Factions[faction]) {
            tablename = Factions[faction].dice
        }
        let table = findObjs({type:'rollabletable', name: tablename})[0];
        if (!table) {
            table = findObjs({type:'rollabletable', name: "Neutral"})[0];
        }
        let obj = findObjs({type:'tableitem', _rollabletableid: table.id, name: roll })[0];   
        if (!obj) {return "NA"}
        let avatar = obj.get('avatar');
        let out = "<img width = "+ size + " height = " + size + " src=" + avatar + "></img>";
        return out;
    };

    const PrintCard = (id) => {
        let output = "";
        if (id) {
            let playerObj = findObjs({type: 'player',id: id})[0];
            let who = playerObj.get("displayname");
            output += `/w "${who}"`;
        } else {
            output += "/desc ";
        }

        if (!outputCard.side || !Factions[outputCard.side]) {
            outputCard.side = "Neutral";
        }

        //start of card
        output += `<div style="display: table; border: ` + Factions[outputCard.side].borderStyle + " " + Factions[outputCard.side].borderColour + `; `;
        output += `background-color: #EEEEEE; width: 100%; text-align: center; `;
        output += `border-radius: 1px; border-collapse: separate; box-shadow: 5px 3px 3px 0px #aaa;;`;
        output += `"><div style="display: table-header-group; `;
        output += `background-color: ` + Factions[outputCard.side].backgroundColour + `; `;
        output += `background-image: url(` + Factions[outputCard.side].image + `), url(` + Factions[outputCard.side].image + `); `;
        output += `background-position: left,right; background-repeat: no-repeat, no-repeat; background-size: contain, contain; align: center,center; `;
        output += `border-bottom: 2px solid #444444; "><div style="display: table-row;"><div style="display: table-cell; padding: 2px 2px; text-align: center;"><span style="`;
        output += `font-family: ` + Factions[outputCard.side].titlefont + `; `;
        output += `font-style: normal; `;

        let titlefontsize = "1.4em";
        if (outputCard.title.length > 12) {
            titlefontsize = "1em";
        }

        output += `font-size: ` + titlefontsize + `; `;
        output += `line-height: 1.2em; font-weight: strong; `;
        output += `color: ` + Factions[outputCard.side].fontColour + `; `;
        output += `text-shadow: none; `;
        output += `">`+ outputCard.title + `</span><br /><span style="`;
        output += `font-family: Arial; font-variant: normal; font-size: 13px; font-style: normal; font-weight: bold; `;
        output += `color: ` +  Factions[outputCard.side].fontColour + `; `;
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
                    out += `<a style ="background-color: ` + Factions[outputCard.side].backgroundColour + `; padding: 5px;`
                    out += `color: ` + Factions[outputCard.side].fontColour + `; text-align: center; vertical-align: middle; border-radius: 5px;`;
                    out += `border-color: ` + Factions[outputCard.side].borderColour + `; font-family: Tahoma; font-size: x-small; `;
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
                    if (Factions[fac]) {
                        lineBack = Factions[fac].backgroundColour;
                        fontcolour = Factions[fac].fontColour;
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
                let borderColour = Factions[outputCard.side].borderColour;
                
                if (inline === false || i===0) {
                    out += `<div style="display: table-row; background: #FFFFFF;; ">`;
                    out += `<div style="display: table-cell; padding: 0px 0px; font-family: Arial; font-style: normal; font-weight: normal; font-size: 14px; `;
                    out += `"><span style="line-height: normal; color: #000000; `;
                    out += `"> <div style='text-align: center; display:block;'>`;
                }
                if (inline === true) {
                    out += '<span>     </span>';
                }
                out += `<a style ="background-color: ` + Factions[outputCard.side].backgroundColour + `; padding: 5px;`
                out += `color: ` + Factions[outputCard.side].fontColour + `; text-align: center; vertical-align: middle; border-radius: 5px;`;
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
        outputCard = {title: "",subtitle: "",side: "",body: [],buttons: [],};
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

log(pageInfo.page)

    }

    const BuildMap = () => {
        let startTime = Date.now();
        HexMap = {};

        let startX = HexInfo.pixelStart.x;
        let startY = HexInfo.pixelStart.y;
        let halfToggleX = HexInfo.halfToggleX;
        let halfToggleY = HexInfo.halfToggleY;
        if (pageInfo.type === "hex") {
            for (let j = startY; j <= pageInfo.height;j+=HexInfo.ySpacing){
                for (let i = startX;i<= pageInfo.width;i+=HexInfo.xSpacing) {
                    let point = new Point(i,j);     
                    let hex = new Hex(point);
                }
                startX += halfToggleX;
                halfToggleX = -halfToggleX;
            }
        } else if (pageInfo.type === "hexr") {
            for (let i=startX;i<=pageInfo.width;i+=HexInfo.xSpacing) {
                for (let j=startY;j<=pageInfo.height;j+=HexInfo.ySpacing) {
                    let point = new Point(i,j);     
                    let hex = new Hex(point);
                }
                startY += halfToggleY;
                halfToggleY = -halfToggleY;
            }
        }
        AddTerrain();    
        AddTokens();
        DefineMap();
        let elapsed = Date.now()-startTime;
        log("Hex Map Built in " + elapsed/1000 + " seconds");
    };

    const DefineMap = () => {
        let map = findObjs({_type: "graphic",_subtype: "token",layer: "map"}).filter((e) => e.get("name").includes("Map"))[0];
        let w = map.get("width")/2;
        let h = map.get("height")/2;
        let x = map.get("left");
        let y = map.get("top");
        MapInfo.top = new Point(x-w,y-h);
        MapInfo.bottom = new Point(x+w,y+h);
        MapInfo.centre = new Point(x,y);
        _.each(HexMap,hex => {
            let pt = hex.centre;
            if (pt.x < MapInfo.top.x || pt.y < MapInfo.top.y || pt.x > MapInfo.bottom.x || pt.y > MapInfo.bottom.y) {
                hex.offmap = true;
            }
        })
    }
     
    const AddTokens = () => {
        UnitArray = {};
        //create an array of all tokens
        let tokens = findObjs({
            _pageid: Campaign().get("playerpageid"),
            _type: "graphic",
            _subtype: "token",
            layer: "objects",
        });
        
        let s = 0;
        tokens.forEach((token) => {
            let character = getObj("character", token.get("represents"));   
            if (character) {
                let unit = new Unit(token.get("id"));
                s++;
            }
        });


        log(s + " Units added to Array");

    }


    const AddTerrain = () => {
        let start = Date.now();

        let waterTokens = [];
        //Add Token Terrain, Building might be multihex
        let tokens = findObjs({_pageid: Campaign().get("playerpageid"),_type: "graphic",_subtype: "token",layer: "map",});

        _.each(tokens,token => {
            let name = token.get("name") || " ";
            if (name.includes("Map")) {
                return;
            }
            name = name.split("//")[0].trim();
            let terrain = TerrainInfo[name];
            if (terrain) {
                let centre = new Point(token.get("left"),token.get('top'));
                let label = centre.toCube().label()
                let hex = HexMap[label];
                if (hex) {
                    if (hex.terrain === "Open") {
                        hex.terrain = name;
                    } else {
                        hex.terrain += ", " + name;
                    }
                    if (terrain.blockLOS !== false) {
                        hex.blockLOS = terrain.blockLOS;
                    }
                    hex.elevation = terrain.elevation;
                    hex.terrainHeight = Math.max(terrain.terrainHeight,hex.terrainHeight);
                    hex.moveCost = Math.max(terrain.moveCost,hex.moveCost);
                    if (terrain.terrainModifier) {
                        hex.terrainModifier = terrain.terrainModifier;
                    }
                    //buildings
                    if (terrain.building === true) {
                        hex.building = true;

                    }
                    //water - see below
                    if (terrain.water === true) {
                        waterTokens.push(token);
                    }
                }
            }

        });

        _.each(waterTokens, token => {
            let name = token.get("name") || " ";
            name = name.split("//")[0].trim();
            let terrain = TerrainInfo[name];
            let centre = new Point(token.get("left"),token.get('top'));
            let label = centre.toCube().label()
            let hex = HexMap[label];
            HexMap[label].elevation -= terrain.terrainHeight;
            hex.water = true;
        })

    
/*



        //Roads
//roads will allow movement to ignore 

        _.each(paths,path => {
            if (path.get("stroke").toLowerCase() === "#ffffff") {
                let vertices = translatePoly(path);
                for (let i=0;i<(vertices.length -1);i++) {
                    let pt1 = vertices[i];
                    let pt2 = vertices[i+1];
                    let hex1 = HexMap[pt1.label()];
                    let hex2 = HexMap[pt2.label()];
                    hex1.type += ",Road";
                    hex2.type += ",Road";
                    let interCubes = hex1.cube.linedraw(hex2.cube);
                    _.each(interCubes,cube => {
                        let hex3 = HexMap[cube.label()];
                        hex3.type += ",Road";
                    })
                }
            }   
        })
*/


        let elapsed = Date.now()-start;
        log(`Terrain added in ${elapsed/1000} seconds`);

    }





    const stringGen = () => {
        let text = "";
        let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < 6; i++) {
            text += possible.charAt(Math.floor(randomInteger(possible.length)));
        }
        return text;
    };





    const RemoveLines2 = () => {
            RemoveLines()
    }


    const RemoveLines = (which = ["LOS","Deploy"]) => {
        _.each(which,lines => {
            let array;
            if (lines === "LOS") {
                array = state.MW.losLines;
            }
            if (lines === "Deploy") {
                array = state.MW.deployLines;
            }
            if (array) {
                for (let i=0;i<array.length;i++) {
                    let id = array[i];
                    let path = findObjs({_type: "pathv2", id: id})[0];
                    if (path) {
                        path.remove();
                    }
                }
                array = [];
            }
        })
    }


    const DrawLine = (set,colour = "#ff0000",type = "Deploy") => {
        let a = set[0],b = set[1];
        //define centre, then a and b change into points
        let left = Math.min(a[0],b[0]);
        let bottom = Math.min(a[1],b[1]);
        let x = Math.abs(a[0] - b[0])/2 + left;
        let y = Math.abs(a[1] - b[1])/2 + bottom;
        let points = [];
        points.push([a[0] - left,a[1] - bottom]);
        points.push([b[0] - left,b[1] - bottom]);
        points = JSON.stringify(points);

        let layer = (type === "LOS") ? "map":"map";

        let page = getObj('page',Campaign().get('playerpageid'));
        
        if(page) {
            let line = createObj('pathv2',{
                layer: layer,
                pageid: page.id,
                shape: "pol",
                stroke: colour,
                stroke_width: 7,
                x: x,
                y: y,
                points: points,
            });
            if (line) {
                toFront(line);
                if (type === "LOS") {
                    state.MW.losLines.push(line.get("id"))
                } else {
                    state.MW.deployLines.push(line.get("id"));
                }
            }
        }
    }


    const TokenInfo = (msg) => {
        if (!msg.selected) {
            sendChat("","Select a Token First");
            return;
        }
        let unit = UnitArray[msg.selected[0]._id];
        if (!unit) {
            sendChat("","Not in UnitArray");
            return;
        };
        let label = unit.hexLabel;
        let hex = HexMap[label];
        SetupCard(unit.name,"Info",unit.faction);

        outputCard.body.push("Hex Label: " + label);
        if (hex.offmap === true) {
            outputCard.body.push("Unit is Off Map");
        } else {
            outputCard.body.push("Hex Elevation: " + hex.elevation);
            outputCard.body.push("Terrain: " + hex.terrain);
            if (hex.terrainHeight > 0) {
                outputCard.body.push("Terrain Height: " + hex.terrainHeight);
            }

            outputCard.body.push("Move Cost: " + hex.moveCost);
            if (hex.blockLOS !== false) {
                outputCard.body.push("Affects LOS as " + hex.blockLOS);
            }
            if (hex.cover === true) {
                outputCard.body.push("Hex gives Cover");
            }
        }




        PrintCard();
    }

    const RollDice = (msg) => {
        PlaySound("Dice");
        let roll = randomInteger(6);
        let playerID = msg.playerid;
        let id,unit,player;
        if (msg.selected) {
            id = msg.selected[0]._id;
        }
        let faction = "Neutral";

        if (!id && !playerID) {
            return;
        }
        if (id) {
            unit = UnitArray[id];
            if (unit) {
                faction = unit.faction;
                player = unit.player;
            }
        }
        if ((!id || !unit) && playerID) {
            faction = state.MW.players[playerID];
            player = (state.MW.faction[0] === faction) ? 0:1;
        }

        if (!state.MW.players[playerID] || state.MW.players[playerID] === undefined) {
            if (faction !== "Neutral") {    
                state.MW.players[playerID] = faction;
            } else {
                sendChat("","Click on one of your tokens then select Roll again");
                return;
            }
        } 
        let res = "/direct " + DisplayDice(roll,faction,40);
        sendChat("player|" + playerID,res);
    }


    function getKeyByValue(object, value) {
        return Object.keys(object).find(key => object[key] === value);
    }


    const ClearState = () => {
        LoadPage();
        RemoveDead();
        RemoveMoveMarkers();
        BuildMap();

        //clear arrays
        UnitArray = {};

        state.MW = {
            players: {},
            factions: [],
            turn: 0,
            phase: "End",
            initiativePlayer: 2,
            losLines: [],
            moveMarkers: [],
        }
        sendChat("","Cleared State/Arrays");
    }


    const RemoveDead = () => {
        let tokens = findObjs({_pageid: Campaign().get("playerpageid"),_type: "graphic",_subtype: "token",layer: "map",});
        _.each(tokens,token => {
            if (token.get("status_dead") === true) {
                token.remove();
            }
            if (token.get("name") === "Map Marker") {
                token.remove();
            }
        })
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

    const CheckLOS = (msg) => {
        let Tag = msg.content.split(";");
        let shooter = UnitArray[Tag[1]];
        let target = UnitArray[Tag[2]];

        if (!shooter) {
            sendChat("","Not valid shooter");
            return;
        }
        if (!target) {
            sendChat("","Not valid target");
            return;
        }
        if (shooter.id == target.id) {
            sendChat("","Selected Same Token");
            return;
        }
        SetupCard(shooter.name,"Line of Sight",shooter.faction);

        let losResult = LOS(shooter,target);
        outputCard.body.push("Distance: " + losResult.distance + " hexes");
        outputCard.body.push("[hr]");
        if (losResult.los === false) {
            outputCard.body.push("No LOS due to " + losResult.reason + " at " + losResult.losBlockedAt);
        } else {
            outputCard.body.push("Target is in LOS");
            if (losResult.partial === true) {
                outputCard.body.push("Target has Partial Cover +1");
            }
            if (losResult.terrainModifier !== 0) {
                outputCard.body.push("Target has a Terrain Modifier of +" + losResult.terrainModifier);
            }
            if (losResult.underwater === true) {
                outputCard.body.push("Both are Underwater");
            }
        }
        let facings = losResult.facings;
        outputCard.body.push("Target is in the " + facings.facing + " Facing");
        outputCard.body.push("Target is being hit on the " + facings.targetArc + " Armour");
        PrintCard();
    }

    const LOS = (shooter,target) => {
        let shooterHex = HexMap[shooter.hexLabel];
        let targetHex = HexMap[target.hexLabel];
        let distance = shooter.Distance(target);
        //bring the bases to whichever is lower
        let baseElevation = Math.min(shooterHex.elevation,targetHex.elevation);
        let shooterElevation = shooterHex.elevation - baseElevation;
        if (shooterHex.building === true && shooter.type === "BattleMech") {
            shooterElevation += shooterHex.terrainHeight;
        }
        let shooterHeight = shooterElevation + shooter.height;
        let targetElevation = targetHex.elevation - baseElevation;
        if (targetHex.building === true && target.type === "BattleMech") {
            targetElevation += targetHex.terrainHeight;
        }
        let targetHeight = targetElevation + target.height;

        let interCubes = [shooterHex.cube.linedraw(targetHex.cube),shooterHex.cube.linedraw2(targetHex.cube)];
        let interLabels = [interCubes[0].map((e)=> e.label()), interCubes[1].map((e)=> e.label())];
        let len = interLabels[0].length;

log("S: " + shooterHeight)
log("T: " + targetHeight)


        let terrainModifier = 0; 
        let partial = false;
        let losBlockedAt = false, losReason = false;
        let visibleSides = 0;
        let underwater = false;
        if (targetHex.water === true) {
            if (targetHex.terrainHeight < target.height) {
                partial = true;
            } else {
                if (shooterHex.water === true && shooterHex.terrainHeight > shooter.height) {
                    underwater = true;
                } else {
                    let result = {
                        distance: distance,
                        los: false,
                        reason: "Target is Completely Underwater",
                        losBlockedAt: targetHex.label,
                        partial: false,
                        terrainModifier: 0,
                        facings: shooter.Facing(target),
                    }
                    return result;
                }
            }
        }

        for (let side=0;side<2;side++) {
            let semi = 0;
            let losSide = true;
log("Side: " + side)
            interHexLoop:
            for (let i=0;i<len;i++) {
                let label = interLabels[side][i];
                let interHex = HexMap[label];

log(i + ": " + label)
log(interHex)
                //hills
                let ihElevation = interHex.elevation - baseElevation;
                if (ihElevation >= shooterHeight && ihElevation >= targetHeight) {
                    losBlockedAt = label;
                    losReason = "Hill";
                    losSide = false;
                    break interHexLoop;
                }
                if (i===0 && ihElevation >= shooterHeight) {
                    losBlockedAt = label;
                    losReason = "Hill";
                    losSide = false;
                    break interHexLoop;
                }
                if (i === (len-1) && ihElevation >= targetHeight) {
                    losBlockedAt = label;
                    losReason = "Hill";
                    losBlockedAt.push(label);
                    losSide = false;
                    break interHexLoop;
                }


                //terrain
                if (interHex.terrainHeight > 0) {
                    let intervening = false;
                    let ihTH = ihElevation + interHex.terrainHeight;
log("ihTH: " + ihTH)
                    if (ihTH >= shooterHeight && ihTH >= targetHeight) {
                        intervening = true;
                    }
                    if (i===0 && ihTH >= shooterHeight) {
                        intervening = true;
                    }
                    if (i === (len-1) && ihTH >= targetHeight) {
                        intervening = true;
                    }
log("Intervening: " + intervening)
                    if (intervening === true) {
                        if (interHex.blockLOS === "Solid") {
                            losBlockedAt = label;
                            losReason = interHex.terrain;
                            losSide = false;
                            break interHexLoop ;
                        }
                        if (interHex.blockLOS === "Semi") {
                            semi++;
                            if (semi > 3) {
                                losBlockedAt = label;
                                losReason = "> 3 Hexes Woods";
                                losSide = false;
                                break interHexLoop;
                            }
                        }
                        terrainModifier = Math.max(terrainModifier,interHex.terrainModifier);
                    }
                }

                //final interHex - partial cover
                if (i === (len-1)) {
                    if ((ihElevation - targetElevation) === 1 && shooterHeight <= targetHeight && target.type === "BattleMech") {
                        partial = true;
                    }
                }


            }
            if (losSide === true) {
                visibleSides++;
            }
        }

        if (visibleSides === 1) {
            partial = true;
        } 
        if (visibleSides === 0) {
            finalLOS = false;
        } else {
            finalLOS = true;
        }

        let result = {
            distance: distance,
            los: finalLOS,
            reason: losReason,
            losBlockedAt: losBlockedAt,
            partial: partial,
            terrainModifier: terrainModifier,
            underwater: underwater, //true or false if both underwater
            facings: shooter.Facing(target),
        }

        return result;
    }



    const ErrorMsg = (msgs) => {
        if (msgs.length === 0) {return false};
        _.each(msgs,msg => {
            outputCard.body.push(msg);
        })
        return true;
    }


    const NextPhase = () => {
        let currentPhase = state.MW.phase;
        let currentTurn = state.MW.turn;

        if (currentTurn === 0) {
            //placeholder


        }
log(currentPhase)
        let phases = ["Movement","Combat","End"];
        let phaseNum = phases.indexOf(currentPhase);
        phaseNum++;
        if (phaseNum >= phases.length) {
            phaseNum = 0
            currentTurn++;
        };
        currentPhase = phases[phaseNum];

        state.MW.phase = currentPhase;
        state.MW.turn = currentTurn;

        RemoveMoveMarkers();

log(currentPhase)
        switch(currentPhase) {
            case 'Movement': 
                Movement();
                break;
            case 'Combat':
                Combat();
                break;
            case 'End':
                End();
                break;
        }
    }


    const Movement = () => {
        let rolls = [[],[]];
        let totals = [0,0];
        for (let p=0;p<2;p++) {
            for (let d=0;d<2;d++) {
                let roll = randomInteger(6);
                totals[p] += roll;
                rolls[p].push(DisplayDice(roll,state.MW.factions[p],24));
            }
        }
        let winner = 2;
        if (totals[0] === totals[1]) {
            if (state.MW.initiativePlayer === 2) {
                winner = randomInteger(2);
            } else {
                winner = (state.MW.initiativePlayer === 0) ? 1:0;
            }
        } else {
            if (totals[0] > totals[1]) {
                winner = 0;
            } else {
                winner = 1;
            }
        }
        let loser = winner === 0 ? 1:0;
        SetupCard("Movement","Turn " + state.MW.turn,state.MW.factions[winner]);
        for (let i=0;i<2;i++) {
            outputCard.body.push(state.MW.factions[i] + ": " + rolls[i]);
        }
        outputCard.body.push("[hr]");
        outputCard.body.push(state.MW.factions[loser] + " activates and moves a Unit first");

        let unitNumbers = [0,0];
        _.each(UnitArray,unit => {
            unitNumbers[unit.player]++;
            unit.SetStatus("Not Activated");
        })


        outputCard.body.push("When both players have completed all their movement, Select Next Phase");
        PrintCard();
    }

    const Combat = () => {
        //when start, set all transparent auras to black ie standstill
        //non-initiative player attacks with all theirs, change auras to clear when done attack
        //then initiative player
        //apply resutls though in end phase




    }


    const End = () => {
        //apply damage, heat
        //victory conditions



    }


    const Activate = (msg) => {
        RemoveMoveMarkers();
        let id = msg.selected[0]._id;
        let unit = UnitArray[id];
        let Tag = msg.content.split(";");
        let order = Tag[1]; //Standstill, Move, Sprint, Jump
        SetupCard(unit.name,order,unit.faction);
        unit.startHexLabel = unit.hexLabel;

        let hex = HexMap[unit.hexLabel];
        if (hex.water === true && hex.terrainHeight > 0 && (order === "Jump" || order === "Death from Above") ) {
            outputCard.body.push("Unit cannot Jump from Water Depths 1+");
            PrintCard();
            return;
        }

        let move = unit.move;
        let jumpMove = unit.jumpMove || 0;
        if (move === 0) {
            order = "Standstill";
            outputCard.subtitle = "Standstill";
        }

        unit.SetStatus(order)
        if (order === "Standstill") {
            outputCard.body.push("The Mech can turn to face any direction, staying in the same hex");
            outputCard.body.push("The Mech can Attack.")
        }
        if (order === "Move") {
            outputCard.body.push("The Mech has " + move + " MP");
            outputCard.body.push("The Mech can turn to face any direction");
            outputCard.body.push("The Mech can Attack");
        }
        if (order === "Sprint") {
            move = Math.round(move * 1.5);
            outputCard.body.push("The Mech has " + move + " MP");;
            outputCard.body.push("The Mech can turn to face any direction");
            outputCard.body.push("The Mech cannot Attack");
        }
        if (order === "Jump") {
            outputCard.body.push("The Mech has " + jumpMove + " MP");;
            outputCard.body.push("It will ignore Terrain Costs");
            outputCard.body.push("It can jump " + Math.floor(jumpMove/2) + " levels high");
            outputCard.body.push("Movement must be in a Straight Line, but the Mech can turn to face any direction at the end");
            outputCard.body.push("The Mech can Attack");
        }
        if (order === "Charge") {
            outputCard.body.push("The Mech has " + move + " MP");;
            outputCard.body.push("The Mech must end facing the target");
            outputCard.body.push("In the Attack Phase the Mech may do a Ram attack");
        }
        if (order === "Death from Above") {
            outputCard.body.push("The Mech has " + jumpMove + " MP");;
            outputCard.body.push("It will ignore Terrain Costs");
            outputCard.body.push("It can jump over " + Math.floor(jumpMove/2) + " levels");
            outputCard.body.push("Movement must be in a Straight Line towards the target, the Mech must end facing the target");
            outputCard.body.push("In the Attack Phase the Mech may do a Death from Above attack");
        }


        //workout next activating player
        let nextPlayer = unit.player === 0 ? 1:0;
        let togo = [0,0];
        _.each(UnitArray,unit2 => {
            if (unit2.GetStatus() === "Not Activated") {
                togo[unit2.player]++;
            }
        })
        if (togo[unit.player] > 0 && togo[unit.player] >= (2 * togo[nextPlayer])) {
            outputCard.body.push("[hr]");
            outputCard.body.push("Another Unit from this Faction should Move next");
        }
        if (togo[unit.player] === 0 && togo[nextPlayer] === 0) {
            outputCard.body.push("[hr]");
            outputCard.body.push("After this Unit has finished its movement, can proceed to the Combat Phase");
        }

        PrintCard();


    }


    const SetGame = () => {
        ClearState();
        let tokens = findObjs({
            _pageid: Campaign().get("playerpageid"),
            _type: "graphic",
            _subtype: "token",
            layer: "objects",
        });
        
        tokens.forEach((token) => {
            let character = getObj("character", token.get("represents"));   
            if (character) {
                let unit = new Unit(token.get("id"));
                AddAbilities(unit);

                unit.SetStatus("Not Activated");
                unit.token.set({
                    aura1_color: "transparent",
                    aura1_radius: .1,
                    aura1_options: "hex",
                });
            }
        });

        let names = [DeepCopy(Factions[state.MW.factions[0]].names), DeepCopy(Factions[state.MW.factions[1]].names)];

        _.each(UnitArray, unit => {
            let skill = unit.skill;
            let rank = Factions[unit.faction].ranks[skill];
            let index = randomInteger(names[unit.player].length) - 1;
            let name = names[unit.player].splice(index,1);
            name = rank + name;
            unit.name = name;
            unit.token.set("name",name);
            unit.startHexLabel = unit.hexLabel;
            for (let i=0;i<unit.weaponArray.length;i++) {
                let weapon = unit.weaponArray[i];
                weapon.short = weapon.shortMax;
                weapon.medium = weapon.mediumMax;
                weapon.long = weapon.longMax;
                AttributeSet(unit.charID,weapon.phrase + "short",weapon.shortMax);
                AttributeSet(unit.charID,weapon.phrase + "medium",weapon.mediumMax);
                AttributeSet(unit.charID,weapon.phrase + "long",weapon.longMax);
            }
            log("Set")
            log(unit.weaponArray)
            AttributeSet(unit.charID,"enginecrit",0);
            AttributeSet(unit.charID,"mpcritlevel",0);
            AttributeSet(unit.charID,"wpcritlevel",0);
            AttributeSet(unit.charID,"heat",0);
            unit.heat = 0;
            AttributeSet(unit.charID,"move",unit.moveMax);
            unit.move = unit.moveMax;
            AttributeSet(unit.charID,"jumpmove",unit.jumpMax);
            unit.jumpMove = unit.jumpMax;
            AttributeSet(unit.charID,"tmm",unit.tmmMax);
            unit.tmm = unit.tmmMax;
            AttributeSet(unit.charID,"armour",unit.armourMax);
            unit.armour = unit.armourMax;
            AttributeSet(unit.charID,"structure",unit.structureMax);
            unit.structure = unit.structureMax;
            let armourID = AttributeID(unit.charID,"armour");
            let structureID = AttributeID(unit.charID,"structure");
            let heatID = AttributeID(unit.charID,"heat");
            unit.token.set({
                "bar1_value": unit.structureMax,
                "bar2_value": unit.armourMax,
                "bar3_value": unit.heat,
            })
        })

        sendChat("","Game Set");


    }




    const aStar = (unit,goalHex) => {

        RemoveMoveMarkers();

        let jump = false;
        let startHex = HexMap[unit.startHexLabel];

        let totalDistance = goalHex.distance(startHex);
        let totalMove = unit.move;
        if (unit.GetStatus() === "Sprint") {
            totalMove = Math.round(totalMove * 1.5);
        }
        if ((unit.GetStatus() === "Jump" || unit.GetStatus() === "Death from Above")) {
            jump = true;
            totalMove = unit.jumpMove;
        }

        let nodes = 1;
        let explored = [];
        let frontier = [{
            label: startHex.label,
            cost: 0,
            estimate: totalDistance,
        }]

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
    //log("Explored")
    //log(explored)
            //if this node reaches goal, end loop
            if (node.label === goalHex.label) {
                break;
            }
    //log("Node: " + node.label);
            //generate possible next steps
            let next = HexMap[node.label].cube.neighbours(); // will be cubes
            //for each possible next step
            for (let i=0;i<next.length;i++) {
                //calculate the cost of the next step 
                //by adding the step's cost to the node's cost
                let stepCube = next[i];
                let stepHexLabel = stepCube.label();
                if (stepHexLabel === undefined) {continue};

    //log("stepHexLabel: " + stepHexLabel);
                let stepHex = HexMap[stepHexLabel];
                if (!stepHex) {continue};
                if (stepHex.offmap === true) {continue};

                let stepHexCost = (jump === true) ? 1:stepHex.moveCost;
                let elevationChange = Math.abs(stepHex.elevation - nodeHex.elevation);
                if (jump === true && elevationChange <= 2) {elevationChange = 0};
                if (unit.type === "BattleMech" && elevationChange > Math.floor(totalMove/2)) {
                    continue;
                } else if (unit.type !== "BattleMech" && elevationChange > 1) {
                    continue;
                }

                if (elevationChange > 2) {continue} //not allowed
                stepHexCost += elevationChange;
                let cost = stepHexCost + node.cost;
    //log("Cost: " + cost);
                //check if this step has already been explored
                let isExplored = (explored.find(e=> {
                    return e.label === stepHexLabel
                }));
                if (isExplored) {
                    if (cost < isExplored.cost) {
                        let dif = isExplored.cost - cost;
                        isExplored.cost -= dif;
                        isExplored.estimate -= dif;
                    }
                }
                //avoid repeated nodes during the calculation of neighbours
                let isFrontier = (frontier.find(e=> {
                    return e.label === stepHexLabel;
                }));
                if (isFrontier) {
                    if (cost < isFrontier.cost) {
                        let dif = isFrontier.cost - cost;
                        isFrontier.cost -= dif;
                        isFrontier.estimate -= dif;
                    }
                }

                //if this step has not been explored
                if (!isExplored && !isFrontier) {
                    let est = cost + stepHex.distance(goalHex);
                    //add the step to the frontier, using the cost and distance
                    frontier.push({
                        label: stepHex.label,
                        cost: cost,
                        estimate: est,
                    });
                }
            }
        }
    //log(explored)
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

            //log(array)

            //run through array, stop when reach units movement points (based on move vs sprint etc)
            //place marker showing cost per hex
            //might stop before end
            let usedMP = 0;
            let prevNodeLabel;
            for (let i=0;i<array.length;i++) {
                let node = array[i];
                if (node.cost > totalMove) {
                    break;
                }
                //place marker showing nodeCost ie. cost for that hex
                if (node.cost > 0) {
                    CreateMoveMarker(node.label,node.cost,prevNodeLabel);
                }
                prevNodeLabel = node.label;
                results.push(node);
            }

            //move unit back to last hex in results
            let lastNode = results[results.length - 1];
            let lastHex = HexMap[lastNode.label];
            unit.token.set({
                left: lastHex.centre.x,
                top: lastHex.centre.y,
            })

        } else {
            sendChat("","No Path");
        }
    }

    const RemoveMoveMarkers = () => {
        let markers = state.MW.moveMarkers;
        _.each(markers,marker => {
            let token = getObj("graphic",marker);
            if (token) {token.remove()};
        })
        state.MW.moveMarkers = [];
    }

    const CreateMoveMarker = (label,cost,lastLabel) => {
        let hex = HexMap[label];
        let lastHex = HexMap[lastLabel];
        let c1 = hex.centre;
        let c2 = lastHex.centre;
        let x = Math.round((c1.x + c2.x)/2);
        let y = Math.round((c1.y + c2.y)/2);

        let img = getCleanImgSrc(MoveMarkers[cost]);
        let newToken = createObj("graphic", {
            left: x,
            top: y,
            width: 25,
            height: 25, 
            name: "Map Marker",
            pageid: Campaign().get("playerpageid"),
            imgsrc: getCleanImgSrc(MoveMarkers[cost]),
            layer: "map",
        })

        if (newToken) {
            toFront(newToken);
            state.MW.moveMarkers.push(newToken.id);
        } 
    }





    const changeGraphic = (tok,prev) => {
        let unit = UnitArray[tok.id];
        let newLabel = new Point(tok.get("left"),tok.get("top")).toCube().label();
        let prevLabel = new Point(prev.left,prev.top).toCube().label();
        if (unit && newLabel !== prevLabel) {
            if (unit.GetStatus === "Standstill" || unit.token.get(SM.immobile)) {
                tok.set({
                    left: prev.left,
                    top: prev.top,
                })
                sendChat("","Unit is not able to move");
            } else {
                let newHex = HexMap[newLabel];
                let prevHex = HexMap[prevLabel];
                let distance = newHex.distance(prevHex);
                let elevationChange = Math.abs(newHex.elevation - prevHex.elevation);
                let jump = (unit.GetStatus() === "Jump" || unit.GetStatus() === "Death from Above") ? true:false;
                if (jump === true) {elevationChange = 0};
                if (elevationChange > 2 && distance === 1 && state.MW.turn > 0) {
                    tok.set({
                        left: prev.left,
                        top: prev.top,
                    })
                    sendChat("","Elevation Change > 2");
                } else {
                    log(unit.name + " moving")
                    let index = HexMap[prevLabel].tokenIDs.indexOf(tok.id);
                    if (index > -1) {
                        HexMap[prevLabel].tokenIDs.splice(index,1);
                        HexMap[newLabel].tokenIDs.push(tok.id);
                    }
                    unit.hexLabel = newLabel;
                    if (state.MW.turn > 0) {
                        aStar(unit,HexMap[newLabel]);
                    }
                }
            }
        } 
        if (unit && tok.get("rotation") !== prev.rotation) {
            log(unit.name + " turning")
            let phi = Angle(tok.get("rotation"));
            phi = Math.round(phi/30) * 30;
            tok.set("rotation",phi);
        }
    }
    
    const destroyGraphic = (obj) => {
        let id = obj.get("id");
        if (id) {
            let unit = UnitArray[id];
            if (unit) {
                log(unit.name + " removed from Unit Array")
                let index = HexMap[unit.hexLabel].tokenIDs.indexOf(id);
                if (index > -1) {
                    HexMap[unit.hexLabel].tokenIDs.splice(index,1);
                }
                delete UnitArray[id];
            }
        }
    }






    const handleInput = (msg) => {
        if (msg.type !== "api") {
            return;
        }
        let args = msg.content.split(";");
        log(args);
        RemoveLines(["LOS"]);
        switch(args[0]) {
            case '!Dump':
                log(HexMap)
                log("State");
                log(state.MW);
                log("UnitArray");
                log(UnitArray)
                break;
            case '!ClearState':
                ClearState(msg);
                break;
            case '!TokenInfo':
                TokenInfo(msg);
                break;
            case '!CheckLOS':
                CheckLOS(msg);
                break;
            case '!Roll':
                RollDice(msg);
                break;
            case '!NextPhase':
                NextPhase();
                break;
            case '!Activate':
                Activate(msg);
                break;
            case '!SetGame':
                SetGame();
                break;

        }
    };

   



    const registerEventHandlers = () => {
        on('chat:message', handleInput);
        //on("add:graphic", addGraphic);
        on('change:graphic',changeGraphic);
        on('destroy:graphic',destroyGraphic);
    };
    on('ready', () => {
        log("===> MechWarrior <===");
        log("===> Software Version: " + version + " <===")
        LoadPage();
        DefineHexInfo();
        BuildMap();
        registerEventHandlers();
        sendChat("","API Ready at " + new Date().toLocaleTimeString("en-US", {timeZone: "America/Toronto"}) + " EST");
        log("On Ready Done")
    });
    return {
        // Public interface here
    };






})();


