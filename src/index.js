import 'node:fs';
import 'node:path';
import { REST, Routes } from "discord.js";
import 'dotenv/config';

const commands = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

// read servers from db
const servers = [];

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
				commands.push(command.data.toJSON());
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const rest = new REST().setToken(token);

(async () => {
	try {
        for (const server in servers) {
            console.log(`Started refreshing ${commands.length} application (/) commands for server ${server.name}`);

            const data = await rest.put(
                Routes.applicationGuildCommands(process.env.PUBLIC_KEY, server.guildId),
                { body: commands },
            );

            console.log(`Successfully reloaded ${data.length} application (/) commands for server ${server.name}`);
        }
	} catch (error) {
		console.error(error);
	}
})();
