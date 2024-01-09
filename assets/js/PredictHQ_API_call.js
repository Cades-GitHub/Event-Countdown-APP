// Wait for the DOM to be fully loaded before executing the code
document.addEventListener("DOMContentLoaded", function () {
    // Define your OpenWeatherMap API key
    const apiKey = "6b7e84ac645512e9524f0cd62a24521e";
    
    // Create the URL for the geocoding API
    const geocodingApiUrl = `https://api.openweathermap.org/geo/1.0/direct?limit=1&appid=${apiKey}`;

    // Initialize elements by selecting them from the HTML using their IDs
    const locationInput = document.getElementById("location"); // Input field for location
    const searchLocationButton = document.getElementById("searchLocation"); // Button to search for events
    const categorySelect = document.getElementById("category"); // Dropdown for event categories
    const eventResults = document.getElementById("eventResults"); // Display area for event results
    const distanceInput = document.getElementById("distance"); // Input field for maximum distance
    const dateInput = document.getElementById("date"); // Input field for selecting a date

    let latLng = null; // Variable to store latitude and longitude coordinates

    // Function to fetch location coordinates based on the city name
    async function fetchLocationCoordinates(cityName) {
        const geocodingUrl = `${geocodingApiUrl}&q=${cityName}`;

        try {
            const response = await fetch(geocodingUrl); // Send a request to the geocoding API
            const data = await response.json(); // Parse the response as JSON

            // Check if the API response contains location data
            if (data.length > 0) {
                latLng = {
                    lat: data[0].lat,
                    lon: data[0].lon,
                };
            } else {
                latLng = null; // Reset latLng if no data is found
            }
        } catch (error) {
            console.error("Error fetching location data:", error);
            latLng = null; // Reset latLng in case of an error
        }
    }

    // Event listener for when the user selects a location
    locationInput.addEventListener("change", function () {
        const cityName = locationInput.value;
        
        // Add a delay before fetching location coordinates (optional)
        setTimeout(() => {
            fetchLocationCoordinates(cityName);
        }, 1000); // You can adjust the delay (in milliseconds) as needed
    });

    // Event listener for when the "Search Location" button is clicked
    searchLocationButton.addEventListener("click", function () {
        if (latLng) {
            console.log("Button clicked");
            const category = categorySelect.value; // Get the selected event category
            const maxDistance = distanceInput.value; // Get the maximum distance
            const selectedDate = dateInput.value; // Get the user-selected date

            // Create the URL for the PredictHQ API request, including filters for category, distance, and date
            const apiUrl = `https://api.predicthq.com/v1/events/?category=${category}&country=US&location_around.origin=${latLng.lat},${latLng.lon}&location_around.range=${maxDistance}km&start.gt=${selectedDate}T00:00:00Z`;

            // Make the API request to fetch event data
            fetch(apiUrl, {
                headers: {
                    Authorization: "Bearer GT0QbJMQ8mJXqnuGNHzBZg-OjRex-auEcS0ofEAs",
                },
            })
                .then((response) => response.json()) // Parse the JSON response
                .then((data) => {
                    // Handle the JSON data here (you can log it to the console or display it in the eventResults div)
                    console.log(data);
                })
                .catch((error) => {
                    console.error("Error fetching event data:", error);
                });
        } else {
            alert("Please select a valid city from the autocomplete dropdown.");
        }
    });
});
