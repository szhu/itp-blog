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
    // Prevent double-clicking on summary elements from selecting text.
    summary.addEventListener("mousedown", (e) => {
      if (e.detail > 1) {
        e.preventDefault();
      }
    });

    summary.addEventListener("click", (e) => {
      if (e.detail === 2) {
        let initialOpen = e.target.parentNode.open;
        e.target.parentNode.open = !initialOpen;
        for (let details of $("details")) {
          if (details === e.target.parentNode) continue;
          details.open = initialOpen;
        }
      }
    });
    summary.title = "Double-click to toggle all collapsible items.";
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
    media.addEventListener("dblclick", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) {
        window.open(media.src);
      } else {
        location.href = media.src;
      }
    });
    media.title = "Double-click to view full size.";
  }

  for (let video of $("video")) {
    video.addEventListener("click", (e) => {
      if (e.detail > 1) {
        // Prevents double-click to fullscreen.
        // Not sure why it's attached to click and not dblclick.
        e.preventDefault();
      }
    });

    video.addEventListener("mouseenter", () => {
      video.controls = true;
      try {
        video.play();
      } catch (e) {
        // It might be this error: DOMException: play() failed because the user
        // didn't interact with the document first.
        video.muted = true;
        video.play();
      }
    });
    video.addEventListener("mouseleave", () => {
      video.controls = false;
      video.pause();
    });
    video.controls = false;
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
