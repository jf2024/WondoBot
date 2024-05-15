const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Match } = require("../../dbObjects.js");
const { Op } = require("sequelize");

async function findMatch() {
  try {
    const currentDate = new Date();
    console.log("Current date:", currentDate.toLocaleDateString());
    console.log("Current time:", currentDate.toLocaleTimeString());

    const gracePeriodMinutes = 135; // 2 hours and 15 minutes
    const gracePeriodEnd = new Date(currentDate.getTime() + gracePeriodMinutes * 60000);

    const nextMatch = await Match.findOne({
      where: {
        [Op.or]: [
          {
            date: { [Op.gt]: currentDate },
          },
          {
            date: currentDate.toLocaleDateString(),
            time: {
              [Op.gte]: currentDate.toTimeString().slice(0, 8), // Format time as HH:MM:SS
              [Op.lte]: gracePeriodEnd.toTimeString().slice(0, 8), // Format time as HH:MM:SS
            },
          },
        ],
      },
      order: [["date", "ASC"], ["time", "ASC"]],
      limit: 1,
    });

    console.log("Next match:", nextMatch);
    return nextMatch;
  } catch (error) {
    console.error("Error finding upcoming match:", error);
    return null;
  }
}


function formatTime(time) {
  const [hours, minutes] = time.split(":");
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${minutes} ${hours < 12 ? "AM" : "PM"}`;
}

function getThumbnailUrl(match) {
  //thumbnails for test server
  // return "https://cdn.discordapp.com/attachments/1228944144714436709/1228944263354777640/mls-logo.png?ex=662de289&is=661b6d89&hm=d4f33f8d0a029f4625aeb4b280f629219de2446623f0dfbef63951bbd3cd8322&";
  if (match.league === "Major League Soccer") {
    return "https://cdn.discordapp.com/attachments/1234582260997423164/1234582269973364831/mls-logo.png?ex=663141d6&is=662ff056&hm=bfc5c1e3686189c87242170c783c9bf25aa325babf093b104b32a677b543b8e9&";
  } else if (match.league === "Leagues Cup") {
    return "https://cdn.discordapp.com/attachments/1234582260997423164/1234582311601832046/Leagues_Cup_logo_white-on-black.png?ex=663141e0&is=662ff060&hm=34be01299e980c29f2a56a8e9fb49e3105eb985fee44c7039ae21ff7b7e88138&";
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("predict-current")
    .setDescription("Provides information about the upcoming match."),
  async execute(interaction) {
    const match = await findMatch();
    if (!match) {
      return interaction.reply(
        "San Jose Earthquakes seem to not be playing anytime soon. No matches available."
      );
    }

    const date = new Date(match.date).toLocaleDateString("en-US", {
      timeZone: "America/Los_Angeles",
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const formattedTime = formatTime(match.time);
    const thumbnailUrl = getThumbnailUrl(match);

    const embed = new EmbedBuilder()
      .setTitle(`🗓️ Current Match`)
      .setDescription(
        `**Match:** ${match.home_team} vs ${match.away_team}\n**Date:** ${date}\n**Time:** ${formattedTime}\n**Venue:** ${match.stadium}\n**League:** ${match.league}`
      )
      .setThumbnail(thumbnailUrl)
      .setFooter({ text: "Dates and times are in Pacific Time." });

    return interaction.reply({ embeds: [embed] });
  },
};