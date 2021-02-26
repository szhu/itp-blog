import { readLines } from "https://deno.land/std@0.77.0/io/bufio.ts";

let textEncoder = new TextEncoder();
let textDecoder = new TextDecoder();

function fixedLine(line: string) {
  return "\r\u001b[K" + line;
}

async function osascript(script: string) {
  let process = Deno.run({
    cmd: ["osascript", "-e", script],
    stdout: "null",
  });
  await process.status();
}

function serialProcess() {
  return Deno.run({
    cmd: ["bash", "-c", "cat /dev/cu.usbmodem*"],
    stdout: "piped",
  });
}

async function isScreenSaverRunning() {
  let process = Deno.run({ cmd: ["pgrep", "ScreenSaverEngine"] });
  let status = await process.status();
  return status.success;
}

let ignore = false;

async function run() {
  console.log("Started!");

  let process = serialProcess();
  for await (let line of readLines(process.stdout)) {
    if (ignore) continue;
    console.log(line);
    if (line.match(/Held and Pressed/)) {
      if (await isScreenSaverRunning()) {
        osascript(`quit app "ScreenSaverEngine"`);
      } else {
        Deno.run({ cmd: ["open", "-a", "ScreenSaverEngine"] });
      }
      ignore = true;
      setTimeout(() => ignore = false, 2000);
    }
    if (line.match(/Pressed/)) {
      osascript(`
        beep
        tell app "Spotify" to playpause
      `);
    }
  }
}

run();
