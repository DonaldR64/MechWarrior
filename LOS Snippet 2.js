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
        let targetHeight = targetHex.elevation - baseElevation;

        let interCubes = [shooterHex.cube.linedraw(targetHex.cube),shooterHex.cube.linedraw2(targetHex.cube)];
        let interLabels = [interCubes[0].map((e)=> e.label()), interCubes[1].map((e)=> e.label())];
        let len = labels[0].length;

        let terrainModifier = 0; 
        let losBlockedAt = [];

        for (let side=0;side<2;side++) {
            let semi = 0;
            





        }









    }