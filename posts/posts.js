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
      if (e.metaKey || e.ctrlKey || e.shiftKey) {
        window.open(media.src);
      } else {
        location.href = media.src;
      }
    });
    media.title = "Double-click to view full size.";
  }

  for (let video of document.querySelectorAll("video")) {
    video.addEventListener("click", (e) => {
      // Prevents double-click to fullscreen.
      // Not sure why it's attached to click and not dblclick.
      e.preventDefault();
    });
    video.addEventListener("mouseover", () => {
      video.controls = true;
      video.play();
    });
    video.addEventListener("mouseleave", () => {
      video.controls = false;
      video.pause();
    });
    video.controls = false;
  }
}

window.addEventListener("load", hydrate);
