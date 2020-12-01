import { data } from "../data.js";
import { Component } from "../framework.js";

class BillBoard {
  constructor(getState, updateState) {
    this.getState = getState;
    this.updateState = updateState;
  }

  onMount({ "movie-id": movieId, "billboard-id": billBoardId }) {
    const billboard = data.billboards.find((item) => item.row === billBoardId);
    const movie = data.videos.find((video) => video.id === movieId);
    this.updateState({ billboard, movie });
  }

  render() {
    const { billboard, movie } = this.getState();

    return [
      `<div class="row-billboard${
        billboard.type === "inline" ? "-inline" : ""
      }">
        <div class="billboard-background" style="background-image: url('${
          movie.background || movie.backgroundShort
        }')">        
        </div>
      </div>`,
      style(),
    ];
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

export const billBoard = Component(BillBoard);
