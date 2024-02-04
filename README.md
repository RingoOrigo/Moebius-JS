## Moebius-JS
Moebius JS is a full rewrite of Moebius within discord.js! Not only will all of the features from the original pycord build of Moebius be ported over, but a slew of new features will be implemented (exclusive to Moebius JS) as well!
## Roadmap

#### Complete Moebius Re-Integration
The first step toward this bot's finished project is to completely rebuild the Moebius bot from [this archived repository](https://github.com/RingoOrigo/moebius-bot) in discord.js.

While many of the features are already implemented, I am refraining from implementing certain features for the time being. The per-message responses, such as the "It's moebin' time" messages and the ping-detection messages will not be implemented until I can determine a suitable way to make them toggleable.

* Progress: 70% (Nearing Completion)

#### Economy System
Ideally, there would be some way to implement a global economy system, where users can earn a fictional currency and earn spots on global and server-based leaderboards with their balance. 

* Progress: 1% (Planning Stage)
## Make It Yourself

Before doing anything with this repository on your local machine, install Node.js from the following link: https://nodejs.org/en. Once you've installed Node.js, you're free to begin following the rest of these instructions!

#### Clone the project
```bash
  git clone https://github.com/RingoOrigo/Moebius-JS
```

#### Go to the project directory
```bash
  cd your/project/directory
```

#### Install dependencies
```bash
  npm install discord.js
```

#### Optional: Install ESLint
*While not required, a linter can be incredibly useful. ESLint can be fully configured with a JSON file in your project's directory.*

```bash
npm install --save-dev eslint
```

#### Making the config file
Your bot will not run without a proper config.json. You are responsible for creating your own config.json file. Below is what a proper config.json file would look like for this project:

```
token : Your bot's token from the Discord Developer Portal
clientID : Your bot's application ID
guildID : The ID of your Discord server for testing
status : The status you would like your bot to display when online
```

#### Run the bot
Before running the bot, deploy your commands to your test guild by running the following command in your directory's terminal.

```bash
  npm deploy-test-commands.js
```

You can then start the bot with the following command to ensure all of its commands are working as intended within your test guild.
```bash
    npm index.js
```

Upon confirmation that everything is working as intended, deploy your commands globaly for use in every server containing your bot.
```bash
    npm deploy-global-commands.js
```

