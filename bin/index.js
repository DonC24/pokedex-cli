#!/usr/bin/env node

const yargs = require("yargs");
const axios = require("axios");

const options = yargs
 .usage("Usage: -s <pokemon name or id>")
 .option("s", { alias: "search", describe: "Search term", type: "string" })
 .argv;

const greet = `Hello!`;

console.log(greet);

if (options.search) {
    console.log(`Searching for pokemon ${options.search}...`)
} else {
    console.log("Here's a pokemon for you:");
}

const url = options.search ? `https://pokeapi.co/api/v2/pokemon/${options.search}` : "https://pokeapi.co/api/v2/pokemon/ditto";
console.log(url);

axios.get(url, { headers: { Accept: "application/json" } })
    .then(res => {
        if (options.search) {
            /*console.log(res);*/
            console.log("\n Pokemon ID: " + res.data.id);
            console.log("\n Pokemon Name: " + res.data.name);
            console.log("\n Pokemon Types: ");
            res.data.types.forEach( i => {
                console.log(" " + i.type.name);
            });
            console.log("\n Pokemon Stats: ");
            res.data.stats.forEach( i => {
                console.log(" " + i.stat.name);
                console.log("  Base stat: " + i.base_stat);
            });
        } else {
            console.log("\n Pokemon ID: " + res.data.id);
            console.log("\n Pokemon Name: " + res.data.name);
            console.log("\n Pokemon Types: ");
            res.data.types.forEach( i => {
                console.log(" " + i.type.name);
            });
            console.log("\n Pokemon Stats: ");
            res.data.stats.forEach( i => {
                console.log(" " + i.stat.name);
                console.log("  Base stat: " + i.base_stat);
            });
        }
        return res.data.id;
    })
    .then(info => { return axios.get(`https://pokeapi.co/api/v2/pokemon/${info}/encounters`)})
    .then(res2 => {
        console.log("\n Encounters: ")
        res2.data.forEach( i => {
                let loc_name = i.location_area.name;
                let loc_kan = loc_name.search("kanto");
                if (loc_kan > -1) {
                    console.log("\n Location Area Name: " + i.location_area.name);
                    i.version_details.forEach( j => {
                        console.log("\n Version: " + j.version.name);
                        j.encounter_details.forEach( k => {
                            console.log("\n   Method: ")
                            console.log("   " + k.method.name);
                        })
                    })
                } else {
                    console.log("-");
                }
            });
    })
    .catch(function (error) {
        // handle error
        console.log("no Pokemon found.");
    });