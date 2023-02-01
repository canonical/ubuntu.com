from requests import Session


class CertificationAPI:
    """
    Method names and properties to describe and map directly
    onto the Certification API
    (at the time of writing, this API is available at
    https://certification.canonical.com/api/v1)
    """

    def __init__(self, base_url: str, session: Session):
        self.base_url = base_url
        self.session = session

    def _get(self, path: str, params: dict = {}):
        # Remove "None" values from params
        params = {
            key: value for key, value in params.items() if value is not None
        }

        # Get the JSON data
        response = self.session.get(
            f"{self.base_url}/{path.strip('/')}/?format=json",
            params=params,
        )

        # Raise any HTTP errors
        response.raise_for_status()

        return response

    def certified_makes(
        self,
        limit=None,
        offset=None,
        desktops__gte=None,
        laptops__gte=None,
        smart_core__gte=None,
        soc__gte=None,
        servers__gte=None,
        make__iexact=None,
    ):
        return self._get(
            "certifiedmakes",
            params={
                "limit": limit,
                "offset": offset,
                "desktops__gte": desktops__gte,
                "laptops__gte": laptops__gte,
                "smart_core__gte": smart_core__gte,
                "soc__gte": soc__gte,
                "servers__gte": servers__gte,
                "make__iexact": make__iexact,
            },
        ).json()

    def certified_models(
        self,
        limit=None,
        offset=None,
        level=None,
        category=None,
        canonical_id=None,
        canonical_id__in=None,
        major_release__in=None,
        vendor=None,
        make__iexact=None,
        query=None,
        category__in=None,
        order_by=None,
        device_identifier=None,
        device_bus=None,
        device_subsystem=None,
        device_vendor_id=None,
    ):
        response = self._get(
            "certifiedmodels",
            params={
                "limit": limit,
                "offset": offset,
                "level": level,
                "major_release__in": major_release__in,
                # If vendor is a list, requests will tranform into
                # &vendor=item&vendor=item
                "vendor": vendor,
                "make__iexact": make__iexact,
                "query": query,
                "canonical_id": canonical_id,
                "canonical_id__in": canonical_id__in,
                "category": category,
                "category__in": category__in,
                "order_by": order_by,
                "device_identifier": device_identifier,
                "device_bus": device_bus,
                "device_subsystem": device_subsystem,
                "device_vendor_id": device_vendor_id,
            },
        )
        response.raise_for_status()

        return response.json()

    def certified_model_details(
        self, limit=None, offset=None, canonical_id=None
    ):
        return self._get(
            "certifiedmodeldetails",
            params={
                "limit": limit,
                "offset": offset,
                "canonical_id": canonical_id,
            },
        ).json()

    def certified_model_devices(
        self,
        limit=None,
        offset=None,
        query=None,
        canonical_id=None,
        identifier=None,
        subsystem=None,
        category=None,
        make=None,
        name=None,
        subproduct_name=None,
        subvendor_id=None,
        vendor_id=None,
    ):
        return self._get(
            "certifiedmodeldevices",
            params={
                "limit": limit,
                "offset": offset,
                "query": query,
                "canonical_id": canonical_id,
                "identifier": identifier,
                "subsystem": subsystem,
                "category": category,
                "make": make,
                "name": name,
                "subproduct_name": subproduct_name,
                "subvendor_id": subvendor_id,
                "vendor_id": vendor_id,
            },
        ).json()

    def certified_releases(
        self,
        limit=None,
        offset=None,
        desktops__gte=None,
        laptops__gte=None,
        smart_core__gte=None,
        soc__gte=None,
        servers__gte=None,
    ):
        return self._get(
            "certifiedreleases",
            params={
                "limit": limit,
                "offset": offset,
                "desktops__gte": desktops__gte,
                "laptops__gte": laptops__gte,
                "smart_core__gte": smart_core__gte,
                "soc__gte": soc__gte,
                "servers__gte": servers__gte,
            },
        ).json()

    def component_summaries(
        self,
        limit=None,
        offset=None,
        id=None,
        canonical_id=None,
        query=None,
        make=None,
        category__iexact=None,
    ):
        return self._get(
            "componentsummaries",
            params={
                "limit": limit,
                "offset": offset,
                "id": id,
                "canonical_id": canonical_id,
                "query": query,
                "make": make,
                "category__iexact": category__iexact,
            },
        ).json()

    def component_summary(self, id):
        return self._get(f"componentsummaries/{id}").json()

    def device_categories(self, limit=None, offset=None):
        return self._get(
            "devicecategories", params={"limit": limit, "offset": offset}
        ).json()

    def releases(self, limit=None, offset=None):
        return self._get(
            "releases", params={"limit": limit, "offset": offset}
        ).json()

    def vendor_summaries_server(self, limit=None, offset=None):
        return self._get(
            "vendorsummaries/server", params={"limit": limit, "offset": offset}
        ).json()


class PartnersAPI:
    def __init__(self, session):
        self.session = session
        self.base_url = "https://partners.ubuntu.com/partners.json"

    def _get(self, params=None):
        # Get the JSON data
        response = self.session.get(
            f"{self.base_url}",
            params=params,
        )

        # Raise any HTTP errors
        response.raise_for_status()

        return response.json()

    def get_partner_by_name(self, name):
        # Map inconsistent vendor names vs partner name
        map_vendors = {
            "Ericsson, Inc.": "Ericsson",
            "HP": "Hewlett Packard",
            "Intel Corp": "Intel",
            "Huawei Technologies Co., Ltd.": "Huawei",
            "Mellanox Technologies": "Mellanox",
            "NEC Corporation": "NEC",
            "nVidia": "NVIDIA",
            "Supermicro": "Super Micro Computer",
            "ASUS Computers, Inc.": "ASUS",
            "AAEON Technology Inc.": "AAEON",
        }
        if name in map_vendors:
            name = map_vendors[name]

        params = {"name": name}

        return self._get(params)
