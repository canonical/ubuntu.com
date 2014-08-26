Run site
===

``` bash
sass --watch --debug-info templates/static/css/styles.scss &
./manage runserver
```

Updating templates to work with this project
===

``` bash
perl -pi -e 's/\{\{ STATIC_URL \}\}u\//{{ STATIC_URL }}/g' `find .`
perl -pi -e 's/\{\% (extends|include) "ubuntu\//{% $1 "/g' `find .`
```

Updating sass files to compile correctly
===

``` bash
perl -pi -e 's/\@import \"css\//\@import \"/g' `find . -name '*.scss'`
```
=======
