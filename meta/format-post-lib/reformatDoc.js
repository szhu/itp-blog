import * as commonmark from "https://jspm.dev/npm:commonmark@0.29.2";

let reader = new commonmark.Parser();

let writer = new commonmark.HtmlRenderer();

function undent(s) {
  let lines = s.split("\n");
  let leadingSpaces = Math.min(
    ...lines.map((line) =>
      line.trim() ? line.match("^ *")[0].length : Infinity
    )
  );
  return lines.map((line) => line.substring(leadingSpaces)).join("\n");
}

function markdownToHtml(markdown) {
  // Prettier strips leading whitespace, but we don't have a way to show
  // indented list items without leading whitespace. So we invent one: we use
  // the length of the list marker dash to indicate nesting. Below, we Replace
  // "--" with an indented "  -". We are careful to not only do it if it follows
  // a blank line, to make sure that "--" inside a paragraph does not get
  // interpreted as a list marker.
  markdown = markdown.replace(
    /^(\s*\n\s*)(-+)([^-])/gm,
    (_match, white, dashes, rest) =>
      white + "  ".repeat(dashes.length - 1) + "-" + rest
  );
  markdown = markdown.replace(/\\\n\n/g, "\\\n");
  let parsed = reader.parse(markdown);
  return writer.render(parsed);
}

function changeEl(el, newEl) {
  // Based on https://stackoverflow.com/a/15086834
  while (el.firstChild) {
    newEl.append(el.firstChild);
  }
  for (let attr of el.attributes) {
    newEl.setAttributeNode(attr.cloneNode());
  }
  el.parentNode.replaceChild(newEl, el);
  return newEl;
}

function wrap(el, wrapper) {
  el.parentNode.insertBefore(wrapper, el);
  wrapper.append(el);
  return wrapper;
}

function line(el, liner) {
  while (el.firstChild) {
    liner.append(el.firstChild);
  }

  el.append(liner);
  return liner;
}

function unwrap(el) {
  while (el.firstChild) {
    el.parentNode.insertBefore(el.firstChild, el);
  }
  el.remove();
}

function countMatchingInAncestry(el, selector) {
  let count = 0;
  el = el.parentNode;
  while (el && el.matches) {
    if (el.matches(selector)) count++;
    el = el.parentNode;
  }
  return count;
}

export default function reformatDoc(document, root) {
  for (let md of root.querySelectorAll("md")) {
    if (md.style) {
      md.style.whiteSpace = "pre-wrap";
    }
    md.outerHTML = markdownToHtml(undent(md.textContent));
  }

  for (let p of root.querySelectorAll("li > p:only-child")) {
    unwrap(p);
  }

  for (let section of root.querySelectorAll("section")) {
    let content = line(section, document.createElement("div"));
    content.classList.add("section-content");

    let header = document.createElement("header");
    header.classList.add("section-header");
    section.prepend(header);
    header.textContent = section.id;

    section.removeAttribute("id");
    section.classList.add("section");
    section.classList.add(section.tagName.toLowerCase());
  }

  for (let section of root.querySelectorAll(".section")) {
    let level = countMatchingInAncestry(section, ".section");
    section.classList.add(`section-level-${level}`);
  }

  {
    let titleHeader = root.querySelector(".section-level-0 > header");
    if (titleHeader) {
      let title = document.createElement("title");
      title.textContent = titleHeader.textContent;
      root.querySelector("head").append(title);
    }
  }

  for (let table of root.querySelectorAll("table")) {
    let [a, b] = table.querySelectorAll("td");
    let [A, B] = table.querySelectorAll("img");

    if (A && B) {
      A.setAttribute("caption", a.textContent);
      B.setAttribute("caption", b.textContent);
    }

    let gallery = document.createElement("gallery");
    gallery.append(A);
    gallery.append(B);

    table.parentNode.replaceChild(gallery, table);
    console.error(gallery.outerHTML.replace(/></g, ">\n<"));
  }

  for (let media of root.querySelectorAll("img, video")) {
    let fig = wrap(media, document.createElement("figure"));

    let figcaption = document.createElement("figcaption");

    let float = media.style.float;
    if (float) {
      media.style.float = "";
      media.classList.add("small");
      fig.style.float = float;
    }

    let caption = media.getAttribute("caption");
    if (caption) {
      media.removeAttribute("caption");

      figcaption = document.createElement("figcaption");
      figcaption.innerHTML = markdownToHtml(caption);
    }

    let from = media.getAttribute("from");
    if (from) {
      media.removeAttribute("from");

      figcaption.append("From ");
      let a = document.createElement("a");
      a.href = from;
      a.textContent = a.host;
      figcaption.append(a);
    }

    if (!figcaption.matches(":empty")) {
      fig.prepend(figcaption);
    }
  }

  for (let video of root.querySelectorAll("video")) {
    video.preload = "metadata";
    video.controls = true;
  }

  for (let pre of root.querySelectorAll("pre, body script[type]")) {
    if (pre.tagName !== "PRE") {
      pre = changeEl(pre, document.createElement("pre"));
      let lang = pre.getAttribute("type");
      pre.removeAttribute("type");
      pre.setAttribute("lang", lang);
    }
    pre.textContent = undent(pre.textContent).trim();

    if (pre.getAttribute("collapsed") != null) {
      let details = wrap(pre, document.createElement("details"));

      let summary = document.createElement("summary");
      summary.textContent = "Code";
      details.prepend(summary);
    }
  }

  for (let a of root.querySelectorAll("a:empty")) {
    a.textContent = a.href;
  }

  for (let a of root.querySelectorAll("a")) {
    if (a.origin !== document.location.origin) {
      a.target = "_blank";
    }
  }

  // https://github.com/jsdom/jsdom/issues/1980#issuecomment-338541807
}
