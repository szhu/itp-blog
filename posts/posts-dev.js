import reformatDoc from "../meta/format-post-lib/reformatDoc.js";

// reformatDoc(document, document.documentElement);

async function reload() {
  let response = await fetch(location.href);
  let html = await response.text();
  let newDoc = document.createElement("html");
  newDoc.innerHTML = html;
  reformatDoc(document, newDoc);

  document.head?.remove();
  document.documentElement.append(newDoc.querySelector("head"));
  document.body?.remove();
  document.documentElement.append(newDoc.querySelector("body"));
  hydrate();
}

window.addEventListener("keypress", (e) => {
  if (e.key === "r") {
    reload();
  }
});
