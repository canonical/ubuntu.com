# Canonical Ltd Global nav

This project contains the JavaScript and styles to display a banner across the top of a page. This banner displays a list of corporate eco-system websites. Giving a user the ability to jump arounds the core sites easily.

## Usage

Simply use bower to install this component and then link the CSS and the JS files into the head of your site.

1. Installing via bower
```bash
bower install canonical-global-nav --save
```

2. Add link to the JS and CSS files in your sites header
```html
<link rel="stylesheet" type="text/css" media="screen" href="/bower-components/canonical-global-nav/build/css/cookie-policy.css" />
<script src="/bower-components/canonical-global-nav/build/js/global.js"></script>
<script>ubuntu.globalNav.setup();</script>
```

The canonical global nav should now appear across the top of you site.

Note: You can specify the directory in which you want your bower components installed in a `.bowerrc`. For example:
```json
{
  "directory": "static/components/"
}
```

## Contributing

If you would like to help improve this project, here is a list of commands to help you get started.

### Building the Global nav

To build the JS and CSS into the build folder, run:

```
gulp build
```

You can view the build files in action by opening the `index.html` in the root of this project.

### Hacking

When developing this project you can run the following command to listen to changes in the `src/js/*js` and `src/sass/*scss` and builds them into the `/build` folder.

```
gulp dev
```

Before submitting your pull request. Run the lint, which checks both the JS and Sass for errors.

```
gulp test
```

Code licensed LGPLv3 by Canonical Ltd.

With ♥ from Canonical 
