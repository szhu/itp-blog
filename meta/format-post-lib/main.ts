import { JSDOM } from "https://jspm.dev/jsdom@16.4.0";
import reformatDoc from "./reformatDoc.js";
import prettify from "./prettier.ts";
import { postDocumentFromSlab } from "./slab.ts";
import { Command } from "https://deno.land/x/cmd@v1.2.0/mod.ts";
import { relative } from "https://deno.land/std@0.86.0/path/mod.ts";

async function readHtmlFileAsDom(file: string) {
  let html;
  try {
    html = await Deno.readTextFile(file);
  } catch (e) {
    console.error(`Error reading: ${file}`);
    throw e;
  }
  return new JSDOM(html).window.document;
}

async function formatPostDocument(document: any) {
  reformatDoc(document, document.documentElement);
  for (let script of document.querySelectorAll("script[dev-only]")) {
    script.remove();
  }
  let html = document.documentElement.outerHTML;
  return prettify(html);
}

async function formatPostFile(file: string) {
  return await formatPostDocument(await readHtmlFileAsDom(file));
}

async function formatPostFromSlab(
  subdomain: string,
  id: string,
  outFile: string
) {
  let prefix = outFile ? relative(`${outFile}/..`, "posts") : "";
  return await formatPostDocument(
    await postDocumentFromSlab(subdomain, id, prefix)
  );
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
    .action(async (srcfile) => {
      let content = await formatPostFile(srcfile);
      await writeOrOutput(content, program.out);
    });
  program
    //
    .command("slab <subdomain> <id>")
    .action(async (subdomain, id) => {
      let content = await formatPostFromSlab(subdomain, id, program.out);
      await writeOrOutput(content, program.out);
    });

  await program.parseAsync(Deno.args);
}
