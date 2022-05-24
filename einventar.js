const { Client, CommandInteraction, CommandInteractionOptionResolver, User, Constants, MessageEmbed } = require("discord.js");
const schema = require('../database/schemas/botsettings');

module.exports = {
    name: 'einventar',
    description: 'Zeigt dir an, wieviele Event-Items du hast.',
    channel: true,
    options: [
        {
            name: 'user',
            description: 'Der User, von dem du dir die Itemanzahl anzeigen lassen möchtest. [Owner-Option]',
            type: Constants.ApplicationCommandOptionTypes.USER,
            required: false
        }
    ],
    eph: true,

    /**
     * 
     * @param {Client} bot 
     * @param {CommandInteraction} interaction 
     * @param {CommandInteractionOptionResolver} options 
     * @param {GuildMember} member 
     * @param {User} user 
     * @param {object} texts
     */

    async execute(bot, interaction, options, member, user, texts) {
        let current = true;

        await schema.findOne({}, async (err, data) => {
            if(err) throw err;
            if(!data) return interaction.editReply({ content: `No Data!`, ephemeral: true });

            if(data.currentEvent.active == false) {
                current = false;
                if(data.nextEvent.timestamps.startsAt == 0) return interaction.editReply({ embeds: [new MessageEmbed().setColor(0xff0000).setTitle(`Fehler ❌`).setDescription(`Derzeit findet kein Event statt!`)], ephemeral: true });
                return interaction.editReply({ embeds: [new MessageEmbed().setColor(0xff0000).setTitle(`Fehler ❌`).setDescription(`Derzeit findet kein Event statt! Das nächste Event namens "${data.nextEvent.name.de}" startet am <t:${Math.floor(data.nextEvent.timestamps.startsAt / 1000 | 0)}:d>`)], ephemeral: true });
            }
        });
        
        if(!current) return;

        let u;
        if(options.getUser('user')) {
            if(user.id == '397829538773598220' || user.id == '616715502399782933' || user.id == interaction.guild.ownerId) u = options.getUser('user');
            else return interaction.editReply({ embeds: [new MessageEmbed().setColor(0xff0000).setDescription(texts.inv.noPerms)] });
        }
        else u = user;

        const data = await bot.userData.findOne({
            userId: u.id,
            guildId: interaction.guild.id
        });
        if(!data || (data && data.itemCount == 0)) return interaction.editReply({ embeds: [new MessageEmbed().setColor(0x0000ff).setDescription(texts.inv.zeroItems.replace(`<user>`, `<@!${u.id}>`))] });

        const embed = new MessageEmbed()
        .setColor(0x0000ff)
        .setDescription(texts.inv.answer.replace(`<user>`, `<@!${u.id}>`).replace(`<count>`, `${data.itemCount}`));

        interaction.editReply({ embeds: [embed] });
        bot.channels.cache.get(bot.cfg.modlog).send({ embeds: [new MessageEmbed().setColor(0x0000ff).setTitle(`Befehl ausgeführt`).setDescription(`<@!${interaction.user.id}> hat gerade den \`/${interaction.commandName}\`-Befehl ausgeführt.`).setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })] });
    }
}
