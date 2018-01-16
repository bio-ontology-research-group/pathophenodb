from django.urls import path
from api.views import SearchAPIView, SearchClassesAPIView

urlpatterns = [
    path('searchclasses', SearchClassesAPIView.as_view(), name="searchclasses"),
    path('search', SearchAPIView.as_view(), name="search"),

]
