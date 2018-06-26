from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
import requests
import json
import itertools
from django.conf import settings
import sys, traceback


ABEROWL_API_URL = getattr(settings, 'ABEROWL_API_URL', 'http://10.254.145.9/')

def read_links():
    links = {}
    with open('data/pathogens.4web.json') as f:
        pathogens = json.loads(f.read())
        for path in pathogens:
            links[path["TaxID"]] = path
    with open('data/diseases.4web.json') as f:
        diseases = json.loads(f.read())
        for dis in diseases:
            links[dis["DOID"]] = dis
    with open('data/phenotypes.4web.json') as f:
        phenotypes = json.loads(f.read())
        for pheno in phenotypes:
            links[pheno["Phenotype"]] = pheno
    
    return links

links = read_links()

def load_annotations(result):
    url = ABEROWL_API_URL + 'api/classes/'
    if 'Phenotypes' in result:
        params = {
            'ontology': 'PhenomeNETSH',
            'iri': result['Phenotypes']}
        r = requests.get(url, params=params)
        data = r.json()
        if data['status'] == 'ok':
            result['Phenotypes'] = data['result']
    if 'Diseases' in result:
        params = {
            'ontology': 'DOIDSH',
            'iri': result['Diseases']}
        r = requests.get(url, params=params)
        data = r.json()
        if data['status'] == 'ok':
            result['Diseases'] = data['result']
    if 'Pathogens' in result:
        params = {
            'ontology': 'NCBITAXONSH',
            'iri': result['Pathogens']}
        r = requests.get(url, params=params)
        data = r.json()
        if data['status'] == 'ok':
            result['Pathogens'] = data['result']
    return result


class SearchAPIView(APIView):
    def __init__(self, *args, **kwargs):
        super(SearchAPIView, self).__init__(*args, **kwargs)
    

    def get(self, request, format=None):
        try:
            query = request.GET.get('query')
            section = request.GET.get('section')
            ontology = 'DOIDSH'
            if section == 'Pathogens':
                ontology = 'NCBITAXONSH'
            elif section == 'Phenotypes':
                ontology = 'PhenomeNETSH'
            
            params = {
                'script': 'runQuery.groovy',
                'type': 'equivalent',
                'direct': 'false',
                'query': '<' + query + '>',
                'axioms': 'false',
                'ontology': ontology
            }
            url = ABEROWL_API_URL + 'api/backend/'

            r = requests.get(url, params=params)
            results = {}
            for res in r.json()["result"]:
                results[res["class"]] = res
            result = results.pop(query)
            
            if query in links:
                result.update(links[query])
                result = load_annotations(result)
            equivs = []
            for key, item in results.items():
                if key in links:
                    item.update(links[key])
                    item = load_annotations(item)
                    equivs.append(item)

            result['equivalents'] = equivs

            params['type'] = 'subclass'
            r = requests.get(url, params=params)
            results = {}
            for res in r.json()["result"]:
                results[res["class"]] = res
            subs = []
            for key, item in results.items():
                if key in links:
                    item.update(links[key])
                    item = load_annotations(item)
                    subs.append(item)
            result['subclasses'] = subs

            return Response({'status': 'ok', 'result': result})
        except Exception as e:
            traceback.print_exc(file=sys.stdout)
            return Response({'status': 'exception', 'message': str(e)})


class SearchClassesAPIView(APIView):

    def get(self, request, format=None):
        query = request.GET.get('query', None)
        try:
            url = ABEROWL_API_URL + '/api/searchclasses'
            params = {'query': query, 'ontology': 'PhenomeNETSH'}
            data = {}
            r = requests.get(url, params=params)
            phenotypes = list()
            for item in r.json()['result']:
                if (item['class'].startswith('http://purl.obolibrary.org/obo/HP_') or
                    item['class'].startswith('http://purl.obolibrary.org/obo/MP_')):
                    phenotypes.append(item)
            data['phenotypes'] = phenotypes
            params['ontology'] = 'NCBITAXONSH'
            r = requests.get(url, params=params)
            data['taxon'] = r.json()['result']
            params['ontology'] = 'DOIDSH'
            r = requests.get(url, params=params)
            diseases = list()
            for item in r.json()['result']:
                diseases.append(item)   
            data['diseases'] = diseases
            result = {'status': 'ok', 'result': data}
            return Response(result)
        except Exception as e:
            return Response({'status': 'exception', 'message': str(e)})
