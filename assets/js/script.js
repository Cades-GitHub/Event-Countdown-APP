// API keys
const geocodingApiKey = "AIzaSyCbplK3dRw0kIy4Nb0fYGv0TEERkK6cBVg";
const predicthqApiKey = "Bearer GT0QbJMQ8mJXqnuGNHzBZg-OjRex-auEcS0ofEAs";

// Global variables to store references to various HTML elements and data
let latLng = null; // Stores latitude and longitude
categorySelect = document.getElementById("category"); // Select element for category
let distanceInput; // Input for search radius
let dateInput; // Input for selecting date
let eventResults; // Element to display event results
let locationInput; // Input for location search
let modal; // Modal element
let span;   // <span> element that closes the modal

function initMap() {
    // Initialize Google Places Autocomplete here
    const autocomplete = new google.maps.places.Autocomplete(locationInput);
    autocomplete.addListener("place_changed", function () {
        // Your Autocomplete event handler
    });

    // Set the default center to the middle of the USA (Kansas City, Missouri)
    const defaultLatLng = { lat: 39.0997, lng: -94.5786 }; // Kansas City, Missouri coordinates
    const map = new google.maps.Map(document.getElementById("map-container"), {
        center: defaultLatLng, // Set the center of the map
        zoom: 5, // Set an appropriate initial zoom level
    });

    // Optionally, you can add other map configurations here, such as markers, controls, etc.
}

function showModal(message) { // Function to display a modal with a message
    document.getElementById("modalText").innerText = message; // Set the modal text
    modal.style.display = "block"; // Display the modal
}

function initializeModal() { // Function to initialize the modal
    modal = document.getElementById("myModal"); // Get the modal
    span = document.getElementsByClassName("close")[0]; // Get the <span> element that closes the modal

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() { // When the user clicks on <span> (x), close the modal
        modal.style.display = "none"; // Close the modal
    }

    window.onclick = function(event) { // When the user clicks anywhere outside of the modal, close it
        if (event.target == modal) { // If the user clicks anywhere outside of the modal, close it
            modal.style.display = "none"; // Close the modal
        }
    }
}

function fetchLocationCoordinates(cityName) { // Function to fetch geographic coordinates (latitude and longitude) based on a city name
    return new Promise((resolve, reject) => { // Create a Promise that resolves when location data is available
        const geocodingApiUrl = `https://maps.googleapis.com/maps/api/geocode/json?key=${geocodingApiKey}`; // URL for Google Geocoding API with API key and city name
        const requestUrl = `${geocodingApiUrl}&address=${encodeURIComponent(cityName)}`; // Construct request URL for Google Geocoding API

        console.log("Geocoding API Request URL:", requestUrl);  // Log the API request URL to the console for debugging

        fetch(requestUrl) // Fetch request to the Geocoding API
            .then((response) => {
                // Handle responses
                if (!response.ok) { // If the response is not OK (i.e. status code is not 200)
                    throw new Error(`Geocoding API Error: ${response.status} - ${response.statusText}`); // Throw an error
                }
                return response.json(); // Return the response as JSON
            })
            .then((data) => {  // Handle data received from the Geocoding API
                console.log("Geocoding API Response:", data); // Log the data received from the Geocoding API to the console for debugging

                if (data.results.length > 0) { // If the response contains location data
                    const location = data.results[0].geometry.location; // Get the location data from the response

                    latLng = { // Set the global variable with latitude and longitude
                        lat: location.lat, // Latitude
                        lon: location.lng,  // Longitude
                    };
                    console.log("Latitude:", latLng.lat); // Log the latitude and longitude to the console for debugging
                    console.log("Longitude:", latLng.lon);  

                    resolve();  // Resolve the Promise
                } else { 
                    latLng = null; // Set the global variable to null
                    showModal("City not found. Please enter a valid city name."); // Show the modal with an error message
                    reject();   // Reject the Promise
                }   // End of if block for checking location data
            })  // End of .then block for fetch request
            .catch((error) => { // Handle errors
                console.error("Error fetching location coordinates:", error); // Log the error to the console for debugging
                latLng = null; // Set the global variable to null
                showModal("Error fetching location coordinates. Please try again later.");  // Show the modal with an error message
                reject();  // Reject the Promise
            }); // End of fetch request
    }); // End of Promise
}   // End of fetchLocationCoordinates function

function fetchEvents(latitude, longitude, category, maxDistance, date) { // Function to fetch events based on latitude, longitude, category, distance, and date
    console.log("Inside fetchEvents function");  // Log to the console for debugging
 
    // Construct request URL for PredictHQ API
    const requestUrl = `https://api.predicthq.com/v1/events/?category=${category}&country=US&within=${maxDistance}mi@${latitude},${longitude}&start.gte=${date}&sort=start`;

    console.log("PredictHQ API Request URL:", requestUrl);  // Log the API request URL to the console for debugging

    // Fetch request to the PredictHQ API
    fetch(requestUrl, { // Fetch request to the PredictHQ API
        headers: { // Set the request headers
            Authorization: predicthqApiKey, // Set the Authorization header with the API key
        }, // End of headers
    })
    .then((response) => { // Handle responses
        if (!response.ok) {     // If the response is not OK (i.e. status code is not 200)
            throw new Error(`API Error: ${response.status} - ${response.statusText}`); // Throw an error
        }
        return response.json(); // Return the response as JSON
    })
    .then((data) => { // Handle data received from the PredictHQ API
        console.log("PredictHQ API Response:", data); // Log the data received from the PredictHQ API to the console for debugging
        eventResults.innerHTML = ""; // Clear any previous event results

        if (data && data.results && data.results.length > 0) { // If the response contains event data
            data.results.forEach((event) => { // Loop through each event
                const eventHeader = document.createElement("h3"); // Create an <h3> element
                eventHeader.textContent = event.title;  // Set the text content of the <h3> element

                const eventDetails = document.createElement("p"); // Create a <p> element
                eventDetails.textContent = `Category: ${event.category}, Start Date: ${event.start}, End Date: ${event.end}`; // Set the text content of the <p> element

                const eventItem = document.createElement("li"); // Create an <li> element
                eventItem.appendChild(eventHeader); // Append the <h3> element to the <li> element
                eventItem.appendChild(eventDetails); // Append the <p> element to the <li> element
                eventResults.appendChild(eventItem); // Append the <li> element to the eventResults element
            }); // End of forEach loop
        } else {  // If the response does not contain event data
            // Display a message if no events are found
            eventResults.innerHTML = "<p>No events found.</p>"; // Set the text content of the <p> element
        }

        locationInput.value = ""; // Reset the location input field
        dateInput.value = new Date().toISOString().split('T')[0]; // Reset to today's date
    })
    .catch((error) => { // Handle errors
        console.error("Error fetching event data:", error); // Log the error to the console for debugging
        eventResults.innerHTML = "<p>Error fetching events. Please try again later.</p>";   // Set the text content of the <p> element
    });
}   // End of fetchEvents function
document.addEventListener("DOMContentLoaded", function () { // Event listener that triggers when the DOM content is fully loaded
    // Initialize modal first
    initializeModal(); // Initialize the modal

    // Initialize HTML elements by their IDs
    locationInput = document.getElementById("location"); // Input for location search
    categorySelect = document.getElementById("category"); // Select element for category
    distanceInput = document.getElementById("distance");  // Input for search radius
    dateInput = document.getElementById("date"); // Input for selecting date
    eventResults = document.getElementById("eventResults"); // Element to display event results

    function initMap() {
        // Initialize Google Places Autocomplete here
        const autocomplete = new google.maps.places.Autocomplete(locationInput);
        autocomplete.addListener("place_changed", function () {
            const selectedPlace = autocomplete.getPlace(); // Get the selected place
            const cityName = selectedPlace.name; // Get the city name from the selected place

            // You can then use cityName for further processing
            if (selectedPlace.geometry && selectedPlace.geometry.location) {    // Check if the selected place has location data
                const latitude = selectedPlace.geometry.location.lat(); // Get the latitude
                const longitude = selectedPlace.geometry.location.lng(); // Get the longitude

                // You can use the latitude and longitude values here
                console.log("Selected Latitude:", latitude); // Log the latitude and longitude to the console for debugging
                console.log("Selected Longitude:", longitude); 
            } else {
                console.log("No location data available for the selected place."); // Log to the console for debugging
            }

            // Check if the city name is empty and show the modal if it is
            if (!cityName.trim()) { // Check if the city name is empty
                showModal("Please enter a city name."); // Show the modal with an error message
                return; // Stop further execution of the function
            }
        });
    }
    
    // Initialize and set event listener for the search button
    const searchButton = document.getElementById("searchButton"); // Search button
    searchButton.addEventListener("click", function () { // Add event listener for click event
        // Obtain the city name from the location input field
        const cityName = locationInput.value; // Get the city name from the location input field
       // Inside the event listener for the search button
       const selectedCategory = categorySelect.value; // Get the selected category
       const maxDistance = distanceInput.value; // Get the maxDistance input value
       const selectedDate = dateInput.value; // Get the selected date input value
       
       // Check if the city name is empty and show the modal if it is
       if (!cityName.trim()) { // Check if the city name is empty
           showModal("Please enter a city name."); // Show the modal with an error message
           return; // Stop further execution
       }
       
       fetchLocationCoordinates(cityName) // Call fetchLocationCoordinates with the city name
           .then(() => { // Handle successful fetchLocationCoordinates
               if (latLng && latLng.lat && latLng.lon) { // Check if latLng is not null and has latitude and longitude values
                   // Get the current date in the user's local time zone
                   const today = new Date(); // Get the current date
       
                   // Parse the date input's value manually (assuming it's in YYYY-MM-DD format)
                   const dateValue = selectedDate.split('-'); // Use the selectedDate variable
                   const selectedDateObj = new Date(dateValue[0], dateValue[1] - 1, dateValue[2]); // Month is 0-based
       
                   // Set time to start of day for accurate date comparison
                   today.setHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0
                   selectedDateObj.setHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0
       
                   // Check if the selected date is in the past
                   if (selectedDateObj < today) { // Check if the selected date is in the past
                       showModal("The selected date is in the past. Please choose a future date."); // Show the modal with an error message
                       return; // Stop further execution
                   }
                   // Fetch events using the selected criteria
                   fetchEvents(latLng.lat, latLng.lon, selectedCategory, maxDistance, selectedDate); // Call fetchEvents with the latitude, longitude, category, distance, and date
               }    // End of if block for checking latLng 
               else {
                   // If latLng is null, show an error message
                   showModal("Error fetching location coordinates. Please try again later.");
               }    // End of if block for checking latLng
           })   // End of .then block for fetchLocationCoordinates
           .catch((error) => {
               // Handle errors from fetchLocationCoordinates
               console.error("Error in fetchLocationCoordinates:", error);
           });  // End of fetchLocationCoordinates
    });  // End of searchButton event listener
});  // End of DOMContentLoaded event listener