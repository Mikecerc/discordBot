import { ApplicationCommandType, ContextMenuCommandBuilder,  EmbedBuilder, GuildMember, GuildMemberRoleManager, UserContextMenuCommandInteraction } from "discord.js";
import moment from "moment";
import { DiscordClient } from "../../classes/discordClient";
import { abstractCommand } from "../commands.types";
export default abstract class UserInfoContext extends abstractCommand {
    static data = new ContextMenuCommandBuilder().setName("Get Info").setDMPermission(false).setType(ApplicationCommandType.User)
    static async execute(client: DiscordClient, interaction: UserContextMenuCommandInteraction) {
        await interaction.deferReply({ ephemeral: false }).catch(() => {});
        let targetMember = interaction.targetMember as GuildMember;
        if (targetMember == null) {
            interaction.followUp({ content: "User not found", ephemeral: true });
            return;
        }
        let Response = new EmbedBuilder()
            .setAuthor({
                name: `${interaction.targetUser.username}`,
                iconURL: interaction.targetUser.displayAvatarURL(),
            })
            .setThumbnail(interaction.targetUser.displayAvatarURL())
            .setColor("Orange")
            .addFields({
                name: "UserID",
                value: `${interaction.targetUser.id}`,
                inline: false,
            });

        const roles = targetMember.roles as GuildMemberRoleManager;
        if (
            roles.cache
                .map((r: any) => r)
                .join(" ")
                .replace("@everyone", " ") != " "
        ) {
            Response.addFields({
                name: "Roles",
                value: `${roles.cache
                    .map((r: any) => r)
                    .join(" ")
                    .replace("@everyone", " ")}`,
            });
        } else {
            Response.addFields({
                name: "Roles",
                value: `No Roles`,
            });
        }
        Response.addFields(
            {
                name: "Server Member Since",
                value: `${moment(targetMember.joinedAt).format("MMMM Do YYYY, h:mm:ss a")}\n**-** ${moment(targetMember.joinedAt)
                    .startOf("day")
                    .fromNow()}`,
            },
            {
                name: "Discord User Since",
                value: `${moment(interaction.targetUser.createdAt).format("MMMM Do YYYY, h:mm:ss a")}\n**-** ${moment(targetMember.user.createdAt)
                    .startOf("day")
                    .fromNow()}`,
            }
        ).setFooter({ text: `Requested By ${interaction.user.tag}` });
        interaction.followUp({ embeds: [Response] });
    }
};