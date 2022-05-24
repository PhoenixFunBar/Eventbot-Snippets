const { Client, CommandInteraction, CommandInteractionOptionResolver, User, MessageEmbed, Permissions } = require("discord.js");
const random = require('random');
const schema = require('../database/schemas/botsettings');

module.exports = {
    name: 'go',
    description: 'Nimmt am Event teil. - Alle 2 Stunden verfügbar',
    channel: true,
    options: [],
    eph: false,

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
        if(!interaction.guild.me.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES) || !interaction.channel.permissionsFor(interaction.guild.me).has(Permissions.FLAGS.MANAGE_MESSAGES)) return interaction.editReply({ embeds: [new MessageEmbed().setColor(0xff0000).setTitle(texts.global.error).setDescription(texts.go.missingPerms)] });

        bot.userData.findOne({
            userId: user.id,
            guildId: interaction.guild.id
        }, async(err, data) => {
            await schema.findOne({}, async(err, s) => {
                if (err) throw err;
                if (!s) return interaction.editReply({ content: `No Data!`, ephemeral: true });
    
                if(s.currentEvent.active == false) {
                    if (s.nextEvent.timestamps.startsAt == 0) return interaction.editReply({ embeds: [new MessageEmbed().setColor(0xff0000).setTitle(`Fehler ❌`).setDescription(`Derzeit findet kein Event statt!`)], ephemeral: true });
                    return interaction.editReply({ embeds: [new MessageEmbed().setColor(0xff0000).setTitle(`Fehler ❌`).setDescription(`Derzeit findet kein Event statt! Das nächste Event namens "${s.nextEvent.name.de}" startet am <t:${Math.floor(s.nextEvent.timestamps.startsAt / 1000 | 0)}:d>`)], ephemeral: true }).then(i => setTimeout(() => { if(i.deletable) i.delete() }, 5000));
                } else {
                    const h2 = 1000 * 60 * 60 * 2;
                    if(err) throw err;
                    if(s.currentEvent == null || s.currentEvent == undefined) return interaction.editReply({ embeds: [new MessageEmbed().setColor(0xff0000).setTitle(texts.global.error).setDescription(texts.global.fatalError)] });
                    if(data) {
                        if ((data.lastItem + h2) > Date.now()) {
                            const embed = new MessageEmbed()
                                .setColor(0xff0000)
                                .setTitle(texts.global.error)
                                .setDescription(texts.go.notReady.replace(`<time>`, `<t:${Math.floor(new Date(data.lastItem + h2) / 1000 | 0)}:R>`));

                            return interaction.editReply({ embeds: [embed], ephemeral: true }).then(i => setTimeout(() => { if(i.deletable) i.delete() }, 8000));
                        } else {
                            const qu = random.int(1, 5);

                            let pic;
                            if (qu == 1) pic = s.currentEvent.images[0];
                            else if (qu == 2) pic = s.currentEvent.images[1];
                            else if (qu == 3) pic = s.currentEvent.images[2];
                            else if (qu == 4) pic = s.currentEvent.images[3];
                            else if (qu == 5) pic = s.currentEvent.images[4];
                            else pic = s.currentEvent.images[5];

                            const embed = new MessageEmbed()
                                .setColor(0x0000ff)
                                .setAuthor({ name: user.username, iconURL: user.displayAvatarURL({ dynamic: true }) })
                                .setTitle(texts.go.title)
                                .setDescription(texts.go.desc.replace(`<qu>`, `${qu}`))
                                .setImage(pic);
                            data.itemCount += qu;
                            data.lastItem = Date.now();

                            data.save().then(async() => {
                                bot.channels.cache.get(bot.cfg.modlog).send({ embeds: [new MessageEmbed().setColor(0x0000ff).setTitle(`Items++`).setDescription(`${user.tag} + **${qu}** Items!`).setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() ? interaction.guild.iconURL({ dynamic: true }) : null })] });
                                const repl = await interaction.editReply({ embeds: [embed], fetchReply: true });
                                setTimeout(() => { if(repl.deletable) repl.delete() }, 30000);
                            }).catch(err => {
                                return interaction.editReply({ embeds: [new MessageEmbed().setColor(0xff0000).setTitle(texts.global.error).setDescription(texts.global.errmsg.replace(`<error>`, `${err}`))] });
                            })
                        }
                    } else {
                        const qu = random.int(1, 5);

                        let pic;
                        if (qu == 1) pic = s.currentEvent.images[0];
                        else if (qu == 2) pic = s.currentEvent.images[1];
                        else if (qu == 3) pic = s.currentEvent.images[2];
                        else if (qu == 4) pic = s.currentEvent.images[3];
                        else if (qu == 5) pic = s.currentEvent.images[4];
                        else pic = s.currentEvent.images[5];

                        const embed = new MessageEmbed()
                            .setColor(0x0000ff)
                            .setAuthor({ name: user.username, iconURL: user.displayAvatarURL({ dynamic: true }) })
                            .setTitle(texts.go.title)
                            .setDescription(texts.go.desc.replace(`<qu>`, `${qu}`))
                            .setImage(pic);

                        new bot.userData({
                            userId: user.id,
                            userTag: user.tag,
                            guildId: interaction.guild.id,
                            guildName: interaction.guild.name,
                            lastItem: Date.now(),
                            itemCount: qu
                        }).save().then(async() => {
                            bot.channels.cache.get(bot.cfg.modlog).send({ embeds: [new MessageEmbed().setColor(0x0000ff).setTitle(`Items++`).setDescription(`${user.tag} + **${qu}** Items`).setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() ? interaction.guild.iconURL({ dynamic: true }) : null })] });
                            const repl = await interaction.editReply({ embeds: [embed], fetchReply: true });
                            setTimeout(() => { if(repl.deletable) repl.delete() }, 60000);
                        }).catch(err => {
                            return interaction.editReply({ embeds: [new MessageEmbed().setColor(0xff0000).setTitle(texts.global.error).setDescription(texts.global.errmsg.replace(`<error>`, `${err}`))] });
                        })
                    }
                }
            });
        });
    }
}