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
        } else {
            console.log("\n Pokemon ID: " + res.data.id);
            console.log("\n Pokemon Name: " + res.data.name);
            console.log("\n Pokemon Types: ");
            res.data.types.forEach( i => {
                console.log(" " + i.type.name);
            });
        }
    })
    .catch(function (error) {
        // handle error
        console.log("no Pokemon found.");
    });