import React, { Component } from 'react';
import { browserHistory } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import './bootstrap/css/bootstrap.min.css';


class App extends Component {


    constructor(props) {
	super(props);
	
	this.state = {
	    page: 'search',
	    query: '',
	    search: '',
	    section: '',
	    searchResults: {"taxon": [], "diseases": [], "phenotypes": []},
	    searchResultsShow: false,
	    result: {}
	};
    }

    componentWillMount() {
	const params = this.props.match.params;
	if (params.page == 'search' && params.section !== undefined && params.query !== undefined) {
	    this.executeQuery(params.section, params.query);
	    this.setState({page: params.page,
			   section: params.section, query: params.query});
	} else if (params.page !== undefined){
	    this.setState({page: params.page});
	}
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
		<a href={'/#/search/Pathogens/' + encodeURIComponent(item.class)}
	            onClick={(e) => this.handleSearchItemClick(item.label[0])}>{item.label[0]}</a></li>
	);
	const diseases = results["diseases"].map(
	    (item) => 
		<li>
		<a href={'/#/search/Diseases/' + encodeURIComponent(item.class)}
	            onClick={(e) => this.handleSearchItemClick(item.label[0])}>{item.label[0]}</a></li>
	);
	const phenotypes = results["phenotypes"].map(
	    (item) => 
		<li>
		<a href={'#/search/Phenotypes/' + encodeURIComponent(item.class)}
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
	var page = newProps.match.params.page;
	var section = newProps.match.params.section;
	var query = newProps.match.params.query;
	if (page == 'search') {
	    this.executeQuery(section, query);
	    this.setState({page: page, section: section, query: query});
	} else {
	    this.setState({page: page});
	}
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
	var page = this.state.page;
	const menuItems = [
	    'Search', 'About', 'Help'];
	const content = menuItems.map(function(item) {
	    var activeClass = '';
	    if (item.toLowerCase() == page) {
		activeClass = 'active';
	    }
	    return (
		    <li className={activeClass}>
		    <a href={'/#/' + item.toLowerCase()}>{ item }</a>
		    </li>
	    );
	});
	return (
		<div className="masthead">
        <nav>
          <ul className="nav nav-justified">
		{ content }
	    	<li><a href="html2.html">SPARQL-Examples</a></li>	
	    	<li><a target="_blank" href="http://patho.phenomebrowser.net/sparql/sparql/">Sparql endpoint</a></li>
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
	var infod = '';
	var infopatho='method';
	var infopheno='source';
	if (obj.ontology == 'NCBITAXONSH') {
	    objSection = 'Pathogens';
	    infod = 'method';
		infopheno='';
		infopatho='';
	} else if (obj.ontology == 'PhenomeNETSH') {
	    objSection = 'Phenotypes';
	    infod = 'source';
		infopatho='';
		infopheno='';
	}
	if (!obj.hasOwnProperty('class')) {
	    return (<div className="row"></div>);
	}
	var diseases = (<div className="hidden"></div>);
	var phenotypes = (<div className="hidden"></div>);
	var pathogens = (<div className="hidden"></div>);
	if (objSection != 'Diseases') {
	    var items = '';
	    if (obj.hasOwnProperty('Diseases')) {
		items = Object.values(obj.Diseases).map(
		    (item) =>
			<tr>
			<td><a href={'#/search/Diseases/' + encodeURIComponent(item.class)}>{item.class}</a></td>
			<td>{item.label}</td><td>{item[infod]}</td></tr>
		);
	    }
	    let subs = obj.subclasses.map(function(sub){
		let subItems = '';
		if (sub.hasOwnProperty('Diseases')) {
		    subItems = Object.values(sub.Diseases).map(
		    (item) =>
			<tr>
			<td><a href={'#/search/Diseases/' + encodeURIComponent(item.class)}>{item.class}</a></td>
			<td>{item.label}</td><td>{item[infod]}</td></tr>
		    );
		}
		return (
		    
			<table className="table table-striped">
			<tbody>
			<tr><td colspan="2"><strong>
			<a href={'#/' + objSection + '/' + encodeURIComponent(sub.class)}>{sub.label} ({sub.class})</a></strong></td></tr>
			{subItems}
		    </tbody>
			</table>
		);
	    });
	    if (obj.subclasses.length > 0) {
		subs = (
		    	<div>
			<p> <strong>Assosications of subclasses</strong></p>
			{subs}
			</div>
		);
	    }
	    let equivs = obj.equivalents.map(function(sub){
		let subItems = '';
		if (sub.hasOwnProperty('Phenotypes')) {
		    subItems = Object.values(sub.Phenotypes).map(
			(item) =>
			    <tr>
			    <td><a href={'#/search/Diseases/' + encodeURIComponent(item.class)}>{item.class}</a></td>
			    <td>{item.label}</td><td>{item[infod]}</td></tr>
		    );
		}
		return (
		    <div>
		        <p> <strong>Assosications of equivalent classes</strong></p>
		
			<table className="table table-striped">
			<tbody>
			<tr><td colspan="2"><strong>
			<a href={'#/' + objSection + '/' + encodeURIComponent(sub.class)}>{sub.label} ({sub.class})</a></strong></td></tr>
			{subItems}
		    </tbody>
			</table>
			</div>
		);
	    });

	    if (obj.equivalents.length > 0) {
		equivs = (
		    	<div>
			<p> <strong>Assosications of equivalent classes</strong></p>
			{equivs}
			</div>
		);
	    }
	    
	    diseases = (
		    <div className="col-md-6">
		    <h3>Associated Diseases</h3>
		    <table className="table table-striped">
		    <thead><tr><th>IRI</th><th>Label</th><th>{infod}</th></tr></thead>
		    <tbody>
		    {items}
		</tbody>
		</table>
		    {subs}
		    {equivs}
		</div>
	    );
	}
	if (objSection != 'Pathogens') {
	    var items = '';
	    if (obj.hasOwnProperty('Pathogens')) {
		items = Object.values(obj.Pathogens).map(
		    (item) =>
			<tr>
			<td><a href={'#/search/Pathogens/' + encodeURIComponent(item.class)}>{item.class}</a></td>
			<td>{item.label}</td><td>{item[infopatho]}</td></tr>
		);
	    }
	    let subs = obj.subclasses.map(function(sub){
		let subItems = '';
		if (sub.hasOwnProperty('Pathogens')) {
		    subItems = Object.values(sub.Pathogens).map(
			(item) =>
			    <tr>
			    <td><a href={'#/search/Diseases/' + encodeURIComponent(item.class)}>{item.class}</a></td>
			    <td>{item.label}</td><td>{item[infod]}</td></tr>
		    );
		}
		return (
			<table className="table table-striped">
			<tbody>
			<tr><td colspan="2"><strong>
			<a href={'#/' + objSection + '/' + encodeURIComponent(sub.class)}>{sub.label} ({sub.class})</a></strong></td></tr>
			{subItems}
		    </tbody>
			</table>
		);
	    });
	    if (obj.subclasses.length > 0) {
		subs = (
		    	<div>
			<p> <strong>Assosications of subclasses</strong></p>
			{subs}
			</div>
		);
	    }
	    
	    let equivs = obj.equivalents.map(function(sub){
		let subItems = '';
		if (sub.hasOwnProperty('Pathogens')) {
		    subItems = Object.values(sub.Pathogens).map(
			(item) =>
			    <tr>
			    <td><a href={'#/search/Diseases/' + encodeURIComponent(item.class)}>{item.class}</a></td>
			    <td>{item.label}</td><td>{item[infod]}</td></tr>
		    );
		}
		return (	
			<table className="table table-striped">
			<tbody>
			<tr><td colspan="2"><strong>
			<a href={'#/' + objSection + '/' + encodeURIComponent(sub.class)}>{sub.label} ({sub.class})</a></strong></td></tr>
			{subItems}
		    </tbody>
			</table>
		);
	    });
	    if (obj.equivalents.length > 0) {
		equivs = (
		    	<div>
			<p> <strong>Assosications of equivalent classes</strong></p>
			{equivs}
			</div>
		);
	    }
	    
	    pathogens = (
		    <div className="col-md-6">
		    <h3>Associated Pathogens</h3>
		    <table className="table table-striped">
		    <thead><tr><th>IRI</th><th>Label</th><th>{infopatho}</th></tr></thead>
		    <tbody>
		       {items}
		    </tbody>
		    </table>
		    {subs}
		    {equivs}
		</div>
	    );
	}

	if (objSection != 'Phenotypes') {
	    var items = '';
	    if (obj.hasOwnProperty('Phenotypes')) {
		items = Object.values(obj.Phenotypes).map(
		    (item) =>
			<tr>
			<td><a href={'#/search/Phenotypes/' + encodeURIComponent(item.class)}>{item.class}</a></td>
			<td>{item.label}</td><td>{item[infopheno]}</td></tr>
		);
	    }
	    let subs = obj.subclasses.map(function(sub){
		let subItems = '';
		if (sub.hasOwnProperty('Phenotypes')) {
		    subItems = Object.values(sub.Phenotypes).map(
			(item) =>
			    <tr>
			    <td><a href={'/#/search/Diseases/' + encodeURIComponent(item.class)}>{item.class}</a></td>
			    <td>{item.label}</td><td>{item[infod]}</td></tr>
		    );
		}
		return (
			<table className="table table-striped">
			<tbody>
			<tr><td colspan="2"><strong>
			<a href={'/#/search/' + objSection + '/' + encodeURIComponent(sub.class)}>{sub.label} ({sub.class})</a></strong></td></tr>
			{subItems}
		    </tbody>
			</table>
		);
	    });
	    if (obj.subclasses.length > 0) {
		subs = (
		    	<div>
			<p> <strong>Assosications of subclasses</strong></p>
			{subs}
			</div>
		);
	    }
	    
	    phenotypes = (
		    <div className="col-md-6">
		    <h3>Associated Phenotypes</h3>
		    <table className="table table-striped">
		    <thead><tr><th>IRI</th><th>Label</th><th>{infopheno}</th></tr></thead>
		    <tbody>
		    {items}
		</tbody>
		    </table>
		    {subs}
		</div>
	    );
	}
	let specContent = (<tr></tr>);
	if (objSection == 'Diseases' && obj.hasOwnProperty("Drugs")) {
	    let specItems = obj.Drugs.map((item) => (<a target="_blank" href={item.Drug_ID}> {item.Drug_Name} </a>));
	    specContent = (<tr><td><strong> Drugs </strong></td><td>{specItems}</td></tr>);
	} else if (objSection == 'Pathogens' && obj.hasOwnProperty("Drug_Resistance")) {
	    let specItems = obj.Drug_Resistance.map(
		(item) => (
			<tr>
			<td>
			<a target="_blank" href={item.PubChemID}> {item.Resistant_to} </a>
			</td>
			<td>
			<a target="_blank" href={item.DNA_accession}> {item.DNA_accession} </a>
			</td>
			<td>
			<a target="_blank" href={item.Protein_accession}> {item.Protein_accession} </a>
			</td>
		    </tr>
		));


	    specContent = (<tr>
			   <td><strong> Resistant to</strong></td>
			   <td>
			   <table className="table table-striped">
			   <thead><th>Drug</th><th>DNA Accession</th><th>Protein Accession</th></thead>
			   <tbody>
			   {specItems}
			   </tbody>
			   </table>
			   </td></tr>);
	
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

    renderSearchPage() {
	if (this.state.page == 'search') {
	    return (
		<div>
		<div className="jumbotron">
		<h1>PathoPhenoDB Search</h1>
		<p className="lead">
		   A database of pathogens and their phenotypes for
		   diagnostic support in infections. 
	        </p>
		</div>
		<div className="row"><div className="col-md-12">
		<p>
		Examples:
		<ul>
		<li>Disease - <a href="/#/search/Diseases/http%3A%2F%2Fpurl.obolibrary.org%2Fobo%2FDOID_11263">Chlamydia</a></li>
		<li>Pathogen - <a href="/#/search/Pathogens/http%3A%2F%2Fpurl.obolibrary.org%2Fobo%2FNCBITaxon_10255">Variola virus</a></li>
		<li>Phenotype - <a href="/#/search/Phenotypes/http%3A%2F%2Fpurl.obolibrary.org%2Fobo%2FHP_0000988">Skin rash</a></li>
	    </ul>
	    </p>
		</div></div>

		<div className="row">
		{ this.renderSearchForm() }
		<br/>
		</div>
		    { this.renderResult() }
		</div>
	    );
	} else {
	    return (<div></div>);
	}
    }

    renderAboutPage() {
	if (this.state.page != 'about') {
	    return (<div></div>);
	}
	return (
		<div>
		<h3>PathoPhenoDB</h3>
		<br/>
		<p>
		PathoPhenoDB aims to support diagnosis of infectious diseases caused by known pathogens.
		The database relies on the pathogen-to-phenotype associations.
		Pathogen-disease relations are manually gathered from Wikipedia,
	    Disease Ontology, Medscape, Centers for disease control and prevention,
	    and literature and linked to disease-phenotypes by using text mining methods. 
		</p>
		<p>
		Mappings:
	    <ul>
		<li>Pathogens are mapped to NCBI Taxonomy</li>
	    <li>Diseases are mapped to Infectious disease class of Disease Ontology</li>
	    <li>Phenotypes are mapped to Human Phenotype Ontology and Mammalian Phenotype ontology.</li> 
	    <li>Drugs are mapped to PubChem</li>
	    <li>Resistant pathogen genes are mapped to ARO</li>
		</ul>
		</p>
		<p>
		Current statistics:
		<ul> 
		<li>1143  pathogen-disease associations with Manual Curation.</li> 
		<li>4169  pathogen-disease associations with Manual Curation, and text mining.</li>
		<li>1140  pathogen-disease associations linked to phenotypes with Manual Curation.</li>
	    <li>3989  pathogen-disease associations linked to phenotypes with Manual Curation, and text mining.</li>
	    <li>508   diseases linked to pathogens with Manual Curation.</li>
	    <li>538   diseases linked to pathogens with Manual Curation, and text mining.</li>
	    <li>488   diseases linked to pathogens and phenotypes with Manual Curation.</li>
	    <li>511   diseases linked to pathogens and phenotypes with Manual Curation, and text mining.</li>
	    <li>692   pathogens linked to phenotypes(insect: 32, fungi: 115, bacteria: 208, virus: 175, protozoa: 47, worm: 115) with Manual Curation.</li>
	    <li>1642  pathogens linked to phenotypes(fungi: 220, insect: 367, bacteria: 404, virus: 358, worm: 199, protozoa: 98) with Manual Curation, and text mining.</li>
	    <li>130   diseases with Drug information from Sider with Manual Curation.</li>
	    <li>139   diseases with Drug information from Sider with Manual Curation, and text mining.</li>
	    <li>30    pathogens with resistant information from ARO with Manual Curation.</li>
	    <li>47    pathogens with resistant information from ARO with Manual Curation, and text mining.</li>
		</ul>
	    </p>
		</div>
	);
    }

    renderHelpPage() {
	if (this.state.page != 'help') {
	    return (<div></div>);
	}

	return (
		<div>
		<h3> How to make a search in PathoPhenoDB? </h3> 
		<p>
		You can search a disease name, pathogen name or a phenotype name in
	    PathoPhenoDB. Below are the example searches for each case:
	    </p>
		<h4>Pathogen search:</h4>
		<p>
As shown in the example below, type the pathogen name in to the search
box that you would like to search in PathoPhenoDB. The database will
return the list of diseases associated with the searched pathogen as
well as all the phenotypes associated with the diseases. The drug
resistance information associated with the searched pathogen will be
also listed. Indirect associations will cover the diseases associated
with the subclasses of the searched pathogen based on the NCBI taxon
Ontology.
</p>
		<p><img src="/static/images/patho1.png"/></p>

		<h4> Phenotype search: </h4>
		<p>
As shown in the example below, type the phenotype name in to the
search box that you would like to search in PathoPhenoDB. The database
will return the list of diseases associated with the searched
phenotype as well as the causative pathogens. Indirect associations
will cover both, the phenotypes associated with the subclasses and
equivalent classes of the searched phenotype based on the PhenomeNET
	    ontology.
		</p>
		<p><img src="/static/images/patho2.png"/></p>

		<h4>Disease search:</h4>
		<p>
As shown in the example below, type the disease name in to the search
box that you would like to search in PathoPhenoDB. The database will
return the list of pathogens associated with the searched disease as
well as the phenotypes. The drugs that can be used to treat the
disease will be also retrieved. Indirect associations will cover the
diseases associated with the subclasses of the searched disease based
on the Disease Ontology.
		</p>
		<p><img src="/static/images/patho3.png"/></p>
		</div>
	);
	
    }

    
    render() {
	var section = (<div></div>);
	return (
		<div className="container">
		{ this.renderHeader() }
	    { this.renderSearchPage() }
	    { this.renderAboutPage() }
	    { this.renderHelpPage() }
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
