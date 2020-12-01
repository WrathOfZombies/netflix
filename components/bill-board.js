import { data } from "../data.js";
import { Component } from "../framework/component.js";
import { IsInView } from "../utilities/is-in-view.js";

class BillBoard {
  constructor(getState, updateState, _notify, ref) {
    this.getState = getState;
    this.updateState = updateState;
    this.ref = ref;
  }

  onMount() {
    this.dispose = IsInView(this.ref.host);
  }

  onUnmount() {
    this.dispose();
  }

  onPropsChanged({
    "movie-id": movieId,
    "billboard-id": billBoardId,
    isinview: isInView,
  }) {
    if (movieId == null || billBoardId == null) {
      return;
    }
    const billboard = data.billboards.find((item) => item.row === billBoardId);
    const movie = data.videos.find((video) => video.id === movieId);

    // Due to a bug in reconciliation
    // By using logical state refresh, we wouldnt be able to trigger
    // the transition as the nodes are different. However in an ideal
    // framework, these nodes should remain same by reference
    if (isInView) {
      const hiddenElement = this.ref.querySelector(".hidden");
      if (hiddenElement) hiddenElement.classList.remove("hidden");
    }

    this.updateState({ billboard, movie });
  }

  renderInlineBillBoard() {
    const { billboard, movie } = this.getState();
    const { title, logo, backgroundShort } = movie;
    const { buttons } = billboard;

    // potential optmization to load box shot first and then
    // swap to the actual image
    const buttonsUI = buttons
      .map(
        ({ type, text }) =>
          `<button class="billboard-metadata-button ${
            type === "play" ? "billboard-metadata-button-play" : ""
          }" aria-label="${text}" title="${text}">
        ${text}
      </button>`
      )
      .join("");

    return [
      `<div class="row-billboard row-billboard-inline" aria-label="${title}" tabindex="0" role="row" aria-label="${title}">
        <div id="billboard-background" class="billboard-background" style="background-image: url('${backgroundShort}')" title="${title}" alt="${title}">        
        </div>
        <div class="billboard-metadata hidden">
          <img loading="lazy" class="billboard-metadata-logo" alt="${title}" src="${logo}"></img>
          ${buttonsUI}
        </div>
      </div>`,
      style(),
    ];
  }

  renderHeroBillBoard() {
    const { billboard, movie } = this.getState();
    const { title, synopsis, logo, background } = movie;
    const { buttons } = billboard;

    // potential optmization to load box shot first and then
    // swap to the actual image
    const buttonsUI = buttons
      .map(
        ({ type, text }) =>
          `<button class="billboard-metadata-button ${
            type === "play" ? "billboard-metadata-button-play" : ""
          }" aria-label="${text}" title="${text}">
        ${text}
      </button>`
      )
      .join("");

    return [
      `<div class="row-billboard" aria-label="${title}, ${synopsis}" tabindex="0" role="row">
        <div class="billboard-background" style="background-image: url('${background}')">        
        </div>
        <div class="billboard-metadata">
          <img alt="${title}" class="billboard-metadata-logo" title="${title}" src="${logo}"></img>
          <div class="billboard-metadata-synopsis">${synopsis}</div>
          ${buttonsUI}
        </div>
      </div>`,
      style(),
    ];
  }

  render() {
    const {
      billboard: { type },
    } = this.getState();

    if (type === "inline") {
      return this.renderInlineBillBoard();
    }

    return this.renderHeroBillBoard();
  }
}

const style = () => `
/**
 * Billboard Row Container.
 *
 * Container for the billboard image and metadata block.
 */
.row-billboard {
  position: relative;
}

/**
 * Billboard Background Image.
 *
 * The actual image element for the billboard.
 */
.billboard-background {
  width: 1280px;
  height: 720px;
  background-position: center center;
  background-size: cover;
  background-repeat: no-repeat;
}

/**
 * Billboard Metadata Container.
 *
 * Contains the logo, synopsis and action buttons.
 */
.billboard-metadata {
  position: absolute;
  top: 80px;
  left: 80px;
  opacity: 1;
  transform: translate3d(0, 0, 0);
  transition: opacity 1s, transform 1s;
}

/**
 * Billboard Metadata Container Visibility.
 *
 * When we have an inline billboard, we don't display the metadata container until
 * it's in the viewport. This CSS class takes care of keeping it hidden.
 *
 * Removing it will set opacity to 1 with a transition.
 */
.billboard-metadata.hidden {
  opacity: 0;
  transform: translate3d(10px, 0, 0);
}

/**
 * Logo element
 */
.billboard-metadata-logo {
  display: block;
}

/**
 * Synopsis Text
 */
.billboard-metadata-synopsis {
  max-width: 500px;
  font-size: 20px;
  margin: 20px 0;
}

/**
 * Metadata Buttons
 */
.billboard-metadata-button {
  font-size: 18px;
  font-weight: 700;
  text-transform: uppercase;
  margin: 20px 15px 0 0;
  padding: 10px 25px;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  background-color: rgba(0, 0, 0, 0.4);
}

/**
 * Special Red Play Metadata Button
 */
.billboard-metadata-button-play {
  background-color: #ff0a16;
  border-color: #ff0a16;
}

/**
 * Custom inline billboard
 */
.row-billboard-inline .billboard-background {
  height: 192px;
}

.row-billboard-inline .billboard-metadata {
  top: 15px;
  right: 50px;
  left: auto;
}
`;

export const billBoard = Component(BillBoard, [
  "movie-id",
  "billboard-id",
  "isinview",
]);
