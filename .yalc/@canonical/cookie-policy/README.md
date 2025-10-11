# Canonical cookie policy component

This project contains the scripts and styles to display a cookie policy notification on a web page.

You can use it to display a custom cookies message of your choosing on your own web page.

## Usage

This project can be installed via an [NPM package](https://www.npmjs.com/package/cookie-policy).

```bash
yarn add @canonical/cookie-policy
```

...or...

```bash
npm install @canonical/cookie-policy
```

You can then install the library either by directly linking to it or via an ES6 import.

1. Via direct link

To consume the library directly, add a link to the JS file containing an [IIFE](https://developer.mozilla.org/en-US/docs/Glossary/IIFE) and call the lib:

```javascript
<script src="[ INSERT YOUR LOCAL PATH ]/js/cookie-policy.js"></script>
<script>
  cpNs.cookiePolicy();
</script>
```

2. Via ES6 import

```javascript
import { cookiePolicy } from '@canonical/cookie-policy';
```

### Revoking the cookie policy

If you would like users to change their preferences you can add `js-revoke-cookie-manager` class to any element that is present in the document to recall the policy manager.

```html
<button class="js-revoke-cookie-manager">Revoke cookie manager</button>
```

or

```html
<a href="" class="js-revoke-cookie-manager">Revoke cookie manager</a>
```

### Visiting a page with tracker disabled

If you add the query `?cp=hide` to any URL the cookie policy will not be rendered. The main use case is to visit the policy page without the modal blocking the content.

### Callback hook

You can set up the cookie policy with a callback when a preference is selected.

```javascript
function callbackFunction() {
  alert('Calling back');
}
cpNs.cookiePolicy(callbackFunction);
```

#### Full example via ES6 import

```javascript
import { cookiePolicy } from '@canonical/cookie-policy';

cookiePolicy();
```

### Cookie groups

Essential cookies are always allowed, unless the user turns them off in their browser. Otherwise, there will be a series of values the `_cookies_accepted` cookie can contain :
| Cookie value | Description | Note |
| --- | --- | --- |
| all | All cookies accepted by the user. Currently used by the existing widget | Previous value was `true`. Using the same cookie. |
| essential | Essential cookies accepted. | This is used to hide the notification instead of not setting the cookie |
| performance | Performance cookies accepted. | - |
| functionality | Functionality cookies accepted. | - |

## Contributing

If you would like to help improve this project, here is a list of commands to
help you get started.

### Building the cookie policy

Install the requisite dependencies;

```
npm install
```

To build the JS and CSS into the build folder, run:

```
npm run build
```

You can view the build files in action by running:

```
npm run serve
```

And, visiting http://0.0.0.0:8301/

### Hacking

When developing this project you can run the following command to listen to
changes in the `src/js/*js` and `src/sass/*scss` folders and build them into the
`/build` folder.

```
npm run watch
```

Before submitting your pull request, run the linters, which checks both the JS
and Sass for errors.

```
npm run test
```

Code licensed LGPLv3 by Canonical Ltd.

With ♥ from Canonical
