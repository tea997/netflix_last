import axios from 'axios';

const main = async () => {
    console.log("Testing TMDB API with Axios...");
    try {
        const q = "avengers";
        const response = await axios.get(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(q)}&include_adult=false&language=en-US&page=1`, {
            headers: {
                accept: 'application/json',
                Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyODk5ZmJmYTk4OWY5YjlmOTJjNWYyYTVjNzExZjhhNiIsIm5iZiI6MTc2NjMzODI3NS45OTYsInN1YiI6IjY5NDgyZWUzNDkzNWIyZTMzMmZiMTFlNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.1uCxRfRwaewJNY5IpKotduvdBYC7PQsuNiN9deCjNkw'
            }
        });

        console.log("Response Status:", response.status);
        console.log("Success! Found results:", response.data.results?.length);

    } catch (e) {
        console.error("Exception caught:", e.message);
        if (e.response) {
            console.error("Data:", e.response.data);
            console.error("Status:", e.response.status);
        }
    }
}
main();
