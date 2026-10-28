import assert from "node:assert/strict";
import test from "node:test";
import {
  countSeats,
  createSeatingPlan,
  displaySeatingPlan,
  findFirstAdjacentPair,
  reserveSeat,
} from "../src/cinema";

test("empty cinema has 80 available seats and displays all seats as available", () => {
  const plan = createSeatingPlan();
  const lines: string[] = [];
  const originalLog = console.log;
  console.log = (line?: unknown) => lines.push(String(line));

  try {
    displaySeatingPlan(plan);
  } finally {
    console.log = originalLog;
  }

  assert.deepEqual(countSeats(plan), { available: 80, occupied: 0 });
  assert.deepEqual(findFirstAdjacentPair(plan), {
    row: 1,
    firstColumn: 1,
    secondColumn: 2,
  });
  assert.equal(lines.length, 9);
  assert.ok(lines[0].includes("10"));
  assert.ok(lines.slice(1).every((line) => line.includes("L")));
  assert.ok(lines.every((line) => !line.includes("X")));
});

test("partial reservations update counts and reject duplicate reservations", () => {
  const plan = createSeatingPlan();

  assert.equal(reserveSeat(plan, 2, 4).success, true);
  assert.equal(reserveSeat(plan, 5, 7).success, true);
  assert.equal(reserveSeat(plan, 2, 4).success, false);

  assert.deepEqual(countSeats(plan), { available: 78, occupied: 2 });
  assert.deepEqual(findFirstAdjacentPair(plan), {
    row: 1,
    firstColumn: 1,
    secondColumn: 2,
  });
});

test("adjacent search returns no pair when only isolated seats are available", () => {
  const plan = createSeatingPlan();
  const availablePositions = new Set([
    "1,1",
    "2,5",
    "3,10",
    "4,2",
    "5,8",
    "6,3",
    "7,6",
    "8,9",
  ]);

  for (let row = 1; row <= 8; row += 1) {
    for (let column = 1; column <= 10; column += 1) {
      if (!availablePositions.has(`${row},${column}`)) {
        reserveSeat(plan, row, column);
      }
    }
  }

  assert.deepEqual(countSeats(plan), { available: 8, occupied: 72 });
  assert.equal(findFirstAdjacentPair(plan), null);
});

test("full cinema rejects further reservations and has no adjacent pair", () => {
  const plan = createSeatingPlan();

  for (let row = 1; row <= 8; row += 1) {
    for (let column = 1; column <= 10; column += 1) {
      assert.equal(reserveSeat(plan, row, column).success, true);
    }
  }

  assert.deepEqual(countSeats(plan), { available: 0, occupied: 80 });
  assert.equal(reserveSeat(plan, 1, 1).success, false);
  assert.equal(findFirstAdjacentPair(plan), null);
});

test("invalid seat positions are rejected without changing the plan", () => {
  const plan = createSeatingPlan();
  const invalidPositions: Array<[number, number]> = [
    [0, 1],
    [9, 1],
    [1, 0],
    [1, 11],
    [1.5, 2],
    [2, Number.NaN],
  ];

  for (const [row, column] of invalidPositions) {
    assert.equal(reserveSeat(plan, row, column).success, false);
  }

  assert.deepEqual(countSeats(plan), { available: 80, occupied: 0 });
});

test("adjacent search can find a pair at the end of a row", () => {
  const plan = createSeatingPlan();

  for (let row = 1; row <= 8; row += 1) {
    for (let column = 1; column <= 10; column += 1) {
      if (row !== 8 || column < 9) {
        reserveSeat(plan, row, column);
      }
    }
  }

  assert.deepEqual(findFirstAdjacentPair(plan), {
    row: 8,
    firstColumn: 9,
    secondColumn: 10,
  });
});