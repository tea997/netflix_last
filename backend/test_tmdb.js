const main = async () => {
    console.log("Testing TMDB API...");
    try {
        if (typeof fetch === 'undefined') {
            console.error("Error: fetch is NOT defined in this environment.");
            return;
        }
        const q = "avengers";
        const response = await fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(q)}&include_adult=false&language=en-US&page=1`, {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyODk5ZmJmYTk4OWY5YjlmOTJjNWYyYTVjNzExZjhhNiIsIm5iZiI6MTc2NjMzODI3NS45OTYsInN1YiI6IjY5NDgyZWUzNDkzNWIyZTMzMmZiMTFlNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.1uCxRfRwaewJNY5IpKotduvdBYC7PQsuNiN9deCjNkw'
            }
        });
        console.log("Response Status:", response.status);
        if (!response.ok) {
            console.error("Response NOT OK");
            const text = await response.text();
            console.error("Body:", text);
        } else {
            const data = await response.json();
            console.log("Success! Found results:", data.results?.length);
        }
    } catch (e) {
        console.error("Exception caught:", e);
    }
}
main();
