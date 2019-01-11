function userInformationHTML(user) {
    
    console.log(user);
    
    //user is the object and name is the element
    return `
        <h2>${user.id} || ${user.name}                               
            <span class="small-name">
                (@<a href="${user.html_url}" target="_blank">${user.login}</a>)
            </span>
        </h2>
        <div class="gh-content">
            <div class="gh-avatar">
                <a href="${user.html_url}" target="_blank">
                    <img src="${user.avatar_url}" width="80" height="80" alt="${user.login}" />
                </a>
            </div>
            <p>Followers: ${user.followers} - Following ${user.following} <br> Repos: ${user.public_repos}</p>
        </div>`;
}

function repoInformationHTML(repos) {                                       // This takes just one argument, which is repos, 
                                                                             // the object returned from our GitHub API.
    console.log(repos);
    if (repos.length == 0) {
        return `<div class="clearfix repo-list">No repos!</div>`;
    }

    var listItemsHTML = repos.map(function(repo) {
        return `<li>
                    <a href="${repo.html_url}" target="_blank">${repo.name}</a>
                </li>`;
    });

    return `<div class="clearfix repo-list">
                <p>
                    <strong>Repo List:</strong>
                </p>
                <ul>
                    ${listItemsHTML.join("\n")}
                </ul>
            </div>`;    
}

function fetchGitHubInformation(event) {
    $("#gh-user-data").html("");                                    // We're actually going to empty both of our divs.
                                                                    // So we'll use jQuery first of all to select the gh-user-data
                                                                    // div and set its HTML content to an empty string.
                                                                    // And then we'll do the same for the gh-repo-data div.
                                                                    // Setting their HTML content to an empty string has the effect
                                                                    // of emptying these divs.
    $("#gh-repo-data").html("");

    var username = $("#gh-username").val();
    if (!username) {
        $("#gh-user-data").html(`<h2>Please enter a GitHub username</h2>`);
        return;
    }

// We're going to give that an <alt> tag of loading, just in case it can't be displayed.

    $("#gh-user-data").html(
        `<div id="loader">
            <img src="assets/css/loader.gif" alt="loading..." />  
        </div>`);

     $.when(                                                            // So now we can issue the promise.
                                                                        //  We do that by using $.when().
                                                                        //  And the when() method takes a function as its first argument.
                                                                        //  So what we're going to do here is pass in a function.
                                                                        //  And that function is going to be the getJSON() function.
        $.getJSON(`https://api.github.com/users/${username}`),
        $.getJSON(`https://api.github.com/users/${username}/repos`)
    ).then(
        function(firstResponse, secondResponse) {
            var userData = firstResponse[0];
            var repoData = secondResponse[0];
            
            $("#gh-user-data").html(userInformationHTML(userData));
            $("#gh-repo-data").html(repoInformationHTML(repoData));
        },
        
        function(errorResponse) {
            if (errorResponse.status === 404) {                             // 404 is a not found error
                $("#gh-user-data").html(
                    `<h2>No info found for user ${username}</h2>`);
            } else if (errorResponse.status === 403) {                      // So in our fetchGitHubInformation() function, after we 
                                                                            // check for status of 404, we're now going to put an else 
                                                                            // if clause and check for the status of 403.
                                                                            // 403 means forbidden.
                                                                            // And this is the status code that GitHub returned when 
                                                                            // our access is denied.
                                                                            // So in here, we're going to create a new variable called 
                                                                            // resetTime and set that to be a new date object. 
                var resetTime = new Date(errorResponse.getResponseHeader('X-RateLimit-Reset') * 1000);
                $("#gh-user-data").html(`<h4>Too many requests, please wait until ${resetTime.toLocaleTimeString()}</h4>`);
            } else {
                console.log(errorResponse);
                $("#gh-user-data").html(
                    `<h2>Error: ${errorResponse.responseJSON.message}</h2>`);
            }
        });
}

$(document).ready(fetchGitHubInformation);
        
       