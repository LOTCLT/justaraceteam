/* =========================================================
   JUST A RACE TEAM — GAME DATA
   Version 5

   Add future cars here.
   script.js automatically builds the car dropdown from this file.
   ========================================================= */


function makeId(category, mod) {

    return (
        category +
        "__" +
        mod
    )
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

}



function cleanOptions(options) {

    return options
        .filter(
            option =>
                option !== null &&
                option !== undefined &&
                String(option).trim() !== "" &&
                String(option).trim() !== "-"
        )
        .map(
            option =>
                String(option).trim()
        );

}



function getUpgradeTier(
    mod,
    option,
    optionIndex
) {

    const modName =
        String(mod)
            .trim()
            .toLowerCase();


    const optionName =
        String(option)
            .trim()
            .toLowerCase();



    /*
        First usable option is the car's
        stock/current state.
    */

    if (optionIndex === 0) {

        return 0;

    }



    /*
        Suspension:
        Sport < Race/Rally/Drift family
    */

    if (
        modName.includes("spring") &&
        modName.includes("damper")
    ) {

        if (
            optionName.includes("sport")
        ) {

            return 1;

        }


        return 2;

    }



    /*
        Transmission:
        Stock < Street < Sport <
        Race / gear-count / Drift family
    */

    if (
        modName ===
        "transmission"
    ) {

        if (
            optionName.includes("street")
        ) {

            return 1;

        }


        if (
            optionName.includes("sport")
        ) {

            return 2;

        }


        return 3;

    }



    /*
        Differential:
        Stock < Street < Sport <
        Race/Rally/Drift/Offroad family
    */

    if (
        modName ===
        "differential"
    ) {

        if (
            optionName.includes("street")
        ) {

            return 1;

        }


        if (
            optionName.includes("sport")
        ) {

            return 2;

        }


        return 3;

    }



    /*
        Tire compounds.
    */

    if (
        modName ===
        "tire compound"
    ) {

        if (
            optionName.includes("street")
        ) {

            return 1;

        }


        if (
            optionName.includes("sport")
        ) {

            return 2;

        }


        if (
            optionName.includes("semi-slick") ||
            optionName.includes("semi slick")
        ) {

            return 3;

        }


        return 4;

    }



    /*
        Equal-tier sidegrade families.
    */

    if (
        modName ===
        "wheels"
    ) {

        return 1;

    }


    if (
        modName.includes(
            "drivetrain swap"
        )
    ) {

        return 1;

    }


    if (
        modName ===
        "aspiration"
    ) {

        return 1;

    }


    if (
        modName.includes("bumper") ||
        modName.includes("wing") ||
        modName.includes("body kit")
    ) {

        return 1;

    }



    /*
        Normal linear upgrades follow
        their usable-option order.
    */

    return optionIndex;

}



function buildCar(
    name,
    startingPI,
    rawUpgrades
) {

    const upgrades =
        rawUpgrades
            .map(
                function (
                    [
                        category,
                        mod,
                        rawOptions
                    ]
                ) {

                    const options =
                        cleanOptions(
                            rawOptions
                        );


                    return {

                        id:
                            makeId(
                                category,
                                mod
                            ),

                        category:
                            category,

                        mod:
                            mod,

                        options:
                            options.map(
                                function (
                                    option,
                                    optionIndex
                                ) {

                                    return {

                                        name:
                                            option,

                                        tier:
                                            getUpgradeTier(
                                                mod,
                                                option,
                                                optionIndex
                                            )

                                    };

                                }
                            )

                    };

                }
            )
            .filter(
                upgrade =>
                    upgrade.options.length >= 2
            );


    return {

        name:
            name,

        startingPI:
            startingPI,

        upgrades:
            upgrades

    };

}



/* =========================================================
   CARS
   ========================================================= */

export const CAR_LIBRARY = [

    buildCar(
        "2024 Ford Mustang GT",
        "A628",
        [
            ["Engine", "Intake", ["Stock Intake", "Street Intake", "Sport Intake", "Race Intake"]],
            ["Engine", "Intake Manifold/ Throttle Body", ["Stock Throttle Body", "Sport Throttle Body", "Race Throttle Body"]],
            ["Engine", "Fuel System", ["Stock Fuel System", "Race Fuel Sytem"]],
            ["Engine", "Ignition", ["Stock Ignition", "Race Ignition"]],
            ["Engine", "Exhaust", ["Stock Exhaust", "Sport Exhaust", "Race Exhaust"]],
            ["Engine", "Camshaft", ["Stock Cams andValves", "Race Cams and Valves"]],
            ["Engine", "Valves", ["Stock valves", "Sport Valves", "Race Valves"]],
            ["Engine", "Displacement", ["Stock Block", "Street Block", "Sport Block", "Race Block"]],
            ["Engine", "Oil/ Cooling", ["Stock Oil Cooling", "Sport Oil Cooling", "Race Oil Cooling"]],
            ["Engine", "Flywheel", ["Stock Flywheel", "Sport Flywheel", "Race Flywheel"]],
            ["Platform and Handling", "Brakes", ["Stock Brakes", "Sport Brakes", "Race Brakes"]],
            ["Platform and Handling", "Spring and Dampers", ["Stock Suspension", "Sport Suspension", "Race Suspension", "Rally Suspension", "Drift Suspension"]],
            ["Platform and Handling", "Front Anti-Roll Bars", ["Stock Anti-Roll Bar", "Race Front Anti-Roll Bar"]],
            ["Platform and Handling", "Rear Anti-Roll Bars", ["Stock Anti-Roll Bar", "Sport Rear Anti-Roll Bar", "Race Rear Anti-Roll Bar"]],
            ["Platform and Handling", "Chassis Reinforcement/ Roll Cage", ["Stock Chassis", "Sport Chassis", "Race Chassis"]],
            ["Platform and Handling", "Weight Reduction", ["Stock Weight", "Street Weight Reduction", "Sport Weight Reduction", "Race Weight Reduction"]],
            ["Drivetrain", "Clutch", ["Stock Clutch", "Race Clutch"]],
            ["Drivetrain", "Transmission", ["Stock Transmission", "Sport Transmission", "Race Transmission", "Race Trans - 7 Speed", "Race Trans - 8 Speed", "Race Trans - 9 Speed", "Race Trans - 10 Speed", "Drift Trans - 4 Speed"]],
            ["Drivetrain", "Driveline", ["Stock Driveshaft", "Street Driveshaft", "Sport Driveshaft", "Race Driveshaft"]],
            ["Drivetrain", "Differential", ["Stock Differential", "Sport Diff", "Race Diff", "Rally Diff", "Drift Diff"]],
            ["Tires and Rims", "Tire Compound", ["Stock (standard)", "Semi-Slick Tires", "Semi-Slick \"Horizon\" Tires", "Slick Tires", "Drift Tires", "Rally Tires", "Offroad Tires", "Snow Tires", "Drag Tires"]],
            ["Tires and Rims", "wheels", ["Stock Wheels", "Wheel Size", "Wheel Style"]],
            ["Tires and Rims", "Front Tire Width", ["255", "265", "275"]],
            ["Tires and Rims", "Rear Tire Width", ["275", "295", "315"]],
            ["Aero and Appearance", "Front Bumper", ["Stock Bumper", "Forza Race"]],
            ["Aero and Appearance", "Rear Wing", ["Stock Bumper", "Forza Race", "APR WING", "Triple 7 Wing", "Remove Wing"]],
            ["Body Kits and Conversions", "Drivetrain Swap", ["RWD", "AWD"]],
            ["Body Kits and Conversions", "Aspiration", ["Stock (NA)", "Big Single Turbo", "Supercharger", "Centrifugal Super Charger"]],
            ["Body Kits and Conversions", "Body Kit", ["Stock Body", "Triple 7 Widebody"]]
        ]
    ),

    buildCar(
        "1986 Honda Civic Si",
        "D253",
        [
            ["Engine", "Intake", ["Stock Intake", "Street Intake", "Sport Intake", "Race Intake"]],
            ["Engine", "Intake Manifold/ Throttle Body", ["Stock Throttle Body", "Sport Throttle Body", "Race Throttle Body"]],
            ["Engine", "Fuel System", ["Stock Fuel System", "Street Fuel System", "Sport Fuel System", "Race Fuel Sytem"]],
            ["Engine", "Ignition", ["Stock Ignition", "Street Ignition", "Sport Ignition", "Race Ignition"]],
            ["Engine", "Exhaust", ["Stock Exhaust", "Street Exhaust", "Sport Exhaust", "Race Exhaust"]],
            ["Engine", "Camshaft", ["Stock Cams andValves", "Street Cams and Valves", "Sport Cams and Valves", "Race Cams and Valves"]],
            ["Engine", "Valves", ["Stock valves", "Street Valves", "Sport Valves", "Race Valves"]],
            ["Engine", "Displacement", ["Stock Block", "Street Block", "Sport Block", "Race Block"]],
            ["Engine", "Pistons/ Compression", ["Stock Pistons", "Street Pistons", "Sport Pistons", "Race Piston"]],
            ["Engine", "Oil/ Cooling", ["Stock Oil Cooling", "Street Oil Cooling", "Sport Oil Cooling", "Race Oil Cooling"]],
            ["Engine", "Flywheel", ["Stock Flywheel", "Street Flywheel", "Sport Flywheel", "Race Flywheel"]],
            ["Platform and Handling", "Brakes", ["Stock Brakes", "Street Brakes", "Sport Brakes", "Race Brakes"]],
            ["Platform and Handling", "Spring and Dampers", ["Stock Suspension", "Sport Suspension", "Race Suspension", "Rally Suspension", "Drift Suspension"]],
            ["Platform and Handling", "Front Anti-Roll Bars", ["Stock Anti-Roll Bar", "Sport Front Anti-Roll Bar", "Race Front Anti-Roll Bar"]],
            ["Platform and Handling", "Rear Anti-Roll Bars", ["Stock Anti-Roll Bar", "Sport Rear Anti-Roll Bar", "Race Rear Anti-Roll Bar"]],
            ["Platform and Handling", "Chassis Reinforcement/ Roll Cage", ["Stock Chassis", "Street Chassis", "Sport Chassis", "Race Chassis"]],
            ["Platform and Handling", "Weight Reduction", ["Stock Weight", "Sport Weight Reduction", "Race Weight Reduction"]],
            ["Drivetrain", "Clutch", ["Stock Clutch", "Street Clutch", "Sport Clutch", "Race Clutch"]],
            ["Drivetrain", "Transmission", ["Stock Transmission", "Street Transmission", "Sport Transmission", "Race Transmission", "Race Trans - 7 Speed", "Race Trans - 8 Speed", "Race Trans - 9 Speed", "Race Trans - 10 Speed", "Drift Trans - 4 Speed"]],
            ["Drivetrain", "Driveline", ["Stock Driveshaft", "Street Driveshaft", "Sport Driveshaft", "Race Driveshaft"]],
            ["Drivetrain", "Differential", ["Stock Differential", "Street Diff", "Sport Diff", "Race Diff", "Rally Diff", "Offroad Diff"]],
            ["Tires and Rims", "Tire Compound", ["Stock (standard)", "Street Tires", "Sport Tires", "Semi-Slick Tires", "Semi-Slick \"Horizon\" Tires", "Slick Tires", "Drift Tires", "Rally Tires", "Offroad Tires", "Snow Tires", "Drag Tires"]],
            ["Tires and Rims", "wheels", ["Stock Wheels", "Wheel Size", "Wheel Style"]],
            ["Tires and Rims", "Front Tire Width", ["175", "195", "205", "215", "225"]],
            ["Tires and Rims", "Rear Tire Width", ["175", "195", "205", "215", "225"]],
            ["Aero and Appearance", "Front Bumper", ["Stock Bumper", "Forza Race"]],
            ["Aero and Appearance", "Rear Wing", ["Stock Bumper", "Forza Race"]],
            ["Body Kits and Conversions", "Drivetrain Swap", ["Stock (FWD)", "RWD", "AWD"]],
            ["Body Kits and Conversions", "Aspiration", ["Stock (NA)", "Big Single Turbo", "Supercharger"]]
        ]
    )

];



/* =========================================================
   TRACKS

   Every individual track has equal odds.
   ========================================================= */

export const RACE_POOL = [

    { type: "Street", name: "Cedar Run Street Race", distance: "4.2 mi" },
    { type: "Street", name: "Daikoku Chase Street Race", distance: "4.2 mi" },
    { type: "Street", name: "Festival Chase Street Race", distance: "4.1 mi" },
    { type: "Street", name: "Hokubu Ascent Street Race", distance: "4.2 mi" },
    { type: "Street", name: "Kita Ine Street Race", distance: "4.1 mi" },
    { type: "Street", name: "Matsumi Climb Street Race", distance: "4.6 mi" },
    { type: "Street", name: "Minami Chase Street Race", distance: "4.6 mi" },
    { type: "Street", name: "Nachi Run Street Race", distance: "3.9 mi" },
    { type: "Street", name: "Norikura Descent Street Race", distance: "3.6 mi" },
    { type: "Street", name: "Okishinaimura Run Street Race", distance: "3.2 mi" },
    { type: "Street", name: "Rainbow Bridge Descent Street Race", distance: "5.3 mi" },
    { type: "Street", name: "River Descent Street Race", distance: "3.8 mi" },
    { type: "Street", name: "Shimanoyama Charge Street Race", distance: "5.2 mi" },
    { type: "Street", name: "Sunflower Charge Street Race", distance: "3.8 mi" },
    { type: "Street", name: "Tokyo City Docks Charge Street Race", distance: "4.0 mi" },
    { type: "Road", name: "Coastline Sprint", distance: "5.0 mi" },
    { type: "Road", name: "Daikoku Circuit", distance: "3.3 mi" },
    { type: "Road", name: "Electric Town Circuit", distance: "5.5 mi" },
    { type: "Road", name: "Festival Sprint", distance: "4.9 mi" },
    { type: "Road", name: "Highway Circuit", distance: "8.7 mi" },
    { type: "Road", name: "Hokubu Circuit", distance: "4.7 mi" },
    { type: "Road", name: "Irokawa Circuit Road Race", distance: "3.5 mi" },
    { type: "Road", name: "Ito Sprint", distance: "5.8 mi" },
    { type: "Road", name: "Legend Island Circuit", distance: "8.8 mi" },
    { type: "Road", name: "Narai-Juku Circuit", distance: "4.4 mi" },
    { type: "Road", name: "Satta Sprint", distance: "5.1 mi" },
    { type: "Road", name: "Seaside Park Sprint", distance: "4.5 mi" },
    { type: "Road", name: "Shikisai Sprint", distance: "4.8 mi" },
    { type: "Road", name: "Shimanoyama Circuit", distance: "3.4 mi" },
    { type: "Road", name: "Shimanoyama Sprint", distance: "4.0 mi" },
    { type: "Road", name: "Shirakawa Circuit", distance: "4.0 mi" },
    { type: "Road", name: "Tateyama Kurobe Sprint", distance: "3.8 mi" },
    { type: "Road", name: "The Colossus", distance: "23.4 mi" },
    { type: "Road", name: "The Goliath", distance: "53.1 mi" },
    { type: "Road", name: "Venus Sprint", distance: "5.0 mi" },
    { type: "Drag", name: "Horizon Festival Drag Strip", distance: "0.6 mi" },
    { type: "Drag", name: "Irokawa Space Center Drag Strip", distance: "0.2 mi" },
    { type: "Drag", name: "Ito Airfield Drag Strip", distance: "0.5 mi" },
    { type: "Dirt / Rally", name: "Airfield Trail", distance: "4.2 mi" },
    { type: "Dirt / Rally", name: "Bamboo Forest Scramble", distance: "9.3 mi" },
    { type: "Dirt / Rally", name: "Cherry Field Trail", distance: "4.5 mi" },
    { type: "Dirt / Rally", name: "Chiheisen Scramble", distance: "4.9 mi" },
    { type: "Dirt / Rally", name: "Hirosaki Scramble", distance: "5.1 mi" },
    { type: "Dirt / Rally", name: "Hokubu Trail", distance: "3.6 mi" },
    { type: "Dirt / Rally", name: "Horizon Stadium Scramble", distance: "7.3 mi" },
    { type: "Dirt / Rally", name: "Ine Scramble", distance: "5.7 mi" },
    { type: "Dirt / Rally", name: "Ito Trail", distance: "4.4 mi" },
    { type: "Dirt / Rally", name: "Kawazu Nanadaru Scramble", distance: "7.8 mi" },
    { type: "Dirt / Rally", name: "Kinkaku-ji Trail", distance: "3.4 mi" },
    { type: "Dirt / Rally", name: "Legend Island Trail", distance: "3.3 mi" },
    { type: "Dirt / Rally", name: "Nukabira Trail", distance: "5.0 mi" },
    { type: "Dirt / Rally", name: "Oyashirazu Trail", distance: "3.2 mi" },
    { type: "Dirt / Rally", name: "Sekibe Scramble", distance: "4.0 mi" },
    { type: "Dirt / Rally", name: "Sotoyama Scramble", distance: "5.5 mi" },
    { type: "Dirt / Rally", name: "Sunflower Scramble", distance: "5.3 mi" },
    { type: "Dirt / Rally", name: "Taiyaki Scramble", distance: "6.7 mi" },
    { type: "Dirt / Rally", name: "Takashiro Trail", distance: "3.6 mi" },
    { type: "Dirt / Rally", name: "The Gauntlet", distance: "18.7 mi" }

];



/* =========================================================
   CHAMPIONSHIP SCORING
   ========================================================= */

export const POINTS_BY_PLACE = {

    1: 4,
    2: 3,
    3: 2,
    4: 1

};



/* =========================================================
   UPGRADE REWARDS
   ========================================================= */

export const REWARDS_BY_PLACE = {

    1: {
        rolls: 0,
        keep: 0,
        text: "No upgrade"
    },

    2: {
        rolls: 1,
        keep: 1,
        text: "1 upgrade roll"
    },

    3: {
        rolls: 2,
        keep: 1,
        text: "2 rolls — keep 1"
    },

    4: {
        rolls: 2,
        keep: 2,
        text: "2 rolls — keep both"
    }

};



/* =========================================================
   DATA HELPERS
   ========================================================= */

export function getCarByName(
    carName
) {

    return (
        CAR_LIBRARY.find(
            car =>
                car.name ===
                carName
        ) ||
        null
    );

}



export function getUpgradeById(
    car,
    modId
) {

    if (!car) {

        return null;

    }


    return (
        car.upgrades.find(
            upgrade =>
                upgrade.id ===
                modId
        ) ||
        null
    );

}



export function getStockForUpgrade(
    upgrade
) {

    if (
        !upgrade ||
        !upgrade.options.length
    ) {

        return null;

    }


    return upgrade.options[0];

}



export function randomFromArray(
    array
) {

    return array[
        Math.floor(
            Math.random() *
            array.length
        )
    ];

}



export function getRandomUpgradeRoll(
    car
) {

    if (
        !car ||
        !car.upgrades.length
    ) {

        return null;

    }



    /*
        Category is chosen first,
        then a mod inside that category,
        then one available option.
    */

    const categories =
        [
            ...new Set(
                car.upgrades.map(
                    upgrade =>
                        upgrade.category
                )
            )
        ];


    const category =
        randomFromArray(
            categories
        );


    const categoryMods =
        car.upgrades.filter(
            upgrade =>
                upgrade.category ===
                category
        );


    const upgrade =
        randomFromArray(
            categoryMods
        );


    const option =
        randomFromArray(
            upgrade.options
        );


    return {

        category:
            upgrade.category,

        mod:
            upgrade.mod,

        modId:
            upgrade.id,

        option:
            option.name,

        tier:
            option.tier

    };

}
