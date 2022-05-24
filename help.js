const { Client, CommandInteraction, CommandInteractionOptionResolver, GuildMember, User, MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton, Permissions } = require('discord.js');

module.exports = {
    name: `help`,
    description: `Zeigt alle Befehle an.`,
    channel: false,
    options: [],
    eph: false,

    /**
     * @param {Client} bot
     * @param {CommandInteraction} interaction
     * @param {CommandInteractionOptionResolver} options
     * @param {GuildMember} member
     * @param {User} user
     * @param {object} texts
     */

    async execute(bot, interaction, options, member, user, texts) {
        const embed = new MessageEmbed()
        .setColor(0x0000ee)
        .setTitle(`**Help-Embed**`)
        
        await bot.commands.forEach(cmd => {
            if(cmd.name !== `binfo` && cmd.name !== `elb` && cmd.name !== `eventlist` && cmd.name !== `go` && cmd.name !== `einventar` && cmd.name !== `setlanguage`) return;
            if(cmd.name == `elb` && !(member.user.id == member.guild.ownerId)) return;
            if(cmd.name == `setlanguage` && !member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) return;
            embed.addField(`\`/${cmd.name}\``, cmd.description);
        })

        interaction.editReply({ embeds: [embed] });
    }
}