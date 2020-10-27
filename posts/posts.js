function hydrate() {
  for (let header of document.querySelectorAll("header")) {
    header.addEventListener("click", () => {
      header.parentNode.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    });
  }

  for (let media of document.querySelectorAll("img, video")) {
    media.addEventListener("dblclick", (e) => {
      e.preventDefault();

      if (e.metaKey || e.ctrlKey || e.shiftKey) {
        window.open(media.src);
      } else {
        location.href = media.src;
      }
    });
    media.title = "Double-click to view full size.";
  }

  for (let video of document.querySelectorAll("video")) {
    video.addEventListener("mouseover", () => {
      video.controls = true;
    });
    video.addEventListener("mouseleave", () => {
      video.controls = false;
    });
    video.controls = false;
  }
}

window.addEventListener("load", hydrate);
