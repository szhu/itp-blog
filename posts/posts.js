window.addEventListener("load", function () {
  for (let header of document.querySelectorAll("header")) {
    header.addEventListener("click", () => {
      header.parentNode.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    });
  }

  for (let img of document.querySelectorAll("img")) {
    img.addEventListener("dblclick", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) {
        window.open(img.src);
      } else {
        location.href = img.src;
      }
    });
    img.title = "Double-click to view full size.";
  }
});
