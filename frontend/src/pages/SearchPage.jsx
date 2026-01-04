import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (query) {
            fetchMovies();
        }
    }, [query]);

    const fetchMovies = async () => {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        try {
            const res = await fetch(`${API_URL}/api/search?q=${query}`);
            const data = await res.json();
            if (data.content) {
                setMovies(data.content);
            } else {
                setMovies([]);
            }
        } catch (error) {
            console.error("Error fetching search results:", error);
            setMovies([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='bg-black min-h-screen text-white pt-20 px-5'>
            <h2 className='text-2xl font-bold mb-6'>
                Search Results for "{query}"
            </h2>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : movies.length > 0 ? (
                <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4'>
                    {movies.map((movie) => (
                        movie.poster_path && (
                            <div key={movie.id} className='bg-[#181818] rounded-lg overflow-hidden hover:scale-105 transition duration-300 relative group'>
                                <Link to={`/movie/${movie.id}`}>
                                    <img
                                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                        alt={movie.title}
                                        className='w-full h-auto object-cover'
                                    />
                                    <div className='p-3'>
                                        <h3 className='font-semibold truncate'>{movie.title}</h3>
                                        <p className='text-gray-400 text-sm'>
                                            {movie.release_date?.split("-")[0]}
                                        </p>
                                    </div>
                                </Link>
                            </div>
                        )
                    ))}
                </div>
            ) : (
                <div className='text-center text-gray-400 mt-10'>
                    <p>No results found for "{query}".</p>
                </div>
            )}
        </div>
    );
};

export default SearchPage;
