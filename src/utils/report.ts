import { colors } from "../theme";
import type { LedgerEntry } from "../types";
import { formatAmount, formatEntryDate } from "./format";

export const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const buildLedgerReportHtml = ({
  balanceCents,
  entries,
  user,
}: {
  balanceCents: number;
  entries: LedgerEntry[];
  user: string;
}) => {
  const generatedAt = new Date();
  const rows = entries
    .map(
      (entry) => `
        <tr>
          <td>
            <strong>${escapeHtml(entry.note || "Untitled entry")}</strong>
            <span>${escapeHtml(entry.source)} · ${formatEntryDate(
              entry.createdAt,
            )}</span>
          </td>
          <td class="${entry.amountCents < 0 ? "negative" : "positive"}">
            ${formatAmount(entry.amountCents)}
          </td>
        </tr>
      `,
    )
    .join("");

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; }
          body {
            color: ${colors.text};
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            margin: 0;
            padding: 40px;
          }
          .kicker {
            color: ${colors.muted};
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }
          h1 { font-size: 32px; margin: 6px 0 20px; }
          .summary {
            border: 1px solid ${colors.border};
            border-radius: 12px;
            margin-bottom: 24px;
            padding: 18px;
          }
          .summary-label {
            color: ${colors.muted};
            font-size: 13px;
            font-weight: 700;
          }
          .summary-total {
            font-size: 34px;
            font-weight: 800;
            margin-top: 4px;
          }
          table { border-collapse: collapse; width: 100%; }
          th {
            border-bottom: 1px solid ${colors.border};
            color: ${colors.muted};
            font-size: 12px;
            padding: 10px 0;
            text-align: left;
            text-transform: uppercase;
          }
          th:last-child, td:last-child { text-align: right; }
          td {
            border-bottom: 1px solid ${colors.reportBorder};
            padding: 14px 0;
            vertical-align: top;
          }
          td span {
            color: ${colors.textMuted};
            display: block;
            font-size: 12px;
            margin-top: 4px;
          }
          .positive { color: ${colors.primary}; font-weight: 800; }
          .negative { color: ${colors.danger}; font-weight: 800; }
          .empty { color: ${colors.textMuted}; padding: 24px 0; }
          .footer {
            color: ${colors.textMuted};
            font-size: 11px;
            margin-top: 28px;
          }
        </style>
      </head>
      <body>
        <div class="kicker">Ledger report</div>
        <h1>${escapeHtml(user)}</h1>
        <section class="summary">
          <div class="summary-label">Total purchases</div>
          <div class="summary-total">${formatAmount(balanceCents)}</div>
        </section>
        ${
          entries.length
            ? `<table>
                <thead>
                  <tr><th>Entry</th><th>Amount</th></tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>`
            : `<div class="empty">No entries yet.</div>`
        }
        <div class="footer">Generated ${formatEntryDate(generatedAt)}</div>
      </body>
    </html>
  `;
};
