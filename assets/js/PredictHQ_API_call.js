    document.addEventListener("DOMContentLoaded", function () {
        // OpenWeatherMap API key
        const apiKey = "6b7e84ac645512e9524f0cd62a24521e";

        // API URL for geocoding to get location coordinates
        const geocodingApiUrl = `https://api.openweathermap.org/geo/1.0/direct?limit=1&appid=${apiKey}`;

        // Initialize HTML elements
        const locationInput = document.getElementById("location");
        const searchLocationButton = document.getElementById("searchLocation");
        const categorySelect = document.getElementById("category");
        const eventResults = document.getElementById("eventResults");
        const distanceInput = document.getElementById("distance");
        const dateInput = document.getElementById("date");

        // Initialize variable to store location coordinates
        let latLng = null;

        // Initialize Google Map
        let map;

        // Function to fetch location coordinates based on city name
        function fetchLocationCoordinates(cityName) {
            // You can use the OpenWeatherMap API or any other geocoding service here
            // For example, using the OpenWeatherMap API:
            fetch(`${geocodingApiUrl}&q=${encodeURIComponent(cityName)}`)
                .then((response) => response.json())
                .then((data) => {
                    if (data.length > 0) {
                        // Assuming the first result is the desired location
                        const location = data[0];
                        latLng = {
                            lat: location.lat,
                            lon: location.lon,
                        };
                        // Call a function to update the map with the new location
                        updateMapWithLocation(location.lat, location.lon);
                    } else {
                        latLng = null;
                    }
                })
                .catch((error) => {
                    console.error("Error fetching location coordinates:", error);
                    latLng = null;
                });
        }

        // Function to update the map with a new location
        function updateMapWithLocation(latitude, longitude) {
            const coordinates = new google.maps.LatLng(latitude, longitude);

            new google.maps.Marker({
                position: coordinates,
                map: map,
                title: "Event Location",
            });
        }

        // Event listener for location input changes
        locationInput.addEventListener("change", function () {
            const cityName = locationInput.value;
            // Add a delay before fetching location coordinates
            setTimeout(() => {
                fetchLocationCoordinates(cityName);
            }, 1000); // Delay in milliseconds
        });

        // Event listener for clicking the "Search Location" button
        searchLocationButton.addEventListener("click", function () {
            if (latLng) {
                console.log("Button clicked");
                const category = categorySelect.value;
                const maxDistance = distanceInput.value;
                const selectedDate = dateInput.value; // Get the user-selected date
                console.log(selectedDate); // Log the date to the console

                // Make the API request to fetch event data based on location, category, distance, and date
                fetch(
                    `https://api.predicthq.com/v1/events/?category=${category}&country=US&location_around.origin=${latLng.lat},${latLng.lon}&location_around.range=${maxDistance}km&start.gt=${selectedDate}T00:00:00Z`, // Include the category, location, distance, and date in the API URL
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
                        eventResults.innerHTML = ""; // Clear the event results

                        // Loop through each event in the JSON data and plot markers on the map
                        data.results.forEach((event) => {
                            // Extract location coordinates from the event
                            const latitude = event.location[1];
                            const longitude = event.location[0];
                            // Create a marker for the event on the map
                            updateMapWithLocation(latitude, longitude);
                            // Create a header element for the event name
                            const eventHeader = document.createElement("h3");
                            eventHeader.textContent = event.title;
                            // Create a paragraph element for event details
                            const eventDetails = document.createElement("p");
                            eventDetails.textContent = `Category: ${event.category}, Start Date: ${event.start}, End Date: ${event.end}`;
                            // Create a list item for the event
                            const eventItem = document.createElement("li");
                            eventItem.appendChild(eventHeader);
                            eventItem.appendChild(eventDetails);
                            // Append the event item to the event results list
                            eventResults.appendChild(eventItem);
                        });
                        // Clear the input fields after the search
                        locationInput.value = ""; // Clear the location input
                        dateInput.value = ""; // Clear the date input
                    })
                    .catch((error) => {
                        console.error("Error fetching event data:", error);
                    });
            } else {
                alert("Please select a valid city from the autocomplete dropdown.");
            }
        });
    });

    function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: 36.998, lng: -109.045 }, // You can set this to a default location
            zoom: 8
        });

        // Initialize Autocomplete
        const locationInput = document.getElementById("location");
        const autocomplete = new google.maps.places.Autocomplete(locationInput);
        autocomplete.bindTo("bounds", map);

        // Listener for place changes in autocomplete
        autocomplete.addListener("place_changed", function() {
            const place = autocomplete.getPlace();
            if (!place.geometry) {
                console.log("No details available for input: '" + place.name + "'");
                return;
            }
            // Use place details like place.geometry.location
        });
    }
