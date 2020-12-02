import { data } from "./data.js";

/**
 * Use any state management solution here, redux, apollo, DIY etc
 */
let mockInMemoryCache = {};

/**
 * Processes the information from the data source and stores the processed information
 * into an inmemory cache. Then returns the current list of movies to render. The cursor
 * can be used for optional paging.
 */
export const queryMoviesList = (cursor = undefined) => {
  const movieMap = new Map(data.videos.map((video) => [video.id, video]));

  const billBoardMap = new Map(
    data.billboards.map((billboard) => [billboard.row, billboard])
  );

  mockInMemoryCache = { movieMap, billBoardMap, movieList: data.rows };

  return data.rows || [];
};

/**
 * Checks if the current item can be a billboard
 * @param {number} billboardId the row index of the billboard
 * @returns true if the current item is a billboard
 */
export const queryIsBillBoard = (billboardId) => {
  const { billBoardMap } = mockInMemoryCache;
  return billBoardMap.has(billboardId);
};

/**
 * Merges the billboard information fetched from various sources
 * @param {number} billBoardId The billboard row index
 * @param {number} movieId The movieId for this billboard
 */
export const queryBillBoard = (billBoardId, movieId) => {
  const { billBoardMap, movieMap } = mockInMemoryCache;
  const billBoard = billBoardMap.get(billBoardId);
  const movie = movieMap.get(movieId);
  return {
    billBoard,
    movie,
  };
};

/**
 * Returns a movie based on the movieID
 */
export const queryMovie = (movieId) => {
  const { movieMap } = mockInMemoryCache;
  return movieMap.get(movieId);
};
