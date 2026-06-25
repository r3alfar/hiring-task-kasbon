// Unit test untuk groupDebtsByPerson — dijalankan dengan:
//   node --test --experimental-strip-types lib/group-debts.test.mjs
//
// Menggunakan Node built-in test runner (zero dependency). Impor langsung
// file .ts; Node 24 men-strip type annotations saat runtime.
import { test } from "node:test";
import assert from "node:assert/strict";
import { groupDebtsByPerson } from "./group-debts.ts";

/** Factory debt minimal untuk test. */
function makeDebt(overrides) {
  return {
    id: crypto.randomUUID(),
    user_id: crypto.randomUUID(),
    type: "owed_to_me",
    counterpart_name: "Budi",
    amount: 10000,
    note: null,
    due_date: null,
    settled_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

test("empty array returns empty array", () => {
  assert.deepEqual(groupDebtsByPerson([]), []);
});

test("groups debts by counterpart_name case-insensitively", () => {
  const debts = [
    makeDebt({ counterpart_name: "Budi", amount: 10000 }),
    makeDebt({ counterpart_name: "budi", amount: 5000 }),
    makeDebt({ counterpart_name: "BUDI", amount: 2000 }),
  ];
  const groups = groupDebtsByPerson(debts);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].debts.length, 3);
  // Header memakai nama asli entry pertama yang ditemukan (preserve case).
  assert.equal(groups[0].displayName, "Budi");
});

test("sums totalAmount across all debts in a group (including settled)", () => {
  const debts = [
    makeDebt({ counterpart_name: "Siti", amount: 50000, settled_at: "2025-01-01T00:00:00Z" }),
    makeDebt({ counterpart_name: "siti", amount: 30000, settled_at: null }),
  ];
  const groups = groupDebtsByPerson(debts);
  assert.equal(groups[0].totalAmount, 80000);
});

test("counts totalCount and unsettledCount correctly", () => {
  const debts = [
    makeDebt({ counterpart_name: "Andi", amount: 10000, settled_at: null }),
    makeDebt({ counterpart_name: "andi", amount: 20000, settled_at: "2025-01-01T00:00:00Z" }),
    makeDebt({ counterpart_name: "ANDI", amount: 30000, settled_at: null }),
  ];
  const groups = groupDebtsByPerson(debts);
  assert.equal(groups[0].totalCount, 3);
  assert.equal(groups[0].unsettledCount, 2);
});

test("sorts groups by totalAmount descending", () => {
  const debts = [
    makeDebt({ counterpart_name: "Kecil", amount: 1000 }),
    makeDebt({ counterpart_name: "Besar", amount: 100000 }),
    makeDebt({ counterpart_name: "Sedang", amount: 50000 }),
  ];
  const groups = groupDebtsByPerson(debts);
  assert.equal(groups[0].displayName, "Besar");
  assert.equal(groups[1].displayName, "Sedang");
  assert.equal(groups[2].displayName, "Kecil");
});

test("preserves individual debts inside group (same references)", () => {
  const d1 = makeDebt({ counterpart_name: "Joko", amount: 10000 });
  const d2 = makeDebt({ counterpart_name: "joko", amount: 5000 });
  const groups = groupDebtsByPerson([d1, d2]);
  assert.equal(groups[0].debts[0], d1);
  assert.equal(groups[0].debts[1], d2);
});

test("separates different names into different groups", () => {
  const debts = [
    makeDebt({ counterpart_name: "Budi", amount: 10000 }),
    makeDebt({ counterpart_name: "Siti", amount: 20000 }),
  ];
  const groups = groupDebtsByPerson(debts);
  assert.equal(groups.length, 2);
});
