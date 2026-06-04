import { expect, test, vi } from "vitest";

vi.mock("react-native", () => ({
  Alert: { alert: vi.fn() },
  Platform: { OS: "ios", select: (obj: Record<string, unknown>) => obj.ios },
}));

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
import { Alert } from "react-native";
import { Timestamp } from "firebase/firestore";
import type { Entry } from "../src/types";
import { getErrorMessage } from "../src/utils/errors";
import { handleAction } from "../src/utils/actions";
import { ledgerId, sourceIdFromName } from "../src/utils/ledger";
import {
  buildLedgerReportHtml,
  entriesSinceLastSettlement,
  escapeHtml,
} from "../src/utils/report";
import {
  parseAmountCents,
  sanitizeAmountInput,
  validateEntryInput,
  validatePersonName,
  validateSourceName,
} from "../src/utils/validation";

// ── format ────────────────────────────────────────────────

test("formats ledger amounts", () => {
  expect(formatDecimalAmount(12)).toBe("12.00");
  expect(formatDecimalAmount(0)).toBe("0.00");
  expect(formatDecimalAmount(0.5)).toBe("0.50");
  expect(formatDecimalAmount(-12.5)).toBe("-12.50");
  expect(formatDecimalAmount(999999.99)).toBe("999,999.99");
  expect(formatAmount(1234)).toBe("AED 12.34");
  expect(formatAmount(-1234)).toBe("(AED 12.34)");
  expect(formatAmount(0)).toBe("AED 0.00");
  expect(formatAmount(1)).toBe("AED 0.01");
  expect(formatAmount(-1)).toBe("(AED 0.01)");
});

test("formats people count labels", () => {
  expect(formatPeopleCountLabel(0)).toBe("Zero-Person Ledger");
  expect(formatPeopleCountLabel(1)).toBe("One-Person Ledger");
  expect(formatPeopleCountLabel(2)).toBe("Two-Person Ledger");
  expect(formatPeopleCountLabel(4)).toBe("Four-Person Ledger");
  expect(formatPeopleCountLabel(10)).toBe("Ten-Person Ledger");
  expect(formatPeopleCountLabel(11)).toBe("11-Person Ledger");
  expect(formatPeopleCountLabel(12)).toBe("12-Person Ledger");
  expect(formatPeopleCountLabel(100)).toBe("100-Person Ledger");
});

test("formats entry dates in en-GB with long month names", () => {
  const date = new Date("2026-05-23T00:00:00Z");
  expect(formatEntryDate(date)).toBe("23 May 2026");
});

// ── ids ───────────────────────────────────────────────────

test("creates stable ids from source names", () => {
  expect(sourceIdFromName("Amazon UAE")).toBe("amazon-uae");
  expect(sourceIdFromName("  ")).toBe("");
  expect(sourceIdFromName("  Hello   World  ")).toBe("hello-world");
  expect(sourceIdFromName("special!@#characters")).toBe("special-characters");
  expect(sourceIdFromName("---hello---")).toBe("hello");
});

test("generates ledger IDs from person IDs", () => {
  expect(ledgerId("Dad")).toBe("ledger-dad");
  expect(ledgerId("John Doe")).toBe("ledger-john-doe");
  expect(ledgerId("  ")).toBe("ledger-default");
});

// ── validation ────────────────────────────────────────────

test("sanitises amount input", () => {
  expect(sanitizeAmountInput("AED -12.30x")).toBe("-12.30");
  expect(sanitizeAmountInput("")).toBe("");
  expect(sanitizeAmountInput("abcdef")).toBe("");
  expect(sanitizeAmountInput("12.34.56")).toBe("12.34.56");
  expect(sanitizeAmountInput("   -12.30  ")).toBe("-12.30");
  expect(sanitizeAmountInput("$1,234.56")).toBe("1234.56");
});

test("parses amount cents", () => {
  expect(parseAmountCents("-12.30")).toBe(-1230);
  expect(parseAmountCents("0")).toBeNull();
  expect(parseAmountCents("abc")).toBeNull();
  expect(parseAmountCents("")).toBeNull();
  expect(parseAmountCents("0.004")).toBe(0);
  expect(parseAmountCents("-0")).toBeNull();
  expect(parseAmountCents("0.00")).toBeNull();
  expect(parseAmountCents("  12.50  ")).toBe(1250);
  expect(parseAmountCents("-0.01")).toBe(-1);
});

test("validates entry input", () => {
  expect(validateEntryInput({ amount: "0", note: "Lunch", source: "Default" })).toEqual({
    ok: false,
    title: "Amount cannot be zero",
    message: "Amount cannot be 0.",
  });
  expect(
    validateEntryInput({ amount: "12", note: "Lunch", source: "Default" }).ok,
  ).toBe(true);
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
  expect(
    validateEntryInput({ amount: "  15  ", note: "Dinner", source: "Default" }).ok,
  ).toBe(true);
  expect(
    validateEntryInput({ amount: "0.001", note: "Snack", source: "Cafe" }),
  ).toEqual({
    ok: false,
    title: "Amount cannot be zero",
    message: "Amount cannot be 0.",
  });
});

test("validates person and source names", () => {
  expect(validatePersonName("Dad", [{ id: "dad", name: "Dad" }]).ok).toBe(false);
  expect(validatePersonName("Mom", [{ id: "dad", name: "Dad" }]).ok).toBe(true);
  expect(validateSourceName("Amazon", [{ id: "amazon", name: "Amazon" }]).ok).toBe(
    false,
  );

  expect(validatePersonName("", []).ok).toBe(false);
  expect(validatePersonName("   ", []).ok).toBe(false);
  expect(
    validatePersonName("DAD", [{ id: "dad", name: "dad" }]),
  ).toEqual({
    ok: false,
    title: "Person already exists",
    message: "DAD is already listed.",
  });

  expect(validateSourceName("", []).ok).toBe(false);
  expect(validateSourceName("   ", []).ok).toBe(false);
  expect(
    validateSourceName("AMAZON", [{ id: "amazon", name: "amazon" }]),
  ).toEqual({
    ok: false,
    title: "Source already exists",
    message: "AMAZON is already listed.",
  });
});

// ── errors ────────────────────────────────────────────────

test("normalizes unknown errors", () => {
  expect(getErrorMessage(new Error("Failed"))).toBe("Failed");
  expect(getErrorMessage("Nope")).toBe("Nope");
  expect(getErrorMessage(null)).toBe("Something went wrong. Please try again.");
  expect(getErrorMessage("")).toBe("Something went wrong. Please try again.");
  expect(getErrorMessage(new Error(""))).toBe("Something went wrong. Please try again.");
  expect(getErrorMessage(new Error("  "))).toBe("Something went wrong. Please try again.");
  expect(getErrorMessage(undefined)).toBe("Something went wrong. Please try again.");
});

// ── handleAction ──────────────────────────────────────────

test("handleAction returns result on success and false on error", async () => {
  const alertSpy = vi.spyOn(Alert, "alert").mockImplementation(() => {});

  const successResult = await handleAction(async () => 42, "Error title");
  expect(successResult).toBe(42);
  expect(alertSpy).not.toHaveBeenCalled();

  const errorResult = await handleAction(async () => {
    throw new Error("Boom");
  }, "Something broke");
  expect(errorResult).toBe(false);
  expect(alertSpy).toHaveBeenCalledWith("Something broke", "Boom");

  alertSpy.mockRestore();
});

// ── Firestore mappers ─────────────────────────────────────

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

test("maps Firestore entry docs with missing fields", () => {
  const entries = entriesFromDocs([
    { id: "e1", data: () => ({}) },
    {
      id: "e2",
      data: () => ({
        amountCents: "not-a-number",
        note: 123,
        personId: null,
        source: undefined,
      }),
    },
    {
      id: "e3",
      data: () => ({
        amountCents: 300,
        note: "Coffee",
        user: "Dad",
      }),
    },
    {
      id: "e4",
      data: () => ({
        amountCents: 100,
        note: "Snack",
        personId: "mom",
        createdAt: Timestamp.fromDate(new Date("2026-05-01T00:00:00Z")),
      }),
    },
  ]);

  expect(entries[0]).toEqual({
    id: "e1",
    amountCents: 0,
    source: "Unknown source",
    note: "",
    personId: "unknown",
    createdAt: expect.any(Date),
  });

  expect(entries[1]).toEqual({
    id: "e2",
    amountCents: 0,
    source: "Unknown source",
    note: "",
    personId: "unknown",
    createdAt: expect.any(Date),
  });

  expect(entries[2]).toMatchObject({
    id: "e3",
    amountCents: 300,
    note: "Coffee",
    personId: "dad",
  });

  expect(entries[3]?.createdAt).toEqual(new Date("2026-05-01T00:00:00Z"));
});

// ── report ────────────────────────────────────────────────

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

const makeEntry = (overrides: Partial<Entry> & { id: string }): Entry => ({
  amountCents: 100,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  note: "",
  personId: "p1",
  source: "Default",
  ...overrides,
});

test("entriesSinceLastSettlement returns all entries when no settlement exists", () => {
  const entries = [
    makeEntry({ id: "a", amountCents: 100, createdAt: new Date("2026-05-01") }),
    makeEntry({ id: "b", amountCents: 200, createdAt: new Date("2026-05-02") }),
  ];

  expect(entriesSinceLastSettlement(entries)).toEqual(entries);
  expect(entriesSinceLastSettlement([])).toEqual([]);
});

test("entriesSinceLastSettlement filters entries after last settlement", () => {
  const settlement = makeEntry({
    id: "settle",
    note: "Balance settled",
    amountCents: -500,
    createdAt: new Date("2026-05-10T12:00:00Z"),
  });

  const before = makeEntry({
    id: "old",
    amountCents: 500,
    createdAt: new Date("2026-05-01"),
  });

  const after1 = makeEntry({
    id: "new1",
    amountCents: 100,
    createdAt: new Date("2026-05-11"),
  });

  const after2 = makeEntry({
    id: "new2",
    amountCents: 200,
    createdAt: new Date("2026-05-12"),
  });

  const result = entriesSinceLastSettlement([before, after1, settlement, after2]);

  expect(result).toEqual([after1, after2]);
});

test("entriesSinceLastSettlement uses the LAST settlement when multiple exist", () => {
  const firstSettlement = makeEntry({
    id: "s1",
    note: "Balance settled",
    amountCents: -100,
    createdAt: new Date("2026-04-01"),
  });

  const afterFirst = makeEntry({
    id: "mid",
    amountCents: 50,
    createdAt: new Date("2026-04-15"),
  });

  const secondSettlement = makeEntry({
    id: "s2",
    note: "Balance settled",
    amountCents: -50,
    createdAt: new Date("2026-05-01"),
  });

  const afterSecond = makeEntry({
    id: "final",
    amountCents: 30,
    createdAt: new Date("2026-05-15"),
  });

  const result = entriesSinceLastSettlement([
    firstSettlement,
    afterFirst,
    secondSettlement,
    afterSecond,
  ]);

  // Should only include entries after the second (latest) settlement
  expect(result).toEqual([afterSecond]);
});

test("entriesSinceLastSettlement returns empty when nothing follows last settlement", () => {
  const entry = makeEntry({
    id: "only",
    amountCents: 100,
    createdAt: new Date("2026-03-01"),
  });

  const settlement = makeEntry({
    id: "s",
    note: "Balance settled",
    amountCents: -100,
    createdAt: new Date("2026-03-02"),
  });

  expect(entriesSinceLastSettlement([entry, settlement])).toEqual([]);
});

test("builds report html with escaped content", () => {
  const entries: Entry[] = [
    makeEntry({
      id: "entry-1",
      amountCents: 2500,
      createdAt: new Date("2026-01-01T00:00:00Z"),
      note: "<Lunch>",
    }),
  ];

  const html = buildLedgerReportHtml({
    entries,
    user: "Dad & Co",
  });

  expect(html).toMatch(/Dad &amp; Co/);
  expect(html).toMatch(/&lt;Lunch&gt;/);
  expect(html).toMatch(/AED 25.00/);
});

test("buildLedgerReportHtml only includes entries after last settlement", () => {
  const settlement = makeEntry({
    id: "settle",
    note: "Balance settled",
    amountCents: -300,
    createdAt: new Date("2026-05-26T12:00:00Z"),
  });

  const after1 = makeEntry({
    id: "after1",
    amountCents: 150,
    note: "Groceries",
    createdAt: new Date("2026-06-01"),
  });

  const after2 = makeEntry({
    id: "after2",
    amountCents: 75,
    note: "Coffee",
    createdAt: new Date("2026-06-02"),
  });

  const html = buildLedgerReportHtml({
    entries: [settlement, after1, after2],
    user: "Test",
  });

  expect(html).not.toMatch(/Balance settled/);
  expect(html).toMatch(/Groceries/);
  expect(html).toMatch(/Coffee/);
  expect(html).toMatch(/AED 2.25/);
});

test("buildLedgerReportHtml shows empty state when no entries remain after settlement", () => {
  const settlement = makeEntry({
    id: "settle",
    note: "Balance settled",
    amountCents: -100,
    createdAt: new Date("2026-05-26"),
  });

  const html = buildLedgerReportHtml({
    entries: [settlement],
    user: "Test",
  });

  expect(html).toMatch(/No entries yet/);
});

test("buildLedgerReportHtml shows balance computed from only recent entries", () => {
  const entries = [
    makeEntry({ id: "a", amountCents: 100, createdAt: new Date("2026-05-01") }),
    makeEntry({ id: "b", amountCents: -50, createdAt: new Date("2026-05-02") }),
  ];

  const html = buildLedgerReportHtml({
    entries,
    user: "Test",
  });

  expect(html).toMatch(/AED 0.50/);
});
