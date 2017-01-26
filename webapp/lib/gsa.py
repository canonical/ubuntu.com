import requests


class GSAParser:
    """
    Query the Google Search Appliance
    for results in JSON format
    and fix the results in various ways
    before returning them as a data object

    Usage:

    search_parser = GSAParser(domain="gsa.example.com")
    results = search_parser.fixed_results(query="hello world")
    """

    domain = ""
    client = ""
    default_collection = ""
    stylesheet = ""

    def __init__(
        self, domain,
        client="default_frontend",
        site_collection="default_collection",
        stylesheet="json_frontend"
    ):
        self.domain = domain
        self.client = client
        self.site_collection = site_collection
        self.stylesheet = stylesheet

    def fixed_results(self, query, start=0, num=10):
        """
        Return a data object of results from the GSA,
        fixed to show the correct total and avoid errors:
        {
            "query": <GSA's generated query>,
            "results": [
                {
                    "url": ..,
                    "title": ..,
                    "summary": ..,
                    "meta_tags" : [..],
                    "size": ..
                }, ..
            ],
            "results_nav": {
                "total_results": <total - fixed to be accurate>,
                "results_start": ..,
                "results_end": ..,
                "current_view": ..,
                "have_prev": "1", # may exist
                "have_next": "1", # may exist
            }
        }
        """

        results_data = self.results(query, start, num)
        results_data["results_nav"]["total_results"] = self.total_results(
            query
        )

        return results_data

    def total_results(self, query):
        """
        Inexplicably, the GSA returns a completely incorrect total
        This is a hack to get the correct total.

        If you request with start>1000, the GSA returns nothing.
        But if you request with start = 990, it returns the last page
        even if there are only 10 results.

        Therefore this is the way to get the real total
        """

        last_results = self.results(query, start=990, num=10)

        return last_results["results_nav"]["results_end"]

    def results(self, query, start, num):
        """
        GSA often returns invalid JSON - attempt to fix it
        """

        results_json = self.results_json(query, start, num)

        return results_json

    def results_json(self, query, start, num):
        """
        Query the GSA to get response in JSON format
        and return it

        Throws a URLError exception if it fails to
        communicate with the GSA
        """

        # Query mustn't have spaces - or BREAKZ!
        query = query.replace(' ', '+')

        # Build the GSA URL
        search_url_template = (
            'http://{domain}/search'
            '?q={q}&num={num}&start={start}&client={client}'
            '&site={site}&output=xml_no_dtd'
            '&proxystylesheet={stylesheet}'
        )
        search_url = search_url_template.format(
            domain=self.domain,
            q=query,
            num=str(num),
            start=str(start),
            client=self.client,
            site=self.site_collection,
            stylesheet=self.stylesheet
        )

        response = requests.get(search_url)

        return response.json()
