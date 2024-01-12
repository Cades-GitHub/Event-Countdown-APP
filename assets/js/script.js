// Global variables to store references to various HTML elements and data
let latLng = null; // Stores latitude and longitude
let locationInput = document.getElementById("location");
let categorySelect; // Select element for choosing event category
let distanceInput; // Input for search radius
let dateInput; // Input for selecting date
let eventResults; // Element to display event results

// Add modal related variables
var modal = document.getElementById("myModal");
var span = document.getElementsByClassName("close")[0];

// Function to fetch geographic coordinates (latitude and longitude) based on a city name
function fetchLocationCoordinates(cityName) {
    // URL for Google Geocoding API with API key and city name
    const geocodingApiUrl = `https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyCbplK3dRw0kIy4Nb0fYGv0TEERkK6cBVg`;
    const requestUrl = `${geocodingApiUrl}&address=${encodeURIComponent(cityName)}`;

    // Log the API request URL to the console for debugging
    console.log("Geocoding API Request URL:", requestUrl);

    // Fetch request to the Geocoding API
    fetch(requestUrl) // Fetch request to the Geocoding API full URL
        .then((response) => {
            // Handle responses
            if (!response.ok) {
                throw new Error(`Geocoding API Error: ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .then((data) => {
            
            // Log the API response to the console for debugging
            console.log("Geocoding API Response:", data);

            // If the response contains location data
            if (data.results.length > 0) {
                const location = data.results[0].geometry.location;
                
                // Set the global variable with latitude and longitude
                latLng = {
                    lat: location.lat,
                    lon: location.lng,
                };
            } else {
                // If no location data is found, reset latLng and alert the user
                latLng = null;
                showModal("City not found. Please enter a valid city name.");
            }
        })
        .catch((error) => {
            // Log and alert any errors encountered
            console.error("Error fetching location coordinates:", error);
            latLng = null;
            showModal("Error fetching location coordinates. Please try again later.");
        });
}

// Function to fetch events based on latitude, longitude, category, distance, and date
function fetchEvents(latitude, longitude, category, maxDistance, formattedDate) {
    // Construct request URL for PredictHQ API
    const requestUrl = `https://api.predicthq.com/v1/events/?category=${category}&country=US&within=${maxDistance}mi@${latitude},${longitude}&start.gte=${formattedDate}&sort=start`;

    // Fetch request to the PredictHQ API
    fetch(requestUrl, {
        headers: {
            Authorization: "Bearer GT0QbJMQ8mJXqnuGNHzBZg-OjRex-auEcS0ofEAs", // API key for authorization
        },
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        }
        return response.json();
    })
    .then((data) => {
        // Clear any previous event results
        eventResults.innerHTML = "";

        // Check if data is received and has results
        if (data && data.results && data.results.length > 0) {
            // Loop through each event and display it
            data.results.forEach((event) => {
                // Create and append elements for each event detail
                const eventHeader = document.createElement("h3");
                eventHeader.textContent = event.title;

                const eventDetails = document.createElement("p");
                eventDetails.textContent = `Category: ${event.category}, Start Date: ${event.start}, End Date: ${event.end}`;

                const eventItem = document.createElement("li");
                eventItem.appendChild(eventHeader);
                eventItem.appendChild(eventDetails);
                eventResults.appendChild(eventItem);
            });
        } else {
            // Display a message if no events are found
            eventResults.innerHTML = "<p>No events found.</p>";
        }

        // Reset the input fields after the search
        locationInput.value = "";
        dateInput.value = new Date().toISOString().split('T')[0]; // Reset to today's date
    })
    .catch((error) => {
        // Log and display any errors encountered
        console.error("Error fetching event data:", error);
        eventResults.innerHTML = "<p>Error fetching events. Please try again later.</p>";
    });
}


// Event listener that triggers when the DOM content is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    // Initialize HTML elements by their IDs
    locationInput = document.getElementById("location");
    categorySelect = document.getElementById("category");
    distanceInput = document.getElementById("distance");
    dateInput = document.getElementById("date");
    eventResults = document.getElementById("eventResults");

    // Listener for changes in location input field
    locationInput.addEventListener("change", function () {
        const cityName = locationInput.value;
        // Delay fetching location coordinates by 1 second after input change
        setTimeout(() => {
            fetchLocationCoordinates(cityName);
        }, 500);
    });

// Initialize and set event listener for search button
const searchButton = document.getElementById("searchButton");
searchButton.addEventListener("click", function () {
    // Obtain the city name from the location input field
    const cityName = locationInput.value;

    // Check if the city name is empty and show the modal if it is
    if (!cityName.trim()) {
        showModal("Please enter a city name.");
        return; // Stop further execution
    }

    // Continue with fetching location coordinates if city name is not empty
    fetchLocationCoordinates(cityName);

    // Ensure latLng is set before fetching events
    if (latLng && latLng.lat && latLng.lon) {
        // Get the current date in the user's local time zone
        const today = new Date();

        // Parse the date input's value manually (assuming it's in YYYY-MM-DD format)
        const dateValue = dateInput.value.split('-');
        const selectedDate = new Date(dateValue[0], dateValue[1] - 1, dateValue[2]); // Month is 0-based

        // Set time to start of day for accurate date comparison
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);

        // Check if the selected date is in the past
        if (selectedDate < today) {
            showModal("The selected date is in the past. Please choose a future date.");
            return; // Stop further execution
        }

        // Fetch events using the selected criteria
        fetchEvents(latLng.lat, latLng.lon, categorySelect.value, distanceInput.value, dateInput.value);
    } else {
        showModal("Please enter a valid location.");
    }
});

    // Add modal related variables
var modal = document.getElementById("myModal");
var span = document.getElementsByClassName("close")[0];
function showModal(message) {
    document.getElementById("modalText").innerText = message;
    modal.style.display = "block";
}
// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
});
