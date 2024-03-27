const { SlashCommandBuilder, Collection } = require("discord.js");
const db = require("../../dbObjects.js");

const member = new Collection();

async function createUser(paramUser) {
  const user = member.get(paramUser.id);

  if (!user) {
    const newUser = await db.Users.create({
      user_id: paramUser.id,
      username: paramUser.username,
    });
    return newUser;
  }

  return user;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("user")
    .setDescription("Provides information about the user."),
  async execute(interaction) {
    // interaction.user is the object representing the User who ran the command
    // interaction.member is the GuildMember object, which represents the user in the specific guild
    // await interaction.reply(`This command was run by ${interaction.user.username}, who joined on ${interaction.member.joinedAt}.`);
    // const user = interaction.options.getUser("user") ?? interaction.user;
    const user = await createUser(interaction.user);
    return interaction.reply(
      `User_id is :${user.user_id}, username is :${user.username}, score is :${user.score}, and ranking is :${user.ranking}`
    );
  },
};
