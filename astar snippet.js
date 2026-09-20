const aStar = (unit,goalHex) => {
    let jump = (unit.GetStatus() === "Jump" || unit.GetStatus() === "Death from Above") ? true:false;

    let startHex = unit.startHexLabel;
    let currentHex = HexMap[unit.hexLabel];

    let totalDistance = goalHex.distance(startHex);
    let totalMove = DeepCopy(unit.move);
    if (unit.GetStatus() === "Sprint") {
        totalMove = Math.round(totalMove * 1.5);
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
        //if this node reaches goal, end loop
        if (node.label === goalHex.label) {
            break;
        }
        //generate possible next steps
        let next = HexMap[node.label].cube.neighbours(); // will be cubes
        //for each possible next step
        for (let i=0;i<next.length;i++) {
            //calculate the cost of the next step 
            //by adding the step's cost to the node's cost
            let stepCube = next[i];
            let stepHexLabel = stepCube.label();
            let stepHex = HexMap[stepHexLabel];
            if (!stepHex) {continue};
            let stepHexCost = (jump === true) ? 1:stepHex.moveCost;
            let elevationChange = Math.abs(stepHex.elevation - nodeHex.elevation);
            if (jump === true) {elevationChange = 0};
            if (elevationChange > 2) {continue} //not allowed
            stepHexCost += elevationChange;
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

        log(array)

        //run through array, stop when reach units movement points (based on move vs sprint etc)
        //place marker showing cost per hex
        //might stop before end


        




    } else {
        sendChat("","No Path");
    }
}