import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';

const RecommendedMovies = ({ movieTitles }) => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyODk5ZmJmYTk4OWY5YjlmOTJjNWYyYTVjNzExZjhhNiIsIm5iZiI6MTc2NjMzODI3NS45OTYsInN1YiI6IjY5NDgyZWUzNDkzNWIyZTMzMmZiMTFlNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.1uCxRfRwaewJNY5IpKotduvdBYC7PQsuNiN9deCjNkw'
        }
    };

    useEffect(() => {
        const fetchMovies = async () => {
            setLoading(true);
            try {
                const promises = movieTitles.map(async (title) => {
                    const searchRes = await fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}&include_adult=false&language=en-US&page=1`, options);
                    const searchData = await searchRes.json();
                    return searchData.results && searchData.results.length > 0 ? searchData.results[0] : null;
                });

                const results = await Promise.all(promises);
                setMovies(results.filter(m => m !== null));
            } catch (error) {
                console.error("Error fetching movie details:", error);
            } finally {
                setLoading(false);
            }
        };

        if (movieTitles && movieTitles.length > 0) {
            fetchMovies();
        }
    }, [movieTitles]);

    if (loading) return <div className="text-white text-center py-10 font-medium text-lg">Loading movie details...</div>;

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 px-4 pb-10">
            {movies.map((movie) => (
                <Link to={`/movie/${movie.id}`} key={movie.id} className="group relative transition transform hover:scale-105 duration-300 block">
                    <div className="bg-[#181818] rounded-xl overflow-hidden h-full shadow-lg border border-[#333] group-hover:border-[#E50914]">
                        <div className="aspect-[2/3] w-full overflow-hidden">
                            <img
                                src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "https://via.placeholder.com/500x750?text=No+Image"}
                                alt={movie.title}
                                className="w-full h-full object-cover group-hover:brightness-110 transition duration-300"
                            />
                        </div>
                        <div className="p-3 bg-[#181818]">
                            <p className="text-white text-sm font-semibold truncate group-hover:text-[#E50914] transition">{movie.title}</p>
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-gray-400 text-xs">{movie.release_date?.split('-')[0] || "N/A"}</p>
                                <span className="text-xs text-[#46d369] font-medium">{movie.vote_average ? Math.round(movie.vote_average * 10) + "% Match" : ""}</span>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default RecommendedMovies;
