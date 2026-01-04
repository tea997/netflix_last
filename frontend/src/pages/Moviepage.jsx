import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import { Search } from 'lucide-react'
import { Play } from 'lucide-react'

const Moviepage = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [trailerKey, setTrailerKey] = useState(null);

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyODk5ZmJmYTk4OWY5YjlmOTJjNWYyYTVjNzExZjhhNiIsIm5iZiI6MTc2NjMzODI3NS45OTYsInN1YiI6IjY5NDgyZWUzNDkzNWIyZTMzMmZiMTFlNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.1uCxRfRwaewJNY5IpKotduvdBYC7PQsuNiN9deCjNkw'
    }
  };



  useEffect(() => {
    fetch(`https://api.themoviedb.org/3/movie/${id}?language=en-US`, options)
      .then(res => res.json())
      .then(res => setMovie(res))
      .catch(err => console.error(err));

    fetch(`https://api.themoviedb.org/3/movie/${id}/recommendations?language=en-US&page=1`, options)
      .then(res => res.json())
      .then(res => setRecommendations(res.results))
      .catch(err => console.error(err));

    fetch(`https://api.themoviedb.org/3/movie/${id}/videos?language=en-US`, options)
      .then(res => res.json())
      .then(res => {
        const trailer = res.results?.find((vid) => vid.site === "YouTube" && vid.type === "Trailer");
        setTrailerKey(trailer?.key || null);
      })
      .catch(err => console.error(err));

  }, [id])

  if (!movie.title) {
    return <div className='flex items-center justify-center h-screen' >
      <span className='text-red-600 text-xl'>Loading...</span>
    </div>
  }
  return (
    <div className='min-h-screen text-white bg-black'>
      <div className='relative h-[60vh] flex items-end justify-start pl-8'

        style={{
          backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
          backgroundSize: "cover",
          backgroundPosition: 'center',

        }}
      >
        <div className='absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent'></div>

        <div className='relative z-10 p-8'>
          <div className='flex items-start gap-4'>
            <img src={`https://image.tmdb.org/t/p/original${movie.poster_path}`} alt=""
              className='rounded-lg shadow-lg w-48'
            />
            <div>
              <h1 className='text-4xl font-bold mb-4'>{movie.title}</h1>
              <div className='flex items-center gap-4 mb-2'>
                <span>⭐ {movie.vote_average?.toFixed(1)}</span>
                <span>{movie.release_date}</span>
                <span>{movie.runtime} mins</span>
              </div>

              <div>
                {movie.genres.map((genre) => (
                  <span key={genre.id} className='mr-2 px-2 py-1 border border-white rounded-full text-sm'>
                    {genre.name}
                  </span>
                ))}
              </div>
              <p className='max-w-3xl pt-2'>{movie.overview}</p>
              <Link to={`https://www.youtube.com/watch?v=${trailerKey}`} target="_blank">
                <button className='flex items-center justify-center bg-[#e50b0b] text-[#f6efef] px-3 py-2
                         rounded-full cursor-pointer text-sm md:text-base mt-4 hover:bg-[#c11119] transition-colors'> <Play /> Watch Trailer</button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <h2 className="text-2xl font-semibold mb-4">Details</h2>
        <div className="bg-[#232323] rounded-lg shadow-lg p-6 flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <ul className="text-gray-300 space-y-3">
              <li>
                <span className="font-semibold text-white">Status: </span>
                <span className="ml-2">{movie.status}</span>
              </li>

              <li>
                <span className="font-semibold text-white">Release Date: </span>
                <span className="ml-2">{movie.release_date}</span>
              </li>

              <li>
                <span className="font-semibold text-white">
                  Original Language:
                </span>
                <span className="ml-2">
                  {movie.original_language?.toUpperCase()}
                </span>
              </li>

              <li>
                <span className="font-semibold text-white">Budget: </span>
                <span className="ml-2">
                  {movie.budget ? `$${movie.budget.toLocaleString()}` : "N/A"}
                </span>
              </li>

              <li>
                <span className="font-semibold text-white">Revenue:</span>{" "}
                <span className="ml-2">
                  {movie.revenue ? `$${movie.revenue.toLocaleString()}` : "N/A"}
                </span>
              </li>

              <li>
                <span className="font-semibold text-white">
                  Production Companies:
                </span>
                <span className="ml-2">
                  {movie.production_companies &&
                    movie.production_companies.length > 0
                    ? movie.production_companies.map((c) => c.name).join(", ")
                    : "N/A"}
                </span>
              </li>

              <li>
                <span className="font-semibold text-white">Countries:</span>
                <span className="ml-2">
                  {movie.production_countries &&
                    movie.production_countries.length > 0
                    ? movie.production_countries.map((c) => c.name).join(", ")
                    : "N/A"}
                </span>
              </li>

              <li>
                <span className="font-semibold text-white">
                  Spoken Languages:
                </span>
                <span className="ml-2">
                  {movie.spoken_languages && movie.spoken_languages.length > 0
                    ? movie.spoken_languages
                      .map((l) => l.english_name)
                      .join(", ")
                    : "N/A"}
                </span>
              </li>
            </ul>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-2">Tagline</h3>
            <p className="italic text-gray-400 mb-6">
              {movie.tagline || "No tagline available."}
            </p>

            <h3 className="font-semibold text-white mb-2">Overview</h3>
            <p className="text-gray-200">{movie.overview}</p>
          </div>
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className='p-8'>
          <h2 className='text-2xl text-white pb-4'>U Might Also Like This...</h2>

          <div className='grid grid-cols-2 md:grid-cols-5 gap-4 pb-2 text-left'>
            {recommendations.slice(0, 10).map((rec) => (
              <div key={rec.id} className='bg-[#ebdede21] rounded-lg overflow-hidden hover:scale-108 transition'>
                <Link to={`/movie/${rec.id}`}>
                  <img src={`https://image.tmdb.org/t/p/w300${rec.poster_path}`} alt={rec.title}
                    className='w-full h-48 object-cover'
                  />
                  <div>
                    <h3 className='text-sm text-semibold pb-1 pt-3'>{rec.title}</h3>
                    <span className='text-xs text-gray-400 pb-2'>
                      {rec.release_date?.slice(0, 4)}
                    </span>
                  </div>
                </Link>
              </div>

            ))}
          </div>
        </div>
      )}
    </div>
  )

}

export default Moviepage


