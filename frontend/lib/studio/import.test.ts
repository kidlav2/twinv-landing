import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseCsv, parseMoney, parseDate, parseImportFile } from "./import.ts";
import { sampleState } from "./sample.ts";

describe("csv", () => {
  it("splits quoted commas and semicolon files", () => {
    const rows = parseCsv('a,b\n"Harbor, Inc",1500');
    assert.deepEqual(rows[1], ["Harbor, Inc", "1500"]);
    const eu = parseCsv("проект;клиент;сумма\nСайт;Atlas;2500");
    assert.equal(eu[1][2], "2500");
  });
});

describe("parseMoney", () => {
  it("reads CAD/US formatting", () => {
    assert.equal(parseMoney("CA$1,540.20"), 1540.2);
    assert.equal(parseMoney("(50.00)"), -50);
    assert.equal(parseMoney("1 540,20"), 1540.2);
  });
});

describe("parseDate", () => {
  it("prefers ISO and DMY when day > 12", () => {
    assert.equal(parseDate("2026-07-01"), "2026-07-01");
    assert.equal(parseDate("15.08.2026"), "2026-08-15");
  });
});

describe("import", () => {
  it("builds projects from a headered CSV", () => {
    const csv = `project,client,quoted,currency,received,status
Harbor Goods site,Harbor Goods,1500,CAD,1500,paid
Atlas Clinic,Atlas Clinic,2500,CAD,1250,partial`;
    const parsed = parseImportFile("jobs.csv", csv, { ...sampleState(), projects: [] }, "a");
    assert.equal(parsed.preview.kind, "projects");
    assert.equal(parsed.next.projects.length, 2);
    const harbor = parsed.next.projects.find((p) => p.name.includes("Harbor"))!;
    assert.equal(harbor.quotedPrice, 1500);
    assert.equal(harbor.actualReceived, 1500);
    assert.equal(harbor.paymentStatus, "paid");
  });

  it("maps Stripe fee/net into processing expense and received amount", () => {
    const csv = `Description,Amount,Fee,Net,Currency,Created,Status
Northline,4000,120,3880,USD,2026-06-12,succeeded`;
    const parsed = parseImportFile("stripe.csv", csv, { ...sampleState(), projects: [] }, "a");
    assert.equal(parsed.preview.kind, "stripe");
    const p = parsed.next.projects[0];
    assert.equal(p.quotedPrice, 4000);
    assert.equal(p.actualReceived, 3880);
    assert.equal(p.expenses[0]?.category, "payment_processing");
    assert.equal(p.expenses[0]?.amount, 120);
  });

  it("restores a JSON ledger", () => {
    const src = sampleState();
    const parsed = parseImportFile("backup.json", JSON.stringify(src), { ...src, projects: [] }, "a");
    assert.equal(parsed.preview.kind, "ledger");
    assert.equal(parsed.next.projects.length, src.projects.length);
  });
});
