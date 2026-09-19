    const LOS = (shooter,target) => {
        let shooterHex = HexMap[shooter.hexLabel];
        let targetHex = HexMap[target.hexLabel];
        let distance = shooter.Distance(target) + 1;
        //bring the bases to whichever is lower
        let baseElevation = Math.min(shooterHex.elevation,targetHex.elevation);
        
        let shooterHeight = shooterHex.elevation - baseElevation;
        if (shooter.type === "BattleMech") {
            shooterHeight += 2;
        }
        let targetBaseHeight = targetHex.elevation - baseElevation;
        let targetHeights = [targetBaseHeight];
        //targetHeight, 2 for Battlemechs
        let th;
        if (target.type === "BattleMech") {
            th = 2;
        }
        for (let i=1;i<6;i++) {
            targetHeights.push(targetBaseHeight + ((th/5)*i));
        }

//if distance is 0, should have LOS UNLESS one is fully underwater and other isnt
//need to work water into this

        //run shooterHeight -> each of target Heights, running through both paths
        //each path gets a 2 (LOS), 1 (LOS on one path blocked), 0 (LOS on both paths blocked)
        //work out the final LOS %, adding up the 3 heights divide by 10 to get a fraction

        let interCubes = [shooterHex.cube.linedraw(targetHex.cube),shooterHex.cube.linedraw2(targetHex.cube)];
        let interLabels = [interCubes[0].map((e)=> e.label()), interCubes[1].map((e)=> e.label())];
        let len = labels[0].length;

        let pathTotal = 0; //variable to add LOS result to
        let terrainModifier = 0; 
        let losBlockedAt = [];

        let pt1 = new Point(0,shooterHeight);
        for (let h=0;h<5;h++) {
            let pt2 = new Point(distance,targetHeights[i]);
            let pt3,pt4,line1;
            for (let side=0;side<2;side++) {
                let semi = 0;
                let path = 0;
                for (let i=0;i<len;i++) {
                    let label = interLabels[side][i];
                    let interHex = HexMap[label];
                    //hills
                    let ihElevation = interHex.elevation - baseElevation;
                    pt3 = new Point(i+1,0);
                    pt4 = new Point(i+1,ihElevation);
                    line1 = lineLine(pt1,pt2,pt3,pt4);
                    if (line1) {
                        losBlockedAt.push(label);
                        break;
                    }
                    //terrain
                    if (interHex.terrainHeight > 0) {
                        let th = interHex.terrainHeight + ihElevation;
                        pt4 = new Point(i+1,th);
                        line1 = lineLine(pt1,pt2,pt3,pt4);
                        if (line1) {
                            if (interHex.blockLOS === "Solid") {
                                losBlockedAt.push(label);
                                break;
                            } else if (interHex.blockLOS === "Semi") {
                                semi++;
                                if (semi > 3) {
                                    losBlockedAt.push(label);
                                    break;
                                }
                                if (interHex.terrainModifier === "Woods") {
                                    terrainModifier = 1;
                                }
                            }
                        }
                    }
                    //if gets to here, has clear LOS
                    path += 2;
                }
                //now for 2 'sides', divide path by 2
                //if 0 then blocked on both, 1 = blocked on 1, 2 = clear on both
                path = path/2;
                pathTotal += path;
            }
        }

        let percentVisible = pathTotal * 10; //pathTotal should be from 0 to 10

        if (percentVisible )







    }