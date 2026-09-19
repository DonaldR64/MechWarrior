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
        let len = labels[0].length;

        let terrainModifier = 0; 
        let partial = false;
        let losBlockedAt = false, losReason = false;
        let visibleSides = 0;
        let underwater = false;
        if (targetHex.water === true) {
            if (targetHex.terrainHeight === 1) {
                partial = true;
            } else if (targetHex.terrainHeight > 1) {
                if (shooterHex.water === true && shooterHex.terrainHeight > 1) {
                    underwater = true;
                } else {
                    let result = {
                        distance: distance,
                        los: false,
                        reason: "Target is Completely Underwater",
                        losBlockedAt: targetHex.label,
                        partial: false,
                        terrainModifier: 0,
                    }
                    return result;
                }
            }
        }



        for (let side=0;side<2;side++) {
            let semi = 0;
            let losSide = true;
            for (let i=0;i<len;i++) {
                let label = interLabels[side][i];
                let interHex = HexMap[label];
                //hills
                let ihElevation = interHex.elevation - baseElevation;
                if (ihElevation >= shooterHeight && ihElevation >= targetHeight) {
                    losBlockedAt = label;
                    losReason = "Hill";
                    losSide = false;
                    break;
                }
                if (i===0 && ihElevation >= shooterHeight) {
                    losBlockedAt = label;
                    losReason = "Hill";
                    losSide = false;
                    break;
                }
                if (i = (len-1) && ihElevation >= targetHeight) {
                    losBlockedAt = label;
                    losReason = "Hill";
                    losBlockedAt.push(label);
                    losSide = false;
                    break;
                }


                //terrain
                if (interHex.terrainHeight > 0) {
                    let intervening = false;
                    let ihTH = ihElevation + interHex.terrainHeight;
                    if (ihTH >= shooterHeight && ihTH >= targetHeight) {
                        intervening = true;
                    }
                    if (i===0 && ihTH >= shooterHeight) {
                        intervening = true;
                    }
                    if (i === (len-1) && ihTH >= targetHeight) {
                        intervening = true;
                    }
                    if (intervening === true) {
                        if (interHex.blockLOS === "Solid") {
                            losBlockedAt = label;
                            losReason = interHex.terrain;
                            losSide = false;
                            break;
                        }
                        if (interHex.blockLOS === "Semi") {
                            semi++;
                            if (semi > 3) {
                                losBlockedAt = label;
                                losReason = "> 3 Hexes Woods";
                                losSide = false;
                                break;
                            }
                        }
                        terrainModifier = Math.max(terrainModifier,interHex.terrainModifier);
                    }
                }

                //final interHex - partial cover
                if (i === (len-1)) {
                    if ((ihElevation - targetElevation) === 1 && shooterHeight <= targetHeight) {
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
        }

        return result;
    }