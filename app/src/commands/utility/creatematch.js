// const { SlashCommandBuilder, Collection } = require("discord.js");
// const db = require("../../dbObjects.js");

// // const interaction = new Collection();

// async function createMatch(id) {
//   const match = await db.Match.findOne({
//     where: { id: id },
//   });
//   if (!match) {
//     const newMatch = await db.Match.create({
//       match_id: id,
//       home_team: "Barcelona",
//       away_team: "Real Madrid",
//       stadium: "Camp Nou",
//       refe: "Mike Dean",
//       home_goals: 2,
//       away_goals: 3,
//       first_scorer: "Messi",
//     });
//     return newMatch;
//   }

//   return match;
// }

// module.exports = {
//   data: new SlashCommandBuilder()
//     .setName("match")
//     .setDescription("Provides information about a match.")
//     .addIntegerOption((option) =>
//       option
//         .setName("amount")
//         .setDescription("The amount of the match.")
//         .setRequired(true)
//     ),
//   async execute(interaction) {
//     const matchId = interaction.options.getInteger("amount");
//     console.log(matchId);
//     const match = await createMatch(matchId);
//     return interaction.reply(
//       `match id is :${match.match_id}, home_team is :${match.home_team}, away_team is :${match.away_team}, stadium is :${match.stadium}, refe is :${match.refe}, home_goals is :${match.home_goals}, away_goals is :${match.away_goals}, first_scorer is :${match.first_scorer}`
//     );
//   },
// };
