import mergeRace from "https://jspm.dev/@async-generator/merge-race@1.0.3";
import { readLines } from "https://deno.land/std@0.77.0/io/bufio.ts";
import { serve } from "https://deno.land/std@0.89.0/http/server.ts";

const server = serve({ hostname: "0.0.0.0", port: 8080 });
console.log(`HTTP webserver running.  Access it at:  http://localhost:8080/`);
let bodyContent = await Deno.readTextFile("index.html");

let brightness = 0;

if (import.meta.main) {
  let serialProcess = Deno.run({
    cmd: ["make", "monitor"],
    stdout: "piped",
  });

  for await (let item of (mergeRace as any)(
    readLines(serialProcess.stdout),
    server
  )) {
    if (typeof item === "string") {
      // From readLines
      let line = item;

      let m = line.match(/(\d+),(\d+),(\d+),(\d+)/);
      if (m) {
        let [_, sr, sg, sb, sc] = m;
        let [r, g, b, c] = [sr, sg, sb, sc].map(parseFloat);
        brightness = c;
        console.log(brightness);
      } else {
        console.log(line);
      }
    } else {
      // From server
      let request = item;

      request.respond({
        status: 200,
        headers: new Headers([
          ["content-type", "text/html"],
          ["brightness", `${brightness}`],
        ]),
        body: bodyContent,
      });
    }
  }
}
