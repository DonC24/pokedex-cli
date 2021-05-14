#!/usr/bin/env node

const yargs = require("yargs");
const axios = require("axios");
const fs = require('fs');
const path = require('path');

function mkDirByPathSync(targetDir, { isRelativeToScript = false } = {}) {
        const sep = path.sep;
        const initDir = path.isAbsolute(targetDir) ? sep : '';
        const baseDir = isRelativeToScript ? __dirname : '.';

        return targetDir.split(sep).reduce((parentDir, childDir) => {
            const curDir = path.resolve(baseDir, parentDir, childDir);
            try {
            fs.mkdirSync(curDir);
            } catch (err) {
                if (err.code === 'EEXIST') { // curDir already exists!
                    return curDir;
                }

            // To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows.
            if (err.code === 'ENOENT') { // Throw the original parentDir error on curDir `ENOENT` failure.
                throw new Error(`EACCES: permission denied, mkdir '${parentDir}'`);
            }

            const caughtErr = ['EACCES', 'EPERM', 'EISDIR'].indexOf(err.code) > -1;
            if (!caughtErr || caughtErr && curDir === path.resolve(targetDir)) {
                throw err; // Throw if it's just the last created dir.
            }
       }

        return curDir;
    }, initDir);
}

function pokemonNameStats(resData) {
    console.log("\n Pokemon ID: " + resData.id);
    console.log("\n Pokemon Name: " + resData.name);
    console.log("\n Pokemon Types: ");
    resData.types.forEach( i => {
        console.log(" " + i.type.name);
    });
    console.log("\n Pokemon Stats: ");
    resData.stats.forEach( i => {
        console.log(" " + i.stat.name);
        console.log("  Base stat: " + i.base_stat);
    });
    return resData.id;
}

function kantoEncounters(resData2) {
    console.log("\n Encounters: ")
    resData2.forEach( i => {
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
}

mkDirByPathSync('../cache_folder', {isRelativeToScript: true});

const options = yargs
    .usage("Usage: -s <pokemon name or id>")
    .option("s", { alias: "search", describe: "Search term", type: "string" })
    .argv;

const greet = `Hello!`;

console.log(greet);

if (options.search) {
    console.log(`Searching for pokemon ${options.search}...`)
} else {
    console.log("Here's a pokemon for you: ");
}

const url = options.search ? `https://pokeapi.co/api/v2/pokemon/${options.search}` : "https://pokeapi.co/api/v2/pokemon/ditto";
//console.log(url);

axios.get(url, { headers: { Accept: "application/json" } })
    .then(res => {
        //console.log (res);
        let fileName = res.data.id + "_" + res.data.name;
        let filePath = __dirname +  `/../cache_folder/${fileName}.txt`;
        let resData = res.data;
        let resInfo = {name: resData.name, id: resData.id};

        fs.access(filePath, fs.F_OK, (err) => {
            if (err) {
                // console.error(err);
                pokemonNameStats(resData);
                let stringRes = JSON.stringify(res.data);

                fs.writeFile(filePath, stringRes, (err) => {
                    // throws an error, you could also catch it here
                    if (err){
                        throw err;
                    }

                    // success case, the file was saved
                    //console.log('Pokemon saved!');
                });
                return resInfo;
            }

            //file exists
            try {
                let pastDate = new Date(Date.now() - 604800000);
                const stats = fs.statSync(filePath);

                // print file last modified date
                //console.log(`File Data Last Modified: ${stats.mtime}`);

                if (stats.mtime > pastDate) {
                    console.log("cached file is > pastDate");
                    fs.readFile(filePath, 'utf8' , (err, data) => {
                      if (err) {
                        console.error(err);
                        return;
                      }
                      console.log("getting data from cache");
                      let cachedData = JSON.parse(data);
                      pokemonNameStats(cachedData);
                    })

                    return resInfo;
                } else {
                    pokemonNameStats(resData);
                    let stringRes = JSON.stringify(res.data);
                    //console.log(stringRes);

                    fs.writeFile(filePath, stringRes, (err) => {
                        // throws an error, you could also catch it here
                        if (err){
                            console.log("No Encounters" + error);
                            throw err;
                        }

                        // success case, the file was saved
                        //console.log('Pokemon saved!');
                    });
                    return resInfo;
                }
            } catch (error) {
                console.log(error);
            }
        })

        return resInfo;
    })
    .then(info => {
        return axios.get(`https://pokeapi.co/api/v2/pokemon/${info.id}/encounters`, {
            params: {
                name: info.name,
                id: info.id
            }
        })
    })
    .then(res2 => {
        let pokeNameQuotes = JSON.stringify(res2.config.params.name);
        let pokeName= pokeNameQuotes.replace(/^"(.*)"$/, '$1');
        let pokeId = JSON.stringify(res2.config.params.id);
        let encFileName = pokeId + "_" + pokeName;
        let encFilePath = __dirname +  `/../cache_folder/${encFileName}_encounters.txt`;
        let resData2 = res2.data;

        fs.access(encFilePath, fs.F_OK, (err) => {
            if (err) {
                // console.error(err);
                kantoEncounters(resData2);
                let stringRes = JSON.stringify(res2.data);
                //console.log(stringRes);

                fs.writeFile(encFilePath, stringRes, (err) => {
                    // throws an error, you could also catch it here
                    if (err){
                        throw err;
                    }

                    // success case, the file was saved
                    //console.log('Encounter saved!');
                });
                return;
            }

            //file exists
            try {
                let pastDate = new Date(Date.now() - 604800000);
                const stats = fs.statSync(encFilePath);

                // print file last modified date
                //console.log(`File Data Last Modified: ${stats.mtime}`);

                if (stats.mtime > pastDate) {
                    console.log("cached file is > pastDate");
                    fs.readFile(encFilePath, 'utf8' , (err, data2) => {
                      if (err) {
                        console.error(err);
                        return;
                      }
                      console.log("getting data from cache");
                      let encCachedData = JSON.parse(data2);
                      kantoEncounters(encCachedData);
                    })

                    return;
                } else {
                    kantoEncounters(resData2);
                    let stringRes = JSON.stringify(res2.data);
                    //console.log(stringRes);

                    fs.writeFile(encFilePath, stringRes, (err) => {
                        // throws an error, you could also catch it here
                        if (err){
                            console.log("No Encounters" + error);
                            throw err;
                        }

                        // success case, the file was saved
                        //console.log('Encounter saved!');
                    });
                }
            } catch (error) {
                console.log("No Encounters" + error);
            }
        })
    })
    .catch(function (error) {
        // handle error
        console.log("No Pokemon found." + error);
    });