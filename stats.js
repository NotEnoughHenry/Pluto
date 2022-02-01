const Discord = require('discord.js');
const client = new Discord.Client();
const axios = require('axios');
const fs = require('fs');

const { google } = require('googleapis');
const creds = require('./google-sheets-node/client_secret.json');
const { firebasedynamiclinks } = require('googleapis/build/src/apis/firebasedynamiclinks');
const { sheets } = require('googleapis/build/src/apis/sheets');
var playerData = require('./playerData.json');
var teamsData = require('./teamsData.json');
const { findOneChild } = require('domutils');

const googleClient = new google.auth.JWT(
    creds.client_email,
    null,
    creds.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
);

googleClient.authorize(function(err,tokens){
    if(err){
        console.log('Stats: ERROR!');
        console.log(err);
        return;
    } else {
        console.log('Stats: connected!');
        googleToken = tokens.access_token;
    }
});

const gsapi = google.sheets({version: 'v4', auth: googleClient});

module.exports = {
    async updateStats() {

    },

    async setTeams(option) { // ============================ NOT BUILT FOR 3's ============================
        if (option == 3) return;
        var opt;
        var teamCount;
        if (option == 2) { // twos
            opt = {
                spreadsheetId: '1Hi_hJNBkzKdWDeKTIRH6CsczePQSNOa-i92IXTfdWhY',
                ranges: `Teams!${collum[i][0]}3:${collum[i][1]}38`,
                auth: googleClient
            };
            teamCount = 20;
        } else { // option == 3 - threes
            opt = {
                spreadsheetId: '1H-gpEAodFBIn7LExpnicoNU1ioz5ThzqtjXmvm9F8Oo',
                ranges: `Teams!${collum[i][0]}3:${collum[i][1]}38`,
                auth: googleClient
            };
            teamCount = 12;
        }

        teamsData = JSON.parse(fs.readFileSync('teamsData.json')); // MUST RUN THIS EVERYTIME I TAKE DATA FROM THE teamsData.json
        playerData = JSON.parse(fs.readFileSync('playerData.json')); // MUST RUN THIS EVERYTIME I TAKE DATA FROM THE playerData.json

        var data;
        var teams = {};
        var collum = [['F','G'], ['H','I'], ['J','K'], ['L','M'], ['N','O'], ['P','Q'], ['R','S'], ['T','U'], ['V','W'], ['X','Y'], ['Z','AA'], ['AB','AC'], ['AD','AE'], ['AF','AG'], [`AH`,`AI`], [`AJ`,`AK`], [`AL`,`AM`],[`AN`,`AO`],[`AP`,`AQ`],[`AR`,`AS`]];
        for (var i = 0; i < teamCount; i++) {
            
            var data = await gsapi.spreadsheets.values.batchGet(opt);
            data = data.data.valueRanges[0].values;
            // Format data
            teams = {...teams, // Adding teams
                [data[0]]: {
                    "GM": data[2][1],
                    "AGM": data[3][1],
                    "Legends": {
                        "Captain": data[4][1],
                        "playerA": {
                            "username": data[6][0],
                            "discordID": findID(data[6][0], option)
                        },
                        "playerB": {
                            "username": data[7][0],
                            "discordID": findID(data[7][0], option)
                        },
                        "playerC": {
                            "username": data[8][0],
                            "discordID": findID(data[8][0], option)
                        },
                        "playerD": {
                            "username": data[9][0],
                            "discordID": findID(data[9][0], option)
                        }
                    },
                    "Ultimate": {
                        "Captain": data[12][1],
                        "playerA": {
                            "username": data[14][0],
                            "discordID": findID(data[14][0], option)
                        },
                        "playerB": {
                            "username": data[15][0],
                            "discordID": findID(data[15][0], option)
                        },
                        "playerC": {
                            "username": data[16][0],
                            "discordID": findID(data[16][0], option)
                        },
                        "playerD": {
                            "username": data[17][0],
                            "discordID": findID(data[17][0], option)
                        }
                    },
                    "All-Star": {
                        "Captain": data[20][1],
                        "playerA": {
                            "username": data[22][0],
                            "discordID": findID(data[22][0], option)
                        },
                        "playerB": {
                            "username": data[23][0],
                            "discordID": findID(data[23][0], option)
                        },
                        "playerC": {
                            "username": data[24][0],
                            "discordID": findID(data[24][0], option)
                        },
                        "playerD": {
                            "username": data[25][0],
                            "discordID": findID(data[25][0], option)
                        }
                    },
                    "Contender": {
                        "Captain": data[28][1],
                        "playerA": {
                            "username": data[30][0],
                            "discordID": findID(data[30][0], option)
                        },
                        "playerB": {
                            "username": data[31][0],
                            "discordID": findID(data[31][0], option)
                        },
                        "playerC": {
                            "username": data[32][0],
                            "discordID": findID(data[32][0], option)
                        },
                        "playerD": {
                            "username": data[33][0],
                            "discordID": findID(data[33][0], option)
                        }
                    }
                }
            };
            // console.log(`${i+1}: ${data[0]} complete`); // Turn on if necessary
        }

        var userData = {
            Twos: null,
            Threes: null
        };

        if (option == 2) { // twos
            userData.Twos = teams;
            userData.Threes = teamsData.Threes;
        } else { // option == 3 - threes
            userData.Threes = teams;
            userData.Twos = teamsData.Twos;
        }

        fs.writeFile('./teamsData.json', JSON.stringify(userData, null, '\t'), err => {
            if(err) throw err;
        });
        console.log("All Teams Updataed.");
    },

    async teamInfo(option, team, msg) {
        teamsData = JSON.parse(fs.readFileSync('teamsData.json')); // MUST RUN THIS EVERYTIME I TAKE DATA FROM THE teamsData.json
        playerData = JSON.parse(fs.readFileSync('playerData.json')); // MUST RUN THIS EVERYTIME I TAKE DATA FROM THE playerData.json
        var players;
        var teams;
        if (option == 2) {
            players = playerData.Twos;
            teams = teamsData.Twos;
        } else { 
            players = playerData.Threes;
            teams = teamsData.Threes;
        }
        var temp = "";
        for (var i = 0; i < team.length; i++) {
            temp += team[i] + " ";
        }
        team = temp.substring(0, temp.length - 1);

        var count = 0;
        var temp;
        var teamName;
        for (var i = 0; i < Object.keys(teams).length; i++) {
            if (Object.keys(teams)[i].toUpperCase().indexOf(team.toUpperCase()) >= 0) {
                count++;
                temp = teams[Object.keys(teams)[i]];
                teamName = Object.keys(teams)[i];
            }
        }
        if (count > 1 || count == 0) 
            team = null;
        else
            team = temp;

        if (team == null) {
            msg.channel.send("``ERROR: Team not found``");
            return;
        } 

        var teamImage;
        switch (teamName) { // ADD THREE's IMAGES
            case "California Bears":
                teamImage = "https://cdn.discordapp.com/attachments/927578169043714168/933143125772341320/CABearsTransparent.png";
                break;
            case "London Cobras":
                teamImage = "https://cdn.discordapp.com/attachments/861814462654185502/918252762955939840/LNCobrasTransparent.png";
                break;
            case "Oregon Trout":
                teamImage = "https://cdn.discordapp.com/attachments/861814462654185502/895017114082103336/ORTroutTransparent.png";
                break;
            case "Montana Menaces":
                teamImage = "https://cdn.discordapp.com/attachments/861814462654185502/898337138603601970/MTMenacesTransparent.png";
                break;
            case "Colorado Peaks":
                teamImage = "https://cdn.discordapp.com/attachments/861814462654185502/895012381468532776/COPeaksTransparent.png";
                break;
            case "Las Vegas Aces":
                teamImage = "https://cdn.discordapp.com/attachments/861814462654185502/895013357831192627/LVAcesTransparent.png";
                break;
            case "Idaho Elk":
                teamImage = "https://cdn.discordapp.com/attachments/861814462654185502/895013064976506910/IDElkTransparent.png";
                break;
            case "Maryland Pirates":
                teamImage = "https://cdn.discordapp.com/attachments/861814462654185502/895016027820290068/MDPiratesTransparent.png";
                break;
            case "Vermont Owls":
                teamImage = "https://cdn.discordapp.com/attachments/927578169043714168/933105048358117446/VTOwlsTransparent.png";
                break;
            case "Michigan Cherries":
                teamImage = "https://cdn.discordapp.com/attachments/861814462654185502/895016343554895922/MICherriesTransparent.png";
                break;
            case "New Orleans Jesters":
                teamImage = "https://cdn.discordapp.com/attachments/927578169043714168/933105046940438638/NOJestersTransparent.png";
                break;
            case "Chicago Huskies":
                teamImage = "https://cdn.discordapp.com/attachments/861814462654185502/903757669549105172/CHHuskies.png";
                break;
            case "Texas Rodeo":
                teamImage = "https://cdn.discordapp.com/attachments/861814462654185502/895017512691990558/TXRodeoTransparent.png";
                break;
            case "Georgia Outlaws":
                teamImage = "https://cdn.discordapp.com/attachments/861814462654185502/895012676613312512/GAOutlawsTransparent.png";
                break;
            case "St. Louis Hydras":
                teamImage = "https://cdn.discordapp.com/attachments/927578169043714168/933105047909306448/STLHydrasTransparent.png";
                break;
            case "Tokyo Red Pandas":
                teamImage = "https://cdn.discordapp.com/attachments/927578169043714168/933105047389241464/RedPandasTransparent.png";
                break;
            case "Miami Sharks":
                teamImage = "https://cdn.discordapp.com/attachments/927578169043714168/933105047615701082/SharksTransparent.png";
                break;
            case "Seattle Botls":
                teamImage = "https://cdn.discordapp.com/attachments/927578169043714168/933104946369405039/BoltsTransparent.png";
                break;
            case "Boston Knights":
                teamImage = "https://cdn.discordapp.com/attachments/927578169043714168/933104946621054986/BOSKnightsTransparent.png";
                break;
            case "Montreal Monarchs":
                teamImage = "https://cdn.discordapp.com/attachments/927578169043714168/933105046529409044/MTLMonarchsTransparent.png";
                break;
            case "Alaska Yetis":
                teamImage = "https://media.discordapp.net/attachments/925528910010134568/937904151684333608/Alaska_Yetis_Final_LOGO.png?width=670&height=670";
                break;
            case "Arizona Scorpions":
                teamImage = "https://media.discordapp.net/attachments/925528910010134568/937904152196042762/Arizona_Scorpions_Final_LOGO.png?width=670&height=670";
                break;
            case "Carolina Pirates":
                teamImage = "https://media.discordapp.net/attachments/925528910010134568/937904152682594344/Carolina_Pirates_Final_LOGO.png?width=670&height=670";
                break;
            case "Oregon Ninjas":
                teamImage = "https://media.discordapp.net/attachments/925528910010134568/937904182042714112/Oregon_Ninjas_Final_LOGO.png?width=670&height=670";
                break;
            case "Hawaii Tikis":
                teamImage = "https://media.discordapp.net/attachments/925528910010134568/937904153588531280/image0.png?width=670&height=670";
                break;
            case "Iceland Foxes":
                teamImage = "https://media.discordapp.net/attachments/925528910010134568/937904153215246356/Iceland_Foxes.png?width=670&height=670";
                break;
            case "Los Angeles Astros":
                teamImage = "https://media.discordapp.net/attachments/925528910010134568/937904154133794886/LA_Astros_Final_LOGO.png?width=670&height=670";
                break;
            case "Michigan Blizzard":
                teamImage = "https://media.discordapp.net/attachments/925528910010134568/937904154796515348/Michigan_Blizzard_Final_LOGO.png?width=670&height=670";
                break;
            case "New York Liberty":
                teamImage = "https://media.discordapp.net/attachments/925528910010134568/937904151269093486/New_York_Liberty_Final_LOGO.png?width=670&height=670";
                break;
            case "Ohio Gorillas":
                teamImage = "https://media.discordapp.net/attachments/925528910010134568/937904181673623572/OHGorillas.png?width=693&height=671";
                break;
            case "San Francisco Gold Miners":
                teamImage = "https://media.discordapp.net/attachments/925528910010134568/937904183099682866/SF_Gold_Miners_Final_LOGO.png?width=670&height=670";
                break;
            case "Washington Angels":
                teamImage = "https://media.discordapp.net/attachments/925528910010134568/937904181023502436/Washington_Angels_Final_LOGO.png?width=670&height=670";
                break;
        }
        
        var longestString = 12;
        for (var i = 2; i < 6; i++) { // 4 Leagues
            var league = team[Object.keys(team)[i]];
            for (var j = 0; j < Object.keys(league).length; j++) {
                try {
                    if (league[Object.keys(league)[j]].username.length > longestString) {
                        longestString = league[Object.keys(league)[j]].username.length;
                    }
                } catch {}
            }
        }
        // Setting String lengths
        var playerList = [];
        for (var i = 2; i < 6; i++) { // 4 Leagues
            var league = team[Object.keys(team)[i]];
            var group = [];
            var totalSalary = 0;
            for (var j = 0; j < Object.keys(league).length; j++) {
                try {
                    while (league[Object.keys(league)[j]].username.length < longestString) {
                        league[Object.keys(league)[j]].username += " ";
                    }
                    var salary = 0;

                    if (option == 2) {
                        var id = league[Object.keys(league)[j]].discordID;
                        salary = playerData.Twos[id].salary;
                    } else {
                        var id = league[Object.keys(league)[j]].discordID;
                        salary = playerData.Threes[id].salary;
                    }
                    totalSalary += salary;
                    group.push([league[Object.keys(league)[j]].username, salary])
                } catch {}
            }
            var tempString = "TOTAL SALARY";
            while (tempString.length < longestString) {
                tempString += " ";
            }
            group.push([tempString, totalSalary]);
            playerList.push(group);
        }
        var legends = [];
        var ultimate = [];
        var allstar = [];
        var contender = [];
        for (var i = 0; i < playerList.length; i++) {
            for (var j = 0; j < playerList[i].length; j++) {
                if (i == 0) 
                    legends.push("``" + playerList[i][j][0] + " | " + playerList[i][j][1]);
                else if (i == 1)
                    ultimate.push("``" + playerList[i][j][0] + " | " + playerList[i][j][1]);
                else if (i == 2)
                    allstar.push("``" + playerList[i][j][0] + " | " + playerList[i][j][1]);
                else if (i == 3)
                    contender.push("``" + playerList[i][j][0] + " | " + playerList[i][j][1]);
            }
        }

        longestString = 0;
        var staff = ["``GM: " + team.GM, "``AGM: " + team.AGM];
        var list = [legends, ultimate, allstar, contender, staff];
        for (var i = 0; i < list.length; i++) {
            for (var j = 0; j < list[i].length; j++) {
                if (list[i][j].length > longestString) {
                    longestString = list[i][j].length;
                }
            }
        }

        var textboxes = ["", "", "", "", ""];
        for (var i = 0; i < list.length; i++) {
            for (var j = 0; j < list[i].length; j++) {
                while (list[i][j].length < longestString + 1) {
                    list[i][j] += " ";
                }
                textboxes[i] += list[i][j] + "``\n";
            }
        }
        const teamRoster = new Discord.MessageEmbed()
                .setTitle(teamName + " Roster")
                .setThumbnail(teamImage)
                .addFields(
                    { name: "``Staff:``", value: textboxes[4], inline: false},
                    { name: "``Legends:``", value: textboxes[0], inline: false},
                    { name: "``Ultimate:``", value: textboxes[1], inline: false},
                    { name: "``All-Star:``", value: textboxes[2], inline: false},
                    { name: "``Contender:``", value: textboxes[3], inline: false},
                )
                .setFooter(randomFooter())
                .setTimestamp();
        msg.channel.send(teamRoster)
    },

    async playerStats(msg, args, guilds) {
        playerData = JSON.parse(fs.readFileSync('playerData.json')); // MUST RUN THIS EVERYTIME I TAKE DATA FROM THE playerData.json

        var data;
        var guild = {
            id: msg.guild.id,
            guild: null,
            league: null
        };
        var id;

        if (args.length > 0) {
            id = args[0].substring(3, args[0].length - 1);
        } else {
            id = msg.author.id;
        }
        try {
            if (guild.id == guilds[0].id) {
                data = playerData.Twos;
                guild.guild = guilds[0];
                guild.league = "Twos";
            } else if (guild.id == guilds[1].id) {
                data = playerData.Threes;
                guild.guild = guilds[1];
                guild.league = "Threes";
            } else {
                guild.guild = guilds[2];
                data = playerData.Twos;
                guild.league = "Twos";
            }
        } catch(error) {
            // msg.channel.send("`Error: Cannot find URL Discord, using default. Contact @NotHenry#4271 for assistance`");
            // return;
            data = playerData.Twos;
            guild.guild = guilds[2];
            guild.league = "Twos";
        }
        var player = data[id];

        if (player == null) {
            msg.channel.send(`\`ERROR: Player not found\``);
            return;
        }

        var textboxA = "";
        // Just add more to the json and add more here then to increase what the text box can have
        var shotperc = 0;
        if (player.shots != 0) {
            shotperc = ((player.goals / player.shots) * 100).toFixed(1);
        }
        var textBoxes = [
            `\n\`Division: ${player.division}`,
            `\n\`Goals: ${player.goals}`,
            `\n\`Saves: ${player.saves}`,
            `\n\`Assists: ${player.assists}`,
            `\n\`Shots: ${player.shots}`,
            `\n\`Shot%: ${shotperc}%`,
        ];

        var longestString = textBoxes[0].length;

        for (var i = 0; i < textBoxes.length; i++) {
            if (textBoxes[i].length > longestString) {
                longestString = textBoxes[i].length + 1;
            }
        }
        
        for (var i = 0; i < textBoxes.length; i++) {
            while (textBoxes[i].length <= longestString) {
                textBoxes[i] += " ";
            }
            textBoxes[i] += "`";
            textboxA += textBoxes[i];
        }

        var textBoxes = [
            `\n\`Salary: ${player.salary}`,
            `\n\`GPG: ${((player.goals / player.games)).toFixed(1)}`,
            `\n\`SPG: ${((player.saves / player.games)).toFixed(1)}`,
            `\n\`APG: ${((player.assists / player.games)).toFixed(1)}`,
            `\n\`SHPG: ${((player.shots / player.games)).toFixed(1)}`,
            `\n\`Games: ${player.games}`,
        ];

        var textboxB = null;

        if (player.games != 0) {
            textboxB = "";
            var longestString = textBoxes[0].length;

            for (var i = 0; i < textBoxes.length; i++) {
                if (textBoxes[i].length > longestString) {
                    longestString = textBoxes[i].length + 1;
                }
            }
            
            for (var i = 0; i < textBoxes.length; i++) {
                while (textBoxes[i].length <= longestString) {
                    textBoxes[i] += " ";
                }
                textBoxes[i] += "`";
                textboxB += textBoxes[i];
            }
        }

        try {
            var discordAvatar = await guild.guild.members.fetch(id);
        } catch {
            msg.channel.send("``ERROR: User not found.``");
        }
        discordAvatar = discordAvatar[Object.keys(discordAvatar)[8]].avatar;
        var statsResponse = new Discord.MessageEmbed()
            .setTitle(`${player.username}'s Stats`)
            .setThumbnail(`https://cdn.discordapp.com/avatars/${id}/${discordAvatar}.png`)
            .addFields(
                { name: `URL`, value: `${textboxA}`, inline: true}
            )
            .setFooter(randomFooter())
            .setTimestamp();
        if (textboxB != null) {
            statsResponse.addFields({ name: `${guild.league}`, value: `${textboxB}`, inline: true});
        }
        msg.channel.send(statsResponse);
    },

    topPlayers() {
        
    }
}

function findUser(id, data) { // If you can make this a => then do it pussy
    for (var i = 0; i < Object.keys(data).length; i++) {
        if (id == Object.keys(data)[i]) { 
            return data[Object.keys(data)[i]];
        }
    }
    return null;
}

function findID(username, option) {
    var discordID = null;
    playerData = JSON.parse(fs.readFileSync('playerData.json')); // MUST RUN THIS EVERYTIME I TAKE DATA FROM THE playerData.json
    var data;
    if (option == 2) {
        data = playerData.Twos;
    } else {
        data = playerData.Threes;
    }

    for (var i = 0; i < Object.keys(data).length; i++) {
        if (username == data[Object.keys(data)[i]].username) {
            console.log(username + " | " + data[Object.keys(data)[i]].username);
            return Object.keys(data)[i];
        }
    }

    return null;
}

function randomFooter() {
    var num = Math.floor(Math.random() * 8);
    switch (num) {
        case 0:
            return "Am I a planet?"
        case 1:
            return "Jotchua Reigns Supreme!🐕";
        case 2:
            return "-_- Tough";
        case 3:
            return "My Creator is NotHenry";
        case 4:
            return "Hehe monkee 🐒";
        case 5:
            return "URL is like pretty cool";
        case 6:
            return `Day #${Math.floor(Math.random() * 1000)}: Code still broke...`;
        case 7:
            return `NASA called me a dwarf...`;
    }
}