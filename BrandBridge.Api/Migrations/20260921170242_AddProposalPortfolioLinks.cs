using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BrandBridge.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddProposalPortfolioLinks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProposalPortfolioLinks",
                columns: table => new
                {
                    ProposalId = table.Column<Guid>(type: "uuid", nullable: false),
                    PortfolioItemId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProposalPortfolioLinks", x => new { x.ProposalId, x.PortfolioItemId });
                    table.ForeignKey(
                        name: "FK_ProposalPortfolioLinks_PortfolioItems_PortfolioItemId",
                        column: x => x.PortfolioItemId,
                        principalTable: "PortfolioItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProposalPortfolioLinks_Proposals_ProposalId",
                        column: x => x.ProposalId,
                        principalTable: "Proposals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProposalPortfolioLinks_PortfolioItemId",
                table: "ProposalPortfolioLinks",
                column: "PortfolioItemId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProposalPortfolioLinks");
        }
    }
}
