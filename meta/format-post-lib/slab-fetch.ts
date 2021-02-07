import { JSDOM } from "https://jspm.dev/jsdom@16.4.0";
import prettify from "./prettify.ts";

{
  let r = await fetch("https://___.slab.com/graphql", {
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify([
      {
        operationName: "publicPostOrTopic",
        variables: {
          id: "____",
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

  // console.log(JSON.stringify(ops, undefined, 2))
  // console.log(blocksToMd(opsToBlocks(ops)))
  console.log(blocksToHtml(opsToBlocks(ops)));
}

interface Attributes {
  bold?: true;
  italic?: true;
  header?: number;
  hint?: "success";
  "code-block"?: "plain";
  link?: string;
  list?: "bullet" | "number";
}

interface Op {
  attributes?: Attributes;
  insert: string | { image: string };
}

interface Block {
  attributes?: Attributes;
  ops: Op[];
}

function newBlock(): Block {
  return {
    ops: [],
  };
}

function opsToBlocks(ops: Op[]) {
  let blocks: Block[] = [];
  let block: Block = newBlock();

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
        newOps.push({
          insert: "\n",
          attributes: op.attributes,
        });
      }
      newOps.push({
        insert: piece,
        attributes: op.attributes,
      });
    }
  }

  for (let op of newOps) {
    if (typeof op.insert !== "string") {
      blocks.push(block);
      block = newBlock();
      block.ops.push(op);
      blocks.push(block);
      block = newBlock();
    } else if (op.insert === "\n") {
      block.attributes = op.attributes;
      let lastBlock = blocks[blocks.length - 1];
      if (
        block.attributes?.["code-block"] &&
        block.attributes?.["code-block"] ===
          lastBlock?.attributes?.["code-block"]
      ) {
        lastBlock.ops = [...lastBlock.ops, { insert: "\n" }, ...block.ops];
      } else {
        blocks.push(block);
      }
      block = newBlock();
    } else {
      block.ops.push(op);
    }
  }

  console.error(blocks);

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
      // text
      // .split("\n")
      // .map((line) => "    " + line)
      // .join("\n")
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

// function inlineOpsToHtml()

function blocksToHtml(blocks: Block[]) {
  let dom = new JSDOM();
  let document = dom.window.document;

  let currentSection = undefined;
  let currentSectionLevel: number = 0;
  let currentList = undefined;

  let first = true;
  for (let block of blocks) {
    if (block.ops.length === 1 && typeof block.ops[0].insert === "object") {
      let op = block.ops[0];
      if (block.ops[0].insert.image) {
        let el = document.createElement("img");
        el.src = block.ops[0].insert.image;
        currentSection.append(el);
      }
      continue;
    }

    let text = block.ops.map((op) => op.insert).join("");

    if (first) {
      first = false;
      currentSection = document.createElement("section");
      currentSection.id = text;
      document.body.append(currentSection);
      currentSectionLevel = 1;
    }

    let attributes: Attributes = block.attributes ?? {};

    if (!attributes.list && currentList) {
      currentList = undefined;
    }

    if (attributes["code-block"]) {
      let el = document.createElement("pre");
      el.textContent = text;
      currentSection.append(el);
    } else if (attributes.header) {
      let targetParentSectionLevel = attributes.header - 1;

      if (targetParentSectionLevel > currentSectionLevel) {
        throw Error(
          `Missing intermediate section levels: h${currentSectionLevel} => h${attributes.header}. The new section must be at most one level deeper than the current section.`
        );
      }

      while (currentSectionLevel > targetParentSectionLevel) {
        currentSection = currentSection.parentElement;
        currentSectionLevel--;
      }

      let newSection = document.createElement("section");
      newSection.id = text;
      currentSection.append(newSection);
      currentSection = newSection;
      currentSectionLevel++;
    } else if (attributes.list) {
      if (!currentList) {
        currentList = document.createElement("ul");
        currentSection.append(currentList);
      }
      let el = document.createElement("li");
      el.textContent = text;
      currentList.append(el);
    } else {
      let el = document.createElement("p");
      el.textContent = text;
      currentSection.append(el);
    }
  }

  console.log(prettify(document.documentElement.outerHTML));
}
