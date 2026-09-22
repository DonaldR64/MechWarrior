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