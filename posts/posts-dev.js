import reformatDoc from "../meta/format-post-lib/reformatDoc.js";

// reformatDoc(document, document.documentElement);

async function reload(shouldReloadHead, signal) {
  let response = await fetch(location.href, { signal });
  let html = await response.text({ signal });
  let newDoc = document.createElement("html");
  newDoc.innerHTML = html;
  reformatDoc(document, newDoc);

  document.documentElement.style.height = document.documentElement.scrollHeight;
  document.body?.remove();
  if (shouldReloadHead) {
    document.head?.remove();
    document.documentElement.append(newDoc.querySelector("head"));
    await new Promise(requestAnimationFrame);
  }
  document.documentElement.append(newDoc.querySelector("body"));
  document.documentElement.removeAttribute("style");
  hydrate();
}

let abortController;
window.addEventListener("keypress", (e) => {
  if (e.key === "r" || e.key === "R") {
    let shouldReloadHead = e.key === "R";
    abortController?.abort();
    abortController = new AbortController();
    reload(shouldReloadHead, abortController.signal);
    console.info("Successfully reloaded with", { shouldReloadHead });
  }
});
