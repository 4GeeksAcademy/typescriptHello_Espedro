export const ROW_COUNT = 8;
export const COLUMN_COUNT = 10;

export type Seat = 0 | 1;
export type SeatingPlan = Seat[][];
export type ReservationResult = { success: boolean; message: string };
export type SeatCounts = { available: number; occupied: number };
export type AdjacentSeatPair = {
  row: number;
  firstColumn: number;
  secondColumn: number;
};

/** Creates an 8-by-10 seating plan with every seat available. */
export function createSeatingPlan(): SeatingPlan {
  return Array.from({ length: ROW_COUNT }, () =>
    Array<Seat>(COLUMN_COUNT).fill(0),
  );
}

/** Prints the seating plan with human-readable row and column labels. */
export function displaySeatingPlan(plan: SeatingPlan): void {
  const columnLabels = Array.from({ length: COLUMN_COUNT }, (_, index) =>
    String(index + 1).padStart(2, " "),
  ).join(" ");

  console.log(`   ${columnLabels}`);

  for (let rowIndex = 0; rowIndex < ROW_COUNT; rowIndex += 1) {
    const rowLabel = String(rowIndex + 1).padStart(2, " ");
    const seats = plan[rowIndex]
      .map((seat) => (seat === 1 ? "X" : "L").padStart(2, " "))
      .join(" ");

    console.log(`${rowLabel} ${seats}`);
  }
}

/** Reserves an available seat after validating its 1-based position. */
export function reserveSeat(
  plan: SeatingPlan,
  row: number,
  column: number,
): ReservationResult {
  if (
    !Number.isInteger(row) ||
    !Number.isInteger(column) ||
    row < 1 ||
    row > ROW_COUNT ||
    column < 1 ||
    column > COLUMN_COUNT
  ) {
    return {
      success: false,
      message: "Invalid seat position. Choose a row from 1-8 and a column from 1-10.",
    };
  }

  const rowIndex = row - 1;
  const columnIndex = column - 1;

  if (plan[rowIndex][columnIndex] === 1) {
    return {
      success: false,
      message: `Seat at row ${row}, column ${column} is already occupied.`,
    };
  }

  plan[rowIndex][columnIndex] = 1;
  return {
    success: true,
    message: `Seat reserved: row ${row}, column ${column}.`,
  };
}

/** Counts available and occupied seats in the seating plan. */
export function countSeats(plan: SeatingPlan): SeatCounts {
  let available = 0;
  let occupied = 0;

  for (const row of plan) {
    for (const seat of row) {
      if (seat === 1) {
        occupied += 1;
      } else {
        available += 1;
      }
    }
  }

  return { available, occupied };
}

/** Finds the first horizontal pair of available seats without reserving it. */
export function findFirstAdjacentPair(
  plan: SeatingPlan,
): AdjacentSeatPair | null {
  for (let rowIndex = 0; rowIndex < ROW_COUNT; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < COLUMN_COUNT - 1; columnIndex += 1) {
      if (
        plan[rowIndex][columnIndex] === 0 &&
        plan[rowIndex][columnIndex + 1] === 0
      ) {
        return {
          row: rowIndex + 1,
          firstColumn: columnIndex + 1,
          secondColumn: columnIndex + 2,
        };
      }
    }
  }

  return null;
}