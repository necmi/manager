const moment = require('moment');
const { existsSync, statSync, writeFileSync } = require('fs');
const { constants } = require('../constants');

/*
* Get localStorage after landing on homepage
* and write them out to a file for use in other tests
* @returns { String } stringified local storage object
*/
exports.saveTokenIfNeeded = (username, password) => {
    let expirationTime, currentTime;
    const tokenPath = './localStorage.json';
    const tokenExists = existsSync(tokenPath);

    if (tokenExists)  {
        const lastModifiedTime = new Date(statSync(tokenPath).mtime);
        expirationTime = moment(lastModifiedTime).add('2', 'hours').format();
        currentTime = moment().format();
    }
    
    const getNewToken = tokenExists ? expirationTime < currentTime : true;

    if (getNewToken) {
        const localStorageObj = browser.execute(function() {
            return JSON.stringify(localStorage);
        });
        writeFileSync(tokenPath, localStorageObj.value);
    }
}

exports.readToken = () => {
    const localStorage = require('../../localStorage.json');

    return localStorage['authentication/oauth-token'];
}
/*
* Navigates to baseUrl, inputs username and password
* And attempts to login
* @param { String } username
* @param { String } password
* @returns {null} returns nothing
*/
exports.login = (username, password) => {
    browser.url(constants.routes.dashboard);
    browser.waitForVisible('#username');
    browser.setValue('#username', username);
    browser.setValue('#password', password);
    browser.click('.btn-primary');
    if (browser.isExisting('.Modal')) {
        browser.click('.btn-primary');
    }
    browser.waitForVisible('[data-qa-add-new-menu-button]', 20000);
    browser.waitForVisible('[data-qa-circle-progress]', 20000, true);

    exports.saveTokenIfNeeded(username, password);
}

/*
* Navigate to a null route on the manager,
* Add the token properties to local storage
* Navigate back to the homepage to be logged in
* @returns {Null} returns nothing
*/
// exports.loadToken = () => {
//     const tokenPath = '../../localStorage.json';
//     try {
//         const localStorageObj = require(tokenPath);
//         const keys = Object.keys(localStorageObj);

//         const storageObj = keys.map(key => {
//             return { [key]: localStorageObj[key] }
//         });

//         browser.url('/null');
//         browser.waitForText('#root > span:nth-child(1)');
//         browser.waitUntil(function() {
//             browser.execute(function(storageObj) {
//                 storageObj.forEach(item => {
//                     localStorage.setItem(Object.keys(item)[0], Object.values(item)[0]);
//                 });
//             }, storageObj);
//             browser.url('/null');
//             return browser.execute(function(storageObj) {
//                 return localStorage.getItem('authentication/oauth-token').includes(storageObj['authentication/oauth-token']) === true;
//             }, storageObj);
//         }, 10000);
//         browser.url(constants.routes.dashboard);
//         browser.waitForVisible('[data-qa-beta-notice]');
//         browser.click('[data-qa-beta-notice] button');
//     } catch (err) {
//         console.log(`${err} \n ensure that your local manager environment is running!`);
//     }
// }
