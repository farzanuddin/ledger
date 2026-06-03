import { expect, test } from "vitest";

import {
  formatAmount,
  formatDecimalAmount,
  formatEntryDate,
  formatPeopleCountLabel,
} from "../src/utils/format";
import {
  entriesFromDocs,
  peopleFromDocs,
  sourcesFromDocs,
} from "../src/services/firestoreMappers";
import type { Entry } from "../src/types";
import { getErrorMessage } from "../src/utils/errors";
import { ledgerId, sourceIdFromName } from "../src/utils/ledger";
import { buildLedgerReportHtml, escapeHtml } from "../src/utils/report";
import {
  parseAmountCents,
  sanitizeAmountInput,
  validateEntryInput,
  validatePersonName,
  validateSourceName,
} from "../src/utils/validation";

test("formats ledger amounts", () => {
  expect(formatDecimalAmount(12)).toBe("12.00");
  expect(formatAmount(1234)).toBe("AED 12.34");
  expect(formatAmount(-1234)).toBe("(AED 12.34)");
});

test("formats people count labels", () => {
  expect(formatPeopleCountLabel(1)).toBe("One-Person Ledger");
  expect(formatPeopleCountLabel(2)).toBe("Two-Person Ledger");
  expect(formatPeopleCountLabel(4)).toBe("Four-Person Ledger");
});

test("creates stable ids from source names", () => {
  expect(sourceIdFromName("Amazon UAE")).toBe("amazon-uae");
  expect(sourceIdFromName("  ")).toBe("");
});

test("validates entry input", () => {
  expect(sanitizeAmountInput("AED -12.30x")).toBe("-12.30");
  expect(parseAmountCents("-12.30")).toBe(-1230);
  expect(validateEntryInput({ amount: "0", note: "Lunch", source: "Default" })).toEqual(
    {
      ok: false,
      title: "Amount cannot be zero",
      message: "Amount cannot be 0.",
    },
  );
  expect(
    validateEntryInput({ amount: "12", note: "Lunch", source: "Default" }).ok,
  ).toBe(true);
});

test("validates unique names", () => {
  expect(validatePersonName("Dad", [{ id: "dad", name: "Dad" }]).ok).toBe(false);
  expect(validatePersonName("Mom", [{ id: "dad", name: "Dad" }]).ok).toBe(true);
  expect(validateSourceName("Amazon", [{ id: "amazon", name: "Amazon" }]).ok).toBe(
    false,
  );
});

test("maps Firestore docs defensively", () => {
  const entries = entriesFromDocs([
    {
      id: "entry-1",
      data: () => ({
        amountCents: 500,
        note: "Lunch",
        personId: "dad",
        source: "Default",
        user: "Dad",
      }),
    },
  ]);

  expect(entries[0]?.id).toBe("entry-1");
  expect(entries[0]?.personId).toBe("dad");
  expect(entries[0]?.amountCents).toBe(500);

  expect(
    peopleFromDocs([
      { id: "dad", data: () => ({ name: "Dad" }) },
      { id: "bad", data: () => ({ name: " " }) },
    ]),
  ).toEqual([{ id: "dad", name: "Dad" }]);

  expect(sourcesFromDocs([{ id: "amazon", data: () => ({ name: "Amazon" }) }])).toEqual(
    [{ id: "amazon", name: "Amazon" }],
  );
});

test("builds report html with escaped content", () => {
  const entries: Entry[] = [
    {
      id: "entry-1",
      amountCents: 2500,
      createdAt: new Date("2026-01-01T00:00:00Z"),
      note: "<Lunch>",
      personId: "dad",
      source: "Default",
    },
  ];

  const html = buildLedgerReportHtml({
    balanceCents: 2500,
    entries,
    user: "Dad & Co",
  });

  expect(html).toMatch(/Dad &amp; Co/);
  expect(html).toMatch(/&lt;Lunch&gt;/);
  expect(html).toMatch(/AED 25.00/);
});

test("normalizes unknown errors", () => {
  expect(getErrorMessage(new Error("Failed"))).toBe("Failed");
  expect(getErrorMessage("Nope")).toBe("Nope");
  expect(getErrorMessage(null)).toBe("Something went wrong. Please try again.");
});

test("formats entry dates in en-GB with long month names", () => {
  const date = new Date("2026-05-23T00:00:00Z");
  expect(formatEntryDate(date)).toBe("23 May 2026");
});

test("generates ledger IDs from person IDs", () => {
  expect(ledgerId("Dad")).toBe("ledger-dad");
  expect(ledgerId("John Doe")).toBe("ledger-john-doe");
  expect(ledgerId("  ")).toBe("ledger-default");
});

test("escapes HTML special characters", () => {
  expect(escapeHtml("&")).toBe("&amp;");
  expect(escapeHtml("<")).toBe("&lt;");
  expect(escapeHtml(">")).toBe("&gt;");
  expect(escapeHtml('"')).toBe("&quot;");
  expect(escapeHtml("'")).toBe("&#39;");
  expect(escapeHtml("<script>alert('xss')</script>")).toBe(
    "&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;",
  );
  expect(escapeHtml("")).toBe("");
});

test("handles edge cases for people count labels", () => {
  expect(formatPeopleCountLabel(0)).toBe("Zero-Person Ledger");
  expect(formatPeopleCountLabel(10)).toBe("Ten-Person Ledger");
  expect(formatPeopleCountLabel(11)).toBe("11-Person Ledger");
});

test("handles edge cases for validation", () => {
  expect(validateEntryInput({ amount: "", note: "Lunch", source: "Default" })).toEqual({
    ok: false,
    title: "Enter an amount",
    message: "Amount cannot be empty.",
  });
  expect(
    validateEntryInput({ amount: "abc", note: "Lunch", source: "Default" }),
  ).toEqual({
    ok: false,
    title: "Enter an amount",
    message: "Amount is not valid.",
  });
  expect(validateEntryInput({ amount: "12.50", note: "", source: "Default" })).toEqual({
    ok: false,
    title: "Enter a note",
    message: "Note cannot be blank.",
  });
  expect(validateEntryInput({ amount: "12.50", note: "Lunch", source: "" }).ok).toBe(
    false,
  );
  expect(
    validateEntryInput({ amount: "12.50", note: "Lunch", source: "Default" }).ok,
  ).toBe(true);
  expect(parseAmountCents("0")).toBeNull();
  expect(parseAmountCents("abc")).toBeNull();
});

test("handles edge cases for id generation", () => {
  expect(sourceIdFromName("  Hello   World  ")).toBe("hello-world");
  expect(sourceIdFromName("special!@#characters")).toBe("special-characters");
});
