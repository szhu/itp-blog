import { JSDOM } from "https://jspm.dev/jsdom@16.4.0";
import reformatDoc from "./reformatDoc.js";
import prettify from "./prettier.ts";
import { postDocumentFromSlab } from "./slab.ts";

async function readHtmlFileAsDom(file: string) {
  let html = await Deno.readTextFile(file);
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

async function formatPostFromSlab(subdomain: string, id: string) {
  return await formatPostDocument(await postDocumentFromSlab(subdomain, id));
}

if (import.meta.main) {
  switch (Deno.args.length) {
    case 2: {
      let [subdomain, id] = Deno.args;
      console.log(await formatPostFromSlab(subdomain, id));
      break;
    }
    case 1: {
      let [file] = Deno.args;
      console.log(await formatPostFile(file));
      break;
    }
    default:
      throw Error("Incorrect number of args");
  }
}
