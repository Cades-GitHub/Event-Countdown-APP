// Bearer GT0QbJMQ8mJXqnuGNHzBZg-OjRex-auEcS0ofEAs
// AIzaSyCbplK3dRw0kIy4Nb0fYGv0TEERkK6cBVg

// Define global variables
let latLng = null;
let locationInput;
let categorySelect;
let distanceInput;
let dateInput;
let eventResults;

// Function to fetch location coordinates based on city name
function fetchLocationCoordinates(cityName) {
    const geocodingApiUrl = `https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyCbplK3dRw0kIy4Nb0fYGv0TEERkK6cBVg`; // Replace with your Geocoding API key

    const requestUrl = `${geocodingApiUrl}&address=${encodeURIComponent(cityName)}`;
    console.log("Geocoding API Request:", requestUrl); // Log the API request URL for debugging

    fetch(requestUrl)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Geocoding API Error: ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .then((data) => {
            console.log("Geocoding API Response:", data); // Log the API response for debugging

            if (data.results.length > 0) {
                const location = data.results[0].geometry.location;
                latLng = {
                    lat: location.lat,
                    lon: location.lng,
                };
                console.log("Set latLng:", latLng); // Log the latLng variable

            } else {
                latLng = null;
                alert("City not found. Please enter a valid city name.");
            }
        })
        .catch((error) => {
            console.error("Error fetching location coordinates:", error);
            latLng = null;
            alert("Error fetching location coordinates. Please try again later.");
        });
}

// Function to fetch events using latitude and longitude
function fetchEvents(latitude, longitude, category, maxDistance, formattedDate) {
    const requestUrl = `https://api.predicthq.com/v1/events/?category=${category}&country=US&within=${maxDistance}mi@${latitude},${longitude}&start.gte=${formattedDate}&sort=start`;

    console.log("PredictHQ API Request URL:", requestUrl); // Log the request URL

    fetch(requestUrl, {
        headers: {
            Authorization: "Bearer GT0QbJMQ8mJXqnuGNHzBZg-OjRex-auEcS0ofEAs", // Replace with your PredictHQ API key
        },
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        }
        return response.json();
    })
    .then((data) => {
        console.log("API Response:", data); // Log the API response for debugging

        // Handle the fetched event data here
        eventResults.innerHTML = ""; // Clear the event results

        if (data && data.results && data.results.length > 0) {
            data.results.forEach((event) => {
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
            eventResults.innerHTML = "<p>No events found.</p>"; // Show message if no events
        }

        // Clear the input fields after the search
        locationInput.value = "";
        var date = new Date();
        var day = String(date.getDate()).padStart(2, '0'); // Add leading 0 if needed
        var month = String(date.getMonth() + 1).padStart(2, '0'); // Add leading 0 if needed
        var year = date.getFullYear();
        var today = `${year}-${month}-${day}`; // Format to YYYY-MM-DD
        document.getElementById("date").value = today;
        dateInput.value = "date";
    })
    .catch((error) => {
        console.error("Error fetching event data:", error);
        eventResults.innerHTML = "<p>Error fetching events. Please try again later.</p>";
    });
}

// Event listener for DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
    // Initialize HTML elements
    locationInput = document.getElementById("location");
    categorySelect = document.getElementById("category");
    distanceInput = document.getElementById("distance");
    dateInput = document.getElementById("date");
    eventResults = document.getElementById("eventResults");

    // Event listener for location input changes
    locationInput.addEventListener("change", function () {
        const cityName = locationInput.value;
        setTimeout(() => {
            fetchLocationCoordinates(cityName);
        }, 1000); // Delay in milliseconds
    });
     // Initialize the search button
     const searchButton = document.getElementById("searchButton");

     // Event listener for the search button click
     searchButton.addEventListener("click", function () {
         if (latLng && latLng.lat && latLng.lon) {
             const category = categorySelect.value;
             const maxDistance = distanceInput.value;
             const formattedDate = dateInput.value; // Make sure this is formatted correctly
 
             fetchEvents(latLng.lat, latLng.lon, category, maxDistance, formattedDate);
         } else {
             alert("Please enter a valid location.");
         }
     });
});
