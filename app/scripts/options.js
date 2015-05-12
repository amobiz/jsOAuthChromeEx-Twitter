'use strict';

var OAuth = chrome.extension.getBackgroundPage().OAuth;
var ui = {
    list: document.getElementById('container'),
    authorize: document.getElementById('authorize'),
    consumerKey: document.getElementById('consumerKey'),
    consumerSecret: document.getElementById('consumerSecret')
};

ui.authorize.addEventListener('click', onAuthorize, false);
ui.consumerKey.value = localStorage.consumerKey || '';
ui.consumerSecret.value = localStorage.consumerSecret || '';

doAuthorize();

function createOAuth() {
    var consumerKey = localStorage.consumerKey = ui.consumerKey.value;
    var consumerSecret = localStorage.consumerSecret = ui.consumerSecret.value;
    var accessTokenKey = localStorage.accessTokenKey;
    var accessTokenSecret = localStorage.accessTokenSecret;
    return new OAuth({
        consumerKey: consumerKey,
        consumerSecret: consumerSecret,
        accessTokenKey: accessTokenKey,
        accessTokenSecret: accessTokenSecret,
        requestTokenUrl: 'https://api.twitter.com/oauth/request_token',
        authorizationUrl: 'https://api.twitter.com/oauth/authenticate',
        accessTokenUrl: 'https://api.twitter.com/oauth/access_token'
    });
}

function onAuthorize(e) {
    doAuthorize();
    e.preventDefault();
    return false;
}

function doAuthorize() {
    var oauth = createOAuth();
    oauth.authorize(granted, rejected);

    function granted() {
        ui.authorize.disabled = 'disabled';
        localStorage.accessTokenKey = oauth.getAccessTokenKey();
        localStorage.accessTokenSecret = oauth.getAccessTokenSecret();
        search(oauth);
    }

    function rejected() {
    }
}

function search(oauth) {
    var query = '@twitterapi';
    var url = 'https://api.twitter.com/1.1/search/tweets.json?q=' + encodeURIComponent(query);
    oauth.get(url, function(data) {
        var tweets = JSON.parse(data.text);
        var fragment = document.createDocumentFragment();
        tweets.statuses.forEach(function(tweet) {
            var li = document.createElement('li');
            li.classList.add('entry');
            li.innerHTML = '<h1>' + tweet.user.name + '</h1><p><img src="' + tweet.user.profile_image_url + '"></p>' + '<p>' + tweet.text + '</p>';
            fragment.appendChild(li);
        });
        ui.list.appendChild(fragment);
    });
}
