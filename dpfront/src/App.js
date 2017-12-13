import React, { Component } from 'react';
import { browserHistory } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import './bootstrap/css/bootstrap.min.css';

class DiseasePage extends React.Component {

    constructor(props) {
	super(props);

	var disease = props.disease;
	
	this.state = {
	    disease: disease,
	};

    }

    componentWillReceiveProps(newProps) {
	var disease = newProps.disease;
	this.setState({disease: disease});
    }

    render() {
	var disease = this.state.disease;
	if (disease !== undefined) {
	    var names = disease.DiseaseNames.join(', ');
	    var pathogen_names = disease.PathogenNames.join(', ');
	    var drugs = disease.Drugs.map(
		(item) => item.Drug_ID + ' - ' + item.Drug_Name).join(', ');
	    var phenos = disease.Phenotypes.map(
		(item) => item.phenotype_id + ' - ' + item.phenotype_names[0])
		.join(', ');
	    var resist = disease.Drug_Resistance.map(
		(item) => item.Resistant_to).join(', ');
	    const disease_info = (
		<tbody>
		<tr><td><strong>ID</strong></td><td>{ disease.DOID }</td></tr>
		<tr><td><strong>Names</strong></td><td>{ names }</td></tr>
		<tr><td><strong>Taxonomy ID</strong></td><td>{ disease.TaxID }</td></tr>
		<tr><td><strong>Pathogen Type</strong></td><td>{ disease.Pathogen_type }</td></tr>
		<tr><td><strong>Pathogen Names</strong></td><td>{ pathogen_names }</td></tr>
		<tr><td><strong>Drugs</strong></td><td>{ drugs }</td></tr>
		<tr><td><strong>Phenotypes</strong></td><td>{ phenos }</td></tr>
		<tr><td><strong>Resistant To</strong></td><td>{ resist }</td></tr>
		</tbody>
	    );
	    return (
		<div class="container">
		    <div class="row">
		    <table class="table table-striped text-left">
		      {disease_info}
		    </table>
		    </div>
		</div>
	    );
	}

	return (<div className="container"></div>);
    }

}

class ResultsTable extends React.Component {

    constructor(props) {
	super(props);
	var page = 1;
	if ('page' in props && props.page != undefined) {
	    page = parseInt(props.page);
	}
	var rows = [];
	var headers = [];
	console.log(props);
	if (props.data !== undefined) {
	    rows = props.data.rows.slice();
	    headers = props.data.headers;
	}
	this.state = {
	    page: page,
	    paginateBy: 10,
	    rows: rows,
	    headers: headers,
	    filterValue: '',
	};
    }

    componentWillReceiveProps(newProps) {
	var state = {}
	if (newProps.page !== undefined) {
	    state.page = parseInt(newProps.page);
	}
	if (this.props.data != newProps.data) {
	    state.page = 1;
	    state.headers = newProps.data.headers;
	    state.rows = newProps.data.rows.slice();
	    state.filterValue = '';
	}
	this.setState(state);
    }

    renderPageButton(page) {
	var activeClass = '';
	if (page == this.state.page) {
	    activeClass = 'active';
	}
	return (
		<li className={activeClass}>
		<a href={this.props.rootURI + page}>{page}</a>
		</li>
	);
    }

    renderPaginator() {
	var n = Math.ceil(this.state.rows.length / this.state.paginateBy);
	var page = this.state.page;
	var prevPage = page - 1 < 1 ? 1 : page - 1;
	var nextPage = page + 1 > n ? n : page + 1;
	var pages = Array();
	for (var i = page - 2; i <= page + 2; i++) {
	    if (i >= 1 && i <= n) {
		pages.push(i);
	    }
	}
	const content = pages.map(
	    (i) => this.renderPageButton(i));
	return (
	    <nav aria-label="Page navigation" class="pull-right">
	      <ul class="pagination">
		<li>
		<a href={this.props.rootURI + prevPage} aria-label="Previous">
		    <span aria-hidden="true">&laquo;</span>
		  </a>
		</li>
		{content}
		<li>
		<a href={this.props.rootURI + nextPage} aria-label="Next">
		    <span aria-hidden="true">&raquo;</span>
		  </a>
		</li>
	      </ul>
	    </nav>
	);
    }

    renderFilter() {
	return (
	    <form class="form">
		<br/>
		<input class="form-control" type="text" value={this.props.filterValue} onChange={(e) => this.filterChange(e)} placeholder="Filter"/>
	    </form>
	);
    }

    filterChange(e) {
	var v = e.target.value;
	this.setState({filterValue: v, page: 1});
	if (this.props.data !== undefined) {
	    const filteredRows = this.props.data.rows.filter(
		function(items) {
		    var keys = v.split(" ");
		    for (var key of keys) {
			var i = items.length - 1;
			if (items[i].indexOf(key) != -1) return true;
		    }
		}
	    );
	    this.setState({rows: filteredRows});
	}
    }

    renderRow(items) {
	const cells = items.map(
	    (item) => <td> {item} </td>);
	return (<tr> {cells} </tr>);
    }
    
    render() {
	var paginateBy = this.state.paginateBy;
	var page = this.state.page;
	const rows = this.state.rows.slice(
	    (page - 1) * paginateBy, page * paginateBy);
	const header = this.state.headers.map(
	    (item) => <th> {item} </th>);
	const content = rows.map(
	    (items) => this.renderRow(items.slice(0, items.length - 1))
	);
	return (
	    <div class="container">
		<div class="row">
		    <div class="col-md-6">
			{this.renderFilter()}
		    </div><div class="col-md-6">
			{this.renderPaginator()}
		    </div>
		</div>
		<table class="table table-striped">
		    <thead> {header} </thead>
		    <tbody> {content} </tbody>
		</table>
		{this.renderPaginator()}
	    </div>
	);
    }
}


class App extends Component {


    constructor(props) {
	super(props);
	var query = props.match.params.query;
	var section = props.match.params.section;
	if (section !== undefined) {
	    section = 'search';
	}
	
	this.state = {
	    query: query,
	    section: section,
	    results: {'headers': [], 'rows': []},
	    diseaseMap: {},
	};
    }

    componentWillMount() {
	if (this.state.query !== undefined) {
	    this.executeQuery(this.state.query);
	}
    }

    renderQueryForm() {
	return (

	    <div class="row">
		<div class="col-md-6 col-md-offset-3">
		<form class="form" onSubmit={(e) => this.handleSubmit(e)}>
		<div class="input-group input-group-lg">
		<input class="form-control input-lg" type="text" value={this.state.inputQuery} onChange={(e) => this.queryChange(e)} placeholder="Search"/>
		<span class="input-group-btn"><button type="submit" class="btn btn-lg">Query</button></span>
		</div>
		</form>
		</div>
		
	    </div>
	);
    }

    queryChange(e) {
	this.setState({inputQuery: e.target.value});
    }

    handleSubmit(e) {
	e.preventDefault();
	this.props.history.push('/search/' + encodeURIComponent(this.state.inputQuery));
    }

    componentWillReceiveProps(newProps) {
	var section = newProps.match.params.section;
	var query = newProps.match.params.query;
	if (section == 'search') {
	    if (query !== undefined && query != this.state.query) {
		query = decodeURIComponent(query);
		this.setState({query: query});
		this.executeQuery(query);
	    }

	    var page = newProps.match.params.page;
	    if (page !== undefined) {
		this.setState({page: page});
	    } else {
		this.setState({page: 1});
	    }
	} else if (section == 'browse' && query !== undefined) {
	    var doid = decodeURIComponent(query);
	    if (this.state.diseaseMap.hasOwnProperty(doid)) {
		var disease = this.state.diseaseMap[doid];
		this.setState({disease: disease});
	    }
	}
	
	this.setState({section: section});
    }

    innerHTML(htmlString) {
	const html = {__html: htmlString};
	return (<span dangerouslySetInnerHTML={html}></span>);
    }

    executeQuery(query) {
	var that = this;
	var query_list = [
            { 'match': { 'DiseaseNames': query } },
	    { 'match': { 'PathogenNames': query } }
        ];
        var docs = {
	    'query': { 'bool': { 'should': query_list } },
	    'from': 0,
	    'size': 1000
	};
            
	var params = {
	    method: 'POST', body: JSON.stringify(docs)
	};
	var that = this;
	fetch('/pathopheno/db/_search/', params)
	    .then(function(response){
		return response.json();
	    })
	    .then(function(data) {
		var hits = data.hits.hits;
		var diseases = {
		    headers: ['ID', 'Names', 'Pathogens'], rows: [] };
		var diseaseMap = {};
		for (var i = 0; i < hits.length; i++) {
		    var item = hits[i]._source;
		    console.log(item);
		    if ('DiseaseNames' in item) {
			diseaseMap[item.DOID] = item;
			const id = (<a href={'#/browse/' + encodeURIComponent(item.DOID)}>{item.DOID}</a>);
			var names = item.DiseaseNames.join(', ');
			var pathogens = item.PathogenNames.join(', ');
			var filterBy = names;
			diseases.rows.push([
			    id,
			    names,
			    pathogens,
			    names
			]);
		    }
		}
		that.setState({results: diseases, diseaseMap: diseaseMap});
	    });

    }

    
    renderSearchForm() {
	return (

	    <div className="row">
		<div className="col-md-6 col-md-offset-3">
		<form className="form" onSubmit={(e) => this.handleSubmit(e)}>
		<div className="input-group input-group-lg">
		<input className="form-control input-lg" type="text" value={this.state.inputQuery} onChange={(e) => this.queryChange(e)} placeholder="Search"/>
		<span className="input-group-btn"><button type="submit" className="btn btn-lg">Query</button></span>
		</div>
		</form>
		</div>
		
	    </div>
	);
    }
    
    renderHeader() {
	var section = this.state.section;
	const menuItems = [
	    'Search', 'Browse', 'About', 'Contact'];
	const content = menuItems.map(function(item) {
	    var activeClass = '';
	    if (item.toLowerCase() == section) {
		activeClass = 'active';
	    }
	    return (
		    <li className={activeClass}>
		    <a href={'#/' + item.toLowerCase()}>{ item }</a>
		    </li>
	    );
	});
	return (
		<div className="masthead">
        <h3 className="text-muted">Disease Pathogens</h3>
        <nav>
          <ul className="nav nav-justified">
		{ content }
	    </ul>
        </nav>
		</div>
	);
    }

    goBack(e) {
	e.preventDefault();
	this.props.history.goBack();
    }
    
    render() {
	var section = (<div></div>);
	if (this.state.section == 'search') {
	    var page = this.state.page;
	    var results = this.state.results;
	    var rootURI = '#/search/' + this.state.query + '/';
	    section = (<ResultsTable data={results} page={page} rootURI={rootURI}/>);
	} else if (this.state.section == 'browse'){
	    var disease = this.state.disease;
	    section = (
		    <div>
		    <a className="btn btn-primary btn-sm pull-left" onClick={(e) => this.goBack(e)}>Back</a>
		    <DiseasePage disease={disease} />
	        </div>);
	}
	return (
	      <div className="container">
		{ this.renderHeader() }
      <div className="jumbotron">
        <h1>DisPath Search</h1>
		<p className="lead">Some information about search</p>
	</div><div>
		{ this.renderSearchForm() }
		<br/>
		{ section }
		
      </div>

      <div className="row">
        <div className="col-lg-4">
        </div>
        <div className="col-lg-4">
        </div>
        <div className="col-lg-4">
        </div>
      </div>

      <footer className="footer">
		<p>&copy; 2017 BORG, CBRC, KAUST.</p>
      </footer>

    </div>
    );
  }
}

export default App;
