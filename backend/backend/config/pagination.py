from rest_framework.pagination import PageNumberPagination


class DefaultPagination(PageNumberPagination):
    """Lets the client widen a page with ?page_size= (used by the storefront
    to pull the whole catalog in one request)."""

    page_size = 50
    page_size_query_param = "page_size"
    max_page_size = 500
