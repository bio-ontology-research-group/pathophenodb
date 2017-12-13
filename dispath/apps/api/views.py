from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
import requests
import json
import itertools
from django.conf import settings


ABEROWL_API_URL = getattr(settings, 'ABEROWL_API_URL', 'http://10.254.145.9/')


class SearchAPIView(APIView):
    def __init__(self, *args, **kwargs):
        super(SearchAPIView, self).__init__(*args, **kwargs)
    

    def get(self, request, format=None):
        query_string = request.GET.urlencode()
        
        try: 
        except Exception as e:
            return Response({'status': 'exception', 'message': str(e)})
