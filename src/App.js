import { useEffect, useState, useRef } from "react";
import StarRating from "./StarRating.js";
import { useMovies } from "./useMovies.js";
import { useLocalStorageState } from "./useLocalStorageState.js";
import { useKey } from "./useKey.js";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "afb28ece";

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [userRating, setUserRating] = useState("");
  const [watched, setWatched] = useLocalStorageState([], "watched");

  function handleWatchedMovies(movie) {
    setWatched((watched) => [...watched, movie]);
    // localStorage.setItem("watched", JSON.stringify([...watched, movie]));
  }

  function handleDeleteMovie(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  function MovieSelected(id) {
    setSelectedId((selectedId) => (selectedId === id ? null : id));
  }

  function handleLeftArrow() {
    setSelectedId(null);
  }

  const { movies, error, isLoading } = useMovies(query);

  return (
    <>
      <NavBar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        <ListBox>
          {/* {isLoading ? <Loader /> : <MovieList movies={movies} />} */}
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} movieSelected={MovieSelected} />
          )}
          {error && <ErrorDisplay error={error} />}
        </ListBox>
        <WatchedBox>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              handleLeftArrow={handleLeftArrow}
              handleWatchedMovies={handleWatchedMovies}
              watched={watched}
              userRating={userRating}
              setUserRating={setUserRating}
              setSelectedId={setSelectedId}
            />
          ) : (
            <>
              {" "}
              <WatchedSummary watched={watched} />
              <WatchedMoviesList
                watched={watched}
                handleDeleteMovie={handleDeleteMovie}
              />
            </>
          )}
        </WatchedBox>
      </Main>
    </>
  );
}

function NavBar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  const inputEl = useRef(null);

  useKey("Enter", function () {
    if (document.activeElement === inputEl.current) {
      return;
    }
    inputEl.current.focus();
    setQuery("");
  });

  // useEffect(
  //   function () {
  //     function callback(e) {
  //       if (document.activeElement === inputEl.current) {
  //         return;
  //       }

  //       if (e.code === "Enter") {
  //         inputEl.current.focus();
  //         setQuery("");
  //       }
  //     }

  //     document.addEventListener("keydown", callback);

  //     return () => document.removeEventListener("keydown", callback);
  //   },
  //   [setQuery]
  // );

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies?.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function ListBox({ children }) {
  const [isOpen1, setIsOpen1] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen1((open) => !open)}
      >
        {isOpen1 ? "–" : "+"}
      </button>
      {isOpen1 && children}
    </div>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function ErrorDisplay({ error }) {
  return (
    <p className="error">
      <span>⛔</span> {error}
    </p>
  );
}

function MovieList({ movies, movieSelected }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} movieSelected={movieSelected} />
      ))}
    </ul>
  );
}

function Movie({ movie, movieSelected }) {
  return (
    <li onClick={() => movieSelected(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function WatchedBox({ children }) {
  const [isOpen2, setIsOpen2] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen2((open) => !open)}
      >
        {isOpen2 ? "–" : "+"}
      </button>
      {isOpen2 && children}
    </div>
  );
}

function MovieDetails({
  selectedId,
  handleLeftArrow,
  handleWatchedMovies,
  watched,
  userRating,
  setUserRating,
  setSelectedId,
}) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const numberOfDecisions = useRef(0);
  useEffect(
    function () {
      if (userRating) numberOfDecisions.current++;
    },
    [userRating]
  );

  const {
    Title: title,
    Poster: poster,
    Plot: plot,
    Runtime: runtime,
    imdbRating,
    Released: released,
    Actors: actors,
    Writer: writer,
    Genre: genre,
  } = movie;

  function update() {
    if (watched.map((movie) => movie.imdbID).includes(selectedId)) {
      watched.map((movie) =>
        movie.imdbID === selectedId ? (movie.userRating = userRating) : null
      );
    }
    setSelectedId(null);
    setUserRating(0);
  }

  function handleAddToWatched() {
    if (watched.map((movie) => movie.imdbID).includes(selectedId)) {
      return;
    }
    const newMovie = {
      title,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      imdbID: selectedId,
      userRating,
      numberOfDecisions,
    };

    handleWatchedMovies(newMovie);
    handleLeftArrow();
    setUserRating(0);
  }

  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
        );
        const data = await res.json();
        setIsLoading(false);
        setMovie(data);
      }
      getMovieDetails();
    },
    [selectedId]
  );

  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;

      return function () {
        document.title = "usePopcorn";
      };
    },
    [title]
  );

  useKey("Escape", handleLeftArrow);

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button onClick={handleLeftArrow}>⬅</button>
            <img src={poster} alt="movie" />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDB rating
              </p>
            </div>
          </header>

          <section>
            <div className="rating ">
              {watched.map((movie) => movie.imdbID).includes(selectedId) ? (
                <StarRating
                  maxRating={10}
                  size={24}
                  onSetRating={setUserRating}
                  defaultRating={watched.map((movie) =>
                    movie.imdbID === selectedId ? movie.userRating : null
                  )}
                />
              ) : (
                <StarRating
                  maxRating={10}
                  size={24}
                  onSetRating={setUserRating}
                />
              )}
              {/* <StarRating
                maxRating={10}
                size={24}
                onSetRating={setUserRating}
              /> */}
              {userRating > 0 &&
              !watched.map((movie) => movie.imdbID).includes(selectedId) ? (
                <button className="btn-add" onClick={handleAddToWatched}>
                  + Add to watched list
                </button>
              ) : null}

              {watched.map((movie) => movie.imdbID).includes(selectedId) ? (
                <button className="btn-add" onClick={update}>
                  Update your rating!
                </button>
              ) : null}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Writed by {writer}</p>
          </section>
        </>
      )}
    </div>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMoviesList({ watched, handleDeleteMovie }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          handleDeleteMovie={handleDeleteMovie}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, handleDeleteMovie }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime}</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => handleDeleteMovie(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}
