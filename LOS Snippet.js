const ShowTargets = (msg) => {
    let id = msg.selected[0]._id;
    let unit = UnitArray[id];

    SetupCard(unit.name,"Targetting",unit.faction);


    let targets = [];
    let weapons = [];
    _.each(UnitArray,unit2 => {
        if (unit2.faction !== unit.faction) {
            let losResult = LOS(unit,unit2);
            if (losResult.los === true && losResult.distance <= unit.maxRange) {
                _.each(unit.weaponArray,weapon => {
                    let damage = Damage(weapon,losResult.distance);
                    if ((losResult.facings.facing === "Front" && damage !== 0) ||  (losResult.facings.facing === "Rear" && damage !== 0 && weapon.special.includes("Rear")) ){
                        targets.push(unit2);
                        weapons.push(weapon);
                    }
                })
            }
        }
    })

    let c = true;
    if (targets.length === 0) {
        outputCard.body.push("No Targets in LOS, Weapon Range or Arc");
        c = false;
    } else if (weapons.length === 0) {
        outputCard.body.push("No Weapons have Range/Arc to Targets");
        c = false;
    } else {
        //for each target, draw line and maybe indicate % chance of hit
        //can create routine to factor to hit, call on it here and in firing routine
        _.each(targets,target => {
            let info = SATOR(unit,target);
            let tN = info.targetNumber;
            let percent = Math.round((13-tN) * 100/12);
            if (percent <= 0) {
                outputCard.body.push(target.name + ": Cannot Hit");
                //black line
            } else {
                outputCard.body.push(target.name + ": " + percent + "%");
                //line coloured based on percent
            }
        })
    }
    PrintCard();
}




const Damage = (weapon,distance) => {
    let damage = 0;
    if (distance <= rangeBands["Long"]) {
        damage = weapon.long;
    }
    if (distance <= rangeBands["Medium"]) {
        damage = weapon.medium;
    }
    if (distance <= rangeBands["Short"]) {
        damage = weapon.short;
    }
    return damage;
}

const SATOR = (shooter,target,combatType = "Ranged") => {
    let shooterStatus = shooter.GetStatus();
    if (shooterStatus === "Charge" || shooterStatus === "Death from Above") {
        combatType = "Melee";
    }
    let targetStatus = target.GetStatus();
    let losResult = LOS(shooter,target);
    //S
    let tN = shooter.skill;
    let tip = "Skill: " + shooter.skill;
    //A
    if ((shooterStatus === "Jump" || shooterStatus === "Death from Above") && shooter.type !== "Infantry") {
        tip += "<br>Jumping: +2";
        tN += 2;
    } else if (shooterStatus === "Standstill" && shooter.type !== "Infantry") {
        tip += "<br>Standstill -1";
        tN -= 1;
    } else if (shooterStatus === "Move") {
        tip += "<br>Move +0";
    }

    //T
    if (targetStatus === "Move") {
        tip += "<br>TMM  +" + target.tmm;
        tN += target.tmm;
    } else if (targetStatus === "Standstill" && target.token.get(SM.immobile) === false) {
        tip += "<br>Target Standstill: +0";
    } else if (targetStatus === "Jump" || targetStatus === "Death from Above") {
        let strong = target.special.find(e => e.includes("Strong Jump Jets"));
        let weak = target.special.find(e => e.includes("Weak Jump Jets"));
        tip += "<br>Jumping +" + (target.tmm + 1);
        tN += (target.tmm + 1);
        if (strong) {
            strong = strong.replace(/[^\d]/g,"");
            tip += "<br>Strong Jump Jets +" + strong;
            tN += strong;
        } else if (weak) {
            weak = weak.replace(/[^\d]/g,"");
            tip += "<br>Weak Jump Jets -" + weak;
            tN -= weak;
        }
    } else if (target.token.get(SM.immobile)) {
        tip += "<br>Immobile -4";
        tN -= 4;
    }
    //submersible movement
    //hull down
    //dropped by airborne unit
    //O
    if (losResult.woods) {
        tip += "<br>Woods +1";
        tN += 1;
    }
    if (losResult.underwater === true) {
        tip += "<br>Both Underwater +1"
    }
    if (losResult.partial) {
        tip += "<br>Partial Cover +1";
        tN += 1;
    }
    //area effect
    //indirect fire
    //secondary
    //unit is also spotting
    if (losResult.facing === "Rear") {
        tip += "<br>Rear Facing Weapons +1";
        tN += 1;
    }
    if (shooter.special.find(e => e.includes("Shield")) && combatType === "Ranged") {
        tip += "<br>Shooter has BattleMech Shield +1";
        tN += 1;
    }
    let fC = Attribute(shooter.charID,"fccritlevel") || 0;
    if (fC > 0 && combatType === "Ranged") {
        tip += "<br>Fire Control Hits +" + (fC * 2);
        tN += (fC*2); 
    }
    let heat = parseInt(shooter.token.get('bar3_value'));
    if (heat > 0 && combatType === "Ranged") {
        tip += "<br>Heat Level +" + heat;
        tN += heat;
    }
    if (shooterStatus === "Charge") {
        tip += "<br>Charge +1";
        tN += 1;
    }
    if (shooterStatus === "Death from Above") {
        tip += "<br>Death from Above +1";
        tN += 1;
    }
    //antimech infantry attack
    //target is airborn aerosapce, drop ship, vtol, battle armor
    //target is hull down and not rear attack
    //target is protomech
    //target has STL Special active

    //R
    let dist = losResult.distance;
    if (losResult.underwater) {
        dist *= 2;
        tip += "<br>Underwater Ranges are Halved";
    }
    if (dist <= 3) {
        tip += "<br>Short Range +0";
    } else if (dist > 3 && dist<= 12) {
        tip += "<br>Medium Range +2";
        tN += 2;
    } else if (dist > 12 && dist <= 21) {
        tip += "<br>Long Range +4";
        tN += 4;
    }
    //extreme ???

    let result = {
        tip: tip,
        targetNumber: tN,
    }
    return result;
}