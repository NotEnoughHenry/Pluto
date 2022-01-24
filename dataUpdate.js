const Discord = require('discord.js');
const client = new Discord.Client();
const axios = require('axios');
const fs = require('fs');

const { google } = require('googleapis');
const creds = require('./google-sheets-node/client_secret.json');
const { firebasedynamiclinks } = require('googleapis/build/src/apis/firebasedynamiclinks');
const { sheets } = require('googleapis/build/src/apis/sheets');
var playerData = null;

// const puppeteer = require('puppeteer-extra'); // Only use if I need to scrape data
// puppeteer.use(require('puppeteer-extra-plugin-stealth'));
// const detectHeadless = require('puppeteer-extra-plugin-stealth/examples/detect-headless');

const googleClient = new google.auth.JWT(
    creds.client_email,
    null,
    creds.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
);

googleClient.authorize(function(err,tokens){
    if(err){
        console.log('dataUpload: ERROR!');
        console.log(err);
        return;
    } else {
        console.log('dataUpload: connected!');
    }
});

const gsapi = google.sheets({version: 'v4', auth: googleClient});

/* Tracker Links
 * https://api.tracker.gg/api/v2/rocket-league/standard/profile/ + console + / + SteamID/Console Username
 * https://api.tracker.gg/api/v1/rocket-league/player-history/mmr/ + trackerID
*/



module.exports = {
    async massAdd(option) {
        playerData = JSON.parse(fs.readFileSync('playerData.json')); // MUST RUN THIS EVERYTIME I TAKE DATA FROM THE playerData.json

        var leagueData;
        var opt;
        var failedUsers = [];
        var linkIndex;
        if (option == 2) { // twos
            leagueData = playerData.Twos;
            opt = {
                spreadsheetId: '1Hi_hJNBkzKdWDeKTIRH6CsczePQSNOa-i92IXTfdWhY',
                ranges: `DIRECTORY!A2:J`,
                auth: googleClient
            };
            linkIndex = 8;
        } else { // option == 3 - threes
            leagueData = playerData.Threes;
            opt = {
                spreadsheetId: '1H-gpEAodFBIn7LExpnicoNU1ioz5ThzqtjXmvm9F8Oo',
                ranges: `DIRECTORY!A2:J`,
                auth: googleClient
            };
            linkIndex = 9;
        }
        var playerList = await gsapi.spreadsheets.values.batchGet(opt)
        .catch(function (error) {
            console.log(error);
            console.log("\nERROR: LEAGUE NOT SPECIFIED\n");
        });

        // console.log(playerList.data.valueRanges[0].values);
        playerList = playerList.data.valueRanges[0].values;
        var count = 0;
        for (var i = 0; i < playerList.length; i++) {
            var canAdd = true;
            // if (count % 5 == 0 && count != 0) { // Add if necessary
            //     console.log(`${count} added so far.`);
            // }
            for (var j = 0; j < Object.keys(leagueData).length; j++) {
                if (playerList[i][1] == Object.keys(leagueData)[j]) {
                    canAdd = false;
                    break;
                }
            }
            if (canAdd) {
                // console.log("ADDING " + playerList[i][1]); // Use if necessary
                count++;
                try {
                    leagueData = {...leagueData, 
                        [playerList[i][1]]:{
                            "username": playerList[i][2],
                            "division": "NA",
                            "team": "FA",
                            "salary": 0,
                            "goals": 0,
                            "saves": 0,
                            "shots": 0,
                            "assists": 0,
                            "trackerID": `${await findTracker(playerList[i][linkIndex])}`
                    }};
                } catch {
                    count--;
                    // console.log(`${playerList[i]} Errored Out`); // Use if necessary
                    failedUsers.push(playerList[i]);
                }
            // } else {
            //     leagueData = {...leagueData, 
            //         [playerList[i][1]]:{
            //             "username": leagueData[playerList[i][1]].username,
            //             "division": leagueData[playerList[i][1]].division,
            //             "team": leagueData[playerList[i][1]].team,
            //             "role": leagueData[playerList[i][1]].role,
            //             "salary": leagueData[playerList[i][1]].salary,
            //             "goals": leagueData[playerList[i][1]].goals,
            //             "saves": leagueData[playerList[i][1]].saves,
            //             "shots": leagueData[playerList[i][1]].shots,
            //             "assists": leagueData[playerList[i][1]].assist,
            //             "games": leagueData[playerList[i][1]].games,
            //             "trackerID": leagueData[playerList[i][1]].trackerID,
            //         }
            //     }
            }
        }
        console.log(`\n${count} added in total.\n`);
        var userData = {
            Twos: null,
            Threes: null
        };

        if (option == 2) { // twos
            userData.Twos = leagueData;
            userData.Threes = playerData.Threes;
        } else { // option == 3 - threes
            userData.Twos = playerData.Twos;
            userData.Threes = leagueData;
        }

        fs.writeFile('./playerData.json', JSON.stringify(userData, null, '\t'), err => {
            if(err) throw err;
        });
        var failedUserData = "";
        for (var i = 0; i < failedUsers.length; i++) {
            failedUserData += `${failedUsers[i][0]} | ${failedUsers[i][1]} | ${failedUsers[i][2]} | ${failedUsers[i][failedUsers[i].length - 1]}\n`;
        }
        fs.writeFile('./oldTrackerUsers.txt', failedUserData, err => {
            if(err) throw err;
        });
    },

    // give FA roles: FA + division
    async addPlayer(msg, id, guilds) { // Add initial data and trackerID
        playerData = JSON.parse(fs.readFileSync('playerData.json')); // MUST RUN THIS EVERYTIME I TAKE DATA FROM THE playerData.json
        var leagueData;
        var opt;
        var guild = 0;

        try {
            if (msg.guild.id == guilds[0].id) { // Twos
                leagueData = playerData.Twos;
                guild = 2;
                opt = {
                    spreadsheetId: '1Hi_hJNBkzKdWDeKTIRH6CsczePQSNOa-i92IXTfdWhY',
                    ranges: `DIRECTORY!A2:J`,
                    auth: googleClient
                };
            } else if (msg.guild.id == guilds[1].id) { // Threes
                leagueData = playerData.Threes;
                guild = 3;
                // Threes Sheet
            }
        } catch(error) {
            // msg.channel.send("`Error: Cannot find URL Discord, using default. Contact @NotHenry#4271 for assistance`");
            // return;
            leagueData = playerData.Twos;
            guild = 2;
            opt = {
                spreadsheetId: '1Hi_hJNBkzKdWDeKTIRH6CsczePQSNOa-i92IXTfdWhY',
                ranges: `DIRECTORY!A2:J`,
                auth: googleClient
            };
        }

        var playerList = await gsapi.spreadsheets.values.batchGet(opt);
        playerList = playerList.data.valueRanges[0].values;
        for (var i = playerList.length - 1; i >= 0; i--) {
            if (id == playerList[i][1]) {
                try {
                    leagueData = {...leagueData,
                        [playerList[i][1]]:{
                            "username": playerList[i][0].split("#")[0],
                            "division": "NA",
                            "team": "FA",
                            "role": "Player",
                            "salary": 0,
                            "goals": 0,
                            "saves": 0,
                            "shots": 0,
                            "assists": 0,
                            "games": 0,
                            "trackerID": `${await findTracker(playerList[i][8])}`
                    }};
                } catch {
                    console.log(`${playerList[i]} Errored Out`);
                    msg.channel.send("Failed to add player. Check Tracker. Contact NotHenry");
                }
                break;
            }
        }

        leagueData[playerList[i][1]] = await findMMR(leagueData[playerList[i][1]], guild);
        
        var userData = {
            Twos: null,
            Threes: null
        };
        
        if (guild == 2) { // twos
            userData.Twos = leagueData;
            userData.Threes = playerData.Threes;
        } else { // option == 3 - threes
            userData.Threes = leagueData;
            userData.Twos = playerData.Twos;
        }

        fs.writeFile('./playerData.json', JSON.stringify(userData, null, '\t'), err => {
            if(err) throw err;
        });

        // Give them roles now To Do
    },

    async updatePlayerData() { // Everything but MMR
        
    },
    /* Salary Per Division
     * Contender 0-10
     * All-Star 10-12
     * Ultimate 12.5-14.5
     * Legends 15-∞
    */ 

    // console.log(twosPlayers[Object.keys(twosPlayers)[0]]);
    async updateMMRs(option) { // JUST MMR - command is made for two's and three's
        playerData = JSON.parse(fs.readFileSync('playerData.json')); // MUST RUN THIS EVERYTIME I TAKE DATA FROM THE playerData.json

        var leagueData;
        if (option == 2) { // twos
            leagueData = playerData.Twos;
        } else { // option == 3 - threes
            leagueData = playerData.Threes;
        }
        
        // update twos
        for (var i = 0; i < Object.keys(leagueData).length; i++) {
            // if (i % 50 == 0) { // Add if necessary
            //     console.log(`${i} completed thus far`);
            // }
            leagueData[Object.keys(leagueData)[i]] = await findMMR(leagueData[Object.keys(leagueData)[i]], option);
        }
        console.log(`${Object.keys(leagueData).length} total players MMR updated`);

        var userData = {
            Twos: null,
            Threes: null
        };

        if (option == 2) { // twos
            userData.Twos = leagueData;
            userData.Threes = playerData.Threes;
        } else { // option == 3 - threes
            userData.Threes = leagueData;
            userData.Twos = playerData.Twos;
        }

        fs.writeFile('./playerData.json', JSON.stringify(userData, null, '\t'), err => {
            if(err) throw err;
        });
        console.log(`\nMMR for ${option}'s Updated\n`);
    }
}

// https://rocketleague.tracker.network/rocket-league/profile/steam/76561198147616652/mmr?playlist=11
async function findTracker(link) { // Used to find trackerID
    var system = link.split("/")[5];
    var userID = link.split("/")[6];
    var data = await axios.get(`https://api.tracker.gg/api/v2/rocket-league/standard/profile/${system}/${userID}`,{timeout: 10000});
    return data.data.data.metadata.playerId;
}

async function findMMR(player, option) {
    var hasTwos = true, hasThrees = true;
    var data = await axios.get(`https://api.tracker.gg/api/v1/rocket-league/player-history/mmr/${player.trackerID}`).catch((err) => {console.log(err.response)});
            try {
                var max2 = data.data.data['11'][data.data.data['11'].length - 1].rating;
                for (var j = 0; j < data.data.data['11'].length - 1; j++) { // finding max 2's mmr
                    if (data.data.data['11'][j].rating > max2)
                        max2 = data.data.data['11'][j].rating;
                }
                max2 = (Math.floor(max2/50)*50)/100 + 0.5;
            } catch {
                var max2 = 0;
                hasTwos = false;
            }
            try {
                var max3 = data.data.data['11'][data.data.data['13'].length - 1].rating;
                for (var j = 0; j < data.data.data['13'].length - 1; j++) { // finding max 2's mmr
                    if (data.data.data['13'][j].rating > max3)
                        max3 = data.data.data['13'][j].rating;
                }
                max3 = ((Math.floor(max3/50)*50)/100 + 0.5);
            } catch { 
                var max3 = 0;
                hasThrees = false;
            }
            if (option == 2) { // twos
                if (max2 >= max3 || !hasThrees)
                    player.salary = Math.max(max2, player.salary);
                else {
                    player.salary = Math.max(((Math.floor(((max2 + max3)*50)/50)*50)/100 + 0.5), player.salary);
                }
            } else { // option == 3 - threes
                if (max3 > max2 || !hasTwos) {
                    player.salary = Math.max(max3, player.salary);
                } else {
                    player.salary = Math.max(((Math.floor(((max2 + max3)*50)/50)*50)/100 + 0.5), player.salary);
                }
            }

            if (player.salary <= 10) {
                player.division = "Contender";
            } else if (player.salary <= 12) {
                player.division = "All-Star";
            } else if (player.salary <= 14.5) {
                player.division = "Ultimate";
            } else {
                player.division = "Legends";
            }
    return player;
}