const linkPreviewsByUrl = {};

function hydrate() {
  let $ = (selector) => document.querySelectorAll(selector);

  for (let header of $(".section-header")) {
    header.addEventListener("click", () => {
      header.parentNode.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    });
    header.classList.add("section-header-interactive");
  }

  for (let summary of $("summary")) {
    summary.addEventListener("click", (e) => {
      if (e.shiftKey) {
        let initialOpen = !e.target.parentNode.open;
        for (let details of $("details")) {
          if (details === e.target.parentNode) continue;
          details.open = initialOpen;
        }
      }
    });
    summary.title = "Shift-click to toggle all collapsible items.";
  }

  function saveDetailsState() {
    let detailsState = Array.from($("details")).map((details) => details.open);
    history.replaceState({ detailsState }, "");
  }

  function loadDetailsState() {
    if (history.state && history.state.detailsState) {
      Array.from($("details")).forEach((details, i) => {
        details.open = history.state.detailsState[i];
      });
    }
  }

  for (let details of $("details")) {
    details.addEventListener("toggle", saveDetailsState);
  }
  loadDetailsState();

  for (let media of $("img, video")) {
    media.addEventListener("click", function (e) {
      if (e.metaKey || e.altKey) {
        window.open(this.src);
      } else if (e.shiftKey) {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          this.requestFullscreen();
        }
      }
    });
    media.title = "Shift-click to view fullscreen.";
  }

  for (let video of $("video")) {
    video.title += " Press and hold to play.";
    video.loop = true;
    video.muted = true;
    // video.autoplay = true;
    video.play();
    // video.dataset.autoMuted = true;
    video.addEventListener("keypress", function (e) {
      if (e.key !== "f") return;
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        this.requestFullscreen();
      }
    });

    // video.addEventListener("mouseenter", async function (e) {
    //   video.muted = false;
    // });

    // video.addEventListener("mouseleave", async function (e) {
    //   video.muted = true;
    // });

    video.addEventListener("pointerdown", async function (e) {
      if (e.button !== 0 || e.shiftKey || e.metaKey || e.altKey) return;
      e.preventDefault();

      this.style.cursor = "none";
      let wasPaused = this.paused;
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (this.style.cursor === "none") {
        // Pressed and held.
        this.loop = false;
        await this.play();
      } else {
        // Short press (a click).
        await (wasPaused ? this.play() : this.pause());
      }
      if (this.dataset.autoMuted) {
        this.muted = false;
        this.dataset.autoMuted = false;
      }
    });

    video.addEventListener("pointerup", async function (e) {
      if (e.button !== 0) return;
      e.preventDefault();

      this.loop = true;
      if (this.style.cursor === "") return;
      this.style.cursor = "";
      this.pause();
    });

    video.addEventListener("click", function (e) {
      if (e.button !== 0) return;
      e.preventDefault();
    });

    video.addEventListener("play", function (e) {
      this.removeAttribute("controls");
      this.focus();
    });

    video.addEventListener("pause", function (e) {
      this.controls = true;
    });

    video.addEventListener("ended", function (e) {
      this.controls = true;
    });
  }

  for (let media of $("figure > video[title], figure > img[title]")) {
    let figure = media.parentElement;
    let title = media.getAttribute("title");
    media.removeAttribute("title");
    figure.setAttribute("data-title", title);

    media.addEventListener("click", () => {
      media.parentNode.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });
  }

  // Show link previews only if a mouse is available. Link previews can
  // interfere with scrolling if the pointer is coarse.
  if (window.matchMedia("(any-pointer: fine)").matches) {
    for (let a of $("a")) {
      if (a.origin !== location.origin) continue;

      a.addEventListener(
        "mousemove",
        (e) => {
          let iframe = linkPreviewsByUrl[a.href];

          for (let someIframe of $(".link-preview-visible")) {
            if (iframe === someIframe) continue;
            someIframe.classList.remove("link-preview-visible");
          }

          if (!iframe) {
            iframe = document.createElement("iframe");
            linkPreviewsByUrl[a.href] = iframe;

            iframe.src = a.href;
            iframe.classList.add("link-preview", "link-preview-loading");
            iframe.addEventListener("load", () => {
              iframe.classList.remove("link-preview-loading");
            });

            a.append(iframe);
          }

          let transform = `translate(${e.clientX - 20}px, ${e.clientY + 20}px)`;
          iframe.style.transform = transform;

          iframe.classList.add("link-preview-visible");
        },
        { passive: true }
      );

      a.addEventListener(
        "mouseleave",
        () => {
          for (let iframe of $(".link-preview-visible")) {
            iframe.classList.remove("link-preview-visible");
          }
        },
        { passive: true }
      );

      a.classList.add("link-preview-enabled");
    }

    window.addEventListener(
      "scroll",
      () => {
        for (let iframe of $(".link-preview-visible")) {
          iframe.classList.remove("link-preview-visible");
        }
      },
      { passive: true }
    );
  }
}

window.addEventListener("DOMContentLoaded", hydrate);
