import { JSDOM } from "https://jspm.dev/jsdom@16.4.0";
import prettify from "./prettier.ts";
import shallowEqualObjects from "https://raw.githubusercontent.com/moroshko/shallow-equal/master/src/objects.js";
import JSON5 from "https://deno.land/x/json5@v1.0.0/mod.ts";
import { join } from "https://deno.land/std@0.86.0/path/mod.ts";

if (import.meta.main) {
  let ops = await slabToOps(Deno.args[0], Deno.args[1]);
  // console.log(JSON.stringify(ops, undefined, 2))
  // console.log(blocksToMd(opsToBlocks(ops)))
  let document = await opsToDocument(ops, ".");
  console.log(prettify(document.documentElement.outerHTML));
}

export async function opsToJson(ops: Op[]) {
  return JSON.stringify(ops);
}

export async function opsToDocument(ops: Op[], pathPrefix: string) {
  let blocks = opsToBlocks(ops);
  let document = blocksToDocument(blocks, pathPrefix);
  return document;
}

export async function slabToOps(subdomain: string, id: string) {
  console.log("Fetching");
  let r = await fetch(`https://${subdomain}.slab.com/graphql`, {
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify([
      {
        operationName: "publicPostOrTopic",
        variables: {
          id: id,
        },
        query: `
        query publicPostOrTopic($id: ID!) {
            topic: publicTopic(id: $id) {
              id
              name
              ...PublicTopicFields
              __typename
            }
            post: publicPost(id: $id) {
              id
              title
              ...PublicPostFields
              __typename
            }
          }

          fragment PublicPostFields on PublicPost {
            id
            title
            ...PublicPostContent
            topics {
              id
              name
              privacy
              ancestors {
                id
                name
                __typename
              }
              __typename
            }
            __typename
          }

          fragment PublicPostContent on PublicPost {
            content
            version
            __typename
          }

          fragment PublicTopicFields on PublicTopic {
            id
            name
            description
            posts {
              id
              title
              __typename
            }
            ancestors {
              id
              name
              __typename
            }
            __typename
          }
        `,
      },
    ]),
    method: "POST",
  });
  let json = await r.json();
  let content = json[0].payload.data.post.content;
  let ops = JSON.parse(content) as Op[];
  return ops;
}

interface Attributes {
  // Inline attributes
  bold?: true;
  italic?: true;
  code?: true;
  link?: string;

  // Block attributes
  blockquote?: true;
  header?: number;
  hint?: "success";
  "code-block"?: "plain";
  list?: "bullet" | "ordered";
  indent?: number;

  // Line break attributes
  soft?: true;

  // Media attributes
  caption?: string;
  float?: "left" | "right";
  span?: "half";
  width?: number;
}

interface Attachment {
  name: string;
  size: number;
  source: string;
}

interface Op {
  attributes?: Attributes;
  insert: string | { image?: string; hr?: true; attachment?: Attachment[] };
}

interface Block {
  attributes?: Attributes;
  ops: Op[];
}

function newBlock(): Block {
  return {
    attributes: undefined,
    ops: [],
  };
}

class BlockBuilder {
  blocks: Block[] = [newBlock()];

  get(index: number) {
    if (index < 0) {
      index = this.blocks.length + index;
    }

    return this.blocks[index];
  }

  current() {
    return this.get(-1)!;
  }

  previous() {
    return this.get(-2);
  }

  mergeLastTwo(opsToInsert: Op[]) {
    let current = this.blocks.pop()!;
    let previous = this.blocks.pop();
    if (!previous) {
      this.blocks.push(current);
      return;
    }

    this.blocks.push({
      attributes: previous.attributes,
      ops: [...previous.ops, ...opsToInsert, ...current.ops],
    });
    this.startNewBlock();
  }

  doLastTwoHaveEqualAttributes() {
    let current = this.current();
    let previous = this.previous();
    if (!previous) return false;

    return shallowEqualObjects(current.attributes, previous.attributes);
  }

  startNewBlock() {
    if (this.current().ops.length === 0) return;

    this.blocks.push(newBlock());
  }

  trimmed() {
    let blocks = [...this.blocks];
    if (this.current().ops.length === 0) {
      blocks.pop();
    }
    return blocks;
  }
}

function opsToBlocks(ops: Op[]) {
  let bb = new BlockBuilder();

  // console.error(ops);

  // Split "\n" into its own op.
  let newOps: Op[] = [];
  for (let op of ops) {
    if (typeof op.insert !== "string" || op.insert === "\n") {
      newOps.push(op);
      continue;
    }

    let textPieces = op.insert.split("\n");

    let first = true;
    for (let piece of textPieces) {
      if (first) {
        first = false;
      } else {
        newOps.push({ insert: "\n", attributes: op.attributes });
      }
      newOps.push({ insert: piece, attributes: op.attributes });
    }
  }

  for (let op of newOps) {
    // console.error(op);

    if (typeof op.insert !== "string") {
      // Non-text items always get their own block.
      bb.startNewBlock();
      bb.current().ops.push(op);
      bb.startNewBlock();
    } else if (op.insert === "\n") {
      // Most newlines signal the end of a block...
      bb.current().attributes = op.attributes;
      if (op.attributes?.soft) {
        // ...except soft line breaks...
        bb.mergeLastTwo([{ insert: "\n" }]);
      } else if (
        // ...and code blocks (but only if current lang == prev lang).
        bb.current().attributes?.["code-block"] &&
        bb.doLastTwoHaveEqualAttributes()
      ) {
        bb.mergeLastTwo([{ insert: "\n" }]);
      } else {
        // Otherwise, end the current block.
        bb.startNewBlock();
      }
    } else {
      // Otherwise, add the op to the current block.
      if (op.attributes || op.insert) {
        bb.current().ops.push(op);
      }
    }
  }

  let blocks = bb.trimmed();
  // console.error("---------------------");
  // console.error(blocks);
  return blocks;
}

function blocksToMd(blocks: Block[]) {
  let md = "";
  let first = true;
  for (let block of blocks) {
    if (first) {
      first = false;
    } else {
      md += "\n\n";
    }

    let text = block.ops.map((op) => op.insert).join("");

    let attributes: Attributes = block.attributes ?? {};
    if (attributes["code-block"]) {
      let fence = "```";
      md += `${fence}${attributes["code-block"]}\n${text}\n${fence}`;
      // code for fenced code blocks:
      // text.split("\n").map((line) => "    " + line).join("\n")
    } else if (attributes.header) {
      md += "#".repeat(attributes.header) + " " + text;
    } else if (attributes.list) {
      md += "- " + text;
    } else {
      md += text;
    }
  }

  return md;
}

function opsToFragment(ops: Op[], document: any, tagName: string) {
  let fragment = document.createDocumentFragment();
  for (let op of ops) {
    if (tagName !== "pre" && op.insert === "\n") {
      fragment.append(document.createElement("br"));
      continue;
    }

    let el = document.createTextNode(op.insert);
    if (op.attributes?.link) {
      let a = document.createElement("a");
      a.href = op.attributes.link
        .replace(/https:\/\/\//, "/")
        .replace(/https:\/\/\./, ".");
      a.append(el);
      el = a;
    }
    if (op.attributes?.bold) {
      let b = document.createElement("b");
      b.append(el);
      el = b;
    }
    if (op.attributes?.italic) {
      let i = document.createElement("i");
      i.append(el);
      el = i;
    }
    if (op.attributes?.code) {
      let code = document.createElement("code");
      code.append(el);
      el = code;
    }
    fragment.append(el);
  }
  return fragment;
}

function blocksToDocument(blocks: Block[], pathPrefix: string) {
  let dom = new JSDOM();
  let document = dom.window.document;

  let currentSection = undefined;
  let currentSectionLevel: number = 0;
  let currentList = undefined;
  let currentListLevel: number = -1;

  let first = true;
  for (let block of blocks) {
    let attributes: Attributes = block.attributes ?? {};

    if (!attributes.list && currentList) {
      currentList = undefined;
      currentListLevel = -1;
    }

    if (block.ops.length === 1 && typeof block.ops[0].insert === "object") {
      if (block.ops[0].insert.image) {
        let src = block.ops[0].insert.image;
        let attributes = block.ops[0].attributes ?? {};

        let el = document.createElement("img");
        el.src = src;

        if (attributes.width) {
          el.width = attributes.width;
        }
        if (attributes.float) {
          el.style.float = attributes.float;
        }
        if (attributes.span === "half") {
          el.classList.add("small");
        }
        let caption = attributes.caption;
        if (caption) {
          let m = caption.match(/(\{.*\})\s*(.*)/);
          if (m) {
            let [_, attrString, restCaption] = m;
            caption = restCaption;
            let attrs = JSON5.parse(attrString);
            if (attrs.class) {
              el.classList.add(attrs.class);
            }
          }
          el.setAttribute("caption", caption);
        }
        currentSection.append(el);
      }
      if (block.ops[0].insert.hr) {
        let el = document.createElement("hr");
        currentSection.append(el);
      }
      if (block.ops[0].insert.attachment) {
        for (let attachment of block.ops[0].insert.attachment) {
          let el = document.createElement("video");
          el.src = attachment.source;
          currentSection.append(el);
        }
      }
      continue;
    }

    let contentsAsText = block.ops.map((op) => op.insert).join("");
    let preContentsAsFragment = opsToFragment(block.ops, document, "pre");
    let contentsAsFragment = opsToFragment(block.ops, document, "div");

    if (first) {
      first = false;
      currentSection = document.createElement("section");
      currentSection.id = contentsAsText;
      document.body.append(currentSection);
      currentSectionLevel = 1;
      continue;
    }

    if (attributes["code-block"]) {
      let el = document.createElement("pre");
      el.setAttribute("collapsed", "");
      el.append(preContentsAsFragment);
      currentSection.append(el);
    } else if (attributes.header) {
      let targetParentSectionLevel = attributes.header - 1;

      if (targetParentSectionLevel > currentSectionLevel) {
        throw Error(
          `Missing intermediate section levels: h${currentSectionLevel} => h${attributes.header}. The new section must be at most one level deeper than the current section.`
        );
      }

      while (currentSectionLevel > targetParentSectionLevel) {
        // This allows the top-level headers to be either h1 or h2.
        if (currentSection.parentElement.tagName === "SECTION") {
          currentSection = currentSection.parentElement;
        }
        currentSectionLevel--;
      }

      let newSection = document.createElement("section");
      newSection.id = contentsAsText;
      currentSection.append(newSection);
      currentSection = newSection;
      currentSectionLevel++;
    } else if (attributes.list) {
      // TODO: Handle the case where adjacent list items are of different kinds.
      // Currently, all of them will be treated as part of the same list.

      let targetListLevel = attributes.indent ?? 0;

      if (targetListLevel - 1 > currentListLevel) {
        throw Error(
          `Missing intermediate list levels: ${currentListLevel} => ${attributes.indent}. The new list must be at most one level deeper than the current list.`
        );
      }

      // console.error(
      //   `targetListLevel = ${targetListLevel} currentListLevel = ${currentListLevel}`
      // );

      // Level 0
      if (!currentList) {
        // console.error("> level 0");

        currentList = currentSection;
        currentListLevel = -1;
      }

      // If we're currently nested too deep, go up a few levels.
      while (currentListLevel > targetListLevel) {
        // console.error("> go up");

        currentList = currentList.parentElement;
        currentListLevel--;
      }

      // If we're currently too shallow, create a new list.
      if (targetListLevel - currentListLevel === 1) {
        // console.error("> go in");

        let newList;
        if (attributes.list === "ordered") {
          newList = document.createElement("ol");
        } else {
          newList = document.createElement("ul");
        }
        currentList.append(newList);
        currentList = newList;
        currentListLevel++;
      }

      // Sanity check.
      if (targetListLevel !== currentListLevel) {
        throw new Error(
          `Inconsistent state. targetListLevel = ${targetListLevel} currentListLevel = ${currentListLevel}`
        );
      }

      let el = document.createElement("li");
      el.append(contentsAsFragment);
      currentList.append(el);
    } else if (attributes.blockquote) {
      let el = document.createElement("blockquote");
      el.append(contentsAsFragment);
      currentSection.append(el);
    } else {
      let el = document.createElement("p");
      el.append(contentsAsFragment);
      currentSection.append(el);
    }
  }

  document.head.innerHTML = `
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, user-scalable=no" />
    <link rel="stylesheet" href="${join(pathPrefix, "posts.css")}" />
    <script defer src="${join(pathPrefix, "posts.js")}"></script>

  `;

  return document;
}
