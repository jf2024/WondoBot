// const { Events } = require("discord.js");
// const { Op } = require("sequelize");
// const db = require("../dbObjects.js");

// var moment = require("moment-timezone"); // require
// moment().tz("America/Los_Angeles").format();

// module.exports = {
//   name: Events.ClientReady,
//   once: true,
//   async execute() {
//     console.log(moment());
//     const match = await db.Match.findOne({
//       where: { date: { [Op.gte]: moment().toDate() } },
//       order: [["date", "ASC"]],
//     });

//     if (match === null) {
//       console.log("No match found.");
//       return;
//     }

//     const result = await db.CurrentMatch.create({
//       fixture_id: match.fixture_id,
//       home_team: match.home_team,
//       away_team: match.away_team,
//       stadium: match.stadium,
//       referee: match.referee,
//       home_goals: match.home_goals,
//       away_goals: match.away_goals,
//       first_scorer: null,
//       date: match.date,
//       //   time: match.time,
//       finished: match.finished,
//     });

//     // console.log(result);
//   },
//   // const command = interaction.client.commands.get(interaction.commandName);

//   // if (!command) {
//   //   console.error(
//   //     `No command matching ${interaction.commandName} was found.`
//   //   );
//   //   return;
//   // }

//   //     try {
//   //       await command.execute(interaction);
//   //     } catch (error) {
//   //       console.error(error);
//   //       if (interaction.replied || interaction.deferred) {
//   //         await interaction.followUp({
//   //           content: "There was an error while executing this command!",
//   //           ephemeral: true,
//   //         });
//   //       } else {
//   //         await interaction.reply({
//   //           content: "There was an error while executing this command!",
//   //           ephemeral: true,
//   //         });
//   //       }
//   //     }
//   //   },
// };
