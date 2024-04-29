const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Match } = require("../../dbObjects.js");
const { Op } = require("sequelize");

async function findMatch() {
  try {
    const currentDate = new Date(); // Current date and time
    console.log("Current date:", currentDate.toLocaleDateString());
    console.log("Current time:", currentDate.toLocaleTimeString());

    const gracePeriodMinutes = 135; // 2 hours and 15 minutes
    const gracePeriodEnd = new Date(
      currentDate.getTime() + gracePeriodMinutes * 60000
    );

    const nextMatch = await Match.findOne({
      where: {
        [Op.or]: [
          {
            date: {
              [Op.gt]: currentDate,
            },
          },
          {
            date: currentDate.toLocaleDateString(),
            time: {
              [Op.gte]: currentDate.toLocaleTimeString(),
              [Op.lte]: gracePeriodEnd.toLocaleTimeString(),
            },
          },
        ],
      },
      order: [
        ["date", "ASC"],
        ["time", "ASC"],
      ],
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
  if (match.league === "Major League Soccer") {
    return "https://cdn.discordapp.com/attachments/1228944144714436709/1228944263354777640/mls-logo.png?ex=662de289&is=661b6d89&hm=d4f33f8d0a029f4625aeb4b280f629219de2446623f0dfbef63951bbd3cd8322&";
  } else if (match.league === "Leagues Cup") {
    return "https://cdn.discordapp.com/attachments/1228944144714436709/1228956095926632458/Leagues_Cup_logo_white-on-black.png?ex=662ded8e&is=661b788e&hm=917e86804748a72a2fcf532ec9f8d9b337ad6f919c27606703df350da134e67c&";
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
    const time = formatTime(match.time);
    const thumbnailUrl = getThumbnailUrl(match);

    const embed = new EmbedBuilder()
      .setTitle(`🗓️ Current Match`)
      .setDescription(
        `**Match:** ${match.home_team} vs ${match.away_team}\n**Date:** ${date}\n**Time:** ${time}\n**Venue:** ${match.stadium}\n**League:** ${match.league}`
      )
      //figure out a different way to get the logo\
      //currently just posting picture on server where bot is located and copying that link onto here
      .setThumbnail(thumbnailUrl)
      .setFooter({
        text: "Dates and times are in Pacific Time.",
      });
    return interaction.reply({ embeds: [embed] });
  },
};
