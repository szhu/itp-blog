import { readLines } from "https://deno.land/std@0.77.0/io/bufio.ts";

let textEncoder = new TextEncoder();
let textDecoder = new TextDecoder();

function sum(items: number[]) {
  return items.reduce((acc, c) => acc + c, 0);
}

function average(items: number[]) {
  return sum(items) / items.length;
}

async function writeFixedLine(line: string) {
  await Deno.stdout.write(textEncoder.encode("\r\u001b[K" + line));
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
  //   display dialog "Now we should lock!" buttons {"OK"} default button "OK"
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
  // https://stackoverflow.com/a/17966890
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

function serialProcess() {
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

// type Process = Await<ReturnType<typeof serialProcess>>;

async function* readLevels(signal?: AbortSignal) {
  let process = serialProcess();
  if (signal) {
    signal.onabort = () => {
      process.kill(9);
    };
  }
  for await (const line of readLines(process.stdout)) {
    yield (line.match(/#/g) || []).length;
  }
}

async function calibrate(
  steps: number,
): Promise<number> {
  console.log("Remove your hands from the computer.");
  await delay(1000);

  let score = undefined;

  let recentLevels = [];
  let controller = new AbortController();
  for await (let level of readLevels(controller.signal)) {
    recentLevels.push(level);

    score = calculateScore(recentLevels);

    await writeFixedLine(`Calibrating... ${score.toFixed(3)}...`);

    if (recentLevels.length >= steps) {
      controller.abort();
      break;
    }
  }

  console.log(" done!");
  return score!;
}

function calculateScore(recentLevels: number[]) {
  return Math.min(...recentLevels) * 0.1 + stdev(recentLevels);
}

async function* readLevelAndScore(steps: number, signal?: AbortSignal) {
  let recentLevels: number[] = [];
  for await (let level of readLevels(signal)) {
    let isInitial = recentLevels.length < steps;
    recentLevels.push(level);
    if (!isInitial) {
      recentLevels.shift();
    }
    let score = calculateScore(recentLevels);
    yield [level, score, isInitial] as [number, number, boolean];
  }
}

async function run(steps: number, threshold: number) {
  console.log("Place your hands back on the computer.");

  while (true) {
    // console.log("Waiting for pressure.");
    // for await (let level of readLevels(process)) {
    //   if (level > threshold) break;
    // }

    console.log();
    console.log("Starting autolock.");

    let controller = new AbortController();
    for await (
      let [level, score, isInitial] of readLevelAndScore(
        steps,
        controller.signal,
      )
    ) {
      let startingText = isInitial ? " still collecting initial data" : "";
      await writeFixedLine(
        `Listening... ` +
          `level: ${level}  ` +
          `score: ${score.toFixed(3)}${startingText}...`,
      );

      if (!isInitial && score < threshold) {
        console.log();
        console.log("Locking!");
        console.log();
        await delay(200);
        await lockScreen();
        controller.abort();
        break;
      }
    }

    await delay(1000);

    while (await isScreenLockedCheck.check()) {
      await delay(1000);
    }
    // Sometimes this is buggy, so we do a second check.
    while ((await getHidInactiveTime()) > 1) {
      await delay(500);
    }

    console.log("Screen unlocked.");
  }
}

let isScreenLockedCheck = new IsScreenLockedCheck();
let threshold = await calibrate(100) + 0.05;
console.log(`Will sleep when score < ${threshold}`);
console.log();

run(100, threshold);
