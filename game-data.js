/* =========================================================
   JUST A RACE TEAM — GAME DATA
   Version 8

   V8 adds conditional upgrade trees for engine swaps and
   aspiration conversions while keeping V7 race-map data.
   ========================================================= */


function makeId(category, mod, variant = "") {

    const pieces = [category, mod];

    if (variant) {
        pieces.push(variant);
    }

    return pieces
        .join("__")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");

}


function cleanOptions(options) {

    return (options || [])
        .filter(
            option =>
                option !== null &&
                option !== undefined &&
                String(option).trim() !== "" &&
                String(option).trim() !== "-"
        )
        .map(option => String(option).trim());

}


function getUpgradeTier(mod, option, optionIndex) {

    const modName = String(mod || "").trim().toLowerCase();
    const optionName = String(option || "").trim().toLowerCase();

    /* Equal-tier conversion / appearance families. */
    if (
        modName.includes("drivetrain swap") ||
        modName.includes("engine swap") ||
        modName === "aspiration" ||
        modName === "wheels" ||
        modName === "wheel style" ||
        modName === "wheel size" ||
        modName.includes("bumper") ||
        modName.includes("wing") ||
        modName.includes("body kit")
    ) {
        return optionIndex === 0 ? 0 : 1;
    }

    /* Tire compounds use their own family tiers. */
    if (modName === "tire compound") {
        if (optionName.includes("street")) return 1;
        if (optionName.includes("sport")) return 2;
        if (optionName.includes("semi-slick") || optionName.includes("semi slick")) return 3;
        if (optionIndex === 0) return 0;
        return 4;
    }

    /* Forza labels are authoritative even when Street is the first visible option. */
    if (optionName.includes("street")) return 1;
    if (optionName.includes("sport")) return 2;

    if (
        optionName.includes("race") ||
        optionName.includes("rally") ||
        optionName.includes("drift") ||
        optionName.includes("offroad") ||
        optionName.includes("off-road") ||
        optionName.includes("snow") ||
        optionName.includes("drag") ||
        optionName === "slick" ||
        optionName === "slick tires"
    ) {
        return 3;
    }

    /* First ordinary option is the stock/current state. */
    if (optionIndex === 0) return 0;

    return optionIndex;

}


function normalizeRequirement(requirement) {

    const allowed = Array.isArray(requirement.options)
        ? requirement.options
        : [requirement.options];

    return {
        modId: makeId(
            requirement.category,
            requirement.mod,
            requirement.variant || ""
        ),
        options: cleanOptions(allowed)
    };

}


function buildCar(name, startingPI, rawUpgrades) {

    const upgrades = rawUpgrades
        .map(function (raw) {

            const config = Array.isArray(raw)
                ? {
                    category: raw[0],
                    mod: raw[1],
                    options: raw[2]
                }
                : raw;

            const category = String(config.category || "").trim();
            const mod = String(config.mod || "").trim();
            const variant = String(config.variant || "").trim();
            const options = cleanOptions(config.options);

            const builtOptions = options.map(
                function (option, optionIndex) {
                    return {
                        name: option,
                        tier: getUpgradeTier(mod, option, optionIndex)
                    };
                }
            );

            const implicitBase = config.implicitBase
                ? {
                    name: String(config.implicitBase),
                    tier: 0,
                    implicit: true
                }
                : null;

            return {
                id: makeId(category, mod, variant),
                category: category,
                mod: mod,
                variant: variant,
                variantLabel: variant,
                options: builtOptions,
                baseOption: implicitBase || builtOptions[0] || null,
                requirements: (config.requires || []).map(normalizeRequirement)
            };

        })
        .filter(function (upgrade) {
            if (!upgrade.baseOption) return false;
            if (upgrade.baseOption.implicit) return upgrade.options.length >= 1;
            return upgrade.options.length >= 2;
        });

    return {
        name: name,
        startingPI: startingPI,
        upgrades: upgrades
    };

}


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
    ),


    buildCar(
        "2024 Toyota Prius Prime XSE Premium",
        "C472",
        [
        {
                    category: "Engine",
                    mod: "Intake",
                    options: ["Stock", "Sport", "Race"],
                    variant: "Stock Engine",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["Stock"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Intake Manifold / Throttle Body",
                    options: ["Stock", "Sport", "Race"],
                    variant: "Stock Engine",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["Stock"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Fuel System",
                    options: ["Stock", "Street", "Sport", "Race"],
                    variant: "Stock Engine",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["Stock"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Ignition",
                    options: ["Stock", "Race"],
                    variant: "Stock Engine",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["Stock"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Exhaust",
                    options: ["Stock", "Street", "Sport", "Race"],
                    variant: "Stock Engine",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["Stock"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Camshaft",
                    options: ["Stock", "Street", "Sport", "Race"],
                    variant: "Stock Engine",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["Stock"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Valves",
                    options: ["Stock", "Street", "Sport", "Race"],
                    variant: "Stock Engine",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["Stock"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Displacement",
                    options: ["Stock", "street", "sport", "race"],
                    variant: "Stock Engine",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["Stock"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Oil / Cooling",
                    options: ["Stock", "Street", "Sport", "Race"],
                    variant: "Stock Engine",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["Stock"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Flywheel",
                    options: ["Stock", "Street", "Sport", "Race"],
                    variant: "Stock Engine",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["Stock"] }
                    ]
                },
        {
                    category: "Platform and Handling",
                    mod: "Brakes",
                    options: ["Stock", "Street", "Sport", "Race"]
                },
        {
                    category: "Platform and Handling",
                    mod: "Springs and Dampers",
                    options: ["Stock", "Street", "Sport", "Race", "Rally", "Drift"]
                },
        {
                    category: "Platform and Handling",
                    mod: "Front Anti-Roll Bars",
                    options: ["Stock", "Sport", "Race"]
                },
        {
                    category: "Platform and Handling",
                    mod: "Rear Anti-Roll Bars",
                    options: ["Stock", "Sport", "Race"]
                },
        {
                    category: "Platform and Handling",
                    mod: "Chassis Reinforcement / Roll Cage",
                    options: ["Stock", "Street", "Sport", "Race"]
                },
        {
                    category: "Platform and Handling",
                    mod: "Weight Reduction",
                    options: ["Stock", "Street", "Sport", "Race"]
                },
        {
                    category: "Drivetrain",
                    mod: "Clutch",
                    options: ["Stock", "Street", "Sport", "Race"]
                },
        {
                    category: "Drivetrain",
                    mod: "Transmission",
                    options: ["Stock", "Race", "Race: 7 Speed", "Race: 8 Speed", "Race: 9 Speed", "Race: 10 Speed", "Drift: 4 Speed"]
                },
        {
                    category: "Drivetrain",
                    mod: "Driveline",
                    options: ["Stock", "Street", "Sport", "Race"]
                },
        {
                    category: "Drivetrain",
                    mod: "Differential",
                    options: ["Stock", "Street", "Sport", "Race", "Rally"]
                },
        {
                    category: "Tires and Rims",
                    mod: "Tire Compound",
                    options: ["Stock", "Street", "Sport", "Semi-Slick Race", "\"Horizon\" Semi-Slick Race", "Slick", "Drift", "Rally", "Offroad", "Snow", "Drag"]
                },
        {
                    category: "Tires and Rims",
                    mod: "Front Tire Width",
                    options: ["195", "215", "225", "235"]
                },
        {
                    category: "Tires and Rims",
                    mod: "Rear Tire Width",
                    options: ["195", "215", "225", "235"]
                },
        {
                    category: "Tires and Rims",
                    mod: "Wheel Style",
                    options: ["Stock", "Style"]
                },
        {
                    category: "Tires and Rims",
                    mod: "Wheel Size",
                    options: ["Stock", "Size"]
                },
        {
                    category: "Aero and Appearance",
                    mod: "Front Bumper",
                    options: ["Stock", "TRD Front Bumper", "Forza Race"]
                },
        {
                    category: "Aero and Appearance",
                    mod: "Rear Bumper",
                    options: ["Stock", "TRD Rear Bumper", "Forza Race"]
                },
        {
                    category: "Body Kits and Conversions",
                    mod: "Drivetrain Swap",
                    options: ["FWD", "RWD", "AWD"]
                },
        {
                    category: "Body Kits and Conversions",
                    mod: "Aspiration",
                    options: ["NA", "Single Turbo"],
                    variant: "Stock Engine",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["Stock"] }
                    ]
                },
        {
                    category: "Body Kits and Conversions",
                    mod: "Engine Swap",
                    options: ["Stock", "1.6L I3-T", "2.5L I6-T", "1.6L I4 - Turbo Rally", "3.0L I6 - TT", "6.2L V8", "4.8L V10"]
                },
        {
                    category: "Engine",
                    mod: "Single Turbo",
                    options: ["Street Turbo", "Sport Turbo", "Race Turbo"],
                    variant: "Stock Engine · Single Turbo",
                    implicitBase: "Base Single Turbo",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["Stock"] },
                        { category: "Body Kits and Conversions", mod: "Aspiration", options: ["Single Turbo"], variant: "Stock Engine" }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Intercooler",
                    options: ["Stock", "Sport", "Race"],
                    variant: "Stock Engine · Single Turbo",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["Stock"] },
                        { category: "Body Kits and Conversions", mod: "Aspiration", options: ["Single Turbo"], variant: "Stock Engine" }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Intake",
                    options: ["Stock", "Sport", "Race"],
                    variant: "1.6L I3-T",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["1.6L I3-T"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Fuel System",
                    options: ["Stock", "Race"],
                    variant: "1.6L I3-T",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["1.6L I3-T"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Ignition",
                    options: ["Stock", "Race"],
                    variant: "1.6L I3-T",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["1.6L I3-T"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Exhaust",
                    options: ["Stock", "Sport", "Race"],
                    variant: "1.6L I3-T",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["1.6L I3-T"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Camshaft",
                    options: ["Stock", "Race"],
                    variant: "1.6L I3-T",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["1.6L I3-T"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Valves",
                    options: ["Stock", "Sport", "Race"],
                    variant: "1.6L I3-T",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["1.6L I3-T"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Piston / Compression",
                    options: ["Stock", "Race"],
                    variant: "1.6L I3-T",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["1.6L I3-T"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Displacement",
                    options: ["Stock", "race"],
                    variant: "1.6L I3-T",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["1.6L I3-T"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Single Turbo",
                    options: ["Stock", "Sport", "Race", "Race with Anti-lag"],
                    variant: "1.6L I3-T",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["1.6L I3-T"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Intercooler",
                    options: ["Stock", "Sport", "Race"],
                    variant: "1.6L I3-T",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["1.6L I3-T"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Oil / Cooling",
                    options: ["Stock", "Sport", "Race"],
                    variant: "1.6L I3-T",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["1.6L I3-T"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Flywheel",
                    options: ["Stock", "Street", "Sport", "Race"],
                    variant: "1.6L I3-T",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["1.6L I3-T"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Intake",
                    options: ["Stock", "Street", "Sport", "Race"],
                    variant: "2.5L I6-T",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["2.5L I6-T"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Fuel System",
                    options: ["Stock", "Sport", "Race"],
                    variant: "2.5L I6-T",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["2.5L I6-T"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Ignition",
                    options: ["Stock", "Race"],
                    variant: "2.5L I6-T",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["2.5L I6-T"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Exhaust",
                    options: ["Stock", "Street", "Sport", "Race"],
                    variant: "2.5L I6-T",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["2.5L I6-T"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Camshaft",
                    options: ["Stock", "Sport", "Race"],
                    variant: "2.5L I6-T",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["2.5L I6-T"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Valves",
                    options: ["Stock", "Street", "Sport", "Race"],
                    variant: "2.5L I6-T",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["2.5L I6-T"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Piston / Compression",
                    options: ["Stock", "Sport", "Race"],
                    variant: "2.5L I6-T",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["2.5L I6-T"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Displacement",
                    options: ["Stock", "Street", "Sport", "race"],
                    variant: "2.5L I6-T",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["2.5L I6-T"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Single Turbo",
                    options: ["Stock", "Sport", "Race", "Race with Anti-lag"],
                    variant: "2.5L I6-T",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["2.5L I6-T"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Intercooler",
                    options: ["Stock", "Sport", "Race"],
                    variant: "2.5L I6-T",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["2.5L I6-T"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Oil / Cooling",
                    options: ["Stock", "Street", "Sport", "Race"],
                    variant: "2.5L I6-T",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["2.5L I6-T"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Flywheel",
                    options: ["Stock", "Street", "Sport", "Race"],
                    variant: "2.5L I6-T",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["2.5L I6-T"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Camshaft",
                    options: ["Stock", "Race"],
                    variant: "1.6L I4 - Turbo Rally",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["1.6L I4 - Turbo Rally"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Displacement",
                    options: ["Stock", "Race"],
                    variant: "1.6L I4 - Turbo Rally",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["1.6L I4 - Turbo Rally"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Single Turbo",
                    options: ["Stock", "Sport", "Race", "Race with Anti-lag"],
                    variant: "1.6L I4 - Turbo Rally",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["1.6L I4 - Turbo Rally"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Restrictor Plate",
                    options: ["Stock", "No Restrictor Plate", "Remove Restrictors"],
                    variant: "1.6L I4 - Turbo Rally",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["1.6L I4 - Turbo Rally"] }
                    ]
                },
        {
                    category: "Body Kits and Conversions",
                    mod: "Aspiration",
                    options: ["Stock Twin Turbos", "Single Turbo"],
                    variant: "3.0L I6 - TT",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["3.0L I6 - TT"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Single Turbo",
                    options: ["Street Turbo", "Sport Turbo", "Race Turbo", "Race with Anti-Lag"],
                    variant: "3.0L I6 - TT",
                    implicitBase: "Base Single Turbo",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["3.0L I6 - TT"] },
                        { category: "Body Kits and Conversions", mod: "Aspiration", options: ["Single Turbo"], variant: "3.0L I6 - TT" }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Intake",
                    options: ["Stock", "Street", "Sport", "Race"],
                    variant: "3.0L I6 - TT",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["3.0L I6 - TT"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Fuel System",
                    options: ["Stock", "Street", "Sport", "Race"],
                    variant: "3.0L I6 - TT",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["3.0L I6 - TT"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Ignition",
                    options: ["Stock", "Street", "Sport", "Race"],
                    variant: "3.0L I6 - TT",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["3.0L I6 - TT"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Exhaust",
                    options: ["Stock", "Street", "Sport", "Race"],
                    variant: "3.0L I6 - TT",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["3.0L I6 - TT"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Camshaft",
                    options: ["Stock", "Street", "Sport", "Race"],
                    variant: "3.0L I6 - TT",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["3.0L I6 - TT"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Valves",
                    options: ["Stock", "Street", "Sport", "Race"],
                    variant: "3.0L I6 - TT",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["3.0L I6 - TT"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Piston / Compression",
                    options: ["Stock", "Street", "Sport", "Race"],
                    variant: "3.0L I6 - TT",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["3.0L I6 - TT"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Displacement",
                    options: ["Stock", "Sport", "race"],
                    variant: "3.0L I6 - TT",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["3.0L I6 - TT"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Twin Turbos",
                    options: ["Stock", "Sport", "Race", "Race with Anti-lag"],
                    variant: "3.0L I6 - TT",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["3.0L I6 - TT"] },
                        { category: "Body Kits and Conversions", mod: "Aspiration", options: ["Stock Twin Turbos"], variant: "3.0L I6 - TT" }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Intercooler",
                    options: ["Stock", "Sport", "Race"],
                    variant: "3.0L I6 - TT",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["3.0L I6 - TT"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Oil / Cooling",
                    options: ["Stock", "Street", "Sport", "Race"],
                    variant: "3.0L I6 - TT",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["3.0L I6 - TT"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Flywheel",
                    options: ["Stock", "Street", "Sport", "Race"],
                    variant: "3.0L I6 - TT",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["3.0L I6 - TT"] }
                    ]
                },
        {
                    category: "Body Kits and Conversions",
                    mod: "Aspiration",
                    options: ["NA", "Twin Turbos", "Supercharger"],
                    variant: "6.2L V8",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["6.2L V8"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Twin Turbos",
                    options: ["Stock", "Sport", "Race", "Race with Anti-lag"],
                    variant: "6.2L V8",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["6.2L V8"] },
                        { category: "Body Kits and Conversions", mod: "Aspiration", options: ["Twin Turbos"], variant: "6.2L V8" }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Supercharger",
                    options: ["Street", "Sport", "Race"],
                    variant: "6.2L V8",
                    implicitBase: "Base Supercharger",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["6.2L V8"] },
                        { category: "Body Kits and Conversions", mod: "Aspiration", options: ["Supercharger"], variant: "6.2L V8" }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Intake",
                    options: ["Stock", "Street", "Sport", "Race"],
                    variant: "6.2L V8",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["6.2L V8"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Intake Manifold / Throttle Body",
                    options: ["Stock", "Sport", "Race"],
                    variant: "6.2L V8",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["6.2L V8"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Fuel System",
                    options: ["Stock", "Race"],
                    variant: "6.2L V8",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["6.2L V8"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Ignition",
                    options: ["Stock", "Sport", "Race"],
                    variant: "6.2L V8",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["6.2L V8"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Exhaust",
                    options: ["Stock", "Street", "Sport", "Race"],
                    variant: "6.2L V8",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["6.2L V8"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Camshaft",
                    options: ["Stock", "Sport", "Race"],
                    variant: "6.2L V8",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["6.2L V8"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Valves",
                    options: ["Stock", "Street", "Sport", "Race"],
                    variant: "6.2L V8",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["6.2L V8"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Piston / Compression",
                    options: ["Stock", "Race"],
                    variant: "6.2L V8",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["6.2L V8"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Displacement",
                    options: ["Stock", "Street", "Sport", "race"],
                    variant: "6.2L V8",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["6.2L V8"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Oil / Cooling",
                    options: ["Stock", "Sport", "Race"],
                    variant: "6.2L V8",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["6.2L V8"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Flywheel",
                    options: ["Stock", "Street", "Sport", "Race"],
                    variant: "6.2L V8",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["6.2L V8"] }
                    ]
                },
        {
                    category: "Body Kits and Conversions",
                    mod: "Aspiration",
                    options: ["NA", "Twin Turbos"],
                    variant: "4.8L V10",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["4.8L V10"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Twin Turbos",
                    options: ["Stock", "Sport", "Race", "Race with Anti-lag"],
                    variant: "4.8L V10",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["4.8L V10"] },
                        { category: "Body Kits and Conversions", mod: "Aspiration", options: ["Twin Turbos"], variant: "4.8L V10" }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Intercooler",
                    options: ["Stock", "Street", "Sport", "Race"],
                    variant: "4.8L V10",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["4.8L V10"] },
                        { category: "Body Kits and Conversions", mod: "Aspiration", options: ["Twin Turbos"], variant: "4.8L V10" }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Intake",
                    options: ["Stock", "Race"],
                    variant: "4.8L V10",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["4.8L V10"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Intake Manifold / Throttle Body",
                    options: ["Stock", "Sport", "Race"],
                    variant: "4.8L V10",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["4.8L V10"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Fuel System",
                    options: ["Stock", "Street", "Sport", "Race"],
                    variant: "4.8L V10",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["4.8L V10"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Ignition",
                    options: ["Stock", "Race"],
                    variant: "4.8L V10",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["4.8L V10"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Exhaust",
                    options: ["Stock", "Race"],
                    variant: "4.8L V10",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["4.8L V10"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Camshaft",
                    options: ["Stock", "Race"],
                    variant: "4.8L V10",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["4.8L V10"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Valves",
                    options: ["Stock", "Race"],
                    variant: "4.8L V10",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["4.8L V10"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Displacement",
                    options: ["Stock", "race"],
                    variant: "4.8L V10",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["4.8L V10"] }
                    ]
                },
        {
                    category: "Engine",
                    mod: "Flywheel",
                    options: ["Stock", "Sport", "Race"],
                    variant: "4.8L V10",
                    requires: [
                        { category: "Body Kits and Conversions", mod: "Engine Swap", options: ["4.8L V10"] }
                    ]
                }
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
   RACE MAP — APPROXIMATE STARTING AREAS

   These pins are intentionally approximate. They are meant
   to get players into the correct part of the FH6 world map,
   not replace the exact in-game event icon.
   ========================================================= */

export const RACE_MAP_IMAGE_URL =
    "https://forza.labsgg.com/_astro/FH6-full-map.59v5pH0D.jpg";

export const RACE_MAP_SOURCE_URL =
    "https://forza.labsgg.com/interactive-map";


const REGION_MAP_POINTS = {

    "Sotoyama": {
        x: 59,
        y: 15
    },

    "Takashiro": {
        x: 67,
        y: 30
    },

    "Hokubu": {
        x: 52,
        y: 38
    },

    "Ohtani": {
        x: 32,
        y: 54
    },

    "Minamino": {
        x: 50,
        y: 53
    },

    "Ito": {
        x: 70,
        y: 56
    },

    "Tokyo City": {
        x: 49,
        y: 72
    },

    "Shimanoyama": {
        x: 25,
        y: 59
    },

    "Nangan": {
        x: 39,
        y: 84
    },

    "Legend Island": {
        x: 86,
        y: 73
    }

};


const RACE_REGION_BY_NAME = {

    /* STREET */
    "Cedar Run Street Race": "Minamino",
    "Daikoku Chase Street Race": "Tokyo City",
    "Festival Chase Street Race": "Ohtani",
    "Hokubu Ascent Street Race": "Hokubu",
    "Kita Ine Street Race": "Ito",
    "Matsumi Climb Street Race": "Ohtani",
    "Minami Chase Street Race": "Shimanoyama",
    "Nachi Run Street Race": "Takashiro",
    "Norikura Descent Street Race": "Takashiro",
    "Okishinaimura Run Street Race": "Takashiro",
    "Rainbow Bridge Descent Street Race": "Tokyo City",
    "River Descent Street Race": "Minamino",
    "Shimanoyama Charge Street Race": "Shimanoyama",
    "Sunflower Charge Street Race": "Hokubu",
    "Tokyo City Docks Charge Street Race": "Tokyo City",

    /* ROAD */
    "Coastline Sprint": "Nangan",
    "Daikoku Circuit": "Tokyo City",
    "Electric Town Circuit": "Tokyo City",
    "Festival Sprint": "Ohtani",
    "Highway Circuit": "Tokyo City",
    "Hokubu Circuit": "Hokubu",
    "Irokawa Circuit Road Race": "Nangan",
    "Ito Sprint": "Ito",
    "Legend Island Circuit": "Legend Island",
    "Narai-Juku Circuit": "Shimanoyama",
    "Satta Sprint": "Ito",
    "Seaside Park Sprint": "Shimanoyama",
    "Shikisai Sprint": "Hokubu",
    "Shimanoyama Circuit": "Shimanoyama",
    "Shimanoyama Sprint": "Shimanoyama",
    "Shirakawa Circuit": "Sotoyama",
    "Tateyama Kurobe Sprint": "Sotoyama",
    "The Colossus": "Ohtani",
    "The Goliath": "Ohtani",
    "Venus Sprint": "Takashiro",

    /* DRAG */
    "Horizon Festival Drag Strip": "Ohtani",
    "Irokawa Space Center Drag Strip": "Nangan",
    "Ito Airfield Drag Strip": "Ito",

    /* DIRT / RALLY */
    "Airfield Trail": "Minamino",
    "Bamboo Forest Scramble": "Ito",
    "Cherry Field Trail": "Ohtani",
    "Chiheisen Scramble": "Ohtani",
    "Hirosaki Scramble": "Takashiro",
    "Hokubu Trail": "Hokubu",
    "Horizon Stadium Scramble": "Ohtani",
    "Ine Scramble": "Ito",
    "Ito Trail": "Ito",
    "Kawazu Nanadaru Scramble": "Ito",
    "Kinkaku-ji Trail": "Ohtani",
    "Legend Island Trail": "Legend Island",
    "Nukabira Trail": "Takashiro",
    "Oyashirazu Trail": "Ito",
    "Sekibe Scramble": "Ito",
    "Sotoyama Scramble": "Sotoyama",
    "Sunflower Scramble": "Hokubu",
    "Taiyaki Scramble": "Shimanoyama",
    "Takashiro Trail": "Takashiro",
    "The Gauntlet": "Ohtani"

};


const LONG_RACE_NAMES = new Set([
    "The Colossus",
    "The Goliath",
    "The Gauntlet"
]);


export function getRaceMapMeta(race) {

    if (!race) {
        return null;
    }


    const name =
        String(race.name || "").trim();


    const region =
        race.region ||
        RACE_REGION_BY_NAME[name];


    if (!region) {
        return null;
    }


    const point =
        REGION_MAP_POINTS[region];


    if (!point) {
        return null;
    }


    return {
        region: region,
        x: Number.isFinite(race.mapX)
            ? race.mapX
            : point.x,
        y: Number.isFinite(race.mapY)
            ? race.mapY
            : point.y,
        note: LONG_RACE_NAMES.has(name)
            ? "Approximate starting area — this route covers a large part of the map."
            : "Approximate starting area — use the matching race icon in-game for the exact start."
    };

}



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

export function getCarByName(carName) {

    return CAR_LIBRARY.find(car => car.name === carName) || null;

}


export function getUpgradeById(car, modId) {

    if (!car) return null;

    return car.upgrades.find(upgrade => upgrade.id === modId) || null;

}


export function getStockForUpgrade(upgrade) {

    if (!upgrade) return null;

    return upgrade.baseOption || upgrade.options[0] || null;

}


function normalizeOptionValue(value) {
    return String(value || "").trim().toLowerCase();
}


export function getEffectiveUpgradeOption(car, garage, upgrade) {

    if (!upgrade) return null;

    const installed = garage && garage[upgrade.id];

    if (installed && installed.option !== undefined) {
        return String(installed.option);
    }

    const base = getStockForUpgrade(upgrade);
    return base ? base.name : null;

}


export function isUpgradeEligible(car, garage, upgrade, visiting = new Set()) {

    if (!car || !upgrade) return false;

    if (!upgrade.requirements || upgrade.requirements.length === 0) {
        return true;
    }

    if (visiting.has(upgrade.id)) return false;

    const nextVisiting = new Set(visiting);
    nextVisiting.add(upgrade.id);

    return upgrade.requirements.every(function (requirement) {

        const parent = getUpgradeById(car, requirement.modId);
        if (!parent) return false;

        if (!isUpgradeEligible(car, garage, parent, nextVisiting)) {
            return false;
        }

        const current = normalizeOptionValue(
            getEffectiveUpgradeOption(car, garage, parent)
        );

        return requirement.options.some(
            option => normalizeOptionValue(option) === current
        );

    });

}


export function pruneIncompatibleGarage(car, garage) {

    if (!car || !garage) return garage;

    let removed = true;

    while (removed) {
        removed = false;

        Object.keys(garage).forEach(function (modId) {
            const upgrade = getUpgradeById(car, modId);

            if (!upgrade || !isUpgradeEligible(car, garage, upgrade)) {
                delete garage[modId];
                removed = true;
            }
        });
    }

    return garage;

}


export function randomFromArray(array) {

    return array[Math.floor(Math.random() * array.length)];

}


export function getRandomUpgradeRoll(car, garage = {}) {

    if (!car || !car.upgrades.length) return null;

    const eligibleUpgrades = car.upgrades.filter(
        upgrade =>
            upgrade.options.length > 0 &&
            isUpgradeEligible(car, garage, upgrade)
    );

    if (eligibleUpgrades.length === 0) return null;

    /* Category first, then an eligible mod, then a real in-game option. */
    const categories = [
        ...new Set(
            eligibleUpgrades.map(upgrade => upgrade.category)
        )
    ];

    const category = randomFromArray(categories);

    const categoryMods = eligibleUpgrades.filter(
        upgrade => upgrade.category === category
    );

    const upgrade = randomFromArray(categoryMods);
    const option = randomFromArray(upgrade.options);

    return {
        category: upgrade.category,
        mod: upgrade.mod,
        modId: upgrade.id,
        variant: upgrade.variantLabel || "",
        option: option.name,
        tier: option.tier
    };

}
