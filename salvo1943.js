const fetch = require('node-fetch');
const WebSocket = require ('ws');

const guilds = new Map();
const socket = new WebSocket("wss://gateway-us-east1-c.discord.gg");

socket.onmessage = async (message) => {
    const data = JSON.parse(message.data.toString());
    if (data.t === "GUILD_UPDATE" || data.t === "GUILD_DELETE") {
        const guildId = data.d.guild_id || data.d.id;
        const guild = await guilds.get(guildId);
        if (guild) {
            try {
                const patchUrl = "https://canary.discord.com/api/v8/guilds/GUILDID/vanity-url"; //sniper-guilds
                const postUrl = 'https://discord.com/api/v10/channels/CHANNELID/messages';  //info-channel
                const patchPromise = await fetch(patchUrl, {
                    method: "PATCH",
                    headers: {
                        "Authorization": "TOKEN", //urlyi alicak token
                        "Content-Type": "application/json",
                    },
                    body: await JSON.stringify({ code:guild}),
                }); // şüpheli
                const patchResult = await patchPromise;
                const content = await patchResult.ok ? `${data.t} | Vanity Taken: https://discord.gg/${guild} | @everyone` : `${data.t} | Vanity Check: ${guild} | @everyone`;
                await fetch(postUrl, {
                    method: "POST",
                    headers: {
                        "Authorization": "TOKEN", //urlyi alicak token
                        "Content-Type": "application/json",
                    },
                    body: await JSON.stringify({ content}),
                });
                guilds.delete(guildId);
            } catch (error) {
                console.error (`Error: ${error}`);
            }
        }
        } else if (data.t === "READY") {
            await data.d.guilds.forEach(async guild => {
                if (guild.vanity_url_code) await guilds.set(guild.id, guild.vanity_url_code);
                
            });
        }
        if (data.op === 10) {
            socket.send(await JSON.stringify({
                op: 2,
                d: {
                    token: "TOKEN", //tarayıcı-tokeni
                    intents: 1 << 0,
                    properties: { os: "Windows", browser: "Discord Client", device: "canary", },
                },
            }));
            setInterval(() => {
                socket.send(JSON.stringify({ op: 1, d: {} }));
                }, data.d.heartbeat_interval);
                } else if (data.op === 7) {
                    console.log(data)
                    process.exit(0);
                    }
                };

            
socket.onclose = () => {
    console.log("socket offline");
    process.exit();
};