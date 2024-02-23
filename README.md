## Moebius-JS
Moebius JS is a full rewrite of Moebius within discord.js! Not only will all of the features from the original pycord build of Moebius be ported over, but a slew of new features will be implemented (exclusive to Moebius JS) as well!
## Roadmap

#### Complete Moebius Re-Integration
The first step toward this bot's finished project is to completely rebuild the Moebius bot from [this archived repository](https://github.com/RingoOrigo/moebius-bot) in discord.js.

While many of the features are already implemented, I am refraining from implementing certain features for the time being. The per-message responses, such as the "It's moebin' time" messages and the ping-detection messages will not be implemented until I can determine a suitable way to make them toggleable.

* Progress: 70% (Nearing Completion)

#### Economy System
Ideally, there would be some way to implement a global economy system, where users can earn a fictional currency and earn spots on global and server-based leaderboards with their balance. 

* Progress: 30% (Takeoff Stage)

##### List of Current Features:
- Database organised by user IDs to keep track of user balances
- Haul (used to gain currency)
- Balance (used to view your balance or that of another user)
##### Planned Features:
- Leaderboard (View the 10 users with the highest global balances)
- Shop System (Buy items for profile showcases or for a similar feature)
    - This will integrate with a future feature, which is why it is not yet implemented

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
  npm install discord.js mongoose
```

#### Optional: Install ESLint
*While not required, a linter can be incredibly useful. ESLint can be fully configured with a JSON file in your project's directory.*

```bash
npm install --save-dev eslint
```

#### Making the config file
Your bot will not run without a proper config.json. You are responsible for creating your own config file, but a guide can be found on the wiki's [Making Your Config File](https://github.com/RingoOrigo/Moebius-JS/wiki/Making-Your-Config-File) page.

#### Run the bot
Before running the bot, deploy your commands to your test guild by running the following command in your directory's terminal. <br>
*This will only deploy commands for your **test token**. To test in-place, without a second bot, you can just set the `testToken` key to the same value as your `token` key in `congif.json`.*

```bash
  npm run testDeploy
```

You can then start the bot with the following command to ensure all of its commands are working as intended within your test guild.
```bash
    npm run start
```

Upon confirmation that everything is working as intended, deploy your commands globaly for use in every server containing your bot.<br>
*This will **delete** all of your local test commands, replacing them with global counterparts.*
```bash
    npm run deploy
```