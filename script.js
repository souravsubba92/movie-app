const API_KEY = "de0e5df4ca8a3596996e6b3514d95d0b";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZTBlNWRmNGNhOGEzNTk2OTk2ZTZiMzUxNGQ5NWQwYiIsInN1YiI6IjY0YmQzOTkxYWQ1MGYwMDBhZTc2MjA1ZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.6Nzb76CLZ7fmRP9-8Y9u7IWrQ2FjqUiVwr4i5Vf1puA",
  },
};

const mainDiv = document.querySelector("#main");
const searchForm = document.querySelector("#form");
const searchInput = document.querySelector("#search");

//fetching Data function from the api's
const fetchData = async (url) => {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error(err);
  }
};

//function for no result found
const showNoResultsFound = () => {
  const noResultsElement = document.createElement("h3");
  noResultsElement.textContent = "No results found.";
  noResultsElement.classList.add("no-results");
  mainDiv.appendChild(noResultsElement);
};

//generating movies data in the html
const showMovies = (movieData) => {
  mainDiv.innerHTML = ""; // Clear existing movie cards

  //when the movieData data has no result
  if (movieData.results.length === 0) {
    showNoResultsFound();
  }
  movieData.results.forEach((movie) => {
    const { title, overview, poster_path, vote_average } = movie;

    //when the poster path is missing
    if (!poster_path) {
      return;
    }

    //creating movieElement to append in the mainDiv
    const movieElement = document.createElement("div");
    movieElement.classList.add("movie");
    movieElement.innerHTML = `
      <img src="${IMG_URL + poster_path}" alt="image">
      <div class="movie-info">
        <h3>${title}</h3>
        <span class="${getColor(vote_average)}">${vote_average}</span>
      </div>
      <div class="overview">
        <h3>Overview</h3>
        ${overview}
      </div>
    `;

    mainDiv.appendChild(movieElement);
  });
};

//color function accroding to the rating
const getColor = (vote) => {
  if (vote >= 8) {
    return "yellow";
  } else if (vote >= 5) {
    return "red";
  } else {
    return "white";
  }
};

//fetching popular movies data
const fetchPopularMovies = async () => {
  const popularMoviesUrl = `https://api.themoviedb.org/3/movie/popular?`;
  const movieData = await fetchData(popularMoviesUrl);
  console.log(movieData);
  showMovies(movieData);
};

fetchPopularMovies();
//fetching search input data
const searchMovies = async (searchValue) => {
  const searchUrl = `https://api.themoviedb.org/3/search/movie?&query=${searchValue}`;
  const movieData = await fetchData(searchUrl);
  showMovies(movieData);
};

//fetching data by matching movies id
const fetchDiscoverMovies = async (genreQuery) => {
  // Updating the API URL to include the genreQuery in the with_genres parameter
  const discoverUrl = `https://api.themoviedb.org/3/discover/movie?&with_genres=${genreQuery}`;

  const movieData = await fetchData(discoverUrl);
  showMovies(movieData);
};

//array to store clicked genre IDs
const clickedGenreIds = [];

let genreListItems;

const getMovieGenre = async () => {
  try {
    const genreUrl = `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`;
    const genresData = await fetchData(genreUrl);

    const genres = genresData.genres.map((genre) => genre);

    // Displaying the genre names in the genreListDiv
    genreList.innerHTML = `
      <h3>Genres</h3>
      <ul>${genres
        .map((genre) => `<li id=${genre.id}>${genre.name}</li>`)
        .join("")}</ul>
    `;
    genreListItems = genreList.querySelectorAll("li");

    // Adding  event listener to each genre list item
    genreListItems.forEach((li) => {
      li.addEventListener("click", () => {
        const genreId = li.id;

        // Checking if the genre id already exists in the array
        if (clickedGenreIds.includes(genreId)) {
          // If it exists, remove it from the array
          const index = clickedGenreIds.indexOf(genreId);
          clickedGenreIds.splice(index, 1);
          console.log("Removed Genre ID:", genreId);
        } else {
          // If id doesn't exist, add it to the array
          clickedGenreIds.push(genreId);
          console.log("Clicked Genre ID:", genreId);
        }
        li.classList.toggle("selected");

        console.log("Clicked Genre IDs Array:", clickedGenreIds);

        const genreQuery = clickedGenreIds;
        console.log("genreQuery", genreQuery);
        // Fetching movies based on the selected genres using the discover API
        fetchDiscoverMovies(genreQuery);
      });
    });
  } catch (err) {
    console.error(err);
  }
};
getMovieGenre();

const clearSelectedGenresButton = document.querySelector("#clearGenres");

// Function to clear selected genres
clearSelectedGenresButton.addEventListener("click", () => {
  clickedGenreIds.length = 0;

  // Removing the "selected" class from all genre list items
  genreListItems.forEach((li) => {
    li.classList.remove("selected");
  });

  fetchPopularMovies();
});

//adding event listen to searchForm to get the searchValue
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const searchValue = search.value;
  console.log(searchValue);

  if (searchValue) {
    searchMovies(searchValue);
  }
});

//adding event listener to searchInput when thge input value is empty
searchInput.addEventListener("input", () => {
  const searchValue = searchInput.value;
  if (!searchValue) {
    fetchPopularMovies();
  }
});

///////////////////////////////////////////////////Pagination////////////////////////////////////////////

//  pagination elements
const prevPage = document.querySelector("#prev");
const currentPage = document.querySelector("#current");
const nextPage = document.querySelector("#next");

// Variable for storing page number
let page = 1;

// Function to update the pagination status
const updatePagination = () => {
  currentPage.innerText = page;
  prevPage.classList.toggle("disabled", page === 1);
};

// Function to fetch movies based on the current page number
const fetchMoviesByPage = async (page) => {
  const popularMoviesUrl = `https://api.themoviedb.org/3/movie/popular?page=${page}`;
  const movieData = await fetchData(popularMoviesUrl);
  console.log(movieData);
  showMovies(movieData);
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

// Function to go to the previous page
const goToPrevPage = () => {
  if (page > 1) {
    page--;
    updatePagination();
    fetchMoviesByPage(page);
    scrollToTop();
  }
};

// Function to go to the next page
const goToNextPage = () => {
  page++;
  updatePagination();
  fetchMoviesByPage(page);
  scrollToTop();
};

// Adding event listeners for previous and next page buttons
prevPage.addEventListener("click", goToPrevPage);
nextPage.addEventListener("click", goToNextPage);

// Fetch popular movies by page number
fetchMoviesByPage(page);
