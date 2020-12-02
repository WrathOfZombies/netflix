import { data } from "./data.js";

let mockInMemoryCache = {};

export const queryMoviesList = (cursor = undefined) => {
  const movieMap = new Map(data.videos.map((video) => [video.id, video]));

  const billBoardMap = new Map(
    data.billboards.map((billboard) => [billboard.row, billboard])
  );

  mockInMemoryCache = { movieMap, billBoardMap, movieList: data.rows };

  return data.rows || [];
};

export const queryIsBillBoard = (billboardId) => {
  const { billBoardMap } = mockInMemoryCache;
  return billBoardMap.has(billboardId);
};

export const queryBillBoard = (billBoardId, movieId) => {
  const { billBoardMap, movieMap } = mockInMemoryCache;
  const billBoard = billBoardMap.get(billBoardId);
  const movie = movieMap.get(movieId);
  return {
    billBoard,
    movie,
  };
};

export const queryMovie = (movieId) => {
  const { movieMap } = mockInMemoryCache;
  return movieMap.get(movieId);
};
