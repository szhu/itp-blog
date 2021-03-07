import { JSDOM } from "https://jspm.dev/jsdom@16.4.0";
import reformatDoc from "./reformatDoc.js";
import prettify from "./prettier.ts";
import {
  opsToDocument as opsToDocument,
  opsToJson,
  slabToOps,
} from "./slab.ts";
import { Command } from "https://deno.land/x/cmd@v1.2.0/mod.ts";
import { relative } from "https://deno.land/std@0.86.0/path/mod.ts";

async function htmlFileToDocument(file: string) {
  let html;
  try {
    html = await Deno.readTextFile(file);
  } catch (e) {
    console.error(`Error reading: ${file}`);
    throw e;
  }
  return new JSDOM(html).window.document;
}

async function documentToHtml(document: any) {
  reformatDoc(document, document.documentElement);
  for (let script of document.querySelectorAll("script[dev-only]")) {
    script.remove();
  }
  let html = document.documentElement.outerHTML;
  return prettify(html);
}

async function writeOrOutput(content: string, outFile?: string) {
  if (outFile) {
    console.error(`Writing: ${outFile}`);
    await Deno.writeTextFile(outFile, content + "\n");
  } else {
    console.log(content);
  }
}

if (import.meta.main) {
  const program = new Command("meta/format-post");

  program
    //
    .option("-o, --out  <dstfile>", "write to file");

  program
    //
    .command("html <srcfile>")
    .action(async (inFile) => {
      let document = await htmlFileToDocument(inFile);
      let html = await documentToHtml(document);
      await writeOrOutput(html, program.out);
    });
  program
    //
    .command("slab <subdomain> <id>")
    .action(async (subdomain, id) => {
      let prefix = program.out ? relative(`${program.out}/..`, "posts") : "";
      let jsonOutFile = program.out.replace(/(\.html)?$/, ".src.json");

      let ops = await slabToOps(subdomain, id);
      let json = await opsToJson(ops);
      await writeOrOutput(json, jsonOutFile);

      let document = await opsToDocument(ops, prefix);
      let html = await documentToHtml(document);
      await writeOrOutput(html, program.out);
    });

  await program.parseAsync(Deno.args);
}
