import { readLines } from "https://deno.land/std@0.77.0/io/bufio.ts";

let textEncoder = new TextEncoder();
let textDecoder = new TextDecoder();

function sum(items: number[]) {
  return items.reduce((acc, c) => acc + c, 0);
}

function average(items: number[]) {
  return sum(items) / items.length;
}

function stdev(array: number[]) {
  const n = array.length;
  const mean = array.reduce((a, b) => a + b) / n;
  return Math.sqrt(
    array.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n,
  );
}

async function delay(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function osascript(script: string) {
  let process = Deno.run({
    cmd: ["osascript", "-e", script],
    stdout: "null",
  });
  await process.status();
}

async function lockScreen() {
  // Fake lock
  // await osascript(`
  //   display dialog "Now the screen is locked!" buttons {"OK"}
  // `);
  // Real lock
  await osascript(`
    tell application id "com.apple.systemevents"
      keystroke "q" using {control down, command down}
    end
  `);
}

class IsScreenLockedCheck {
  process: Deno.Process<{
    cmd: [string, string];
    stdin: "piped";
    stdout: "piped";
  }>;

  constructor() {
    this.process = Deno.run({
      cmd: ["python", "check_if_screen_locked.py"],
      stdin: "piped",
      stdout: "piped",
    });
  }

  async check() {
    await this.process.stdin.write(textEncoder.encode("\n"));
    for await (let line of readLines(this.process.stdout)) {
      return line === "True";
    }
  }
}

async function getHidInactiveTime(): Promise<number> {
  let process = Deno.run({
    cmd: [
      "sh",
      "-c",
      "ioreg -c IOHIDSystem | awk '/HIDIdleTime/ {print $NF/1000000000; exit}'",
    ],
    stdout: "piped",
  });
  if (!(await process.status()).success) {
    throw new Error();
  }
  for await (let line of readLines(process.stdout)) {
    return Number(line);
  }
  throw new Error();
}

async function serialProcess() {
  return Deno.run({
    cmd: ["bash", "-c", "cat /dev/cu.usbmodem*"],
    stdout: "piped",
  });
}

// https://stackoverflow.com/a/57364353
type Await<T> = T extends {
  then(onfulfilled?: (value: infer U) => unknown): unknown;
} ? U
  : T;

type Process = Await<ReturnType<typeof serialProcess>>;

async function* readLevels(process: Process) {
  for await (const line of readLines(process.stdout)) {
    yield (line.match(/#/g) || []).length;
  }
}

async function calibrate(
  process: Process,
  steps: number,
): Promise<number> {
  console.log("Calibrating. Remove your hands from the computer.");
  await delay(1000);

  let threshold = undefined;

  let recentLevels = [];
  for await (let level of readLevels(process)) {
    recentLevels.push(level);

    let averageLevel = average(recentLevels);
    let maxLevel = Math.max(...recentLevels);

    threshold = (averageLevel * 2 + maxLevel * 5) / 7;

    await Deno.stdout.write(
      textEncoder.encode(`\r${threshold.toFixed(1)}...`),
    );
    if (recentLevels.length >= steps) {
      break;
    }
  }

  console.log(" done!");
  return threshold!;
}

async function* readRecentLevels(process: Process, steps: number) {
  let recentLevels = new Array(steps).fill(99);
  for await (let level of readLevels(process)) {
    recentLevels.push(level);
    recentLevels.shift();
    let recentLevel = Math.max(...recentLevels);
    yield [level, recentLevel];
  }
}

async function run(process: Process, steps: number, threshold: number) {
  console.log("Place your hands back on the computer.");

  while (true) {
    console.log("Waiting for pressure.");
    for await (let level of readLevels(process)) {
      if (level > threshold) break;
    }

    console.log("Starting autolock.");

    for await (let [level, recentLevel] of readRecentLevels(process, steps)) {
      await Deno.stdout.write(
        textEncoder.encode(
          `\rLevels: now: ${level}  max of last 100: ${recentLevel}...`,
        ),
      );

      if (recentLevel < threshold) {
        console.log("");
        console.log("Locking!");
        await delay(200);
        await lockScreen();
        break;
      }
    }

    while (await isScreenLockedCheck.check());

    console.log("Screen unlocked.");
  }
}

let isScreenLockedCheck = new IsScreenLockedCheck();
let process = await serialProcess();
let threshold = await calibrate(process, 20) + 5;
console.log(`Will sleep when pressure is consistently < ${threshold}`);

run(process, 50, threshold);
