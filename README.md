# WPI Covid Dashboard Downloader
This is a tool to download data from WPI's Covid-19 Dashboard.  
The dashboard is hosted/run by [Tableau](https://www.tableau.com/) and has the `Download Data` option disabled.
The script gets a session token from Tableau and then pulls data from their API like the dashboard itself does. The actual data is returned with two JSON objects and some extra data in one request so we first have to split that and get the data we want.  
This data is then parsed to get the correct values then saved to a cache so we don't have to bother Tableu's servers every time. This is partly to reduce the load on my (and their) server(s) and partly to keep them from blocking me from their service.  
The script can export the data in both JSON and Prometheus format, so it can easily be parsed by other tools, such as Grafana.  
It can also be run in a Docker container to simplify setup and maitainance. To run in Docker, just clone the repo and run `docker-compose up -d` to build and start the container. If you ever pull updates or make your own changes, you have to rebuild the image to have them reflected in the container: `docker-compose build; docker-compose up -d`.  
PRs are welcome, so feel free to add your own exporters if you need a specific format.