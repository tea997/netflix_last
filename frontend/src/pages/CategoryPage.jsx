import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import Footer from '../components/Footer';

const CategoryPage = () => {
    const { type } = useParams(); // e.g., "tv", "movies", "anime", "popular", "upcoming"
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    const categoryConfig = {
        tv: { title: "TV Shows", endpoint: "tv" },
        movies: { title: "Movies", endpoint: "movies" },
        anime: { title: "Anime", endpoint: "anime" },
        popular: { title: "New & Popular", endpoint: "popular" },
        upcoming: { title: "Upcoming", endpoint: "upcoming" },
    };

    const config = categoryConfig[type] || { title: "Category", endpoint: type };

    useEffect(() => {
        fetchItems();
    }, [type, page]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/category/${config.endpoint}?page=${page}`);
            const data = await res.json();
            if (data.content) {
                setItems(prev => page === 1 ? data.content : [...prev, ...data.content]);
            }
        } catch (error) {
            console.error("Error fetching category:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        setPage(prev => prev + 1);
    };

    // Reset page when category changes
    useEffect(() => {
        setPage(1);
        setItems([]);
    }, [type]);

    // Get backdrop from first item with a backdrop_path
    const heroBackdrop = items.find(item => item.backdrop_path)?.backdrop_path;

    return (
        <div className='bg-black min-h-screen text-white'>
            {/* Hero Banner */}
            <div className='relative h-[30vh] flex items-end justify-start'
                style={{
                    backgroundImage: heroBackdrop
                        ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.9)), url(https://image.tmdb.org/t/p/original${heroBackdrop})`
                        : `linear-gradient(135deg, #1a1a1a 0%, #E50914 100%)`,
                    backgroundSize: "cover",
                    backgroundPosition: 'center',
                }}
            >
                <h1 className='text-4xl md:text-5xl font-bold p-8 z-10'>{config.title}</h1>
            </div>

            {/* Content Grid */}
            <div className='p-5 md:p-8'>
                {loading && items.length === 0 ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : items.length > 0 ? (
                    <>
                        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'>
                            {items.map((item) => (
                                item.poster_path && (
                                    <div key={item.id} className='bg-[#181818] rounded-lg overflow-hidden hover:scale-105 transition duration-300 group'>
                                        <Link to={type === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`}>
                                            <img
                                                src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                                                alt={item.title || item.name}
                                                className='w-full h-auto object-cover'
                                            />
                                            <div className='p-3'>
                                                <h3 className='font-semibold truncate text-sm'>{item.title || item.name}</h3>
                                                <div className='flex items-center justify-between text-xs text-gray-400 mt-1'>
                                                    <span>{(item.release_date || item.first_air_date)?.split("-")[0]}</span>
                                                    <span className='flex items-center'>⭐ {item.vote_average?.toFixed(1)}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                )
                            ))}
                        </div>

                        {/* Load More Button */}
                        <div className='flex justify-center mt-8'>
                            <button
                                onClick={loadMore}
                                disabled={loading}
                                className='bg-[#E50914] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#C11119] transition duration-200 disabled:opacity-50'
                            >
                                {loading ? 'Loading...' : 'Load More'}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className='text-center text-gray-400 mt-10'>
                        <p>No content available.</p>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default CategoryPage;
