document.addEventListener("DOMContentLoaded", function () {
    const apiKey = "6b7e84ac645512e9524f0cd62a24521e";
    const geocodingApiUrl = `https://api.openweathermap.org/geo/1.0/direct?limit=1&appid=${apiKey}`;

    // Initialize elements
    const locationInput = document.getElementById("location");
    const searchLocationButton = document.getElementById("searchLocation");
    const categorySelect = document.getElementById("category");
    const eventResults = document.getElementById("eventResults");
    const distanceInput = document.getElementById("distance");
    const dateInput = document.getElementById("date");

    let latLng = null;

    function initAutocomplete() {
        // Initialize Google Places Autocomplete here
        const autocomplete = new google.maps.places.Autocomplete(locationInput);
    
        // Event listener when a place is selected from autocomplete
        autocomplete.addListener("place_changed", function () {
            const place = autocomplete.getPlace();
            
            if (place.geometry && place.geometry.location) {
                latLng = {
                    lat: place.geometry.location.lat(),
                    lon: place.geometry.location.lng(),
                };
            } else {
                latLng = null;
            }
        });
    }

    // Call the initAutocomplete function to initialize autocomplete
    initAutocomplete();
    // Define the fetchLocationCoordinates function
    function fetchLocationCoordinates(cityName) {
        // Your implementation here
    }
    // Event listener for place selection
    locationInput.addEventListener("change", function () {
        const cityName = locationInput.value;
        // Add a delay before fetching location coordinates
        setTimeout(() => {
            fetchLocationCoordinates(cityName);
        }, 1000); // You can adjust the delay (in milliseconds) as needed
    });

    // Event listener for clicking the "Search Location" button
    searchLocationButton.addEventListener("click", function () {
        if (latLng) {
            console.log("Button clicked");
            const category = categorySelect.value;
            const maxDistance = distanceInput.value;
            const selectedDate = dateInput.value; // Get the user-selected date

            // Make the API request to fetch event data based on latLng, category, distance, and date
            fetch(
                `https://api.predicthq.com/v1/events/?category=${category}&country=US&location_around.origin=${latLng.lat},${latLng.lon}&location_around.range=${maxDistance}km&start.gt=${selectedDate}T00:00:00Z`, // Include the date filter in the URL
                {
                    headers: {
                        Authorization: "Bearer GT0QbJMQ8mJXqnuGNHzBZg-OjRex-auEcS0ofEAs",
                    },
                }
            )
                .then((response) => response.json())
                .then((data) => {
                    // Handle the JSON data here
                    console.log(data); // Log the JSON data to the console
                    // You can also display the data in the eventResults div or process it as needed
                })
                .catch((error) => {
                    console.error("Error fetching event data:", error);
                });
        } else {
            alert("Please select a valid city from the autocomplete dropdown.");
        }
    });
});
