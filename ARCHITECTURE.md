# Ubuntu.com application architecture

This lays out the high level architecture of the ubuntu.com application. The ubuntu.com domain has many different pieces drawn from a number of different places.

## The core application

ubuntu.com is a [Flask v1](https://flask.palletsprojects.com/_/downloads/en/1.1.x/pdf/) app. It makes use of a number of our standard Python modules. Specifically, these two effect the whole site:

- [flask-base](https://github.com/canonical/canonicalwebteam.flask-base): This is our core Flask app ([instantiated here](app.py#L162-L169)) that sets default functionality (e.g. `redirects.yaml`, `templates/404.html`, `robots.txt`, favicon, caching headers, security headers)
- [templatefinder](https://github.com/canonical/canonicalwebteam.templatefinder): A standard view ([created here](webapp/app.py#L635)) for serving any template based on its path. E.g. creating a file at `templates/my-new-page.html` will result in a page being displayed at `ubuntu.com/my-new-page`.

### Local development

It uses [dotrun](https://github.com/canonical/dotrun) for local development, defining standard endpoints for `serve`, `build`, `test`, `watch` etc. within the [`package.json`](https://github.com/canonical/ubuntu.com/blob/main/package.json). For more information, see the [README.md](README.md).

### Deployment

Merging a pull request (PR) into the `main` branch will automatically trigger a deployment to the production site, which normally takes around 5 minutes. This follows [our standard deployment flow](https://discourse.canonical.com/t/how-the-standard-website-deployment-flow-is-set-up-in-github-jenkins-and-kubernetes/2112).

## File structure

- [`./redirects.yaml`](rerdirects.yaml): A file defining URL paths for 302 redirects
- [`./deleted.yaml`](deleted.yaml): A file defining URL paths for 310 deleted responses
- [`./entrypoint`](entrypoint): The commands for running the application with Gunicorn. This is used within `Dockerfile` for running the production site.
- [`./Dockerfile`](Dockerfile): Used by the [production Jenkins job](https://jenkins.canonical.com/webteam/job/ubuntu.com) for building the production docker image. See [our standard deployment flow](https://discourse.canonical.com/t/how-the-standard-website-deployment-flow-is-set-up-in-github-jenkins-and-kubernetes/2112).
- [`./releases.yaml`](releases.yaml): For defining releases of Ubuntu, which get displayed on ubuntu.com/download etc.
- [`./navigation.yaml`](navigation.yaml): Navigation sections within ubuntu.com.
- [`./appliances.yaml`](appliances.yaml): Appliance metadata for displaying on ubuntu.com/appliance
- [`./requirements.txt`](requirements.txt): Python dependencies for the project
- [`./webapp/`](webapp/): The Python application files:
  - [`app.py`](webapp/app.py) is entrypoint for the parent application, and defines URL routes
  - [`views.py`](webapp/views.py) contains the view functions for handing routed URL paths
  - [`certified/`](webapp/certified/), [`shop/`](webapp/shop/) and [`security/`](webapp/security/) contain blueprints for the sub-paths of ubuntu.com
  - [`login.py`](webapp/login.py) and [`macaroons.py`](webapp/macaroons.py) contain the logic for authentication and login
- [`./templates/`](templates/): Jinja2 templates, used by the Flask app for serving HTTP pages
- [`./konf/site.yaml`](konf/site.yaml): Kubernetes configuration files to be interpreted by [Konf](https://github.com/canonical/konf), our custom config manager. Used in our [standard deployment flow](https://discourse.canonical.com/t/how-the-standard-website-deployment-flow-is-set-up-in-github-jenkins-and-kubernetes/2112) to release the site to Kubernetes.
- [`./scripts/`](scripts/): Local utility scripts, not used by the production application

## Major website areas

### Homepage

The homepage ([url rule](webapp/app.py#L637)) has no server-side dynamic functionality, so is instead served directly by the template finder view from `templates/index.html`.

Since ubuntu.com is a high-traffic site, and the homepage its most popular page, it is important that the initial response for this page remains as fast as possible, so it should _not_ be making server-side database or API calls directly if it can be avoided.

#### Homepage takeovers and engage pages

The main central area of the homepage contains a "takeover" - a large strip advertising a Canonical product or service. These takeovers often then link to "engage pages" - a page about a specific piece of marketing content like a whitepaper.

The list of takeovers is maintained by the Marketing team, and when the homepage loads, a random takeover will be chosen and then on reloads it will cycle through the list of takeovers, so you can see all takeovers by refreshing a few times.

The takeovers are loaded client-side by calling https://ubuntu.com/takeovers.json ([url rule](webapp/app.py#L602), [view function](webapp/app.py#L568-L578)). You can also see all available takeovers listed at https://ubuntu.com/takeovers ([url rule](webapp/app.py#L603), [view function](webapp/app.py#L581-L598)), and you can see available engage pages at https://ubuntu.com/engage.

The takeover content is maintained by Marketing in [the takeovers category in Discourse](https://discourse.ubuntu.com/c/design/takeovers/106), and the /takeovers.json view pulls the content from here through the Discourse API using [our Discourse module](https://github.com/canonical/canonicalwebteam.discourse) ([instantiated here](webapp/app.py#L510-L515)). Similarly, the engage pages are maintained in [a Discourse category](https://discourse.ubuntu.com/c/design/engage-pages/51), which populates https://ubuntu.com/engage.

Here's [a more complete guide to the engage pages and takeovers system](https://discourse.canonical.com/t/engage-pages-and-takeovers-v2/358).

### Blog

The blog pages under https://ubuntu.com/blog make use of [the blog module](https://github.com/canonical/canonicalwebteam.blog) ([instantiated here](webapp/app.py#L437-L442)) to pull in content from the `admin.insights.ubuntu.com` Wordpress installation through the Wordpress API. This content is managed through [the Wordpress admin area](https://admin.insights.ubuntu.com/admin), which is only accessible while on [the company VPN](https://wiki.canonical.com/InformationInfrastructure/IS/HowTo/CompanyOpenVPN).

### Documentation

There are a large number of documentation areas on ubuntu.com (complete at the time of writing, I think):

- [ubuntu.com/server/docs](http://ubuntu.com/server/docs) ([code](webapp/app.py#L642-L651))
- [ubuntu.com/core/services/guide](https://ubuntu.com/core/services/guide) ([code](webapp/app.py#L606-L616))
- [ubuntu.com/core/docs](http://ubuntu.com/core/docs) ([code](webapp/app.py#L748-L756))
  - Also [core sub docs sets](webapp/app.py#L757-L858): bluez, networkmanager, wpa-supplicant, easy-openvpn, wifi-ap, asla-utils
- [ubuntu.com/openstack/docs](http://ubuntu.com/openstack/docs) ([code](webapp/app.py#L942-L952))
- [ubuntu.com/security/livepatch/docs](http://ubuntu.com/security/livepatch/docs) ([code](webapp/app.py#L969-L979))
- [ubuntu.com/security/certifications/docs](http://ubuntu.com/security/certifications/docs) ([code](webapp/app.py#L996-L1006))
- [ubuntu.com/landscape/docs](http://ubuntu.com/landscape/docs) ([code](webapp/app.py#L1023-L1033))
- [ubuntu.com/robotics/docs](http://ubuntu.com/robotics/docs) ([code](webapp/app.py#L1050-L1060))

Each of these is served with [our Discourse module](https://github.com/canonical/canonicalwebteam.discourse), and pulls its content from a set of topics in Discourse, as with the takeovers and engage pages.

For more information, see the [Creating Discourse based documentation pages](https://discourse.canonical.com/t/creating-discourse-based-documentation-pages/159) guide.

### Search

https://ubuntu.com/search ([url rule](webapp/app.py#L412-L421)) makes use of [our Google Programmable Search account](https://programmablesearchengine.google.com/u/1/controlpanel/overview?cx=009048213575199080868%3Ai3zoqdwqk8o) to pull results through Google's API using [our search module](https://github.com/canonical/canonicalwebteam.search/). The account is configured to index many different domains that we own, and results can be displayed from all of them.

We have had trouble with search spam in the past which has led to us hitting API rate limits, breaking our search. There is now rate limiting on the content-cache level which will hopefully take care of this. We've set up [a dashboard in Graylog](https://logging.comms.canonical.com/dashboards/62cb3f41363defb179345f25) for monitoring the traffic on the search engine.

### Downloads

The download pages, e.g. https://ubuntu.com/download/desktop, include links for people to download Ubuntu. These pages get extremely busy on our six-monthly release days.

When people click the "Download" button they are sent to the thank-you page, e.g. `https://ubuntu.com/download/desktop/thank-you?version=22.04.3&architecture=amd64` ([url rule](webapp/app.py#L396-L403), [view function](webapp/views.py#L170-L184)). Similar to the homepage, it's important that this page is served as straightforwardly as possible with no back-end API/database calls so the page can remain responsive.

After the page has loaded, JavaScript will download the list of download mirrors from https://ubuntu.com/mirrors.json and choose one to trigger the download with. If JavaScript isn't available, the download will instead be triggered from our own download server, releases.ubuntu.com.

The [mirrors.json view](webapp/views.py#L261):

- Looks for a list of mirrors in the local file `etc/ubuntu-mirrors-rss.xml`. This file gets built into the production image in [the Docker build](Dockerfile#L50-L55) when the site is released. To refresh the mirror list the site needs to be released again.
- It uses geolite2 to match the request IP address to a location and serves mirrors for that location.

### Security pages

https://ubuntu.com/security/cves ([url rule](webapp/app.py#L490), [view function](webapp/security/views.py#L290)) and https://ubuntu.com/security/notices ([url rule](webapp/app.py#L466), [view function](webapp/security/views.py#L116)) list CVEs and Ubuntu Security Notices respectively. These pages are build by pulling in information from the security API. The [local API models are here](webapp/security/api.py), and this API is documented at https://ubuntu.com/security/api/docs.

The API, even though it's hosted on ubuntu.com at ubuntu.com/security/cves.json etc., is actually deployed separately in the [ubuntu-com-security-api](https://github.com/canonical/ubuntu-com-security-api/) project. This is to keep this high-traffic database-backed service separate from the main ubuntu.com application so as not to introduce stability issues.

### Pro

**To be completed** by @jpmartinspt.
