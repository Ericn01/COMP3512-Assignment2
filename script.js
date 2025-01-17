/**
* Course: COMP3512 (Web Development II)
* Author: Eric Nielsen
* Date: November 22, 2022
 */
// ===================================================== FETCHING JSON DATA FROM API ========================================================
// This function is responsible for fetching the required data from the given API. 
// The data for this project has been taken from (URL) and converted into a JSON format that is very similar to the one originally used in class.
// The JSON file that I am fetching contains 2300ish songs as opposed to only 317 
async function fetchData(){
    return (await fetch("https://api.npoint.io/754241399347bc042cba")).json(); // Courtesy of npoint.io for hosting the JSON Data
}
document.addEventListener("DOMContentLoaded", async() =>{
    let songs = getLocalStorage();
    function getLocalStorage(){
        return JSON.parse(localStorage.getItem('songs')) || "";
    }
    if (songs == ""){
        try{
            songs = await fetchData();
            const songsStringified = JSON.stringify(songs);
            localStorage.setItem('songs', songsStringified);
        } catch(error){
            console.log(error);
        }
    }
// ===================================================== MISCELLANEOUS FUNCTIONS ============================================================
const NUM_SONGS = songs.length;
/* 
*  Modifies the first character of every word in a string such that it is in uppercase form
*  Essentially has the same functionality as python's title() function.
*/
function upperCaseFirstChar(str){
    const stringArray = str.split(" ");
    let upperCaseFirstCharString = "";
    for (let elem of stringArray){
        upperCaseFirstCharString += (elem[0].toUpperCase() + elem.substring(1)) + " ";
    }
    return upperCaseFirstCharString;
}
/* Some of the songs in the JSON file have ridiculously long names due to the added parentheses that include unnecessary info 
*  This function will be used to remove the parentheses on songs that have the stated problem.
*/
function abbreviateSongTitle(songTitle){
    let shortenedTitle = "";
    const regex = /(\s(\(|\[|\-)[\d\:\w\s\.\-\&\+\,]+(\)|\]|)){1,}/i; // This was good regular expression practice. A few songs have brackets, parentheses, hyphens after them, and expand unnecessarily. This regex matches that and removes it.
    songTitle.includes('(') || songTitle.includes('-') || songTitle.includes("[") ? shortenedTitle = songTitle.replace(regex, "") : shortenedTitle = songTitle // Removes the matched text if the title is greater than 40 chars and matches the given regular expression
    return shortenedTitle;
}
/**
 * Converts a number of seconds into a formatted M:SS date
 * @param {} seconds the number of seconds to convert
 * @returns the formatted duration string
 */
function secondsToMin(seconds){
    let minutesNum = seconds / 60; // M.S...
    if (String(minutesNum).length === 1) {return minutesNum + ":00"}; // Condition if the seconds value is a multiple of 60.
    let secondsNum = String(minutesNum).substring(1) * 60;
    secondsNum < 10 ? secondsNum = "0" + String(Math.round(secondsNum, 0)) : secondsNum; // Appends a 0 to the start of values that are less than 10 
    return `${String(minutesNum).substring(0,1)}:${String(secondsNum).substring(0,2)} minutes`;
}
/* Autocompletes the title options after the user types in a certain amount of characters*/
function autocompleteTitles(){
    const datalistReference = this.list; // References the datalist element associated with the input
    if (this.value.length >= 2){ // Starts using autocomplete after 2 character have been typed
        const titleMatches = findMatches(this.value, songTitles);
        datalistReference.replaceChildren();
        for (let match of titleMatches){
            let option = document.createElement('option');
            option.textContent = match;
            datalistReference.appendChild(option);
        }
    }
}
/* Simple function that checks to see if the current user input string matches any of the song titles in the JSON file */
function findMatches(word, titles){
    const currentMatches = [];
    for(let title of titles){
        let stringTitle = String(title).toLowerCase(); // Includes function is casensitive so the word and string must have the same casing when compared
        if (stringTitle.includes(word.toLowerCase())){
            currentMatches.push(title);
        }
    }
    return currentMatches; // returns a sorted array of song matches
}

// ========================================================== SONG SEARCH PAGE ============================================================== 
/**
 * This function loads the select inputs in the song search page. 
 * @param {*} fieldName the name of the field that we are looking for in the json file
 */
// Set the default song view
switchView("SONG_SEARCH_VIEW");
// Define a few global variables (will be refactored later)
const songTitles = getSongAttributeArray("title"); // Loads all the song titles into an array
const songArtists = [...new Set(getSongAttributeArray("artist"))]; // This ensures that there are no duplicate values in the set. 
const titleInput = document.querySelector('#title-input');
const artistInput = document.querySelector("#artist-input");
// Adding event listeners to autocomplete these text inputs
titleInput.addEventListener('input', autocompleteTitles);
artistInput.addEventListener('input', autocompleteArtists);

// Adding a way to switch to song search view from anywhere 
document.querySelector("#search-view-btn").addEventListener('click', songInfoToSearchPageViewSwitch);
/* Switches the view from the song info page to the search page */
function songInfoToSearchPageViewSwitch(){
    switchView("SONG_SEARCH_VIEW");
}
// This function fills an array with the given attribute of a song in the json file and returns it.
// For the moment the supported attributes are 
function getSongAttributeArray(attributeName){
    const songAttributeArray = [];
    for (let song of songs){
        switch(attributeName){
            case "title":
            case "year":
                songAttributeArray.push(song[attributeName]);
                break;
            case "energy":
            case "valence":
            case "acousticness":
            case "speechiness":
            case "liveness":
            case "danceability":
                songAttributeArray.push(song['analytics'][attributeName]);
                break;
            case "artist":
            case "genre":
                songAttributeArray.push(song[attributeName]['name'].replace(/,[\s\w\d\,]+/, "")); // Returns the name of the genre or artist
                break;
            case "popularity":
            case "bpm":
                songAttributeArray.push(song['details'][attributeName]);
                break;
            default:
        }
    }
    return songAttributeArray; 
}

function autocompleteArtists(){
    const datalistReference = this.list; // References the datalist element associated with the input
    if (this.value.length >= 1){ // Starts using autocomplete after 1 character has been typed
        const artistMatches = findMatches(this.value, songArtists)
        datalistReference.replaceChildren();
        for (let match of artistMatches){
            let option = document.createElement('option');
            option.textContent = match;
            datalistReference.appendChild(option);
        }
    }
}

/* Add a event listener to every radio button */
const radioButtons = document.querySelectorAll(".search-form input[type='radio']");
const inputs = document.querySelectorAll(".search-form input, .search form select");
// Adding an event listener for the radio button 
for (let currentRadioBtn of radioButtons){
    currentRadioBtn.addEventListener('change', disableInputs);
}
/* Disables all of the inputs that aren't associated with the currently selected radio button*/
function disableInputs(){
    if (this.checked){
        let radioType = String(this.id.replace("-radio", ''));
        for (let input of inputs){
            if (!input.id.includes(radioType) && input.type != "radio"){
                disableEnableInputBehavior(input, 'disabled');
            }
            else if(input.id.includes(radioType)){
                disableEnableInputBehavior(input, 'enabled');
            }
        }
    }
}
// Defines the behavior of the given input depending on the state that is passed (enabled or disabled)
function disableEnableInputBehavior(input, state){
    if (state == 'disabled'){
        input.style.color = 'gray';
        input.style.backgroundColor = 'rgba(0,0,0,0.050)';
        input.disabled = true;
    }
    else if (state == 'enabled'){
        input.style.color = 'white';
        input.style.backgroundColor = 'transparent';
        input.disabled = false;
    }
    else{
        console.log("Invalid state parameter passed");
    }
}
const numberInputs = document.querySelectorAll('input[type="number"]');
for (let input of numberInputs){
    input.addEventListener('click', numberHandling);
}
/**
 * This function handles number inputs by deciding which one should be enabled/disabled.
 */
function numberHandling(){
    const yearLessInput = numberInputs[0];
    const yearGreaterInput = numberInputs[1];
    const popularityLessInput = numberInputs[2];
    const popularityGreaterInput = numberInputs[3];
    const selectedInputId = this.id;
    switch(selectedInputId){
        case "year-less-input":
            disableEnableInputBehavior(yearLessInput, 'enabled');
            disableEnableInputBehavior(yearGreaterInput, 'disabled'); // Disables the 'greater than' year input
            break;
        case "year-greater-input":
            disableEnableInputBehavior(yearLessInput, 'disabled');
            disableEnableInputBehavior(yearGreaterInput, 'enabled'); // Disables the 'less than' year input
            break;
        case "popularity-less-input":
            disableEnableInputBehavior(popularityLessInput, 'enabled');
            disableEnableInputBehavior(popularityGreaterInput, 'disabled'); // Disables the 'greater than' popularity input
            break;
        case "popularity-greater-input":
            disableEnableInputBehavior(popularityLessInput, 'disabled');
            disableEnableInputBehavior(popularityGreaterInput, 'enabled')  // Disables the 'less than' popularit input
            break;
        default:
    }
}

// This function is responsible for populating the select elements with options in the song search.
function loadSelectOptions(fieldName){
    const field = fieldName;
    const selectionId = fieldName += '-select';
    let selectElement = document.getElementById(selectionId);
    let fieldContainer = [];
    if (selectElement.options.length === 0){ // This should only be run once, when clicked. 
        for (let currentSong of songs){ 
            let optionText = upperCaseFirstChar(currentSong[field]["name"])
            if (!fieldContainer.includes(optionText)){ // Ensures that there are no duplicates 
                fieldContainer.push(optionText);
                let optionValue = currentSong[field]["name"]; 
                const songOption = document.createElement("option");
                songOption.style.color = 'black'; // Able to see the select options
                songOption.text = fieldContainer[fieldContainer.length - 1]; // adds the element that we just pushed into the array
                songOption.value = optionValue;
                selectElement.appendChild(songOption);
            }
        }
        
    }
}
    // Load the select elements with data upon clicking.
    document.querySelector("#genre-select").addEventListener('click', loadSelectOptions("genre"));
    function populateRow(parentElement, attribute, songObj){
        const cellElement = document.createElement("td");
        if (attribute == 'artist' || attribute == 'genre'){
            cellElement.textContent = upperCaseFirstChar(songObj[attribute]['name']);
        }
        else if (attribute == 'details'){
            cellElement.textContent = songObj[attribute]['popularity'] + "%";
        }
        else{
            if (attribute == 'title'){
                cellElement.value = songObj["song_id"];
                cellElement.textContent = abbreviateSongTitle(String(songObj['title']));
            }
            else{ 
                cellElement.textContent = songObj[attribute];
            }
        }
        cellElement != 'details' ? cellElement.className = attribute : cellElement.className = 'popularity'; // setting the class name of the cell element
        parentElement.appendChild(cellElement);
    }
    function populateSongs(results){ // Should run in O(nlog(n)) time since the inner loop has a fixed length. Not great, but could be worse
        const resultsBody = document.querySelector("#results-body")
        // Clears the table if elements are already present
        if (resultsBody.hasChildNodes()){
            resultsBody.innerHTML = "";
        }
        const labels = ['title', 'artist', 'year', 'genre', 'details'];
        let songRow;
        for(let song of results){
            songRow = document.createElement("tr");
            for (let i = 0; i < labels.length; i++){
                populateRow(songRow, labels[i], song);
            }
        resultsBody.appendChild(songRow); // Appends the current row to the table body
        }
        trackResults(); // This function adds an event listener to all the title elements from our search results
    }
    // Table "link" click 
    function trackResults(){
        let tableLinks = document.querySelectorAll(".title"); // NodeList of all titles
        for (let link of tableLinks){
            link.addEventListener('click', displaySongInformation);
        }
    }
    populateSongs(songs);
    document.querySelector("#clear-btn").addEventListener("click", (e) => {
        e.preventDefault();
        for (let currentInput of inputs){
            if (currentInput.type === 'text' || currentInput.type === 'number'){
                currentInput.value = "";
            }
        }
    });
    document.querySelector("#submit-btn").addEventListener("click", (e) => {
            // retrieving data from the button
            let id = e.target.getAttribute('data-id');
            // get song object from the button
        }
    );

    // Form data handling section
    // Populates the results table with all songs
    const submitBtn = document.querySelector('#submit-btn');
    submitBtn.addEventListener('click', displayResults);
    
    // appends the given input value to the given array 
    function pushInputValue(inputName, arr){
        const value = document.querySelector(`#${inputName}`).value;
        arr.push(value);
    }
    /**
     * Searches for and returns the id value of the * radio button that is checked.
     * @returns the id of the form radio button that is * currently selected
     */
    function getSelectedRadioButtonId(){
        let selectedRadioId;
        for (let currentRadioButton of radioButtons){
            if (currentRadioButton.checked == true){
                selectedRadioId = currentRadioButton.id;
            }
        }
        return selectedRadioId;
    }
    // This function is responsible for processing the data sent through the form
    function getSearchResults(){
        // Prevents a page reload when we submit the form.
        document.querySelector("#song-form").addEventListener('submit', e => e.preventDefault());        
        const selectedRadioId = getSelectedRadioButtonId();
        const searchParameters = []; // Array containing the search parameters 
        let searchAttribute = ""; // The attribute that the search is going by
        // Different logic will be applied depending on the selected radio button 
        switch(selectedRadioId){
            case "title-radio":
                pushInputValue("title-input", searchParameters);
                searchAttribute = "title";
                break;
            case "artist-radio":
                pushInputValue("artist-input", searchParameters);
                searchAttribute = "artist";
                break;
            case "genre-radio":
                pushInputValue("genre-select", searchParameters);
                searchAttribute = "genre";
                break;
            case "year-radio":
                if (!numberInputs[0].disabled){
                    pushInputValue("year-less-input", searchParameters);
                }
                else{
                    pushInputValue("year-greater-input", searchParameters);
                }
                searchAttribute = "year"
                break;
            case "popularity-radio":
                if (!numberInputs[2].disabled){
                    pushInputValue("popularity-less-input", searchParameters);
                }
                else{
                    pushInputValue("popularity-greater-input", searchParameters);
                }
                searchAttribute = "popularity";
                break;
            default:
        }
        const searchResults = findResults(searchParameters, searchAttribute, songs); // Returns the results of the search query
        return searchResults;
    }
    /* Displays the search results */
    function displayResults(){
        const searchResults = getSearchResults();
        populateSongs(searchResults);
    }
    /**
     * Finds and returns the results of a search on the JSON file based on the given parameters
     * @param {*} valuesArr the array containing the search parameter values
     * @param {*} searchAttribute the attribute that the file is being searched by
     * @param {*} songObj the object that is being parsed through
     * @returns an array of song objects that meet the given criteria 
     */
    function findResults(valuesArr, searchAttribute, songObj){
        const results = [];
        const userValue = valuesArr[0];
        // Loop through the song objects array
        for (let song of songObj){
            if (searchAttribute == 'title' && String(song['title']).toLowerCase().includes(userValue.toLowerCase())){ // Includes function is case sensitive!
                    results.push(song);
                }
            else if ((searchAttribute =='artist' || searchAttribute == 'genre') && (song[searchAttribute]['name'].includes)(userValue)){
                    results.push(song);
                }
            else if (searchAttribute == 'popularity' || searchAttribute == 'year'){
                if (searchAttribute == "year"){ 
                    const songYear = Number(song[searchAttribute]); // The current song's popularity
                    if (numberInputs[0].disabled){ // Search was based on the 'less' parameter for the year
                        if (Number(userValue) < songYear){
                            results.push(song);
                        }
                    }
                    else{ // search is based on greater than parameter
                        if (Number(userValue) > songYear){
                            results.push(song);
                        }
                    }
                }
                else{ // Search attribute is year
                    const songPopularity = Number(song["details"][searchAttribute]); // The current song's popularity
                    if (numberInputs[2].disabled){// Search is based on the 'less parameter' for for year attribute
                        if (Number(userValue) < songPopularity){
                            results.push(song);
                        }
                    }
                    else{ // search is based on greater than parameter
                        if (Number(userValue) > songPopularity){
                            results.push(song);
                        }
                    }
                }
            }
            else if (searchAttribute == ""){
                console.log("No search attribute has been chosen");
        }
        }
        return results;
    }
// Receive all of the sort buttons, and add an event listener to sort them.
const sortButtons = document.querySelectorAll(".sort");
for (let i =0; i < sortButtons.length; i++){
    sortButtons[i].addEventListener('click', sortTableByAttribute);
}
// Sorts the table by the given attribute 
function sortTableByAttribute(){
    // The attribute that we are sorting by
    const attribute = this.id;
    styleSortButton(this) // reference to the button we pressed.
    const changedAttribute = attribute.substring(0, attribute.match(/[-][\w]{1,}/i).index);
    const sortOrder = getSortOrder(attribute);
    // First and foremost we need to receive the search results.
    const results = getSearchResults();
    const sortedResults = resultSort(changedAttribute, results, sortOrder);
    populateSongs(sortedResults);
}
function styleSortButton(sortBtn){
    sortBtn.style.color = "#ff7f50";
    sortBtn.style.textShadow = '2px 2px 4px black';
    for (btn of sortButtons){
        if (btn.id !== sortBtn.id){
            btn.style.color = "white";
            btn.style.border = "none";
            btn.style.textShadow = "";
        }
    }
}
function getSortOrder(sortId){
    return sortId.includes("desc") ? sortOrder = 'descending' : sortOrder = 'ascending';
}
/* Sorts the search table based on the attribute that is clicked*/
function resultSort(attribute, unsortedResults, order){
    let sortedResults = ""
    if (attribute === 'year'){
        sortedResults = unsortedResults.sort((a, b) => a['year'] - b['year']); 
    }
    else if (attribute === 'popularity'){
        sortedResults = unsortedResults.sort((a,b) => a['details']['popularity'] - b['details']['popularity']);
    }
    else if (attribute === 'genre' || attribute === 'artist'){
        sortedResults = unsortedResults.sort((a,b) => a[attribute]['name'].localeCompare(b[attribute]['name']));
    }
    else if (attribute === 'title'){
        sortedResults = unsortedResults.sort((a,b) => String(a[attribute]).localeCompare(String(b[attribute]))); // the few titles that are encoded as numbers gave me quite a headache with this one...
    }
    else{
        console.log("error occured while sorting - attribute does not exist");
        return;
    }  
    return order == 'ascending' ? sortedResults : sortedResults.reverse(); // If the user selected ascending order, then return the ascended sorted results, else return the reverse
}

// Adds a random placholder title to the title input space when the page loads
const titlePlaceholder = document.querySelector("#title-input");
titlePlaceholder.placeholder = `${songTitles[Math.floor(Math.random() * songs.length)]}`; // Math random -> (0-1) * number of songs (decimals included) -> math.floor to make value an integer
const artistPlaceholder = document.querySelector("#artist-input");
artistPlaceholder.placeholder = `${songArtists[Math.floor(Math.random() * songArtists.length)]}`;

// ================================================================== END OF SECTION =======================================================================

// ======================================================== SONG INFORMATION PAGE =========================================================== 
/**
 * This function is responsible for filling the song information view with the given information.
 */
function displaySongInformation(){
    const id = this.value; // the ID of the song element that was clicked
    const songData = getSongAttributes(id);
    switchView("SONG_INFORMATION_VIEW"); // Switches the view 
    makeSongInformation(songData);
    makeChart(songData); 
}
/* Returns an array of song attributes*/
function getSongAttributes(id){
        let songId = id; // the value of the link element (song id)
        const songAttributes = [];
        for (let song of songs){
            if (songId === song['song_id']){ // Linear search through the songs object to see if the link id is equal to the current song id
                songAttributes.push(song['analytics']); // Retrieves the analytics of the given song. 
                songAttributes.push(song['details']); // Retrieves addional details of the song.
                songAttributes.push(song['title']);
                songAttributes.push(song['artist']);
                songAttributes.push(song['genre']);
                songAttributes.push(song['year']);
                break;
            }
        }
    return songAttributes;
}
/**
 * This function draws a radar chart that displays the song's analytics data.
 * @param {*} songData the required data of the song that the user is searching for
 */
function makeChart(songData){
    const analyticValues = songData[0]; // The analytics object is wrapped in an array of length 1, hence index 0 to access it
    const labels = ['Energy', 'Valence', 'Liveness', 'Speechiness', 'Acousticness', 'Danceability'];
    const parentNode = document.querySelector('.chart');
    // To redraw on the canvas we must first destroy the old one. If this isn't done, JS throws an error
    const canvas = document.querySelector("#song-chart")
    parentNode.removeChild(canvas);
    // Create a new canvas to draw the chart on 
    const newCanvas = document.createElement("canvas");
    newCanvas.id = "song-chart";
    // Append the new canvas onto the chart container (parent node)
    parentNode.appendChild(newCanvas);
    const ctx = newCanvas.getContext('2d');
    // Default comparison song values
    const data = {
        labels: labels,
        datasets: [ {
        label: `${songData[2]}`, // Song title value
        data: [analyticValues.energy, analyticValues.valence, analyticValues.liveness, 
                analyticValues.speechiness, analyticValues.acousticness, analyticValues.danceability],
        fill: true,
        tension: 0.15,
        backgroundColor: "rgba(25, 255, 25, 0.25)",
        borderColor: "rgba(25,255,25,1)",
        pointBackgroundColor: "rgba(25,255,25,1)",
        pointBorderColor: "white",
        pointRadius: 4
        },
        /* Default song to compare to - For now I'll be using Alarm, but I'd like to add functionality such that the user can choose the songs to compare, up to 3 songs */
        {
            label: `Overall Average`,
            data: songAnalyticsAverageValues, /* The average values of all songs combined in the DB */
            fill: true,
            tension: 0.15,
            backgroundColor: "rgba(179,181,198,0.25)",
            borderColor: "rgba(179,181,198,1)",
            pointBackgroundColor: "rgba(179,181,198,1)",
            pointBorderColor: "white",
            pointRadius: 4
        }
    ]
    };
    const songChart = new Chart(ctx, {
    type: 'radar',
    data: data,
    options: {
        plugins: {
            legend:{
                display: true,
                labels: {color: "white"},
            },
            title: {
                display: true,
                text: `'${songData[2]}'` + " Radar View",
                align: 'center',
                color: 'white',
                font:{
                    family: 'serif',
                    color: 'snow',
                    size: 18,
                    weight: 'bold'
                }
            }
        },
        scales: {
            r: {
                ticks: {
                    color: "white",
                    backdropColor: "transparent",
                    textStrokeWidth: 5,
                    font:{
                        family: 'serif',
                        size: 13
                    }
                },
                pointLabels: {
                    color: 'white',
                    font:{
                        family: 'serif',
                        size: 14,
                        weight: 'bold'
                    }
                },
                grid: {
                    circular: true,
                    color: "white"
                },
                suggestedMin: 0,
                //suggestedMax: 100
            }
        },
        responsive: true,
        elements: {
            line: {
                borderWidth: 2
            }
        }
    }
    }); 
}
/* Calculates and returns the average of all analytic values for all songs in the JSON file. May be computationally on smartphones */
function getSongAnalyticAverages(){
    const analyticAverages = new Array(6).fill(0); // Creates an array of length 6 with values 0
    for (let i = 0; i < NUM_SONGS; i++){
        const songAnalytics = Object.values(songs[i]['analytics']); // Analytics array containing values of current song object 
        let analyticIndex = 0;
        songAnalytics.forEach((value) => {
            analyticAverages[analyticIndex] += value;
            analyticIndex++;
        });
    }
    let count = 0;
    while (count < analyticAverages.length){ // Haven't used a while loop for a while, just felt like using it now :)
        analyticAverages[count] /= NUM_SONGS;
        analyticAverages[count] = Math.round(analyticAverages[count], 1);
        count++;
    }
    return analyticAverages;
}
const songAnalyticsAverageValues = getSongAnalyticAverages(); // only called on a page refresh
/* Generates the markup for displaying song information */
function makeSongInformation(songData){
    const bpm = Math.round(songData[1].bpm, 0); const bpmRanking = findRanking(bpm,"bpm");
    const popularity = Math.round(songData[1].popularity); const popularityRanking = findRanking(popularity, "popularity");
    const energy = Math.round(songData[0].energy); const energyRanking = findRanking(energy, "energy");
    const valence = Math.round(songData[0].valence); const valenceRanking = findRanking(valence, "valence");
    const acousticness = Math.round(songData[0].acousticness); const acousticnessRanking = findRanking(acousticness, "acousticness");
    const speechiness = Math.round(songData[0].speechiness); const speechinessRanking = findRanking(speechiness, "speechiness");
    const liveness = Math.round(songData[0].liveness); const livenessRanking = findRanking(liveness, "liveness");
    const danceability = Math.round(songData[0].danceability); const danceabilityRanking = findRanking(danceability, "danceability");
    makeDetailsBox(songData)    
    const headings = ["BPM 🏃", "Popularity 📈", "Energy 🔋", "Valence 😃", "Acousticness 🎶", 
    "Speechiness 👄", "Liveness ✨", "Danceability 🕺"]
    const analytics = [bpm, popularity, energy, valence, acousticness, speechiness, liveness, danceability];
    const analyticsRanking = [bpmRanking, popularityRanking, energyRanking, valenceRanking, acousticnessRanking, speechinessRanking, livenessRanking, danceabilityRanking];
    const dataBoxes = document.querySelectorAll(".analysis");
    for (let i = 0; i < dataBoxes.length; i++){
        makeAnalyticsBoxMarkup(headings[i], analyticsRanking[i], analytics, dataBoxes[i]);
    }
}

function makeDetailsBox(songData){
    const detailsBox = document.querySelector(".song-details");
    detailsBox.id = 'details-box'
    if (detailsBox.hasChildNodes()){
        detailsBox.textContent = "";
    }
    // Song title heading setup
    const title = songData[2]; // The song's title
    const year = songData[5]; // The song's release date 
    const songTitleHeading = document.createElement("h1");
    songTitleHeading.className = 'song-title'; 
    songTitleHeading.textContent = `${title} (${year})`;
    // Artist name setup
    const artist = songData[3]['name'];
    const artistNameBox = document.createElement("h3");
    artistNameBox.textContent = `Produced by ${artist}`;
    // Genre name & duration setup
    const genre = songData[4]['name'];
    const duration = secondsToMin(songData[1].duration);
    // Creating the 'add to playlist button'
    const songPlaylistButton = document.createElement("button");
    songPlaylistButton.textContent = 'Add to Playlist';
    songPlaylistButton.className = 'playlist-add';
    songPlaylistButton.id = songData[2]; // The second index of song data refers to the current song's title 
    songPlaylistButton.addEventListener('click', makePopupBox);
    // Setting up the duration and genre data 
    const durationGenreBox = document.createElement("h3")
    let genreEmoticon = getGenreEmoticon(genre);
    durationGenreBox.textContent = `${duration} | ${upperCaseFirstChar(genre)} ${genreEmoticon}`
    // Appending all the child elements
    detailsBox.appendChild(songTitleHeading);
    detailsBox.appendChild(artistNameBox);
    detailsBox.appendChild(durationGenreBox);
    detailsBox.appendChild(songPlaylistButton);
}
/** Associates an emoticon with the specified genre name and returns it. Simple function added for fun. */
function getGenreEmoticon(genreName){
    let shortenedGenre = getShortenedGenreName(genreName);
    // There could have been many ways to do this, but I feel as though this is the clearest syntatictally
    const emotes = {
        "dance pop": "💃",
        "pop": "🥂",
        "puerto rican pop": "🇵🇷",
        "canadian": "🇨🇦",
        "australian": "🇦🇺",
        "argentina": "🇦🇷",
        "germany": "🇩🇪",
        "colombia": "🇨🇴",
        "italian": "🇮🇹",
        "atl hip hop": "🧨",
        "indie": "🧑",
        "rock": "🎸",
        "reggaeton": "😌",
        "hip hop": "🔥",
        "emo rap": "😢",
        "folk-pop": "🌿",
        "permanent wave": "🔮",
        "alaska wave": "🏴󠁵󠁳󠁡󠁫󠁿",
        "neo mellow": "🛀",
        "house": "🏠",
        "french indie pop": "🇫🇷",
        "danish pop": "🇧🇪",
        "hollywood": "🎥",
        "grime": "🎹",
        "rap": "🎤",
        "r&b": "🎷",
        "cali rap": "🏖️",
        "melodic rap": "🎵",
        "art pop": "🎨",
        "brostep": "🏍️",
        "boy band": "🎢", 
        "alt z": "🤳",
        "country": "🐎",
        "latin": "🇲🇽",
        "afro": "🦱",
        "complextro": "🚀",
        "dreamo": "💭",
        "none given": "🤷‍♂️"
    };
    let emote = emotes[shortenedGenre];
    if (emote === undefined){
        emote = "";
    }
    return emote;
}

function getShortenedGenreName(genreName){
    let shortenedGenre = genreName.toLowerCase();
    // There are wayyyy too many genres to have an emoji for each one, so I'm creating a funnel of specificity to catch most cases
    if (genreName.includes("pop")){
        shortenedGenre = "pop";
    }if (genreName.includes("hip hop")){
        shortenedGenre = "hip hop"
    }if (genreName.includes("dance pop")){
        shortenedGenre = "dance pop"
    }if (genreName.includes("rap")){
        shortenedGenre = "rap";
    }if (genreName.includes("r&b")){
        shortenedGenre = "r&b";
    }
    if (genreName.includes("rock")){
        shortenedGenre = "rock";
    }if (genreName.includes("country")){
        shortenedGenre = "country";
    }if (genreName.includes("rap")){
        shortenedGenre = "rap";
    }if (genreName.includes("drill")){
        shortenedGenre = "drill";
    }if (genreName.includes("alt") || genreName.includes("indie")){
        shortenedGenre = "alt";
    }if (genreName.includes("afro")){
        shortenedGenre = "afro";
    }if (genreName.includes("canadian")){
        shortenedGenre = "canadian";
    }if (genreName.includes("itali")){
        shortenedGenre = 'italian';
    }if (genreName.includes("australian") || genreName.includes("aussie")){
        shortenedGenre = "australian";
    }if (genreName.includes('argentin')){
        shortenedGenre = 'argentina'
    }if (genreName.includes("german") || genreName.includes("dutch")){
        shortenedGenre = "germany"
    }if (genreName.includes("colombia")){
        shortenedGenre = "colombia"
    }if (genreName.includes("latin") || genreName.includes("mexico")){
        shortenedGenre = "latin";
    }
    return shortenedGenre;
}
function rankFormat(rank){
    return `Rank: #${rank + 1}`;
}
function makeAnalyticsBoxMarkup(heading, dataRankings, data, dataBox){
    if (dataBox.hasChildNodes()){
        dataBox.textContent = "";
    }
    // Create the header for the specified analytic
    const headingMarkup = document.createElement("h2");
    headingMarkup.textContent = heading;
    // Create the progress bar 
    const progressBar = makeAnalyticsProgressBar(dataRankings);
    // Create and display the ranking of the specified attribute 
    const dataMarkup = document.createElement("h1");
    dataMarkup.textContent = rankFormat(dataRankings);
    // Song attribute value and context 
    const context = document.createElement('p');
    context.textContent = getSongAttributeContext(heading, data)['attribute_context'];
    // Append children elements
    dataBox.appendChild(headingMarkup);
    dataBox.appendChild(context);
    dataBox.appendChild(progressBar);
    dataBox.appendChild(dataMarkup);
    dataBox.title = getSongAttributeContext(heading, data)['attribute_title']; // The first element that this function returns is 
}

function getSongAttributeContext(attribute, data){
    let attributeTitle = ''
    let attributeContext = ''
    let cleanedAttribute = attribute.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '').toLowerCase().trim(); // removes the emoji from the given attribute. Regex taken from StackOverflow
    switch(cleanedAttribute){
        case 'bpm':
            attributeTitle = 'BPM (Beats per minute) refers to the tempo of the song.';
            attributeContext = `Runs at ${data[0]} beats per minute.`;
            break;
        case 'popularity':
            attributeTitle = 'Popularity refers to how popular this song is relative to others. ';
            attributeContext = getAttributeContext(cleanedAttribute, data, 1);
            break;
        case 'energy':
            attributeTitle = 'Energy represents the amount of energy and activity in the song.';
            attributeContext = getAttributeContext(cleanedAttribute, data, 2);
            break;
        case 'valence':
            attributeTitle = 'Valence describes the musical positiveness conveyed by the song.'
            attributeContext =  getAttributeContext(cleanedAttribute, data, 3);
            break;
        case 'acousticness':
            attributeTitle = 'Acousticness is a confidence measure of whether or not a song is acoustic';
            attributeContext = getAttributeContext(cleanedAttribute, data, 4);
            break;
        case 'speechiness':
            attributeTitle = 'Speechiness detects the presence of spoken words in song.';
            attributeContext = getAttributeContext(cleanedAttribute, data, 5);
            break;
        case 'liveness':
            attributeTitle = 'Liveness is an estimate of how much audience noise is in the recording.'
            attributeContext = getAttributeContext(cleanedAttribute, data, 6);
            break;
        case 'danceability':
            attributeTitle = 'Danceability describes the suitability of a track for dancing';
            attributeContext = getAttributeContext(cleanedAttribute, data, 7);
            break;
        default:
    }
    return {"attribute_title": attributeTitle, "attribute_context": attributeContext};
}
function getAttributeContext(attribute, data, index){
    attributeValue = data[index];
    return `Has a ${attribute} value of ${attributeValue}%.`;
}
/**
 * Returns a certain color based on the given progress bar value
 * @param {*} value the given 
 * @returns the color of the progress bar 
 */
function progressBarColor(value){
    const rankingPercent = (value / NUM_SONGS) * 100;
    let color = "#ff0d0d";
    if (rankingPercent <= 15.0){
        color = '#ff4e11';
    }
    else if (rankingPercent >= 15.0 && rankingPercent < 35.0){
        color = "#ff8e15";
    }
    else if (rankingPercent >= 35.0 && rankingPercent < 65.0){
        color = '#fab733';
    }
    else if (rankingPercent >= 65.0 && rankingPercent < 85.0){
        color = '#abc334';

    }
    else if (rankingPercent >= 85.0 && rankingPercent <= 100.0){
        color = "#69b34c";
    }
    return color;
}
/**
 * Draws a custom progress bar based on the given ranking
 * @param {} value the ranking of the specified attributed of the given song
 * @returns the progress bar element
 */
function makeAnalyticsProgressBar(value){
    const numSongs = songs.length;
    const pixelWidth = 175;
    const absoluteValue = Math.abs(Number(value) - numSongs);
    const progress = document.createElement('div');
    progress.dataset.label = "";
    progress.className = "progress";
    progress.max = numSongs;
    progress.value = absoluteValue; // Lower rankings end up higher on the progress bar
    const width = (absoluteValue / numSongs) * pixelWidth;
    const color = progressBarColor(absoluteValue);
    progress.style = `--width:${width}px; --inputted-color:${color}`;
    return progress;
}
// Adding an event listener to the table sort buttons


// ========================================================= START OF 'ADD SONG TO PLAYLIST' FUNCTIONALITY ======================================================
/* Adds event listeners to see if the popup box should be closed. */
function closePopupBoxCheck(songTitle){
    const popupElement = document.querySelector(".playlist-add-div");
    popupElement.addEventListener('click', (e) => {
        const popupButton = document.querySelector("#popup-btn");
        if (popupButton.contains(e.target)){
            addSongToPlaylist(songTitle, 'playlist-add-div');
            setTimeout(() => {
                document.querySelector(".song-info").removeChild(popupElement);
            }, 2000)
        }
    }); 
}
/* Creates a popup box that allows the user to select what songs */
function makePopupBox(){
    const songTitle = this.id 
    // Setup the playlist popux box
    const playlistAddBox = document.createElement("div");
    playlistAddBox.className = "playlist-add-div";
    // Create the heading for the popup box
    const heading = document.createElement("h2");
    heading.textContent = `Add '${songTitle}' to: `;
    playlistAddBox.appendChild(heading);
    // Get and append the playlist selections
    const playlistNamesBox = getPlaylistNamesBox(abbreviateSongTitle(songTitle));
    playlistAddBox.appendChild(playlistNamesBox);
    // Make a button to submit the user input 
    const submitSelectionButton = document.createElement("button");
    submitSelectionButton.id = 'popup-btn'
    submitSelectionButton.textContent = "Submit";
    playlistAddBox.appendChild(submitSelectionButton);
    // Appends the popup box to the song info
    document.querySelector(".song-info").appendChild(playlistAddBox);
    closePopupBoxCheck(songTitle); // Adds an event listener to see if the popup box should be closed
}
/**
 * Generates and returns a div that allows the user to select the playlist(s) that he wants to add the current song to.
 * @param {*} songTitle 
 */
function getPlaylistNamesBox(songTitle){
    const outerContainer = document.createElement("div");
    outerContainer.className = 'checkbox-outer-container';
    for (playlist of playlists){
        // Playlist checkbox 
        const playlistCheckbox = document.createElement("input");
        playlistCheckbox.setAttribute("type", "checkbox");
        playlistCheckbox.name = 'playlist-checkbox';
        playlistCheckbox.className = 'playlist-checkbox';
        playlistCheckbox.id = playlist.name;
        // Label associated to given checkbox
        const label = document.createElement("label")
        label.setAttribute("for", "playlist-checkbox");
        label.textContent = playlist['name'];
        // playlist checkbox container
        const checkboxContainer = document.createElement("div");
        checkboxContainer.append(playlistCheckbox, label);
        // Logic on whether or not the user can add the given song to a playlist 
        let songAlreadyInPlaylist;
        for (let song of playlist['songs']){
            song['title'] === songTitle ? songAlreadyInPlaylist = true : songAlreadyInPlaylist = false;
            if (songAlreadyInPlaylist){
                playlistCheckbox.disabled = true;
                label.style.textDecoration = "line-through";
                label.title = "Song is already in this playlist!";
            }   
        }
        // Append to the outer container
        outerContainer.appendChild(checkboxContainer);
    }
    return outerContainer;
}
// adds a song to the selected playlists
function addSongToPlaylist(songTitle, className){ 
    const checkboxes = document.querySelectorAll(`.${className} input[type='checkbox']`);
    const playlistSelection = [];
    for (checkbox of checkboxes){
        if (checkbox.checked){
            playlistSelection.push(checkbox.id) // checkbox id contains the name of the given playlist
        }
    }
    addToPlaylistSuccessTransition(songTitle, playlistSelection);
}
/* Counts the number of playlists that the given song was added to */
function addToPlaylistSuccessTransition(songTitle, playlistSelection){
    let addedCount = 0;
    for (playlistName of playlistSelection){
        const playlistMatch = findPlaylist(playlistName);
        const songMatch = findSong(songTitle);
        playlistMatch["songs"].push(songMatch);
        addedCount++;
    }
    storePlaylists(); // Updates the playlist cookie 
    // Let the user know that the song was added to the given playlists
    const parent = document.querySelector(".playlist-add-div")
    parent.removeChild(document.querySelector("#popup-btn"));
    const success = document.createElement("h3");
    success.textContent = `${songTitle} was succefully added to ${addedCount} playlists.`
    success.style.textShadow = '1px 1px 2px black';
    success.id = 'playlist-add-success';
    parent.appendChild(success);
}
// ============================================================ END OF 'ADD TO PLAYLIST' FUNCTIONALITY ====================================================================

// SORTING SONGS TO FIND THEIR RANKING 
function sortAttribute(attribute){
    const generalAttributeArray = getSongAttributeArray(attribute);
    switch(attribute){
        // === ANALYTICS & DETAILS ATTRIBUTES (NUMBERS) === 
        case "energy":
        case "valence":
        case "acousticness":
        case "speechiness":
        case "liveness":
        case "danceability":
        case "bpm":
        case "popularity":
            generalAttributeArray.sort((a,b) => a-b); // Sorts by ascending order for number values
            break;
        // === ARTIST, GENRE, Title ===
        case "artist":
        case "genre":
        case "title":
            generalAttributeArray.sort(); // Sorts alphabetically -> numbers and symbols will come first
            break;
        default:
    }
    return generalAttributeArray;
}
function findRanking(attributeValue, attributeName){
    const sortedAttributeArray = sortAttribute(attributeName).reverse(); // The ranking is based on the index of the song, so we want numerical values in descending order
    let ranking = 0;
    for (let i = 1; i <= sortedAttributeArray.length; i++){
        if (attributeValue === sortedAttributeArray[i]){
            ranking = i;
        }
    }
    return ranking;
}

// ================================================================== END OF SECTION =======================================================================

// ======================================================== PLAYLIST INFO SECTION ============================================================== 
let playlists = []; // empty array for now
// Note --> Adding the necesary event listeners
document.querySelector("#playlist-view-btn").addEventListener('click', displayPlaylists);
document.querySelector("#playlist-view-btn").addEventListener('click', makePlaylistDetails);
// Creating some template playlist objects for testing - this only occurs if no playlist are stored in local storage yet. This should only be possible on the user's first login
if (!getPlaylistStoredData()){
    makePlaylist("Country Songs 🤠", [findSong("memory"), findSong("wasted on you"), findSong("more than my hometown"), findSong("tequila"), findSong("sand in my boots"), findSong("10,000 Hours (with Justin Bieber)")]);
    makePlaylist("Old Christmas Tunes 🎄", [findSong("jingle bell rock"), findSong("white christmas"), findSong("rudolph the red-nosed reindeer"), findSong("baby, it's cold outside")]);
    makePlaylist("Most Popular Songs 🚀", [findSong("beggin'"), findSong("good 4 u"), findSong("save your tears"), findSong("lose you to love me"), findSong("bad habits")]);
    makePlaylist("Club Tracks 🕺", [findSong("give me everything"), findSong("Party Rock Anthem"), findSong("time of our lives"), findSong("electricity (with dua lipa)"), findSong("astronomia"), findSong("Juju on That Beat (TZ Anthem)")]);
    storePlaylists();
}
// If the user has playlists already, then we're just going to load them from local storage
else {
    playlists = getPlaylistStoredData();
}
function getPlaylistStoredData(){
    const playlistData =  JSON.parse(localStorage.getItem("playlists"));
    return playlistData
}
// creates a new playlist and appends it to the playlists array
function makePlaylist(name, songs){
    if (checkPlaylistName(name)){
        const playlist = {
            "name" : name,
            "songs": songs,
        };
        playlists.push(playlist);
        storePlaylists();
    }
    else{
        console.log(`The playlist called ${name} was not inserted because it already exists`);
    }
}
/* Converts current playlist */
function storePlaylists(){
    localStorage.setItem("playlists", JSON.stringify(playlists));
}

function checkPlaylistName(name){
    for (let p of playlists){
        if (p['name'].trim().toLowerCase() === name.trim().toLowerCase()){
            return false;
        }
    }
    return true;
}
// Make random song playlist. Cap number of 
function makeRandomPlaylist(name, numSongs){
    const randomPlaylistSongs = [];
    let count = 0;
    while (count < numSongs){
        const randomIndex = Math.floor(Math.random() * NUM_SONGS);
        const randomSong = songs[randomIndex];
        randomPlaylistSongs.push(randomSong);
        count++;
    }
    playlists.push({"name" : name, "songs": randomPlaylistSongs})
}
/**
 * Finds and returns the song with the given title
 * @param {} title the passed title
 * @returns the song match
 */
function findSong(title){
    const titleFormatted = title.toLowerCase().trim();
    for (let song of songs){
        const songTitle = String(song['title']).toLowerCase().trim();
        if (titleFormatted == songTitle){
            return song;
        }
    }
    return song[0];
}
/* Returns an object that contains a collection of data about the given playlist */
function getPlaylistData(playlist){
    const averageDuration = getPlaylistAverageDuration(playlist)
    const mostPopularSong = getPlaylistMostPopularSong(playlist);
    const songList = getPlaylistSongNames(playlist);
    const numSongs = playlist['songs'].length;
    const mostCommonGenre = getMostCommonGenreInPlaylist(playlist);
    const playlistData = {
        "average_duration": averageDuration,
        "most_popular_song": mostPopularSong,
        "number_of_songs": numSongs,
        "song_list": songList,
        "most_common_genre": mostCommonGenre,
    };
    return playlistData;
}
/* Returns an unordered list that contains the markup for the song names in the given playlist. */
function getPlaylistSongNames(playlist){
    const songNames = document.createElement("div");
    songNames.className = 'playlist-songs-container';
    for (let song of playlist['songs']){
        const listItem = document.createElement("p");
        listItem.value = song['song_id'];
        listItem.className = 'title'; // Same as those used in the search results table 
        listItem.addEventListener("click", displaySongInformation)
        listItem.textContent = song['title'];
        songNames.appendChild(listItem);
    }
    return songNames;
}
// calculates and returns the average song duration of a given playlist
function getPlaylistAverageDuration(playlist){
    const playlistSongs = playlist['songs'];
    let totalDuration = 0;
    for (let song of playlistSongs){
        totalDuration += song['details']['duration'];
        }
    const avgDuration = totalDuration / playlistSongs.length;
    return secondsToMin(avgDuration);
}
// finds and returns the most popular song in the given playlist
function getPlaylistMostPopularSong(playlist){
    const songs = playlist['songs'];
    let mostPopular = songs[0]; // to create a playlist you need at least one song so this won't raise an error
    for (let song of songs){
        if (song['details']['popularity'] > mostPopular['details']['popularity']){
            mostPopular = song;
        }
    }
    return mostPopular;
}
/* Calculates and returns an array containing the average values of all analytic attributes of a given playlist (includes average popularity score as well) */
function getPlaylistAverages(playlist){
    const avgArray = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
    for (let song of playlist){
        const analytics = song['analytics'];
        avgArray[0] += analytics['danceability'];
        avgArray[1] += analytics['energy'];
        avgArray[2] += analytics['speechiness'];
        avgArray[3] += analytics['acousticness'];
        avgArray[4] += analytics['liveness'];
        avgArray[5] += analytics['valence'];
        avgArray[6] += song['details']['popularity'];
    }
    for (let i = 0; i < avgArray.length;  i++){
        let attributeAvgValue = avgArray[i] / playlist.length
        avgArray[i] = Math.ceil(attributeAvgValue);
    }
    return avgArray;
}
function setPlaylistListItems(){
    const listItems = document.querySelectorAll(".playlist-list h4");
    for (let heading of listItems){
        heading.addEventListener("click", makePlaylistDetails)
    }
}
// Creates the playlist view markup -> Playlist list
function displayPlaylists(){
    switchView("SONG_PLAYLIST_VIEW");
    storePlaylists(); // Makes sure that playlist cookies are up to date
    makePlaylistList();
    setPlaylistListItems();
}
// [playlist1, playlist2] => each playlist is an array of songs [[{Playlist 1: Song 1}, {Playlist 1: Song 2}], []]
/* Displays the list of playlists, along with their names, and the number of songs in the given playlist */
function makePlaylistList(){
    if (playlists.length == 0){return;} // exits the function if no playlists are present
    const container = document.querySelector(".playlist-selections");
    const listDiv = document.querySelector(".playlist-list");
    listDiv.innerHTML = ""; // clears the list div content
    listDiv.appendChild(makeHeading("Playlists"));
    for (let playlist of playlists){
        const playlistName = playlist['name'];
        // Creating the header for the list item
        const header = document.createElement("h4");
        header.id = playlistName;
        header.textContent = `${upperCaseFirstChar(playlistName)}`;
        header.innerHTML += `<br> (${getPlaylistData(findPlaylist(playlistName))['number_of_songs']} songs)`;
        listDiv.appendChild(header);
    }
    container.prepend(listDiv);
    loadRemovePlaylistSelect(); // Loads the select element in the remove playlist option
    playlistOptionsEventListeners(); // Creates the playlist options event listeners
}

/**
 * Sets the container for making a new playlist and adding a song to playlist(s).
 */
function playlistOptionsEventListeners(){
    const options = document.querySelectorAll(".option-btn");
    for (let option of options){
        option.addEventListener('click', optionViewControl);
    }
    // Adds an autocomplete function to these elements
    document.querySelector('#new-playlist-song').addEventListener('input', autocompleteTitles);
    // Listens for submit button actions 
    const optionActionButtons = document.querySelectorAll(".action-btn");
    optionActionButtons[0].addEventListener('click', newPlaylistAction);
    optionActionButtons[1].addEventListener('click', removePlaylistAction);
}

function optionViewControl(){
    const options = document.querySelectorAll(".playlist-option");
    const selectorId = this.id;
    switch(selectorId){
        case 'o1':
            displayOptions(options[0], options[1]);
            break;
        case 'o2':
            displayOptions(options[1], options[0]);
            break;
        default: 
            console.log('element not found');
    }
}
function displayOptions(displayed, n1){
    displayed.style.display = 'block';
    n1.style.display = 'none';
}
/* This function controls the actions that occur when a user creates a new playlist (both random and user selected) */
function newPlaylistAction(){
    const container = document.querySelector(".new-playlist-inputs");
    // Get user selection 
    const selectionId = getCheckedId(document.querySelectorAll('.new-playlist-radio'));
    // Creating the error message element
    const actionMsg = document.createElement('p');
    setInterval(() => {actionMsg.innerHTML = ""}, 1000); // removes the action message html every second
    container.appendChild(actionMsg);
    // Adding some styles to it 
    actionMsg.style.fontStyle = 'italic';
    actionMsg.style.fontWeight = 'bold';
    // Getting inputs from text fields.
    const playlistName = document.querySelector("#new-playlist-name").value;
    const playlistSong = document.querySelector("#new-playlist-song").value;
    if (playlistName != ""){
        if (selectionId == 'random-new-playlist-radio'){
            const numSongs = document.querySelector('#num-songs-range').value;
            makeRandomPlaylist(playlistName, numSongs);
            actionMsg.textContent = `${playlistName} was successfully created.`;
            displayPlaylists(); 
        }
        else if (selectionId == 'user-new-playlist-radio' && playlistName != ""){
            if (!checkPlaylistName(playlistName)){
                actionMsg.textContent = 'A playlist with that name already exists';
                container.appendChild(actionMsg);
            }
            const song = findSong(playlistSong);
            if (song === 0){
                actionMsg.textContent = 'The given song is not present in the database'
            }
            else {
                makePlaylist(playlistName, [song]);
                actionMsg.textContent = `${playlistName} was successfully created.`;
                setTimeout(displayPlaylists(), 1250); // refreshes the view after 1 second
            }
        }
    }
    else{
        actionMsg.textContent = "Please provide a playlist name.";
    }
}
/* Returns the ID of the element button that has been checked*/
function getCheckedId(radioNodeList){
    for (let radio of radioNodeList){
        if (radio.checked){
            return radio.id;
        }
    }
    return 0; // Case in which no radio button was checked
}

/* The actions that occur during and after a playlist is removed (DOM manipulation included) */
function removePlaylistAction(){
    if (playlists.length !== 1){
        const selection = document.querySelector('#playlist-remove-list').value;
        removePlaylist(selection); // Removes the playlist 
        document.querySelectorAll("#playlist-remove-list option").forEach( (item) => {
            if (item.value === selection){
            document.querySelector("#playlist-remove-list").removeChild(item);
            }
        });
        const parent = document.querySelector('.remove-message');
        parent.innerHTML = ""; // Wipes out earlier messages
        parent.textContent = `${selection} was removed`;
        storePlaylists();
        setTimeout(displayPlaylists, 500);
    }
    else {
        document.querySelector(".remove-playlist").style.display = "none";
    }
}
/* Removes the selected playlist */
function removePlaylist(playlistName){
    const removeIndex = playlists.findIndex((item) => item.name === playlistName);
    playlists.splice(removeIndex,1); // removes the playlist at the given index
    const element = document.querySelectorAll(".playlist-list h4")[removeIndex];
    element.remove();
}
/* Generates and appends the markup for a select input containing all removable playlists */
function loadRemovePlaylistSelect(){
    const parent = document.querySelector('#playlist-remove-list');
    parent.innerHTML = '';
    const playlistNames = getPlaylistNames();
    playlistNames.forEach( (playlistName) => {
        const option = document.createElement('option');
        option.setAttribute('value', playlistName);
        option.textContent = playlistName;
        parent.appendChild(option);
    });
}
/* Returns an array containing the name of all playlists */
function getPlaylistNames(){
    const names = [];
    playlists.forEach(item => {
        names.push(item.name);
    })
    return names;
}
/* This function is responsible for filling the playlist details container with relevant data. 
* This also includes a polar area chart that contains information about the averages of each attribute of the given playlist 
*/
function makePlaylistDetails(){
    if (playlists.length !== 0){ // Checking to see if playlists exists 
    playlistListObjs.forEach((listObj) => {console.log(listObj.id); if(listObj.id != this.id){listObj.style.backgroundColor = "474E68"} else{listObj.style.backgroundColor = "#fb2576"}});
    let eventId = this.id;
    const viewPlaylistBtnHandler = eventId === 'playlist-view-btn' ? eventId = (document.querySelectorAll(".playlist-list h4")[Math.round(Math.random() * document.querySelectorAll("playlist-list h4").length, 0)].id) : eventId; 
    const playlist = findPlaylist(viewPlaylistBtnHandler); // find the playlist that the list element relates to based on the given id
    const playlistName = playlist['name'];
    const detailsContainer = document.querySelector(".details-container");
    if (detailsContainer.hasChildNodes()){
        detailsContainer.textContent = "";
    }
    highlightSelectedPlaylist(playlistName);
    detailsContainer.appendChild(makeHeading(`${playlistName} Details`));
    // Data that will be displayed in the details view
    const playlistData = getPlaylistData(playlist);
    // Append the songs names list to the details container.
    const songsList = getPlaylistDetailsDiv(`Song List 📋`, "");
    songsList.appendChild(playlistData['song_list']);
    detailsContainer.appendChild(songsList);
    // Creates and appends the most popular song div to the details container
    const mostPopularSongBox = getPlaylistDetailsDiv('Most Popular Song 😎',  `'${playlistData['most_popular_song']['title']}' by ${playlistData['most_popular_song']['artist']['name']}, with a popularity score of ${playlistData['most_popular_song']['details']['popularity']}%`)
    detailsContainer.appendChild(mostPopularSongBox);
    // Andddd with the average song duration
    const averageSongDuration = getPlaylistDetailsDiv('Average Song Duration ⏱️', `The average song duration in this playlist is ${playlistData['average_duration']}`)
    detailsContainer.appendChild(averageSongDuration);
    // Finds the most common genre in the playlist, along with the number of occurences
    const mostCommonGenre = getPlaylistDetailsDiv('Most Common Genre 💫', `${upperCaseFirstChar(playlistData['most_common_genre'][0]).trim()}, which occurs ${playlistData['most_common_genre'][1]} times in this playlist. `); 
    detailsContainer.appendChild(mostCommonGenre);
    // Creates the playlist average chart
    const averagesData = getPlaylistAverages(playlist['songs']);
    makePlaylistAveragesChart(averagesData, playlistName);
    // The same is done with the most pronounced (max valued) average of a song analytic within the playlist.
    const attributeData = getPlaylistMostPronoucedAttribute(averagesData);
    const mostPronoucedAttribute = getPlaylistDetailsDiv('Most Pronouced Attribute 🥇', `${attributeData['max_attribute_name']}, with an average value of ${attributeData['max_val']}%`);
    detailsContainer.appendChild(mostPronoucedAttribute);
    }
    else{
        document.querySelector(".playlist-list").innerHTML = "<h1 style='text-align:center; padding:20px; margin-top:10px; text-shadow: 2px 2px 4px black; text-style: italic;'> Nothing to see here. <br> Press the 'New Playlist' button to add data! <h1> ";
    }
}
function highlightSelectedPlaylist(playlistId){
    for (let playlistButton of document.querySelectorAll(".playlist-list h4")){
        if (playlistButton.id == playlistId){
            playlistButton.style.backgroundColor = "#fb2576";
        }
        else{
            playlistButton.style.backgroundColor = "";
        }
        playlistButton.style.color = "white";
    }
}
const playlistListObjs = document.querySelectorAll(".playlist-list h4");
/* Finds and returns the attribute name and value of the with the highest average */
function getPlaylistMostPronoucedAttribute(averages){
    let maxValue = 0;
    let maxIndex = 0;
    let maxAttributeName = "";
    for (let i = 0; i < averages.length - 1; i++){ // The -1 is included so that we do not included popularity as an attribute (not an analytics attribute)
        if (averages[i] > maxValue){
            maxValue = averages[i];
            maxIndex = i;
        }
    }
    switch(maxIndex){
        case 0: 
            maxAttributeName = 'Danceability';
            break;
        case 1: 
            maxAttributeName = 'Energy';
            break;
        case 2:
            maxAttributeName = 'Speechiness';
            break;
        case 3:
            maxAttributeName = 'Acousticness';
            break;
        case 4:
            maxAttributeName = 'Liveness';
            break;
        case 5:
            maxAttributeName = 'Valence';
            break;

    }
    return {"max_val": maxValue, "max_attribute_name": maxAttributeName};
}
/* Creates and appends the markup for the divs that contain information about the given playlist */
function getPlaylistDetailsDiv(boxHeading, text){
    const detailsDiv = document.createElement("div");
    detailsDiv.className = 'details-element';
    const boxHeadingDiv = document.createElement("h3");
    boxHeadingDiv.textContent = boxHeading;
    boxHeadingDiv.className = 'box-heading-div';
    detailsDiv.appendChild(boxHeadingDiv);
    if (!text == ""){
        const textBox = document.createElement("p")
        textBox.textContent = text;
        detailsDiv.appendChild(textBox);
    }
    return detailsDiv;
}
/* Find and return the given playlist based on the passed name parameter. Essentially, this parameter acts as the primary key to identify the playlist */
function findPlaylist(playlistName){
    for (let playlist of playlists){
        if (playlist['name'] === playlistName){
            return playlist;
        }
    }
    return;
}
/* Creates and returns the markup for a heading */
function makeHeading(text){
    const heading = document.createElement("h1");
    heading.textContent = upperCaseFirstChar(text);
    return heading;
}
/* Finds and returns the name of the most common genre in a playlist, along with the amount of times it occurs */
function getMostCommonGenreInPlaylist(playlist){
    if (playlist.length == 1){return playlist["songs"][0]['genre']['name']};
    const genresList = [];
    const genreCounts = [0];
    for (let song of playlist["songs"]){
        const currentSongGenre = song['genre']['name'];
        genresList.push(currentSongGenre);
    }
    genresList.sort();
    let currentGenre = genresList[0];
    let genreIndex = 0;
    for (let genre of genresList){
        if (genre.trim() !== currentGenre.trim()){
            genreCounts.push(1);
            genreIndex++;
            currentGenre = genre;
        }
        else{
            genreCounts[genreIndex]++;
        }
    }
    let genreMax = Math.max.apply(null, genreCounts);
    let maxIndex = genreCounts.findIndex((value) => value === genreMax);
    let maxGenreName = genresList[maxIndex];
    const genresData = [maxGenreName, genreMax];
    return genresData;
}
/* Creates a polar area chart containing information about the average value of each attribute (including popularity) in a given playlist
*/
function makePlaylistAveragesChart(averagesData, playlistName){
    // Draws, destroys, and redraws the canvas on which the chart is displated
    const parentNode = document.querySelector(".averages-container");
    const averagesCanvas = document.querySelector("#averages-chart");
    parentNode.removeChild(averagesCanvas);
    const newCanvas = document.createElement("canvas");
    parentNode.appendChild(newCanvas);
    newCanvas.id = "averages-chart";
    const ctx = newCanvas.getContext('2d');
    const data = {
        labels: ['Danceability','Energy','Speechiness','Acousticness','Liveness','Valence', 'Popularity'],
        datasets: [{
        label: 'Playlist Averages',
        data: averagesData,
        backgroundColor: [
            'rgba(255, 99, 132, 0.65)',
            'rgba(75, 192, 192, 0.65)',
            'rgba(255, 205, 86, 0.65)',
            'rgba(201, 203, 207, 0.65)',
            'rgba(54, 162, 235, 0.65)', 
            'rgba(128, 0, 128, 0.65)',
            'rgba(50, 205, 50, 0.65)'
            ]
        }]
    };
    const chart = new Chart(ctx, {
        type: 'polarArea',
        data: data,
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    color: "white",
                    text: `Average Values of ${playlistName}`,
                    align: "center",
                    position: "top",
                    font:{
                        size: 18,
                        family: "serif",
                        weight: "bold"
                    }
                },
                legend: {
                    display: true,
                    align: "center",
                    position: "top",
                    labels: {
                            color: "white",
                            font: {
                                family: "serif",
                                size: 13
                            }
                        }
                    },
                },
            scales: {
                r: {
                    ticks: {
                        backdropColor: "transparent",
                        color: "white",
                        font:{
                            family: 'serif',
                            size: 15,
                            weight: "bold"
                        }
                    },
                    grid: {color: "white"},
                
                    pointLabels: {
                        color: 'white',
                        font:{
                            family: 'serif',
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: "white"
                    },
                    suggestedMin: 0,
                    suggestedMax: 90
            }
            },
        }
    });
}
// ======================================================== SWITCH VIEW =====================================================================
/* This function is responsible for switching between the given 'views' in the single page application. */
function switchView(newView){
    const songSearchBody = document.querySelector(".song-search");
    const songInformationBody = document.querySelector(".song-info");
    const songPlaylistBody = document.querySelector(".song-playlists");
    if (newView == "SONG_SEARCH_VIEW"){
        setDisplay(songSearchBody, songInformationBody, songPlaylistBody);
    }
    else if (newView == "SONG_INFORMATION_VIEW"){
        setDisplay(songInformationBody, songSearchBody, songPlaylistBody);
    }
    else if (newView == "SONG_PLAYLIST_VIEW"){
        setDisplay(songPlaylistBody, songSearchBody, songInformationBody);
    }
    else {
        console.log("The given view attribute is not currently supported");
    }
}
/* Sets the display of different views as you're switching from one view to another */
function setDisplay(flexBody, noBodyOne, noBodyTwo){
    flexBody.style.display = ''; // Flex display is already set in css properties so nothing needs to be overriden here
    noBodyOne.style.display = 'none';
    noBodyTwo.style.display = 'none';
}
});
// ================================================================== END OF FILE =======================================================================