using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Torq.Api.Data;

#nullable disable

namespace Torq.Api.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(TorqDbContext))]
    [Migration("20261122170000_AddBlueprintCoverage")]
    public partial class AddBlueprintCoverage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Products",
                table: "Businesses",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PayoutAccountLabel",
                table: "ProviderProfiles",
                type: "character varying(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "FraudFlagged",
                table: "AspNetUsers",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "ViewCount",
                table: "Requirements",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "AudienceGeography",
                table: "SocialAccounts",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "EngagementRate",
                table: "SocialAccounts",
                type: "numeric(6,2)",
                precision: 6,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UsageRights",
                table: "SocialAccounts",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "DisclosureAcknowledged",
                table: "SocialAccounts",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "RequirementQuestions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RequirementId = table.Column<Guid>(type: "uuid", nullable: false),
                    AuthorUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Body = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    Answer = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    AnsweredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RequirementQuestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RequirementQuestions_Requirements_RequirementId",
                        column: x => x.RequirementId,
                        principalTable: "Requirements",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PlatformSettings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PlatformFeePercent = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    AllowedGeographies = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlatformSettings", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RequirementQuestions_RequirementId",
                table: "RequirementQuestions",
                column: "RequirementId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "RequirementQuestions");
            migrationBuilder.DropTable(name: "PlatformSettings");
            migrationBuilder.DropColumn(name: "Products", table: "Businesses");
            migrationBuilder.DropColumn(name: "PayoutAccountLabel", table: "ProviderProfiles");
            migrationBuilder.DropColumn(name: "FraudFlagged", table: "AspNetUsers");
            migrationBuilder.DropColumn(name: "ViewCount", table: "Requirements");
            migrationBuilder.DropColumn(name: "AudienceGeography", table: "SocialAccounts");
            migrationBuilder.DropColumn(name: "EngagementRate", table: "SocialAccounts");
            migrationBuilder.DropColumn(name: "UsageRights", table: "SocialAccounts");
            migrationBuilder.DropColumn(name: "DisclosureAcknowledged", table: "SocialAccounts");
        }
    }
}
