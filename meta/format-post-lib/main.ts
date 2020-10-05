import { JSDOM } from "https://jspm.dev/jsdom@16.4.0";
import reformatDoc from "./reformatDoc.js";
import prettify from "./prettier.ts";

async function readHtmlFileAsDom(file: string) {
  let html = await Deno.readTextFile(file);
  return new JSDOM(html).window.document;
}

async function formatPost(file: string) {
  let document = await readHtmlFileAsDom(file);
  reformatDoc(document);
  for (let script of document.querySelectorAll("script[dev-only]")) {
    script.remove();
  }
  let html = document.documentElement.outerHTML;
  return prettify(html);
}

if (import.meta.main) {
  for (let file of Deno.args) {
    console.log(await formatPost(file));
  }
}
