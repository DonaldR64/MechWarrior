const aStar = (unit,goalHex) => {
    RemoveMoveMarkers();

    let jump = (unit.GetStatus() === "Jump" || unit.GetStatus() === "Death from Above") ? true:false;

    let startHex = HexMap[unit.startHexLabel];

    let totalMove = DeepCopy(unit.move);
    if (unit.GetStatus() === "Sprint") {
        totalMove = Math.round(totalMove * 1.5);
    }

    let results;
    let explored = [];
    let frontier = [{
        label: startHex.label,
        cost: 0,
        estimate: goalHex.distance(startHex),
    }];
    //while paths being explored
    while (frontier.length > 0) {
        //sort paths in frontier by cost,lowest cost first
        //choose lowest cost path from the frontier
        //if more than one, choose one with highest cost       
        frontier.sort(function(a,b) {
            return a.estimate - b.estimate || b.cost - a.cost; //2nd part used if estimates are same
        })
        let node = frontier.shift();
        let nodeHex = HexMap[node.label];
        //add this node to explored paths
        explored.push(node);
        //if this node reaches goal, end loop
        if (node.label === goalHex.label) {
            break;
        }
        //generate possible next steps
        let next = nodeHex.cube.neighbours(); // will be cubes
        //for each possible next step
        for (let i=0;i<next.length;i++) {
            //calculate the cost of the next step 
            //by adding the step's cost to the node's cost
            let stepCube = next[i];
            let stepHexLabel = stepCube.label();
            if (stepHexLabel === undefined) {continue};
            let stepHex = HexMap[stepHexLabel];
            if (!stepHex) {continue};
            if (stepHex.offmap === true) {continue};

            let stepHexCost = (jump === true) ? 1:stepHex.moveCost;
            let elevationChange = Math.abs(stepHex.elevation - nodeHex.elevation);
            if (jump === true) {elevationChange = 0};
            if (elevationChange > 2) {continue} //not allowed
            stepHexCost += elevationChange;
            let cost = stepHexCost + node.cost;
            
            //check if this step has already been explored
            let isExplored = (explored.find(e=> {
                return e.hexLabel === stepHexLabel
            }));
            //avoid repeated nodes during the calculation of neighbours
            let isFrontier = (frontier.find(e=> {
                return e.hexLabel === stepHexLabel
            }));
            //if this step has not been explored
            if (!isExplored && !isFrontier) {
                let est = cost + stepHex.distance(goalHex);
                //add the step to the frontier, using the cost and distance
                frontier.push({
                    label: stepHexLabel,
                    cost: cost,
                    estimate: est,
                });
            }
        }
    }
    //If there are no paths left to explore or hit target hex
log(explored)
    if (explored.length > 0) {
        //sort explored backwards choosing path

        explored.reverse();
        let finalArray = [];
        finalArray.push(explored[0]);
        let currentCost = explored[0].cost
        let currentHex = HexMap[explored[0].label];
        for (let i=1;i<explored.length;i++) {
            if (explored[i].hex.distance(currentHex) === 1 && explored[i].cost < currentCost) {
                currentCost = explored[i].cost;
                currentHex = explored[i].hex;
                finalArray.push(explored[i]);
            }
        }
        finalArray.reverse();

        let returnArray = []
        for (let i=0;i<finalArray.length;i++) {
            if (finalArray[i].cost > movement) {break};
            returnArray.push(finalArray[i]);
        }       
        returnArray.reverse();
        //place move markers
        for (let i=0;i<returnArray.length;i++) {
            MoveMarkers(returnArray[i].hexLabel);
        }
    } else {
        sendChat("","No Path");
    }
    return;
}

const MoveMarkers = (hexLabel) => {
    let location = hexMap[hexLabel].centre;
    let img = getCleanImgSrc("https://s3.amazonaws.com/files.d20.io/images/413129/hkE8pjjFVSOA2ALw-I2KTg/thumb.png?1354343672");
    let newToken = createObj("graphic", {
        left: location.x,
        top: location.y,
        width: 25,
        height: 25,
        name: "Map Marker",
        pageid: Campaign().get("playerpageid"),
        imgsrc: img,
        layer: "map",
    })
    toFront(newToken);
    state.FTT.MoveMarkers[hexLabel] = newToken.id;
}


const RemoveMoveMarkers = () => {
    let keys = Object.keys(state.FTT.MoveMarkers);
    for (let i=0;i<keys.length;i++) {
        let hexLabel = keys[i];
        let id = state.FTT.MoveMarkers[hexLabel];
        let tok = findObjs({_type:"graphic", id: id})[0];
        if (tok) {
            tok.remove();
        }
    }
    state.FTT.MoveMarkers = {};
}