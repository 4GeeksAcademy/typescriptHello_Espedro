import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";
import {
  countSeats,
  createSeatingPlan,
  displaySeatingPlan,
  findFirstAdjacentPair,
  reserveSeat,
} from "./cinema";

/** Runs the interactive cinema reservation menu until the user exits. */
async function runConsoleApp(): Promise<void> {
  const readline = createInterface({ input: stdin, output: stdout });
  const plan = createSeatingPlan();
  let running = true;

  try {
    while (running) {
      console.log("\nCinema Seat Reservation");
      console.log("1. Display seats");
      console.log("2. Reserve a seat");
      console.log("3. Count available and occupied seats");
      console.log("4. Find two adjacent available seats");
      console.log("5. Exit");

      const choice = (await readline.question("Choose an option: ")).trim();

      switch (choice) {
        case "1":
          displaySeatingPlan(plan);
          break;
        case "2": {
          const row = Number(await readline.question("Enter row (1-8): "));
          const column = Number(
            await readline.question("Enter column (1-10): "),
          );
          const result = reserveSeat(plan, row, column);
          console.log(result.message);
          break;
        }
        case "3": {
          const counts = countSeats(plan);
          console.log(
            `Available: ${counts.available} | Occupied: ${counts.occupied}`,
          );
          break;
        }
        case "4": {
          const pair = findFirstAdjacentPair(plan);
          if (pair) {
            console.log(
              `First adjacent pair: row ${pair.row}, columns ${pair.firstColumn} and ${pair.secondColumn}.`,
            );
          } else {
            console.log("No two adjacent available seats were found.");
          }
          break;
        }
        case "5":
          running = false;
          console.log("Goodbye.");
          break;
        default:
          console.log("Invalid option. Choose a number from 1 to 5.");
      }
    }
  } finally {
    readline.close();
  }
}

void runConsoleApp().catch((error: unknown) => {
  console.error("The cinema reservation menu could not start.", error);
});