import React, { Component } from 'react';
import { browserHistory } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import './bootstrap/css/bootstrap.min.css';


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
	    search: '',
	    section: section,
	    searchResults: {"taxon": [], "diseases": [], "phenotypes": []},
	    searchResultsShow: false,
	    result: {}
	};
    }

    componentWillMount() {
    }

    searchChange(e) {
	var search = e.target.value;
	this.setState({search: search});
	if (search.length >= 3) {
	    this.executeSearch(search);
	    this.setState({searchResultsShow: true });
	} else {
	    this.setState({searchResultsShow: false});
	
	}
    }

    executeSearch(search) {
	var that = this;
	fetch('/api/searchclasses?query=' + encodeURIComponent(search)
		  + '&format=json')
	    .then((response) => response.json())
	    .then(function(data) {
		console.log(data);
		if (data.status == 'ok') {
		    that.setState({
			searchResults: data.result,
			searchResultsShow: true});
		}
	    });
    }

    handleSearchItemClick(search) {
	this.setState({ search: search, searchResultsShow: false });
    }


    renderSearchResults() {
	var results = this.state.searchResults;
	const pathogens = results["taxon"].map(
	    (item) => 
		<li>
		<a href={'#/Pathogens/' + encodeURIComponent(item.class)}
	            onClick={(e) => this.handleSearchItemClick(item.label[0])}>{item.label[0]}</a></li>
	);
	const diseases = results["diseases"].map(
	    (item) => 
		<li>
		<a href={'#/Diseases/' + encodeURIComponent(item.class)}
	            onClick={(e) => this.handleSearchItemClick(item.label[0])}>{item.label[0]}</a></li>
	);
	const phenotypes = results["phenotypes"].map(
	    (item) => 
		<li>
		<a href={'#/Phenotypes/' + encodeURIComponent(item.class)}
	            onClick={(e) => this.handleSearchItemClick(item.label[0])}>{item.label[0]}</a></li>
	);
	var open = '';
	if (this.state.searchResultsShow) {
	    open = 'open';
	}
	return (
	    <div className={'dropdown ' + open}>
		<ul class="dropdown-menu">
		<li><strong>Pathogens</strong></li>
		{pathogens}
	        <li><strong>Diseases</strong></li>
		{diseases}
		<li><strong>Phenotypes</strong></li>
		{phenotypes}	    
	    </ul>
	    </div>
	);
    }
    

    componentWillReceiveProps(newProps) {
	var section = newProps.match.params.section;
	var query = newProps.match.params.query;
	this.executeQuery(section, query);
	this.setState({section: section, query: query});
    }

    innerHTML(htmlString) {
	const html = {__html: htmlString};
	return (<span dangerouslySetInnerHTML={html}></span>);
    }

    executeQuery(section, query) {
	var that = this;
	    
	fetch('/api/search?query=' + query + '&section=' + section)
	    .then(function(response){
		return response.json();
	    })
	    .then(function(data) {
		console.log(data);
		if (data.status == 'ok') {
		    console.log(data);
		    that.setState({result: data.result});
		}
	    });

    }

    
    renderSearchForm() {
	return (

	    <div className="row">
		<div className="col-md-6 col-md-offset-3">
		<input className="form-control input-lg" type="text"
	    value={this.state.search} onChange={(e) => this.searchChange(e)} placeholder="Search"/>
		{ this.renderSearchResults()}
	        </div>
		
	    </div>
	);
    }
    
    renderHeader() {
	var section = this.state.section;
	const menuItems = [
	    'Search', 'Browse', 'About'];
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
		<li><a target="_blank" href="http://borg.kaust.edu.sa/Pages/People.aspx">Contact</a></li>
	    </ul>
        </nav>
		</div>
	);
    }

    goBack(e) {
	e.preventDefault();
	this.props.history.goBack();
    }

    renderResult() {
	var obj = this.state.result;
	var objSection = 'Diseases';
	if (obj.ontology == 'NCBITAXONSH') {
	    objSection = 'Pathogens';
	} else if (obj.ontology == 'PhenomeNETSH') {
	    objSection = 'Phenotypes';
	}
	if (!obj.hasOwnProperty('class')) {
	    return (<div className="row"></div>);
	}
	var diseases = (<div className="hidden"></div>);
	var phenotypes = (<div className="hidden"></div>);
	var pathogens = (<div className="hidden"></div>);
	if (obj.hasOwnProperty('Diseases')) {
	    var items = Object.values(obj.Diseases).map(
		(item) =>
		    <tr>
		    <td><a href={'#/Diseases/' + encodeURIComponent(item.class)}>{item.class}</a></td>
		    <td>{item.label}</td></tr>
	    );
	    let subs = obj.subclasses.map(function(sub){
		let subItems = Object.values(sub.Diseases).map(
		    (item) =>
			<tr>
			<td><a href={'#/Diseases/' + encodeURIComponent(item.class)}>{item.class}</a></td>
			<td>{item.label}</td></tr>
		);
		return (
			<table className="table table-striped">
			<tbody>
			<tr><td colspan="2"><strong>
			<a href={'#/' + objSection + '/' + encodeURIComponent(sub.class)}>{sub.class}</a></strong></td></tr>
			{subItems}
		    </tbody>
			</table>
		);
	    });
	    diseases = (
		    <div className="col-md-6">
		    <h3>Associated Diseases</h3>
		    <table className="table table-striped">
		    <thead><tr><th>IRI</th><th>Label</th></tr></thead>
		    <tbody>
		    {items}
		<tr><td colspan="2"><strong>Indirect Associations</strong></td></tr>
		</tbody>
		</table>
		    {subs}
		</div>
	    );
	}
	if (obj.hasOwnProperty('Pathogens')) {
	    var items = Object.values(obj.Pathogens).map(
		(item) =>
		    <tr>
		    <td><a href={'#/Pathogens/' + encodeURIComponent(item.class)}>{item.class}</a></td>
		    <td>{item.label}</td></tr>
	    );
	    let subs = obj.subclasses.map(function(sub){
		let subItems = Object.values(sub.Pathogens).map(
		    (item) =>
			<tr>
			<td><a href={'#/Diseases/' + encodeURIComponent(item.class)}>{item.class}</a></td>
			<td>{item.label}</td></tr>
		);
		return (
			<table className="table table-striped">
			<tbody>
			<tr><td colspan="2"><strong>
			<a href={'#/' + objSection + '/' + encodeURIComponent(sub.class)}>{sub.class}</a></strong></td></tr>
			{subItems}
		    </tbody>
			</table>
		);
	    });
	    pathogens = (
		    <div className="col-md-6">
		    <h3>Associated Pathogens</h3>
		    <table className="table table-striped">
		    <thead><tr><th>IRI</th><th>Label</th></tr></thead>
		    <tbody>
		    {items}
		<tr><td colspan="2"><strong>Indirect Associations</strong></td></tr>
		</tbody>
		    </table>
		    {subs}
		</div>
	    );
	}

	if (obj.hasOwnProperty('Phenotypes')) {
	    var items = Object.values(obj.Phenotypes).map(
		(item) =>
		    <tr>
		    <td><a href={'#/Phenotypes/' + encodeURIComponent(item.class)}>{item.class}</a></td>
		    <td>{item.label}</td></tr>
	    );
	    let subs = obj.subclasses.map(function(sub){
		let subItems = Object.values(sub.Phenotypes).map(
		    (item) =>
			<tr>
			<td><a href={'#/Diseases/' + encodeURIComponent(item.class)}>{item.class}</a></td>
			<td>{item.label}</td></tr>
		);
		return (
			<table className="table table-striped">
			<tbody>
			<tr><td colspan="2"><strong>
			<a href={'#/' + objSection + '/' + encodeURIComponent(sub.class)}>{sub.class}</a></strong></td></tr>
			{subItems}
		    </tbody>
			</table>
		);
	    });
	    phenotypes = (
		    <div className="col-md-6">
		    <h3>Associated Phenotypes</h3>
		    <table className="table table-striped">
		    <thead><tr><th>IRI</th><th>Label</th></tr></thead>
		    <tbody>
		    {items}
		<tr><td colspan="2"><strong>Indirect Associations</strong></td></tr>
		</tbody>
		    </table>
		    {subs}
		</div>
	    );
	}
	let specContent = (<tr></tr>);
	if (objSection == 'Diseases') {
	    let specItems = obj.Drugs.map((item) => (<a target="_blank" href={item.Drug_ID}> {item.Drug_Name} </a>));
	    specContent = (<tr><td><strong> Drugs </strong></td><td>{specItems}</td></tr>);
	} else if (objSection == 'Pathogens' && obj.hasOwnProperty("Drug_Resistance")) {
	    let specItems = obj.Drug_Resistance.map((item) => (<a target="_blank" href={item.PubChemID}> {item.Resistant_to} </a>));
	    specContent = (<tr><td><strong> Resistant to</strong></td><td>{specItems}</td></tr>);
	
	}
	const content = (
	    <div class="col-md-12">
		<table className="table table-striped">
		<tbody>
		<tr><td><strong>Label</strong></td><td>{obj.label}</td></tr>
		<tr><td><strong>Class</strong></td><td>{obj.class}</td></tr>
		<tr><td><strong>Definition</strong></td><td>{obj.definition}</td></tr>
		{specContent}
	    </tbody>
		</table>
		{diseases}{pathogens}{phenotypes}
	    </div>
	
	);
	return (<div class="row">{content}</div>);
    }
    
    render() {
	var section = (<div></div>);
	return (
	      <div className="container">
		{ this.renderHeader() }
		<div className="jumbotron">
		<h1>PathoPhenoDB Search</h1>
		<p className="lead">Some information about search</p>
		</div>

		<div className="row">
		{ this.renderSearchForm() }
		<br/>
		</div>
		{ this.renderResult() }

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
