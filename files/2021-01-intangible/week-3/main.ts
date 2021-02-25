import { readLines } from "https://deno.land/std@0.77.0/io/bufio.ts";

let lastSetting: boolean | undefined = undefined;
async function setDarkMode(setting: boolean) {
  if (setting === lastSetting) return;
  lastSetting = setting;

  let process = await Deno.run({
    cmd: [
      "osascript",
      "-e",
      `tell application "System Events"
      tell appearance preferences
              set dark mode to ${setting}
          end tell
      end tell`,
    ],
  });
  await process.status();
}

if (import.meta.main) {
  let process = Deno.run({
    cmd: ["make", "monitor"],
    stdout: "piped",
  });
  for await (let line of readLines(process.stdout)) {
    let m = line.match(/(\d+),(\d+),(\d+),(\d+)/);
    if (m) {
      let [_, sr, sg, sb, sc] = m;
      let [r, g, b, c] = [sr, sg, sb, sc].map(parseFloat);
      console.log(c);
      setDarkMode(c < 45);
    } else {
      console.log(line);
    }
  }
}
