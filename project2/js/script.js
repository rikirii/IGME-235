// 1
let searchBar;
let descriptBar ;
let maxResults ;
let patchSelect ;
let itemList = [ ];

const prefix = "ry5665";
let listID = "ry5665-filter-list";


window.onload = (e) => { 
    document.querySelector("#search").onclick = searchButtonClicked;
    searchBar = document.querySelector("#searchterm");
    descriptBar = document.querySelector("#description");
    maxResults = document.querySelector("#limit");
    patchSelect = document.querySelector("#patch");

    let items = localStorage.getItem(listID);
    if (items != null){
        itemList = JSON.parse(items);
        console.log(itemList);
        searchBar.value = itemList[0];
        console.log(searchBar.value);
        descriptBar.value = itemList[1];
        maxResults.value = itemList[2];
        patchSelect.value = itemList[3];
    }
};

// 2
let displayTerm = "";

// 3
function searchButtonClicked() {
    console.log("searchButtonClicked() called");

    // 1
    //Documentation: https://documenter.getpostman.com/view/1779678/TzXzDHM1
    const URL = "https://ffxivcollect.com/api/achievements";

    // 2
    //no key needed
    //let GIPHY_KEY = "5PuWjWVnwpHUQPZK866vd7wQ2qeCeqg7";

    // 3 - build up your URL string
    let url = URL;
    //url += "api_key=" + GIPHY_KEY;

    //clear list
    itemList.splice(0,itemList.length);

    // 4 - parse the user entered term we wish to search
    let term = searchBar.value;
    itemList.push(term);
    displayTerm = term;

    let description = descriptBar.value;
    itemList.push(description);

    let maxResult = maxResults.value;
    itemList.push(maxResult);

    let patchNum = patchSelect.value;
    itemList.push(patchNum);

    console.log(itemList);

    let filters = "";

    // 5 - get rid of any leading and trailing sapces
    term = term.trim();
    term = term.replace(/\s+/g, '-');

    description = description.trim();
    description = description.replace(/\s+/g, '-');

    // 6 - encode spaces and special characters
    term = encodeURIComponent(term);
    description = encodeURIComponent(description);

    // 7 - filters
    
    filters += "&limit=" + maxResult;

    if (patchNum !=0){
        filters += "&patch_eq=" + patchNum;
    }
    // else, empty. no need to specify a limit


    //if term exists, add the term
    if (term.length > 1)
    {
        // 8 - append the search term to the URL - need ? after achivements
        filters += "&name_en_cont=" + term;    
    }

    if (description.length > 0) {
        filters += "&" + "description_en_cont=" + description;
    }

    
    //to replace all char in a string, do .replace(/char/g, [other char]) or .replace('char', [other char]) for first occurance

    if (filters[0] == '&'){
        filters = filters.replace('&','?');
    }
    else if (filters[0] == "?")
    {
        url += filters;
    }
    
    console.log(filters);

    if (filters.length != 0){
        url += filters
    }
        

    // 9 - grab the user chosen search 'limit' from the <select> and append it to the URL
    let limit = document.querySelector("#limit").value;
    //url += "&limit=" + limit;

    // 10 - update the UI
    document.querySelector("#status").innerHTML = "<b>Searching for '" + displayTerm + "'</b>";

    // 11 - see what the URL looks like
    console.log(url);

    // 12 Request data!
    getData(url);

    let items = JSON.stringify(itemList); 			// now it's a String
    localStorage.setItem(listID, items);
}

function getData(url) {
    // 1 - create a bew XHR object
    let xhr = new XMLHttpRequest();

    // 2 - set the onload handler
    xhr.onload = dataLoaded;

    // 3 - set the onerror handler
    xhr.onerror = dataError;

    // 4 - open connection and send the request
    xhr.open("GET", url);
    xhr.send();
}

function dataLoaded(e) {
    // 5 - event.target is the xhr object
    let xhr = e.target;

    // 6 - xhr.responseTest is the JSON file we just downloaded
    console.log(xhr.responseText);

    // 7 - turn the test into a parseable Javascript obejct
    let obj = JSON.parse(xhr.responseText);

    // 8 - if there are no result, print the message and return
    /// *** !!!! "data" this is specific to different api's
    if (!obj.results || obj.results.length == 0) {
        document.querySelector("#status").innerHTML = "<b>No results found for '" + displayTerm + "'</b>";
        return; //Bail out
    }

    // 9 - Start building an HTML string we will display to the user
    let responses = obj.results
    console.log("results.length = " + responses.length);
    let bigString = "";

    // 10 - loop through the array of results
    for (let i = 0; i < responses.length; i++) {
        let repsonse = responses[i];

        // 11 - get the URL to the GIF
        let smallURL = repsonse.icon;
        if (!smallURL) smallURL = "images/no-image-found.png";

        // 12 - get the URL to the GIPHY Page
        let descript = repsonse.description;

        // 13 - Build a <div> to hold each result
        // ES6 String Templating
        let line = `<div class='result'>Name: ${repsonse.name}<br>Patch: ${repsonse.patch}<br>${descript}`;
        line += `<img src='${smallURL}' title= '${repsonse.name}' /> </div>`;

        // 14 - another way of doing the same thing above
        //Replaces this:
        // var line = "<div class='result'>";
        //     line += "<img src='";
        //     line += smallURL;
        //     line += "' tittle= '";
        //     line += result.id;
        //     line += "' />";

        //     line += "<span><a target='_blank' href='" +url + "'>View on Giphy</a></span>";
        //     line += "</div>";

        // 15 - add the <div> to `bigString` and loop
        bigString += line;
    }

    // 16 - all done building the HTMl - show it to the user!
    document.querySelector("#content").innerHTML = bigString;

    // 17 - update the status
    if (displayTerm == "") {displayTerm = "Everything";}
    document.querySelector("#status").innerHTML = "<b>Succes!</b><p><i>Here are " + responses.length + " results for '" + displayTerm + "'</i></p>";
}

function dataError(e) {
    console.log("An error occured");
}


