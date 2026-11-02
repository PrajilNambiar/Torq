using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Torq.Api.Migrations
{
    /// <inheritdoc />
    [Migration("20261101170000_AddEmailOtpAndUniquePaymentReference")]
    public partial class AddEmailOtpAndUniquePaymentReference : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EmailOtpChallenges",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    CodeHash = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ConsumedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Attempts = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmailOtpChallenges", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EmailOtpChallenges_Email",
                table: "EmailOtpChallenges",
                column: "Email");

            migrationBuilder.DropIndex(
                name: "IX_Payments_ExternalPaymentId",
                table: "Payments");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_ExternalPaymentId",
                table: "Payments",
                column: "ExternalPaymentId",
                unique: true);

            migrationBuilder.DropIndex(
                name: "IX_Payments_CampaignId",
                table: "Payments");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_OneOpenCharge",
                table: "Payments",
                column: "CampaignId",
                unique: true,
                filter: "\"Status\" IN (2, 3)");

            migrationBuilder.CreateIndex(
                name: "IX_Payouts_ExternalPayoutId",
                table: "Payouts",
                column: "ExternalPayoutId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Payouts_OneOpenPayout",
                table: "Payouts",
                column: "MilestoneId",
                unique: true,
                filter: "\"Status\" IN (2, 3)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "EmailOtpChallenges");

            migrationBuilder.DropIndex(name: "IX_Payments_ExternalPaymentId", table: "Payments");
            migrationBuilder.CreateIndex(
                name: "IX_Payments_ExternalPaymentId",
                table: "Payments",
                column: "ExternalPaymentId");

            migrationBuilder.DropIndex(name: "IX_Payments_OneOpenCharge", table: "Payments");
            migrationBuilder.CreateIndex(
                name: "IX_Payments_CampaignId",
                table: "Payments",
                column: "CampaignId");

            migrationBuilder.DropIndex(name: "IX_Payouts_ExternalPayoutId", table: "Payouts");
            migrationBuilder.DropIndex(name: "IX_Payouts_OneOpenPayout", table: "Payouts");
        }
    }
}
