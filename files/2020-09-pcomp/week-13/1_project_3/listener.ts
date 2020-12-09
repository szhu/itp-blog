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

let ignore = false;

async function run() {
  let process = serialProcess();
  for await (let line of readLines(process.stdout)) {
    if (ignore) continue;
    console.log(line);
    if (line.match(/Held and Pressed/)) {
      await osascript(`
        tell app "Spotify" to pause
        do shell script "brightness 0"
        quit app "Backdrop"
        -- activate app "ScreenSaverEngine"
      `);
      ignore = true;
      setTimeout(() => ignore = false, 2000);
    } else if (line.match(/Pressed/)) {
      osascript(`
        beep
        do shell script "brightness 0.7"
        activate app "Backdrop"
        tell app "Spotify" to playpause
      `);
    }
  }
}

run();
