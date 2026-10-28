import "./style.css";
import {
  countSeats,
  createSeatingPlan,
  findFirstAdjacentPair,
  reserveSeat,
  type AdjacentSeatPair,
  type SeatCounts,
  type SeatingPlan,
} from "./cinema";

type SeatPosition = { row: number; column: number };

function getRequiredElement<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`The reservation interface is missing ${selector}.`);
  }
  return element;
}

const seatGrid = getRequiredElement<HTMLDivElement>("#seat-grid");
const selectedSummary = getRequiredElement<HTMLElement>("#selected-summary");
const availableCount = getRequiredElement<HTMLElement>("#available-count");
const occupiedCount = getRequiredElement<HTMLElement>("#occupied-count");
const reserveButton = getRequiredElement<HTMLButtonElement>("#reserve-button");
const findPairButton = getRequiredElement<HTMLButtonElement>("#find-pair-button");
const resetButton = getRequiredElement<HTMLButtonElement>("#reset-button");
const statusMessage = getRequiredElement<HTMLElement>("#status-message");

let seatingPlan: SeatingPlan = createSeatingPlan();
let selectedSeats: SeatPosition[] = [];
let notice = "Ready for reservations.";

function renderSeatGrid(): void {
  const cells: HTMLElement[] = [];
  const corner = document.createElement("span");
  corner.className = "grid-corner";
  corner.setAttribute("aria-hidden", "true");
  cells.push(corner);

  for (let column = 1; column <= 10; column += 1) {
    const columnLabel = document.createElement("span");
    columnLabel.className = "column-label";
    columnLabel.textContent = String(column);
    columnLabel.setAttribute("aria-hidden", "true");
    cells.push(columnLabel);
  }

  for (let row = 1; row <= 8; row += 1) {
    const rowLabel = document.createElement("span");
    rowLabel.className = "row-label";
    rowLabel.textContent = String(row);
    rowLabel.setAttribute("aria-hidden", "true");
    cells.push(rowLabel);

    for (let column = 1; column <= 10; column += 1) {
      const isOccupied = seatingPlan[row - 1][column - 1] === 1;
      const isSelected = selectedSeats.some(
        (seat) => seat.row === row && seat.column === column,
      );
      const seatButton = document.createElement("button");
      seatButton.type = "button";
      seatButton.className = `seat ${isOccupied ? "occupied" : isSelected ? "selected" : "available"}`;
      seatButton.dataset.row = String(row);
      seatButton.dataset.column = String(column);
      seatButton.disabled = isOccupied;
      seatButton.setAttribute("aria-pressed", String(isSelected));
      seatButton.setAttribute(
        "aria-label",
        `Row ${row}, seat ${column}, ${isOccupied ? "reserved" : isSelected ? "selected" : "available"}`,
      );
      cells.push(seatButton);
    }
  }

  seatGrid.replaceChildren(...cells);
}

function formatSeatPositions(seats: SeatPosition[]): string {
  return seats
    .map((seat) => `${seat.row}·${String(seat.column).padStart(2, "0")}`)
    .join("  /  ");
}

function updateSummary(counts: SeatCounts): void {
  availableCount.textContent = String(counts.available);
  occupiedCount.textContent = String(counts.occupied);
  selectedSummary.textContent = selectedSeats.length
    ? formatSeatPositions(selectedSeats)
    : "None";
  reserveButton.disabled = selectedSeats.length === 0;
  reserveButton.textContent = selectedSeats.length
    ? `Reserve ${selectedSeats.length} ${selectedSeats.length === 1 ? "seat" : "seats"}`
    : "Reserve selected seats";
  statusMessage.textContent = notice;
}

function render(): void {
  renderSeatGrid();
  updateSummary(countSeats(seatingPlan));
}

function selectAdjacentPair(pair: AdjacentSeatPair): void {
  selectedSeats = [
    { row: pair.row, column: pair.firstColumn },
    { row: pair.row, column: pair.secondColumn },
  ];
  notice = `Pair selected: row ${pair.row}, seats ${pair.firstColumn}–${pair.secondColumn}. Not reserved.`;
}

seatGrid.addEventListener("click", (event: MouseEvent) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) return;

  const row = Number(target.dataset.row);
  const column = Number(target.dataset.column);
  const selectedIndex = selectedSeats.findIndex(
    (seat) => seat.row === row && seat.column === column,
  );

  if (selectedIndex === -1) {
    selectedSeats = [...selectedSeats, { row, column }];
    notice = `Row ${row}, seat ${column} selected.`;
  } else {
    selectedSeats = selectedSeats.filter((_, index) => index !== selectedIndex);
    notice = `Row ${row}, seat ${column} removed from selection.`;
  }

  render();
});

reserveButton.addEventListener("click", () => {
  let reservedCount = 0;

  for (const seat of selectedSeats) {
    const result = reserveSeat(seatingPlan, seat.row, seat.column);
    if (result.success) reservedCount += 1;
  }

  notice = `Reservation confirmed for ${reservedCount} ${reservedCount === 1 ? "seat" : "seats"}.`;
  selectedSeats = [];
  render();
});

findPairButton.addEventListener("click", () => {
  const pair = findFirstAdjacentPair(seatingPlan);
  if (pair) {
    selectAdjacentPair(pair);
  } else {
    selectedSeats = [];
    notice = "No adjacent available pair found.";
  }
  render();
});

resetButton.addEventListener("click", () => {
  seatingPlan = createSeatingPlan();
  selectedSeats = [];
  notice = "Cinema reset. All seats are available.";
  render();
});

render();
