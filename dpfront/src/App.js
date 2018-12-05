import React, { Component } from 'react';
import { browserHistory } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import './bootstrap/css/bootstrap.min.css';
import Plot from 'react-plotly.js';


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
		    that.setState({ 
		    	search: data.result.label,
		    	result: data.result});
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
	    'Search','Explore', 'About', 'Help','Downloads'];
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
	    	<li><a href="RDFquery.html">SPARQL</a></li>	
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
			<p> <strong>Associations of subclasses</strong></p>
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
			<p> <strong>Associations of equivalent classes</strong></p>
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
			<p> <strong>Associations of subclasses</strong></p>
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
			<p> <strong>Associations of equivalent classes</strong></p>
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

    explore(){
    	var trace1 = {
  			x: [10.162094420264362,-8.681572179079803,3.684148116359646,-8.891245031282251,-8.810960099577233,-9.324698811611551,-8.613761959692972,-10.029228563806416,-12.988442163405692,-1.9984231803330683,-2.1360074365062447,9.23218165908108,-12.351561588334585,3.976402132999493,9.831961592351481,9.306706880659494,0.8839991634026451,10.144190798892446,5.773192622299303,-2.825757558928718,-2.3786106815089716,-1.0343688245237153,-6.802215268472287,-1.3353229425547741,4.1342281152871,-1.6679837321048838,-3.09822991693621,-14.864432123770984,-12.082735454271173,3.0785811066550868,-6.456930171807165,-5.749053323678325,-11.4346598416785,-8.54241608979053,-11.521658213614407,-5.761758091298988,16.86725772779883,-4.54565462023761,8.924137111370618,13.662205643506905,-10.096316916054617,10.89683818198174,8.639341246871858,15.898353286124792,11.1024437386245,13.290836014171441,14.64395935972159,5.302486443077591,-9.476159463042627,10.012436574236359,-6.826700030819131,-11.120571073358333,13.24948949224699,-0.5517471330004542,10.924606552511323,8.544759489967838,8.601591576828204,12.28733254759493,6.244412955884235,7.171152475805979,10.337453405658064,3.2079825208451274,11.062285451580461,-0.8074606711390662,9.027907635554298,4.198103661134421,6.422774633842488,7.548257759087581,-1.4907924970299038,-14.371372268427015,-10.26954456286548,-10.097355341611795,3.435703784925985,-2.3519048844544796,1.4204247836126547,-7.8835822115713166,-0.23738471395367217,-1.8502498368165416,-10.786489286791193,-10.206545758358544,-4.478353645761603,-2.2600389671138674,-4.498318872589454,5.941546663637527,5.599045293719719,15.870172687080073,0.6116894680847424,4.684787002499153,-1.476089788374665,0.6985654099894593,7.512789013497187,0.5656234114910504,-1.3091246158926038,-1.2974585313561633,-1.7734728826478494,14.70947985539092,-6.5114141078829935,9.784399562624984,10.282377518469994,-7.770929063387771,9.620212732868628,-6.638019065953489,-2.0189732189421394,11.495565396698822,4.569583698188026,-3.5824370429625914,-2.6871043761544757,-5.213796907641188,-3.0362709759843987,-13.704261713714935,-11.365370202983542,-13.074587042078726,-7.2656123108696375,-3.0769417296261783,2.0845409894290228,-1.0251950150373277,-7.483388626321235,-5.390596980947395,3.1106171408453247,-8.819867047083404,8.77768218050657,14.03982824313651,11.119271669808448,10.752737760091025,3.3460163335050073,0.8745329567194894,-14.227153501665935,3.661519915295124,10.122488788348184,5.409409509365463,9.602914171773923,8.648377247154029,-7.3653795896115835,7.0878640386649945,6.657116972207199,9.982248123139318,8.569719529679134,5.08477946640035,4.558238268674592,1.1747168468682736,2.6323033102351467,5.790010166476883,9.431441805041443,5.791356811117944,3.715179203364473,-5.138205715051676,8.988445252959153,16.222564264073302,-5.7506297275721145,-5.256682224746643,-3.280074257449467,6.45418375762252,0.5096532862894396,8.501959560090905,3.5931528968814566,-9.046778353635066,-9.55721154745231,-4.250631750593577,-5.665775900852937,-4.092136902525902,-9.132708950653189,7.158002779785167,1.3059081940888655,-5.184403720247995,7.008609369309705,3.4914774748654858,2.054378843632967,5.566394276201098,0.8261177058248232,6.896927381614106,9.049444797003165,7.0986223287996655,1.047252639107649,3.1986286051431687,-13.211998527982654,4.093601055938986,7.340669782547228,-1.2299927646102902,7.661450322250265,-3.7652560350458333,12.351860832336655,-9.218860819429239,0.5991325647821703,9.50992360435094,-7.702604555900668,-8.306212229317206,15.573163647868633,-9.073970794528853,13.462687107392048,4.598347692961945,5.89653497195919,-7.642052881532981,-1.0440141126662115,4.886541240024928,10.436045214219934,7.6405900262706075,6.4825211195029855,10.892217114578228,12.693948139529898,7.466385991947917,-3.1032149688493966,6.9707169418903945,8.305350456657376,8.500415611758283,9.419286627830008,8.854472122207431,6.484131205010142,-3.6529638835235607,15.595264062461347,-8.82717891316905,8.859147909010433,14.027082486940268,1.3821660978004624,11.504244243044782,7.64373852784756,6.611697721719913,-7.9733243968053635,9.806644069473927,4.249260136111556,5.799272009098109,-12.092721974142787,9.295449293040251,15.581314470190451,3.639467571106254,5.513109810900909,10.00032866112454,3.0320502187726293,6.959547196480157,-3.8878279427294573,-2.6436170210432186,-3.6448319984712967,10.450478303351673,1.3308951771893407,13.083208042552997,-8.507495551008272,-2.9780883181313387,14.06057851719623,5.543947010937179,5.7870265781812815,1.5126965560411405,-7.586808840376833,-5.078516919270708,-6.8732736774689345,2.3145686490345523,0.29606070951829017,1.8402489745469246,2.327809047501882,6.860909152379841,-6.235560021392262,6.871588306146944,-0.3082359377963784,-5.182881883153455,-7.959013269627719,-1.9475724806118133,10.921888305865323,-5.614835588039442,9.245129551639181,4.094678116440103,3.957148969807363,10.391296674772123,4.842975909499663,-5.666695714635328,-5.864274193582604,6.847790384433406,1.471171200157849,-12.224976956592815,-5.1011552956076835,2.00244038866746,11.024941872027494,10.508529170832311,7.612073535312291,8.540925722379352,0.6224801924028122,1.7842615850108952,3.192652965985025,-0.5313513165327435,1.608656059896246,7.1162295319085205,6.353985170828318,4.532546036965729,-4.35513124168637,8.83861816506557,-0.27130914691154795,1.7944858043786898,-2.8103142403383012,7.127916802078077,-2.9167135623335496,-2.4489127185019033,-8.691046113380658,9.068016960228796,-1.025293618614294,-2.448953614294909,0.4425202835214374,4.163891639283626,-7.3254774041668185,-0.44876324554027186,-7.7535612917023835,-1.3153754694176147,-1.5771379682624285,13.617997625774386,2.994756954133391,3.1637692358572345],
  			y: [-11.512749697949834,33.30754236218664,-22.3903860796357,22.17169932340619,30.76369306739943,32.46969128663429,31.23661202256798,29.81718429482659,35.55719336110078,-3.0596768345685983,-1.8583949736947232,-4.68584621257866,-11.51675810568453,0.2512209765735754,-3.02132449931883,-4.709661366064869,-5.76115973363379,-4.112273652388417,-13.274143473006882,-15.447267680957989,-7.14602916260551,-15.38892801155078,-8.266401908410407,-7.693105569294568,-16.15867501889442,-14.065073721789405,-9.351078841176523,32.86369903812613,27.992916658684035,-15.420929388007915,27.131762433505877,20.540074391593105,25.881544311507042,24.61375201530639,38.020878263551424,19.627116478729423,-12.490343743737393,-6.704660236342522,-8.004577878887934,3.2525051011539814,21.57882641466588,5.339275224910119,-26.485820295801226,-8.908718353227256,5.694686636983208,0.27054454477047557,-1.17772200257559,3.1322223452755567,20.139115133992924,-29.97317557547008,9.705155745247144,33.893368721452305,-9.07116165262969,-27.594458430670073,-10.83476624677684,3.050139549854566,-17.52139442152699,-16.625949204523902,-17.57940040968595,-17.79614148284676,-17.765448239273223,-19.543239225418066,-20.37968602163494,-20.725678624437624,-17.32362727626512,-25.808636141334425,-25.784245026595656,-1.1465642235513012,13.593700498625257,28.80549627166324,24.185178475984102,31.000716571881977,-32.36407497629401,17.52913614231073,-21.43791873981644,27.5972085726484,-4.87311137569678,-10.994469942331047,28.48318657032047,35.934900752946476,16.316966139180114,-6.511180938697012,25.152848698873516,-34.06023332094715,-34.36173975243453,-12.826811446813059,17.885837989244695,-38.25462251025067,16.947523358321092,17.14474966110259,-30.047002157044968,12.160783938634708,-21.300239211443344,-19.386758057847853,-8.83457526528452,-22.03584348817799,-18.654512275349685,-9.101187870117075,-9.684767038965015,-2.8326939702476066,0.5899977328347946,3.6776160890586933,3.130445347266667,4.132680898937394,4.929873151430322,-0.41162813437242457,4.3080151738135015,-1.6259536871688145,26.34501821525359,37.55262831052232,27.313767289191173,36.840220342360546,21.811278562386878,19.110377686388087,14.250463037584712,5.926127791451398,-0.6535678189461138,-1.6702757022913888,3.011605577833012,32.337697667064724,2.430828949611531,1.9217341954793152,-5.858715349040116,-7.3419231181835505,-17.17240054301903,-6.679526428986317,40.7356190850191,3.68542156348978,-10.916167677102315,7.236520371488792,4.43903303760306,2.0836413970919843,34.78453180821841,-29.235001751667063,-27.713713985483917,-27.156372998271856,-28.05422008167442,-30.182086522092927,-30.11946037424556,-28.084567919813466,-30.817891008616506,-31.5296080465318,-28.072384357601024,-31.471044486964473,-30.363984931178397,-9.070147757769393,-33.0099988430939,-14.603611647431148,-16.114839499634947,-9.765832722693352,-5.662333274778026,-35.3801150622621,-21.533626035660365,-18.877552003327867,-11.863875807152217,-4.367505693267594,-5.036695891271998,2.7045433900433276,2.2998836629741803,3.8553959387563266,33.28919546889207,-15.80887469297004,-23.77829217340104,26.17643078728238,-27.07736786314429,13.734899981895026,13.529201255572797,-34.714736534053785,-27.216298994367573,-31.481146389634613,-29.251101021282356,-28.296643282028658,-27.55388855350862,-28.943106917545535,35.93219924498986,-28.233030046343256,-23.939715305949104,15.05950134660763,-8.240846833975692,-24.17700295156259,-16.754258180180784,-9.00138184986164,12.184738047992045,-16.64947380463482,25.77303457177836,23.473977850495647,-13.099990008866424,-7.833416115798847,-16.526518367876985,6.867463892603254,-8.723611918303956,-4.1359355831058675,-22.112361277174166,-27.54639358201397,-25.669711441116892,5.146859239036543,-19.438869446012397,-28.780469591136587,-24.5184691614333,-23.67228884192807,-24.563072924123013,-23.476584460522844,3.9392622945237235,-28.26343751398096,-25.554778174086096,-24.665099140734643,7.333935701644931,-7.4266150960427835,-17.26673687401538,21.42827653716791,-20.154153583468414,-15.077708706507181,17.14256653505173,-22.0276963335662,-22.542118671076505,-35.015372782210385,-3.4319761176045307,-8.555831968399698,-6.33021628387348,-27.090302091051,-12.33059211818959,-0.4783106823694481,-8.472839077396756,5.481538782165461,2.709061086659413,-18.02496987617575,-18.343095842131195,-15.897770381182932,17.569058938640026,15.1351732289729,17.999257553726196,-19.601577320319297,-21.674614390503788,-17.8828575709004,-1.0133005336710954,-4.160574932517922,-10.122696620606208,-33.68510573943582,-33.215787065741196,19.68588492476106,10.585813267803854,32.06524388286819,16.92500315328652,15.126453266892298,15.264014927791996,16.50013002637851,8.53758045243685,-6.6693692783313425,-12.12399726354026,1.52971379174473,-1.8914859837276592,1.133960561922881,-1.6486797425944393,-6.321557443154662,3.048970858258472,-2.4423877260050104,1.758827448791172,5.211521840788637,-23.829294699168223,-7.585285983476156,6.573072935374545,13.272482149410129,0.3813747864251209,4.043723852556161,-2.8864527581261266,-11.802869760396566,-4.228472881769886,16.822677627356672,-26.74137007913962,4.781098030844713,-25.272249489534747,-25.02540371224831,-25.94869159712218,-17.86927425553911,-17.119598651690602,-25.092091834239216,-26.18138359945149,-26.811005532033874,-24.118649033412584,-27.455407654113294,2.1124886320025533,-13.444209511466786,15.978728144521806,14.462103462214065,3.848412403078417,-3.4763833493826404,-4.047073663741552,3.6800452662099965,-7.2824333898189035,-26.30057016952139,-9.627771188091526,-10.194807080467097,-8.451602542121332,-6.238117128691456,1.1147690876292071,16.904930451441597,3.859984115167964,-9.578229950893158,-4.697576329899276,-4.340734451774073,-12.93151805675693,7.890836260304993],
  			mode: 'markers',
  			type: 'scatter',
  			name: 'Others',
  			text: ["Trypanosoma cruzi (http://purl.obolibrary.org/obo/NCBITaxon_5693)","Plasmodium malariae (http://purl.obolibrary.org/obo/NCBITaxon_5858)","Plasmodium knowlesi strain H (http://purl.obolibrary.org/obo/NCBITaxon_5851)","Plasmodium knowlesi (http://purl.obolibrary.org/obo/NCBITaxon_5850)","Plasmodium ovale wallikeri (http://purl.obolibrary.org/obo/NCBITaxon_864142)","Plasmodium ovale curtisi (http://purl.obolibrary.org/obo/NCBITaxon_864141)","Plasmodium falciparum (http://purl.obolibrary.org/obo/NCBITaxon_5833)","Plasmodium ovale (http://purl.obolibrary.org/obo/NCBITaxon_36330)","Plasmodium vivax (http://purl.obolibrary.org/obo/NCBITaxon_5855)","Paragonimus mexicanus (http://purl.obolibrary.org/obo/NCBITaxon_100270)","Paragonimus heterotremus (http://purl.obolibrary.org/obo/NCBITaxon_100268)","Paragonimus (http://purl.obolibrary.org/obo/NCBITaxon_34503)","Paragonimus kellicotti (http://purl.obolibrary.org/obo/NCBITaxon_100269)","Paragonimus westermani (http://purl.obolibrary.org/obo/NCBITaxon_34504)","Paragonimus africanus (http://purl.obolibrary.org/obo/NCBITaxon_434055)","Paragonimus skrjabini (http://purl.obolibrary.org/obo/NCBITaxon_59630)","Paragonimus miyazakii (http://purl.obolibrary.org/obo/NCBITaxon_59628)","Paragonimus caliensis (http://purl.obolibrary.org/obo/NCBITaxon_1902345)","Chrysomya bezziana (http://purl.obolibrary.org/obo/NCBITaxon_69364)","Cuterebra sp. Ac6 (http://purl.obolibrary.org/obo/NCBITaxon_269682)","Lucilia blowfly (http://purl.obolibrary.org/obo/NCBITaxon_7374)","Wohlfahrtia magnifica (http://purl.obolibrary.org/obo/NCBITaxon_641482)","Hypoderma lineatum (http://purl.obolibrary.org/obo/NCBITaxon_7389)","Gasterophilus (http://purl.obolibrary.org/obo/NCBITaxon_84524)","Wohlfahrtia vigil (http://purl.obolibrary.org/obo/NCBITaxon_128962)","Cochliomyia hominivorax (http://purl.obolibrary.org/obo/NCBITaxon_115425)","Phormia regina (http://purl.obolibrary.org/obo/NCBITaxon_7380)","Dermatobia hominis (http://purl.obolibrary.org/obo/NCBITaxon_115427)","Oestrus ovis (http://purl.obolibrary.org/obo/NCBITaxon_123737)","Cordylobia anthropophaga (http://purl.obolibrary.org/obo/NCBITaxon_226132)","Ancylostoma duodenale (http://purl.obolibrary.org/obo/NCBITaxon_51022)","Enterobius vermicularis (http://purl.obolibrary.org/obo/NCBITaxon_51028)","Ascaris lumbricoides (http://purl.obolibrary.org/obo/NCBITaxon_6252)","Trichuris trichiura (http://purl.obolibrary.org/obo/NCBITaxon_36087)","Trichophyton (http://purl.obolibrary.org/obo/NCBITaxon_5550)","Ascomycota (http://purl.obolibrary.org/obo/NCBITaxon_4890)","Microsporum audouinii (http://purl.obolibrary.org/obo/NCBITaxon_34393)","Strongyloides stercoralis (http://purl.obolibrary.org/obo/NCBITaxon_6248)","Strongyloides fuelleborni (http://purl.obolibrary.org/obo/NCBITaxon_44441)","Sporothrix schenckii (http://purl.obolibrary.org/obo/NCBITaxon_29908)","Blastomyces dermatitidis (http://purl.obolibrary.org/obo/NCBITaxon_5039)","Exophiala jeanselmei (http://purl.obolibrary.org/obo/NCBITaxon_5584)","Trematosphaeria grisea (http://purl.obolibrary.org/obo/NCBITaxon_1489895)","Rhinocladiella aquaspersa (http://purl.obolibrary.org/obo/NCBITaxon_37936)","Exophiala dermatitidis (http://purl.obolibrary.org/obo/NCBITaxon_5970)","Cladophialophora carrionii (http://purl.obolibrary.org/obo/NCBITaxon_86049)","Phialophora verrucosa (http://purl.obolibrary.org/obo/NCBITaxon_39412)","Cryptococcus gattii VGI (http://purl.obolibrary.org/obo/NCBITaxon_37769)","Talaromyces marneffei (http://purl.obolibrary.org/obo/NCBITaxon_37727)","Lophophyton (http://purl.obolibrary.org/obo/NCBITaxon_1916090)","Madurella mycetomatis (http://purl.obolibrary.org/obo/NCBITaxon_100816)","Histoplasma capsulatum (http://purl.obolibrary.org/obo/NCBITaxon_5037)","Fonsecaea pedrosoi (http://purl.obolibrary.org/obo/NCBITaxon_40355)","Paracoccidioides sp. (http://purl.obolibrary.org/obo/NCBITaxon_1939674)","Fonsecaea compacta (http://purl.obolibrary.org/obo/NCBITaxon_86057)","Exophiala spinifera (http://purl.obolibrary.org/obo/NCBITaxon_91928)","Amblyomma maculatum (http://purl.obolibrary.org/obo/NCBITaxon_34609)","Ixodes pacificus (http://purl.obolibrary.org/obo/NCBITaxon_29930)","Amblyomma americanum (http://purl.obolibrary.org/obo/NCBITaxon_6943)","Dermacentor andersoni (http://purl.obolibrary.org/obo/NCBITaxon_34620)","Ixodes holocyclus (http://purl.obolibrary.org/obo/NCBITaxon_65647)","Otobius megnini (http://purl.obolibrary.org/obo/NCBITaxon_34606)","Dermacentor variabilis (http://purl.obolibrary.org/obo/NCBITaxon_34621)","Ixodes scapularis (http://purl.obolibrary.org/obo/NCBITaxon_6945)","Rhipicephalus sanguineus (http://purl.obolibrary.org/obo/NCBITaxon_34632)","Demodex brevis (http://purl.obolibrary.org/obo/NCBITaxon_574145)","Demodex folliculorum (http://purl.obolibrary.org/obo/NCBITaxon_481310)","Scabies (http://purl.obolibrary.org/obo/NCBITaxon_1408500)","Phthiraptera (http://purl.obolibrary.org/obo/NCBITaxon_85819)","Pediculus humanus corporis (http://purl.obolibrary.org/obo/NCBITaxon_121224)","Pthirus pubis (http://purl.obolibrary.org/obo/NCBITaxon_121228)","Pediculus humanus capitis (http://purl.obolibrary.org/obo/NCBITaxon_121226)","Rhizopus microsporus (http://purl.obolibrary.org/obo/NCBITaxon_58291)","Leishmania donovani (http://purl.obolibrary.org/obo/NCBITaxon_5661)","Pediculus humanus (http://purl.obolibrary.org/obo/NCBITaxon_121225)","Schistosoma japonicum (http://purl.obolibrary.org/obo/NCBITaxon_6182)","Schistosoma mekongi (http://purl.obolibrary.org/obo/NCBITaxon_38744)","Schistosoma (http://purl.obolibrary.org/obo/NCBITaxon_6181)","Schistosoma mansoni (http://purl.obolibrary.org/obo/NCBITaxon_6183)","Schistosoma haematobium (http://purl.obolibrary.org/obo/NCBITaxon_6185)","Schistosoma intercalatum (http://purl.obolibrary.org/obo/NCBITaxon_6187)","Entamoeba histolytica (http://purl.obolibrary.org/obo/NCBITaxon_5759)","Trypanosoma brucei (http://purl.obolibrary.org/obo/NCBITaxon_5691)","Malassezia sp. (http://purl.obolibrary.org/obo/NCBITaxon_2011732)","Trichosporon sp. (http://purl.obolibrary.org/obo/NCBITaxon_1856742)","Hortaea werneckii (http://purl.obolibrary.org/obo/NCBITaxon_91943)","Piedraia hortae (http://purl.obolibrary.org/obo/NCBITaxon_147573)","Haemonchus (http://purl.obolibrary.org/obo/NCBITaxon_6288)","Taenia saginata (http://purl.obolibrary.org/obo/NCBITaxon_6206)","Microsporum (http://purl.obolibrary.org/obo/NCBITaxon_34392)","Arthrodermataceae (http://purl.obolibrary.org/obo/NCBITaxon_34384)","Epidermophyton (http://purl.obolibrary.org/obo/NCBITaxon_34390)","Trichosporon inkin (http://purl.obolibrary.org/obo/NCBITaxon_82517)","Cutaneotrichosporon mucoides (http://purl.obolibrary.org/obo/NCBITaxon_82522)","Trichosporon beigelii (http://purl.obolibrary.org/obo/NCBITaxon_5553)","Trichosporon asteroides (http://purl.obolibrary.org/obo/NCBITaxon_82511)","Cutaneotrichosporon cutaneum (http://purl.obolibrary.org/obo/NCBITaxon_5554)","Trichosporon asahii (http://purl.obolibrary.org/obo/NCBITaxon_82508)","Trichosporon ovoides (http://purl.obolibrary.org/obo/NCBITaxon_82524)","Sarcocystis (http://purl.obolibrary.org/obo/NCBITaxon_5812)","Babesia bigemina (http://purl.obolibrary.org/obo/NCBITaxon_5866)","Babesia duncani (http://purl.obolibrary.org/obo/NCBITaxon_323732)","Babesia divergens (http://purl.obolibrary.org/obo/NCBITaxon_32595)","Babesia (http://purl.obolibrary.org/obo/NCBITaxon_5864)","Babesia bovis (http://purl.obolibrary.org/obo/NCBITaxon_5865)","Theileria equi (http://purl.obolibrary.org/obo/NCBITaxon_5872)","Babesia major (http://purl.obolibrary.org/obo/NCBITaxon_127461)","Babesia microti (http://purl.obolibrary.org/obo/NCBITaxon_5868)","Echinococcus vogeli (http://purl.obolibrary.org/obo/NCBITaxon_6213)","Echinococcus multilocularis (http://purl.obolibrary.org/obo/NCBITaxon_6211)","Echinococcus oligarthrus (http://purl.obolibrary.org/obo/NCBITaxon_6212)","Echinococcus granulosus (http://purl.obolibrary.org/obo/NCBITaxon_6210)","Echinococcus (http://purl.obolibrary.org/obo/NCBITaxon_6209)","null (http://purl.obolibrary.org/obo/NCBITaxon_11619)","Fasciola hepatica (http://purl.obolibrary.org/obo/NCBITaxon_6192)","Fasciola gigantica (http://purl.obolibrary.org/obo/NCBITaxon_46835)","Leishmania infantum (http://purl.obolibrary.org/obo/NCBITaxon_5671)","Leishmania major (http://purl.obolibrary.org/obo/NCBITaxon_5664)","Leishmania subgenus (http://purl.obolibrary.org/obo/NCBITaxon_38568)","Leishmania genus (http://purl.obolibrary.org/obo/NCBITaxon_5658)","Leishmania mexicana MHOM/GT/2001/U1103 (http://purl.obolibrary.org/obo/NCBITaxon_929439)","Anisakis simplex (http://purl.obolibrary.org/obo/NCBITaxon_6269)","Pseudoterranova decipiens (http://purl.obolibrary.org/obo/NCBITaxon_6271)","Anisakis (http://purl.obolibrary.org/obo/NCBITaxon_6268)","Hirudinea (http://purl.obolibrary.org/obo/NCBITaxon_55824)","Plasmid pSa (http://purl.obolibrary.org/obo/NCBITaxon_2637)","Candida albicans (http://purl.obolibrary.org/obo/NCBITaxon_5476)","Trichophyton verrucosum (http://purl.obolibrary.org/obo/NCBITaxon_63417)","Epidermophyton floccosum (http://purl.obolibrary.org/obo/NCBITaxon_34391)","Trichophyton rubrum (http://purl.obolibrary.org/obo/NCBITaxon_5551)","Trichophyton mentagrophytes (http://purl.obolibrary.org/obo/NCBITaxon_523103)","Aspergillus fumigatus (http://purl.obolibrary.org/obo/NCBITaxon_746128)","Aspergillus (http://purl.obolibrary.org/obo/NCBITaxon_5052)","Aspergillus flavus (http://purl.obolibrary.org/obo/NCBITaxon_5059)","Phaeoannellomyces (http://purl.obolibrary.org/obo/NCBITaxon_66225)","Cladophialophora bantiana (http://purl.obolibrary.org/obo/NCBITaxon_89940)","Alternaria (http://purl.obolibrary.org/obo/NCBITaxon_5598)","Phialophora Chaetothyriales (http://purl.obolibrary.org/obo/NCBITaxon_5600)","Exserohilum (http://purl.obolibrary.org/obo/NCBITaxon_91493)","Curvularia spicifera (http://purl.obolibrary.org/obo/NCBITaxon_145392)","Aureobasidium (http://purl.obolibrary.org/obo/NCBITaxon_5579)","Curvularia hawaiiensis (http://purl.obolibrary.org/obo/NCBITaxon_1230527)","Rhinocladiella mackenziei (http://purl.obolibrary.org/obo/NCBITaxon_86056)","Cladosporium cladosporioides (http://purl.obolibrary.org/obo/NCBITaxon_29917)","null (http://purl.obolibrary.org/obo/NCBITaxon_45150)","Angiostrongylus cantonensis (http://purl.obolibrary.org/obo/NCBITaxon_6313)","Trichophyton interdigitale (http://purl.obolibrary.org/obo/NCBITaxon_101480)","Trichophyton tonsurans (http://purl.obolibrary.org/obo/NCBITaxon_34387)","Thelazia callipaeda (http://purl.obolibrary.org/obo/NCBITaxon_103827)","Thelazia gulosa (http://purl.obolibrary.org/obo/NCBITaxon_150476)","Setaria nematode (http://purl.obolibrary.org/obo/NCBITaxon_48796)","null (http://purl.obolibrary.org/obo/NCBITaxon_11027)","Dirofilaria immitis (http://purl.obolibrary.org/obo/NCBITaxon_6287)","Dirofilaria repens (http://purl.obolibrary.org/obo/NCBITaxon_31241)","Onchocerca volvulus (http://purl.obolibrary.org/obo/NCBITaxon_6282)","Trichostrongylus axei (http://purl.obolibrary.org/obo/NCBITaxon_40349)","Trichostrongylus colubriformis (http://purl.obolibrary.org/obo/NCBITaxon_6319)","Brugia malayi (http://purl.obolibrary.org/obo/NCBITaxon_6279)","Brugia timori (http://purl.obolibrary.org/obo/NCBITaxon_42155)","Wuchereria bancrofti (http://purl.obolibrary.org/obo/NCBITaxon_6293)","Toxoplasma gondii (http://purl.obolibrary.org/obo/NCBITaxon_5811)","Pneumocystis jirovecii (http://purl.obolibrary.org/obo/NCBITaxon_42068)","Galactomyces candidus (http://purl.obolibrary.org/obo/NCBITaxon_1173061)","Trichomonas vaginalis (http://purl.obolibrary.org/obo/NCBITaxon_5722)","Scedosporium apiospermum (http://purl.obolibrary.org/obo/NCBITaxon_563466)","Scedosporium boydii (http://purl.obolibrary.org/obo/NCBITaxon_5597)","Sarcoptes scabiei (http://purl.obolibrary.org/obo/NCBITaxon_52283)","Arthroderma (http://purl.obolibrary.org/obo/NCBITaxon_63399)","[Candida] auris (http://purl.obolibrary.org/obo/NCBITaxon_498019)","Candida tropicalis (http://purl.obolibrary.org/obo/NCBITaxon_5482)","Clavispora lusitaniae (http://purl.obolibrary.org/obo/NCBITaxon_36911)","Candida dubliniensis (http://purl.obolibrary.org/obo/NCBITaxon_42374)","Meyerozyma guilliermondii (http://purl.obolibrary.org/obo/NCBITaxon_4929)","Candida parapsilosis (http://purl.obolibrary.org/obo/NCBITaxon_5480)","Candida Saccharomycetales (http://purl.obolibrary.org/obo/NCBITaxon_5475)","Pichia kudriavzevii (http://purl.obolibrary.org/obo/NCBITaxon_4909)","[Candida] glabrata (http://purl.obolibrary.org/obo/NCBITaxon_5478)","Clonorchis sinensis (http://purl.obolibrary.org/obo/NCBITaxon_79923)","Coccidia (http://purl.obolibrary.org/obo/NCBITaxon_5796)","Cystoisospora belli (http://purl.obolibrary.org/obo/NCBITaxon_482538)","Filarioidea (http://purl.obolibrary.org/obo/NCBITaxon_6295)","Candida Debaryomycetaceae (http://purl.obolibrary.org/obo/NCBITaxon_1535326)","Cryptococcus neoformans (http://purl.obolibrary.org/obo/NCBITaxon_5207)","Haemaphysalis longicornis (http://purl.obolibrary.org/obo/NCBITaxon_44386)","Coccidioides immitis (http://purl.obolibrary.org/obo/NCBITaxon_5501)","Taenia solium (http://purl.obolibrary.org/obo/NCBITaxon_6204)","Theileria annulata (http://purl.obolibrary.org/obo/NCBITaxon_5874)","Theileria (http://purl.obolibrary.org/obo/NCBITaxon_5873)","Theileria parva (http://purl.obolibrary.org/obo/NCBITaxon_5875)","Trichinella spiralis (http://purl.obolibrary.org/obo/NCBITaxon_6334)","Toxocara cati (http://purl.obolibrary.org/obo/NCBITaxon_6266)","Toxocara canis (http://purl.obolibrary.org/obo/NCBITaxon_6265)","Giardia intestinalis (http://purl.obolibrary.org/obo/NCBITaxon_5741)","Trachipleistophora (http://purl.obolibrary.org/obo/NCBITaxon_72358)","Trachipleistophora hominis (http://purl.obolibrary.org/obo/NCBITaxon_72359)","Encephalitozoon cuniculi (http://purl.obolibrary.org/obo/NCBITaxon_6035)","Anncaliia algerae (http://purl.obolibrary.org/obo/NCBITaxon_723287)","Nosema (http://purl.obolibrary.org/obo/NCBITaxon_27977)","Tubulinosema acridophagus (http://purl.obolibrary.org/obo/NCBITaxon_307626)","Pleistophora (http://purl.obolibrary.org/obo/NCBITaxon_35233)","Enterocytozoon bieneusi (http://purl.obolibrary.org/obo/NCBITaxon_31281)","Vittaforma corneae (http://purl.obolibrary.org/obo/NCBITaxon_42399)","Encephalitozoon intestinalis (http://purl.obolibrary.org/obo/NCBITaxon_58839)","Microsporidium (http://purl.obolibrary.org/obo/NCBITaxon_144516)","Anncaliia (http://purl.obolibrary.org/obo/NCBITaxon_311453)","Microsporidia (http://purl.obolibrary.org/obo/NCBITaxon_6029)","Encephalitozoon hellem (http://purl.obolibrary.org/obo/NCBITaxon_27973)","Coccidioides posadasii (http://purl.obolibrary.org/obo/NCBITaxon_199306)","Hymenolepis Cestoda (http://purl.obolibrary.org/obo/NCBITaxon_6215)","Diphyllobothrium (http://purl.obolibrary.org/obo/NCBITaxon_28844)","Taenia (http://purl.obolibrary.org/obo/NCBITaxon_6202)","Dipylidium caninum (http://purl.obolibrary.org/obo/NCBITaxon_66787)","Taenia multiceps (http://purl.obolibrary.org/obo/NCBITaxon_94034)","Spirometra (http://purl.obolibrary.org/obo/NCBITaxon_46580)","Taenia asiatica (http://purl.obolibrary.org/obo/NCBITaxon_60517)","Lacazia loboi (http://purl.obolibrary.org/obo/NCBITaxon_121752)","Echinostoma trivolvis (http://purl.obolibrary.org/obo/NCBITaxon_27849)","Echinostoma hortense (http://purl.obolibrary.org/obo/NCBITaxon_48216)","Echinostoma (http://purl.obolibrary.org/obo/NCBITaxon_27847)","Dracunculus medinensis (http://purl.obolibrary.org/obo/NCBITaxon_318479)","Austrobilharzia variglandis (http://purl.obolibrary.org/obo/NCBITaxon_100588)","Angiostrongylus (http://purl.obolibrary.org/obo/NCBITaxon_6312)","Angiostrongylus costaricensis (http://purl.obolibrary.org/obo/NCBITaxon_334426)","Mansonella ozzardi (http://purl.obolibrary.org/obo/NCBITaxon_122354)","Mansonella perstans (http://purl.obolibrary.org/obo/NCBITaxon_42231)","Emmonsia crescens (http://purl.obolibrary.org/obo/NCBITaxon_73230)","Chrysosporium parvum (http://purl.obolibrary.org/obo/NCBITaxon_41283)","null (http://purl.obolibrary.org/obo/NCBITaxon_73231)","Ancylostoma caninum (http://purl.obolibrary.org/obo/NCBITaxon_29170)","Ancylostoma braziliense (http://purl.obolibrary.org/obo/NCBITaxon_369059)","Ancylostoma ceylanicum (http://purl.obolibrary.org/obo/NCBITaxon_53326)","Sparganum proliferum (http://purl.obolibrary.org/obo/NCBITaxon_64606)","Spirometra mansonoides (http://purl.obolibrary.org/obo/NCBITaxon_46899)","Spirometra erinaceieuropaei (http://purl.obolibrary.org/obo/NCBITaxon_99802)","Heterophyes heterophyes (http://purl.obolibrary.org/obo/NCBITaxon_1849833)","Heterophyes (http://purl.obolibrary.org/obo/NCBITaxon_104454)","Fasciolopsis buski (http://purl.obolibrary.org/obo/NCBITaxon_27845)","Paracoccidioides brasiliensis (http://purl.obolibrary.org/obo/NCBITaxon_121759)","Paracoccidioides lutzii (http://purl.obolibrary.org/obo/NCBITaxon_1048829)","Macracanthorhynchus (http://purl.obolibrary.org/obo/NCBITaxon_60533)","Macracanthorhynchus hirudinaceus (http://purl.obolibrary.org/obo/NCBITaxon_1032456)","Moniliformis moniliformis (http://purl.obolibrary.org/obo/NCBITaxon_10237)","Gnathostoma hispidum (http://purl.obolibrary.org/obo/NCBITaxon_279404)","Gnathostoma nipponicum (http://purl.obolibrary.org/obo/NCBITaxon_279403)","Gnathostoma doloresi (http://purl.obolibrary.org/obo/NCBITaxon_279402)","Gnathostoma binucleatum (http://purl.obolibrary.org/obo/NCBITaxon_61466)","Gnathostoma spinigerum (http://purl.obolibrary.org/obo/NCBITaxon_75299)","Opisthorchis felineus (http://purl.obolibrary.org/obo/NCBITaxon_147828)","Opisthorchis viverrini (http://purl.obolibrary.org/obo/NCBITaxon_6198)","Neoscytalidium (http://purl.obolibrary.org/obo/NCBITaxon_463684)","Diphyllobothrium dendriticum (http://purl.obolibrary.org/obo/NCBITaxon_28845)","Diphyllobothrium ditremum (http://purl.obolibrary.org/obo/NCBITaxon_85435)","Dibothriocephalus latus (http://purl.obolibrary.org/obo/NCBITaxon_60516)","Adenocephalus pacificus (http://purl.obolibrary.org/obo/NCBITaxon_372152)","Diphyllobothrium nihonkaiense (http://purl.obolibrary.org/obo/NCBITaxon_64604)","Necator americanus (http://purl.obolibrary.org/obo/NCBITaxon_51031)","Entomophthorales (http://purl.obolibrary.org/obo/NCBITaxon_4857)","Mucorales (http://purl.obolibrary.org/obo/NCBITaxon_4827)","Naegleria fowleri (http://purl.obolibrary.org/obo/NCBITaxon_5763)","Trichosporon (http://purl.obolibrary.org/obo/NCBITaxon_5552)","Loa loa (http://purl.obolibrary.org/obo/NCBITaxon_7209)","Dipetalonema (http://purl.obolibrary.org/obo/NCBITaxon_114233)","Sappinia (http://purl.obolibrary.org/obo/NCBITaxon_343528)","Acanthamoeba (http://purl.obolibrary.org/obo/NCBITaxon_5754)","Balamuthia mandrillaris (http://purl.obolibrary.org/obo/NCBITaxon_66527)","Hymenolepis nana (http://purl.obolibrary.org/obo/NCBITaxon_102285)","Hymenolepis diminuta (http://purl.obolibrary.org/obo/NCBITaxon_6216)","Histoplasma capsulatum var. capsulatum (http://purl.obolibrary.org/obo/NCBITaxon_278162)","Histoplasma capsulatum var. duboisii (http://purl.obolibrary.org/obo/NCBITaxon_149546)","Baylisascaris procyonis (http://purl.obolibrary.org/obo/NCBITaxon_6259)","Cryptosporidium hominis (http://purl.obolibrary.org/obo/NCBITaxon_237895)","Cryptosporidium parvum (http://purl.obolibrary.org/obo/NCBITaxon_5807)","Cryptosporidium (http://purl.obolibrary.org/obo/NCBITaxon_5806)","Fusarium solani (http://purl.obolibrary.org/obo/NCBITaxon_169388)","Fusarium oxysporum (http://purl.obolibrary.org/obo/NCBITaxon_5507)","Fusarium verticillioides (http://purl.obolibrary.org/obo/NCBITaxon_117187)","Malassezia sympodialis (http://purl.obolibrary.org/obo/NCBITaxon_76777)","Malassezia globosa (http://purl.obolibrary.org/obo/NCBITaxon_76773)","Malassezia (http://purl.obolibrary.org/obo/NCBITaxon_55193)","Malassezia furfur (http://purl.obolibrary.org/obo/NCBITaxon_55194)","Fascioloides magna (http://purl.obolibrary.org/obo/NCBITaxon_394415)","Tunga penetrans (http://purl.obolibrary.org/obo/NCBITaxon_214035)","Dicrocoelium dendriticum (http://purl.obolibrary.org/obo/NCBITaxon_57078)","Ascaridia (http://purl.obolibrary.org/obo/NCBITaxon_46684)","Paracapillaria philippinensis (http://purl.obolibrary.org/obo/NCBITaxon_1457282)","Capillaria hepatica (http://purl.obolibrary.org/obo/NCBITaxon_1239592)","Capillaria aerophila (http://purl.obolibrary.org/obo/NCBITaxon_1172388)","Oesophagostomum bifurcum (http://purl.obolibrary.org/obo/NCBITaxon_61179)","Leptotrombidium deliense (http://purl.obolibrary.org/obo/NCBITaxon_299467)","Cyclospora cayetanensis (http://purl.obolibrary.org/obo/NCBITaxon_88456)","Taenia serialis (http://purl.obolibrary.org/obo/NCBITaxon_94035)","Rhinosporidium seeberi (http://purl.obolibrary.org/obo/NCBITaxon_90339)","Basidiobolus ranarum (http://purl.obolibrary.org/obo/NCBITaxon_34480)","Balantioides coli (http://purl.obolibrary.org/obo/NCBITaxon_71585)","Ostertagia (http://purl.obolibrary.org/obo/NCBITaxon_6316)","Plasmodium (http://purl.obolibrary.org/obo/NCBITaxon_5820)","Toxascaris leonina (http://purl.obolibrary.org/obo/NCBITaxon_59264)","Metagonimus yokogawai (http://purl.obolibrary.org/obo/NCBITaxon_84529)","Dioctophyme renale (http://purl.obolibrary.org/obo/NCBITaxon_513045)","Trichostrongyloidea (http://purl.obolibrary.org/obo/NCBITaxon_6314)","Dientamoeba fragilis (http://purl.obolibrary.org/obo/NCBITaxon_43352)","Conidiobolus coronatus (http://purl.obolibrary.org/obo/NCBITaxon_34488)"],
  			marker: { size: 7 }
		};

		var trace2 = {
  			x: [-3.0437515409548315,-16.387080626359705,-16.06762324635774,-16.45532082197909,-17.14728487361325,-3.1461094955169004,-7.28972999460089,-11.163340813654324,-16.99078065579207,-9.628922421408854,4.473655598194794,-12.863714164864643,-11.385497380547228,-7.837309071500582,4.39848891957838,1.8206861750498697,2.654180865176291,-14.185494267916397,-16.152868889357357,-11.840904803140566,-13.500791533457695,-9.65362851046246,-7.260383395668039,-12.943484011722191,-4.512651009262042,3.290683261329569,2.7876709085996723,-12.360554982678273,-13.26441803219255,-17.184488773607683,-18.46949119481585,-18.720101081759207,-5.216860414749214,-12.503755483156574,-15.745095651853726,-4.389259877830817,-6.23793700800358,7.93328293659589,-8.128848745463575,-0.9462914430265388,3.183534494627852,-8.307676962290305,-3.2409871166040327,11.08492891090937,7.826843601279623,-10.920523989760294,-9.016921260056357,9.548254004154302,-7.02472020407996,-5.820439699357735,2.4670949259917605,-12.979453484654632,-9.713108518421734,-15.1245936055127,-14.786677901405783,-5.137383532019335,-5.793142923332985,1.9795427910139882,4.968749070070739,-10.78429905580109,2.8922254658016433,7.280208696226925,11.048154047241104,-0.5662836967879946,-7.043460762368193,4.585182426636279,5.523555745108035,0.605737442843564,-6.987852643897563,7.7708032454307014,-4.200138095506803,-13.654532366285663,9.080805399272585,-6.688158023461309,-3.941839031481668,14.329132879936223,9.396447482937857,4.431306004221082,9.297818431833393,0.10021861089331635,5.722442369073503,1.6809031566464756,-0.22557330196153044,6.676450479026463,6.499619294944642,4.773845889109524,-1.2833853232676686,-15.86147632665007,-3.904416809108729,-1.109179759301922,5.62590036657409,-10.292230503467152,-18.575397707181462,11.214213276749716,1.1047003023244393,-2.12284848625081,-1.7018021456594703,-4.959174613748606,12.084651255992771,4.2579940079545855,-3.9880887051735967,4.113763738391658,-0.5795659160168517,-3.718126177726617,-4.519248979802939,8.833191059209746,13.36414073103922,-13.068813907860811,-6.252269314586567,1.3087314505557897,-15.66900102722139,4.556172689947408,-16.96564217960869,-12.46883843718104,-9.068518801398735,-7.946466195405454,-2.986493482909069,12.24640699810191,-6.895650038353813,-3.666511684593931,-14.32147741170386,-4.049663475081704,7.596076917570599,14.228084118432765,-4.053463846469614,12.999376391467196,7.02024183277401,2.707686365245522,7.953968541681063,1.2152646478988174,-8.158500482274675,-3.9963946653716236,13.078784939725125,-16.956763571510944,5.032836636371245,-7.2103645213421785,17.356824971055534,12.232077311801865,3.5911666649212854,-1.887318200143902,0.8327012914231333,4.889305862376246,-6.9508667576008625,-3.4516717657757177,3.627941555159565,14.799847158021974,-5.547293083892861,-7.77291488680457,-9.967077133953955,-0.9835599907900793,6.5745600098239025,-2.8882069456567145,2.7323718563644706,1.3309245439422543,-7.052790969857184,6.316983462697344,4.872669142572597,0.6785939299102253,-4.644124165405282,4.135823664298669,0.48997390813165986,5.607804168494133,0.3946191482127348,-8.657548137019823,-0.10639689551630127,3.1987779435668426,-7.239113869399791,4.345643135273936,5.624324945659283,-5.595258802676606],
  			y: [-2.3462732382318214,31.24844113310369,31.217286909284418,31.718863969825204,33.41939685708138,7.432867737526874,34.75377396722381,-13.179222856668792,39.30865173333116,18.18478901778984,-3.659215393514991,39.45342936513036,35.55736071587339,-14.500031109160295,-3.6357461951877905,-3.7464239153367145,-4.3126211892311535,32.79026991627537,39.47708455339003,38.85738142231926,23.373316585366908,17.9895758646885,19.197491665177733,30.905553358788453,28.580288988731212,-2.578581660503656,-3.095547820204768,37.6410213994424,29.712992244371755,39.5890224710461,34.946567603571246,35.924970910529005,27.81465003169418,22.580046588836318,38.4471446746616,27.7577989274244,-7.465534496143294,-8.760741434856422,13.487524930199573,-2.1210933304285207,-7.886541014096077,13.455296766368646,-16.717004333560062,-15.799356010470984,-15.884104689018395,29.82447370792412,-8.674462125655749,-11.776938385615043,-6.055520905080493,-8.032817416966129,-7.965804962913474,25.724464970227846,36.379609211628114,34.76460920565345,35.444831918497876,23.97240599719992,16.143903632104763,-9.872186345730801,-8.217842301910693,19.860369400815074,17.020373350897124,-12.733611000021453,-17.619520207726477,18.293781861489304,-15.213425065757852,16.74668188006243,15.126214009929475,18.242642771234497,16.1456335937655,0.8253943178319928,22.026574157171808,25.33238204397465,-15.15269959797444,28.60096086717966,-20.56093950493402,-26.80933178765518,-18.567082448342543,-20.07075170570961,-18.09244707557622,-23.774754063884036,-23.351432907798582,-19.765639387513033,-25.638196954595955,-21.58724765245196,-22.137398376938453,-21.722123990315072,-25.052135432853117,34.65275250263005,5.471530653356762,14.65927968169776,19.05085063509416,-12.958370397407087,35.021103290298676,-8.896010406722713,0.04829041404621495,-3.8685270469241764,-2.608324927271745,-4.579583969611015,-11.773172317567258,15.330922727435558,-19.69595588726346,-11.497985805670568,-10.07543591810905,-18.981120901563276,-14.4747086255416,-6.851421650402735,-10.595037547113623,31.924985022938817,27.558785162928423,23.285116743677527,31.209640931279402,-14.454623042268329,34.78954638781916,26.744643110915018,25.770419896585935,25.965431635328976,-20.841130955785093,-19.232286839298474,17.611642803397775,23.518404459738147,28.6857736730237,22.23661542162452,2.636603024193025,5.163916459592416,1.6429848685094641,2.9070928594708643,1.997126463192869,-30.923061284522984,-26.937416505360257,20.68935865241795,21.684667935385168,-8.763205003335704,-19.792024275248604,30.2804547020096,17.575606702188026,10.262072587278148,-5.481423497029938,-31.947324513077078,-20.555146097880883,-17.745374164832025,-18.428948210723792,-34.89288067729165,-6.115466746823779,-6.125192331249519,20.80001236280772,-9.061902492573394,22.152534291225102,19.85614356322171,-12.759856085745556,1.508254780434468,-6.8377180875638155,21.710526813104916,19.09407948115618,0.05777069134839232,14.403123627223705,-35.23641826918089,-18.577951956398174,5.044570676921811,-12.72605355465019,0.7670658675546121,-16.433178945462092,-37.61843765299613,5.835300583997199,19.305106159237575,-2.9830183504232126,-12.07382806335214,-12.965338495541713,20.71734153121139,-37.61765940875471,21.404970951872492],
  			mode: 'markers',
  			type: 'scatter',
  			name: 'Viruses',
  			text: ["Lymphocytic choriomeningitis mammarenavirus (http://purl.obolibrary.org/obo/NCBITaxon_11623)","Dengue virus 1 (http://purl.obolibrary.org/obo/NCBITaxon_11053)","Dengue virus 4 (http://purl.obolibrary.org/obo/NCBITaxon_11070)","Dengue virus 2 (http://purl.obolibrary.org/obo/NCBITaxon_11060)","Dengue virus 3 (http://purl.obolibrary.org/obo/NCBITaxon_11069)","Flavivirus (http://purl.obolibrary.org/obo/NCBITaxon_11051)","Dengue virus (http://purl.obolibrary.org/obo/NCBITaxon_12637)","Cowpox virus (http://purl.obolibrary.org/obo/NCBITaxon_10243)","unidentified adenovirus (http://purl.obolibrary.org/obo/NCBITaxon_10535)","Orthohantavirus (http://purl.obolibrary.org/obo/NCBITaxon_1980442)","Reoviridae (http://purl.obolibrary.org/obo/NCBITaxon_10880)","Measles morbillivirus (http://purl.obolibrary.org/obo/NCBITaxon_11234)","Enterovirus A71 (http://purl.obolibrary.org/obo/NCBITaxon_39054)","Coronaviridae (http://purl.obolibrary.org/obo/NCBITaxon_11118)","Herpesviridae (http://purl.obolibrary.org/obo/NCBITaxon_10292)","Picornaviridae (http://purl.obolibrary.org/obo/NCBITaxon_12058)","Retroviridae (http://purl.obolibrary.org/obo/NCBITaxon_11632)","Human immunodeficiency virus (http://purl.obolibrary.org/obo/NCBITaxon_12721)","Enterovirus (http://purl.obolibrary.org/obo/NCBITaxon_12059)","unidentified influenza virus (http://purl.obolibrary.org/obo/NCBITaxon_11309)","Human T-cell leukemia virus type I (http://purl.obolibrary.org/obo/NCBITaxon_11908)","Human metapneumovirus (http://purl.obolibrary.org/obo/NCBITaxon_162145)","Echovirus (http://purl.obolibrary.org/obo/NCBITaxon_33758)","Coxsackievirus (http://purl.obolibrary.org/obo/NCBITaxon_12066)","Human respirovirus 1 (http://purl.obolibrary.org/obo/NCBITaxon_12730)","Paramyxoviridae (http://purl.obolibrary.org/obo/NCBITaxon_11158)","Human polyomavirus 1 (http://purl.obolibrary.org/obo/NCBITaxon_1891762)","Respiratory syncytial virus (http://purl.obolibrary.org/obo/NCBITaxon_12814)","Orthomyxoviridae (http://purl.obolibrary.org/obo/NCBITaxon_11308)","Human gammaherpesvirus 4 (http://purl.obolibrary.org/obo/NCBITaxon_10376)","Cytomegalovirus (http://purl.obolibrary.org/obo/NCBITaxon_10358)","Human alphaherpesvirus 1 (http://purl.obolibrary.org/obo/NCBITaxon_10298)","Gammacoronavirus (http://purl.obolibrary.org/obo/NCBITaxon_694013)","Influenza C virus (http://purl.obolibrary.org/obo/NCBITaxon_11552)","Influenza A virus (http://purl.obolibrary.org/obo/NCBITaxon_11320)","Influenza B virus (http://purl.obolibrary.org/obo/NCBITaxon_11520)","Australian bat lyssavirus (http://purl.obolibrary.org/obo/NCBITaxon_90961)","European bat 1 lyssavirus (http://purl.obolibrary.org/obo/NCBITaxon_57482)","Rabies lyssavirus (http://purl.obolibrary.org/obo/NCBITaxon_11292)","European bat 2 lyssavirus (http://purl.obolibrary.org/obo/NCBITaxon_57483)","Orf virus (http://purl.obolibrary.org/obo/NCBITaxon_10258)","Saint Louis encephalitis virus (http://purl.obolibrary.org/obo/NCBITaxon_11080)","Human immunodeficiency virus 1 (http://purl.obolibrary.org/obo/NCBITaxon_11676)","Human immunodeficiency virus 2 (http://purl.obolibrary.org/obo/NCBITaxon_11709)","Sandfly fever Naples virus (http://purl.obolibrary.org/obo/NCBITaxon_206160)","Enterovirus C (http://purl.obolibrary.org/obo/NCBITaxon_138950)","SARS coronavirus (http://purl.obolibrary.org/obo/NCBITaxon_227859)","Chikungunya virus (http://purl.obolibrary.org/obo/NCBITaxon_37124)","Human adenovirus 7p (http://purl.obolibrary.org/obo/NCBITaxon_316517)","Human adenovirus 3p (http://purl.obolibrary.org/obo/NCBITaxon_754032)","Human mastadenovirus B (http://purl.obolibrary.org/obo/NCBITaxon_108098)","Rubella virus (http://purl.obolibrary.org/obo/NCBITaxon_11041)","Human poliovirus 3 (http://purl.obolibrary.org/obo/NCBITaxon_12086)","Human poliovirus 1 (http://purl.obolibrary.org/obo/NCBITaxon_12080)","Human poliovirus 2 (http://purl.obolibrary.org/obo/NCBITaxon_12083)","Caliciviridae (http://purl.obolibrary.org/obo/NCBITaxon_11974)","Rotavirus (http://purl.obolibrary.org/obo/NCBITaxon_10912)","Astrovirus sp. (http://purl.obolibrary.org/obo/NCBITaxon_178530)","Bayou orthohantavirus (http://purl.obolibrary.org/obo/NCBITaxon_1980459)","Andes orthohantavirus (http://purl.obolibrary.org/obo/NCBITaxon_1980456)","Sin Nombre orthohantavirus (http://purl.obolibrary.org/obo/NCBITaxon_1980491)","Black Creek Canal orthohantavirus (http://purl.obolibrary.org/obo/NCBITaxon_1980460)","Laguna Negra orthohantavirus (http://purl.obolibrary.org/obo/NCBITaxon_1980476)","Mumps rubulavirus (http://purl.obolibrary.org/obo/NCBITaxon_1979165)","Yellow fever virus (http://purl.obolibrary.org/obo/NCBITaxon_11089)","H2N3 subtype (http://purl.obolibrary.org/obo/NCBITaxon_114731)","H1N1 subtype (http://purl.obolibrary.org/obo/NCBITaxon_114727)","H1N2 subtype (http://purl.obolibrary.org/obo/NCBITaxon_114728)","Rift Valley fever virus (http://purl.obolibrary.org/obo/NCBITaxon_11588)","Zika virus (http://purl.obolibrary.org/obo/NCBITaxon_64320)","Powassan virus (http://purl.obolibrary.org/obo/NCBITaxon_11083)","Vaccinia virus (http://purl.obolibrary.org/obo/NCBITaxon_10245)","Enterovirus A (http://purl.obolibrary.org/obo/NCBITaxon_138948)","Coxsackievirus A16 (http://purl.obolibrary.org/obo/NCBITaxon_31704)","Tai Forest ebolavirus (http://purl.obolibrary.org/obo/NCBITaxon_186541)","Sudan ebolavirus (http://purl.obolibrary.org/obo/NCBITaxon_186540)","Bundibugyo ebolavirus (http://purl.obolibrary.org/obo/NCBITaxon_565995)","Ebolavirus (http://purl.obolibrary.org/obo/NCBITaxon_186536)","Zaire ebolavirus (http://purl.obolibrary.org/obo/NCBITaxon_186538)","Tai Forest virus - Cote d'Ivoire Cote d'Ivoire 1994 (http://purl.obolibrary.org/obo/NCBITaxon_128999)","Human papillomavirus type 6 (http://purl.obolibrary.org/obo/NCBITaxon_31552)","Human papillomavirus type 6b (http://purl.obolibrary.org/obo/NCBITaxon_10600)","Betapapillomavirus (http://purl.obolibrary.org/obo/NCBITaxon_333922)","Alphapapillomavirus (http://purl.obolibrary.org/obo/NCBITaxon_333750)","Mupapillomavirus (http://purl.obolibrary.org/obo/NCBITaxon_334202)","Gammapapillomavirus (http://purl.obolibrary.org/obo/NCBITaxon_325455)","Human papillomavirus type 11 (http://purl.obolibrary.org/obo/NCBITaxon_10580)","Human papillomavirus (http://purl.obolibrary.org/obo/NCBITaxon_10566)","Human papillomavirus 4 (http://purl.obolibrary.org/obo/NCBITaxon_10617)","Human papillomavirus type 2 (http://purl.obolibrary.org/obo/NCBITaxon_333751)","Venezuelan equine encephalitis virus (http://purl.obolibrary.org/obo/NCBITaxon_11036)","Monkeypox virus (http://purl.obolibrary.org/obo/NCBITaxon_10244)","Human alphaherpesvirus 2 (http://purl.obolibrary.org/obo/NCBITaxon_10310)","H7N9 subtype (http://purl.obolibrary.org/obo/NCBITaxon_333278)","H5N1 subtype (http://purl.obolibrary.org/obo/NCBITaxon_102793)","H7N2 subtype (http://purl.obolibrary.org/obo/NCBITaxon_119214)","H3N2 subtype (http://purl.obolibrary.org/obo/NCBITaxon_119210)","H7N7 subtype (http://purl.obolibrary.org/obo/NCBITaxon_119218)","Human bocavirus (http://purl.obolibrary.org/obo/NCBITaxon_329641)","Western equine encephalitis virus (http://purl.obolibrary.org/obo/NCBITaxon_11039)","Saaremaa hantavirus (http://purl.obolibrary.org/obo/NCBITaxon_159479)","Puumala orthohantavirus (http://purl.obolibrary.org/obo/NCBITaxon_1980486)","Hantaan orthohantavirus (http://purl.obolibrary.org/obo/NCBITaxon_1980471)","Peribunyaviridae (http://purl.obolibrary.org/obo/NCBITaxon_1980416)","Dobrava-Belgrade orthohantavirus (http://purl.obolibrary.org/obo/NCBITaxon_1980467)","Tula orthohantavirus (http://purl.obolibrary.org/obo/NCBITaxon_1980494)","Seoul orthohantavirus (http://purl.obolibrary.org/obo/NCBITaxon_1980490)","Hepacivirus C (http://purl.obolibrary.org/obo/NCBITaxon_11103)","Hepatitis delta virus (http://purl.obolibrary.org/obo/NCBITaxon_12475)","Hepatovirus A (http://purl.obolibrary.org/obo/NCBITaxon_12092)","Hepatitis B virus (http://purl.obolibrary.org/obo/NCBITaxon_10407)","JC polyomavirus (http://purl.obolibrary.org/obo/NCBITaxon_10632)","Human alphaherpesvirus 3 (http://purl.obolibrary.org/obo/NCBITaxon_10335)","Coxsackievirus A9 (http://purl.obolibrary.org/obo/NCBITaxon_12067)","Coxsackievirus A4 (http://purl.obolibrary.org/obo/NCBITaxon_42785)","Coxsackievirus A6 (http://purl.obolibrary.org/obo/NCBITaxon_86107)","Coxsackievirus A24 (http://purl.obolibrary.org/obo/NCBITaxon_12089)","Human enterovirus 70 (http://purl.obolibrary.org/obo/NCBITaxon_12090)","Colorado tick fever virus (http://purl.obolibrary.org/obo/NCBITaxon_46839)","Arenavirus (http://purl.obolibrary.org/obo/NCBITaxon_11618)","Lassa mammarenavirus (http://purl.obolibrary.org/obo/NCBITaxon_11620)","West Nile virus (http://purl.obolibrary.org/obo/NCBITaxon_11082)","Coxsackievirus B5 (http://purl.obolibrary.org/obo/NCBITaxon_12074)","Coxsackievirus A14 (http://purl.obolibrary.org/obo/NCBITaxon_42773)","Coxsackievirus B2 (http://purl.obolibrary.org/obo/NCBITaxon_82639)","Coxsackievirus A10 (http://purl.obolibrary.org/obo/NCBITaxon_42769)","Coxsackievirus A5 (http://purl.obolibrary.org/obo/NCBITaxon_42786)","Human papillomavirus type 32 (http://purl.obolibrary.org/obo/NCBITaxon_333763)","Human papillomavirus type 13 (http://purl.obolibrary.org/obo/NCBITaxon_10573)","Hepatitis E virus (http://purl.obolibrary.org/obo/NCBITaxon_12461)","Crimean-Congo hemorrhagic fever orthonairovirus (http://purl.obolibrary.org/obo/NCBITaxon_1980519)","Enterovirus B (http://purl.obolibrary.org/obo/NCBITaxon_138949)","Human papillomavirus type 63 (http://purl.obolibrary.org/obo/NCBITaxon_28311)","Variola virus (http://purl.obolibrary.org/obo/NCBITaxon_10255)","Pseudocowpox virus (http://purl.obolibrary.org/obo/NCBITaxon_129726)","Parapoxvirus (http://purl.obolibrary.org/obo/NCBITaxon_10257)","Variola major virus (http://purl.obolibrary.org/obo/NCBITaxon_12870)","Human betaherpesvirus 7 (http://purl.obolibrary.org/obo/NCBITaxon_10372)","Human betaherpesvirus 6A (http://purl.obolibrary.org/obo/NCBITaxon_32603)","Human herpesvirus 6 (http://purl.obolibrary.org/obo/NCBITaxon_10368)","Human betaherpesvirus 6B (http://purl.obolibrary.org/obo/NCBITaxon_32604)","Molluscum contagiosum virus (http://purl.obolibrary.org/obo/NCBITaxon_10279)","Betacoronavirus (http://purl.obolibrary.org/obo/NCBITaxon_694002)","Alphacoronavirus (http://purl.obolibrary.org/obo/NCBITaxon_693996)","Japanese encephalitis virus (http://purl.obolibrary.org/obo/NCBITaxon_11072)","Astroviridae (http://purl.obolibrary.org/obo/NCBITaxon_39733)","Marburg marburgvirus (http://purl.obolibrary.org/obo/NCBITaxon_11269)","Marburgvirus (http://purl.obolibrary.org/obo/NCBITaxon_186537)","Eastern equine encephalitis virus (http://purl.obolibrary.org/obo/NCBITaxon_11021)","Tick-borne encephalitis virus (http://purl.obolibrary.org/obo/NCBITaxon_11084)","Norovirus (http://purl.obolibrary.org/obo/NCBITaxon_142786)","Machupo mammarenavirus (http://purl.obolibrary.org/obo/NCBITaxon_11628)","Aleutian mink disease virus (http://purl.obolibrary.org/obo/NCBITaxon_28314)","Barmah Forest virus (http://purl.obolibrary.org/obo/NCBITaxon_11020)","Avian avulavirus 1 (http://purl.obolibrary.org/obo/NCBITaxon_11176)","Whitewater Arroyo mammarenavirus (http://purl.obolibrary.org/obo/NCBITaxon_46919)","Variola minor virus (http://purl.obolibrary.org/obo/NCBITaxon_53258)","La Crosse virus (http://purl.obolibrary.org/obo/NCBITaxon_11577)","Ross River virus (http://purl.obolibrary.org/obo/NCBITaxon_11029)","Kyasanur Forest disease virus (http://purl.obolibrary.org/obo/NCBITaxon_33743)","Louping ill virus (http://purl.obolibrary.org/obo/NCBITaxon_11086)","Kunjin virus (http://purl.obolibrary.org/obo/NCBITaxon_11077)","Borna disease virus (http://purl.obolibrary.org/obo/NCBITaxon_12455)","Omsk hemorrhagic fever virus (http://purl.obolibrary.org/obo/NCBITaxon_12542)","Alkhumra hemorrhagic fever virus (http://purl.obolibrary.org/obo/NCBITaxon_172148)","Oropouche virus (http://purl.obolibrary.org/obo/NCBITaxon_118655)","Human parvovirus B19 (http://purl.obolibrary.org/obo/NCBITaxon_10798)","Murray Valley encephalitis virus (http://purl.obolibrary.org/obo/NCBITaxon_11079)","Lujo mammarenavirus (http://purl.obolibrary.org/obo/NCBITaxon_649188)","Guanarito mammarenavirus (http://purl.obolibrary.org/obo/NCBITaxon_45219)"],
  			marker: { size: 7 }
		};

		var trace3 = {
  			x: [-12.001311751690196,-13.109332798249616,-15.327400073357959,-11.518235791573241,-10.024218330665702,-1.20967015993642,11.088601475256857,-5.789346064620951,-7.493115873048869,-5.191491695711851,-1.5033524315665043,-13.756105982010887,-13.400655200228655,1.274774275930806,-12.122613562160828,-3.2661055245037955,2.812865851663312,-0.2758095215085861,-14.966171380504072,3.1079516499915156,-13.575862565249787,0.5618475701206727,-0.3314050207383819,-10.846821856815124,2.59165681229863,-10.582928631010464,-3.5719932584957266,-1.431980019623365,5.437891698824701,-8.753061083690682,2.056524150701377,5.003810977916164,-10.883728060205335,-5.728318881413483,-4.498311490484396,-14.321311398709692,-5.808307929116305,-14.40373722432603,-14.589867571018491,-10.175294134831798,-10.353392307811284,-11.370929534589493,-14.945416159376707,-7.285815087313706,-16.327041452555587,2.556571699249861,12.15118109300828,3.8169019579719015,-5.593744168320418,10.473231457615693,10.87311923030089,-9.787774475959797,4.748686622922565,-11.869624926746377,-0.4396597647993675,-3.5220950160015394,-4.623841037911091,-2.8957775457257893,0.3349494414390327,9.543487938674188,-0.01514206987063979,-0.981081095854399,1.4178553729241037,-3.066943470553143,-16.226289037280594,7.688748101306904,6.9672130585955,8.29310519209574,13.605481960582079,-1.352706254521719,6.704189336734337,8.46367075494148,-6.418348171069319,2.6457939298308077,2.253595063897211,4.14711010830458,8.96418528208906,0.46466165908846213,0.9926379152509736,10.921213180573842,-6.381022259605341,-3.6903722245797757,-8.167610762932387,-11.259294553389635,15.065367843878706,-7.8460215562823175,-10.087156317353235,-6.8991329796788206,-6.347104910412376,-6.890754299497333,-0.5757817592127714,-6.316748843468338,-11.365434125355197,-6.778888532304534,-5.854189418816138,5.489690349238624,-0.22897657002293373,-1.2193532425840676,1.5200197448661028,12.85275178999018,16.872723075027963,5.904346921365383,13.642639810932316,-2.4761295266992573,14.461952787215639,7.482499281756947,17.761496430158907,-0.2898183656317077,6.686350453636436,13.206261489099049,-0.1812755057521785,2.991244364703616,11.924948291421083,10.435901121970057,-7.73283861528136,-9.765017556648287,5.497545552160301,9.23361681243782,-5.666904884832554,11.333207677931433,10.238349929177899,-8.247894603087147,1.831594133704178,2.6987360420123196,6.096971861380792,4.965510136477315,5.5889752912848865,3.4851117111910543,5.067280343218142,6.013791936926533,4.966046554664226,-12.186722110019286,-10.701854296040931,-12.021782301870408,-13.935003820231422,-7.183385036297974,-12.170372703280346,13.878000190460076,8.06998158831614,-5.896903829585643,-14.394216314725403,4.039444266150469,-6.192420738247785,-5.154704988367893,1.480517071022702,-11.176341847492905,4.9064356464010555,11.05353377636517,1.9257718029269686,-8.694894314351279,1.0026063092888962,-1.642874052612994,-8.761913887542201,-11.904721075538264,13.148378694436836,8.10305676878093,1.4214884173693363,-6.9001977508297765,8.874783256311073,-11.236452486291292,11.597052192902852,5.94344212392447,18.46422813725651,-10.246724130222402,-11.935138428517906,5.038538548874497,-5.559141854458979,-1.5015723537919712,-0.34179961957247196,8.693251528231071,2.1884469464082894,-10.053047055697636,1.360223577603097,12.988033851295384,9.58793736338535,8.924012163931204,6.600432208547334,6.733498725741292,5.722885274069136,2.7321642004396907,1.1535352940080834,2.997480650351937,4.2954060539461025,-1.7465652851222313,5.645152803524075,5.652382863127822,-1.510030851564936,-3.476358762587639,-10.853510473863752,3.133196012377174,-8.69538816316712,3.1334412413090877,4.415718481558622,14.486460920652416,-2.8073025715725413,3.4396605260662936,-6.699121219970599,5.10314578673073,0.14351109726421554,11.381753810261634,14.130523727781693,-0.46100226201339234,-4.193243817429465,-6.571165049400806,-3.353599787593646,-6.71018239147982,7.459153305680032],
  			y: [34.20622599741377,34.36802093048952,39.44957034197995,38.18160027140375,31.59330970963269,-13.949640299035787,-14.28752495710964,-13.280444685925017,20.466353057225312,26.226822537806857,13.635674613221841,34.92370367277534,33.51907021984868,-10.077725256685287,36.57213864420876,1.0149719908981563,-5.562102569748172,7.680481294201326,36.612407121291916,-1.802917045126704,39.63081091869422,-11.48641409520791,5.638453025774389,-7.2879369829975635,1.7212645853080655,26.72232990721527,20.66021889668971,23.045875551932895,-6.006555064628138,17.233848643692234,-3.712095402346765,-3.792671740955512,-7.359893998124535,25.505522675958847,17.776996334554326,39.578816060192366,-4.139934460403358,38.03806931808023,38.29860325789246,19.200030612450536,15.9129236287711,27.01645072215314,40.93890823924287,18.4795987883881,41.60580512797296,6.694083470356635,-1.2732464814042612,-22.97430031943113,15.465719665548262,-0.18738075549644687,3.020637456372951,2.2102934461194357,-8.140465251757435,17.935155877208167,21.140831687053915,19.570465660143793,20.331795106087966,21.55642832019337,7.410467208366565,-0.016353662755043068,-15.638993144181367,-16.47578262982857,-16.931190485105002,-16.444339600406494,41.52027479197807,-10.002263357204374,-13.29071890139067,-11.430683922954964,-12.336441182392578,-11.974063481367962,-21.104152264612075,-9.861452510225758,-13.420583538892041,21.394523393882743,-24.329933171992415,-24.655846604367035,-22.125623585543103,-27.23135300220449,-25.655837115454304,-19.395526969541656,17.573716812140482,-3.525151518078691,-11.756886451045736,-1.9338095377421356,-11.175332938779311,30.66980775322645,37.92376013846287,28.10229268483185,19.116240926404878,23.95726009548446,3.575312818509666,20.98751580663425,17.853810577397713,22.49975557150426,21.11556801935142,-10.169212950150483,20.900706423339145,-12.841584112807839,-15.851626673048003,-14.363707951666747,-10.713332524443304,-15.44980544948112,-14.580962832500845,16.435314166448244,-1.0220555062619738,-1.2635853406542807,-9.150990431834506,-0.9803608223495346,0.43787206914165405,0.5064277061278326,-6.8625542176099446,-13.148980891173132,-11.219620930102568,-12.872711653467155,22.05499923289394,28.39081463444215,4.793324680376993,-22.67445219376909,3.8621907414143637,2.265644501938331,-23.9038650011192,27.510125725896973,18.91576195008711,15.253402743909596,-30.566848904783754,-31.23060533306392,-29.598388755537815,-26.786145401105554,-28.62722411103614,-28.74414642203116,-28.892676313335787,29.540102157252203,35.568084942101535,35.097397503899906,34.63349228005732,26.597579339051695,35.37170556198313,4.6103494990234335,6.121157557398092,18.751923058930412,40.81196766450478,-26.728046012499103,0.33199807703016687,18.424559958441314,-8.68946203378305,-5.616841587815293,-0.9521517741345836,-9.403298107377333,-11.446961999845321,-4.178922059507722,-2.541560114336376,-3.256505385157658,-2.875817911613096,33.817724440989736,-8.303421428076591,-9.702789434117358,-14.301570653943907,24.24498218043871,-31.2525051562485,34.67945145001967,-10.36114904330157,1.46021500365477,-2.1514876594290344,29.52614955175168,23.64117649837834,-18.170011062998714,-14.304385748182572,-27.506493191477738,-14.019893547866674,-19.250823698048194,-19.034225999486587,34.39911562860544,-14.221521157062769,-9.52828868631994,-14.795726763217413,-9.760985629075629,-10.115443626131185,-33.08358092817526,-31.46769316793329,-9.757674751434065,-6.9694152053885645,-16.20892392001344,16.066269009545206,25.931116121230417,6.111714697058986,-37.63172819930898,19.42245847272189,14.794426786173299,17.12590118799571,-9.553200948624156,19.60121289136618,-32.91386987296037,-38.41111475982484,-10.531797771878555,-12.82178933672955,-22.058421443743175,-13.802329842951902,-38.01825789715937,5.261058734033808,-2.046302655153583,-6.926038613151349,-4.855937465131854,3.6475533767763615,-22.08305231752651,-10.828566602599674,-9.28896001690684,2.8337698094173485],
  			mode: 'markers',
  			type: 'scatter',
  			name: 'Bacteria',
  			text: ["Mycobacterium avium complex sp. (http://purl.obolibrary.org/obo/NCBITaxon_37162)","Treponema pallidum subsp. pertenue (http://purl.obolibrary.org/obo/NCBITaxon_168)","Staphylococcus aureus (http://purl.obolibrary.org/obo/NCBITaxon_1280)","Streptococcus pyogenes (http://purl.obolibrary.org/obo/NCBITaxon_1314)","Bartonella bacilliformis (http://purl.obolibrary.org/obo/NCBITaxon_774)","Bartonella elizabethae (http://purl.obolibrary.org/obo/NCBITaxon_807)","Bartonella (http://purl.obolibrary.org/obo/NCBITaxon_773)","Bartonella ancashensis (http://purl.obolibrary.org/obo/NCBITaxon_1318743)","Bartonella henselae (http://purl.obolibrary.org/obo/NCBITaxon_38323)","Bartonella quintana (http://purl.obolibrary.org/obo/NCBITaxon_803)","Mycobacterium lepromatosis (http://purl.obolibrary.org/obo/NCBITaxon_480418)","Mycobacterium leprae (http://purl.obolibrary.org/obo/NCBITaxon_1769)","Clostridium (http://purl.obolibrary.org/obo/NCBITaxon_1485)","Salmonella (http://purl.obolibrary.org/obo/NCBITaxon_590)","Haemophilus influenzae (http://purl.obolibrary.org/obo/NCBITaxon_727)","Chlamydia (http://purl.obolibrary.org/obo/NCBITaxon_810)","Moraxella catarrhalis (http://purl.obolibrary.org/obo/NCBITaxon_480)","Acinetobacter baumannii (http://purl.obolibrary.org/obo/NCBITaxon_470)","Mycoplasma pneumoniae (http://purl.obolibrary.org/obo/NCBITaxon_2104)","Peptostreptococcus (http://purl.obolibrary.org/obo/NCBITaxon_1257)","Bacillus anthracis (http://purl.obolibrary.org/obo/NCBITaxon_1392)","Enterococcus faecium (http://purl.obolibrary.org/obo/NCBITaxon_1352)","Chlamydia pneumoniae (http://purl.obolibrary.org/obo/NCBITaxon_83558)","Fusobacterium (http://purl.obolibrary.org/obo/NCBITaxon_848)","Mycoplasma (http://purl.obolibrary.org/obo/NCBITaxon_2093)","Coxiella burnetii (http://purl.obolibrary.org/obo/NCBITaxon_777)","Klebsiella (http://purl.obolibrary.org/obo/NCBITaxon_570)","Klebsiella pneumoniae (http://purl.obolibrary.org/obo/NCBITaxon_573)","Escherichia coli (http://purl.obolibrary.org/obo/NCBITaxon_562)","Actinomyces israelii (http://purl.obolibrary.org/obo/NCBITaxon_1659)","Pseudomonas aeruginosa (http://purl.obolibrary.org/obo/NCBITaxon_287)","Legionella (http://purl.obolibrary.org/obo/NCBITaxon_445)","Enterococcus (http://purl.obolibrary.org/obo/NCBITaxon_1350)","Chlamydia psittaci (http://purl.obolibrary.org/obo/NCBITaxon_83554)","Prevotella (http://purl.obolibrary.org/obo/NCBITaxon_838)","Francisella tularensis (http://purl.obolibrary.org/obo/NCBITaxon_263)","Bacteroides (http://purl.obolibrary.org/obo/NCBITaxon_816)","Yersinia pestis (http://purl.obolibrary.org/obo/NCBITaxon_632)","Streptococcus pneumoniae (http://purl.obolibrary.org/obo/NCBITaxon_1313)","Enterococcus faecalis (http://purl.obolibrary.org/obo/NCBITaxon_1351)","Nocardia asteroides (http://purl.obolibrary.org/obo/NCBITaxon_1824)","Bordetella pertussis (http://purl.obolibrary.org/obo/NCBITaxon_520)","Chlamydia trachomatis (http://purl.obolibrary.org/obo/NCBITaxon_813)","Corynebacterium diphtheriae (http://purl.obolibrary.org/obo/NCBITaxon_1717)","Mycobacterium tuberculosis (http://purl.obolibrary.org/obo/NCBITaxon_1773)","Salmonella enterica subsp. enterica serovar Typhi (http://purl.obolibrary.org/obo/NCBITaxon_90370)","Salmonella enterica subsp. enterica (http://purl.obolibrary.org/obo/NCBITaxon_59201)","Orientia tsutsugamushi (http://purl.obolibrary.org/obo/NCBITaxon_784)","Borreliella burgdorferi (http://purl.obolibrary.org/obo/NCBITaxon_139)","Borrelia mayonii (http://purl.obolibrary.org/obo/NCBITaxon_1674146)","Borreliella garinii (http://purl.obolibrary.org/obo/NCBITaxon_29519)","Borreliella afzelii (http://purl.obolibrary.org/obo/NCBITaxon_29518)","Borrelia crocidurae (http://purl.obolibrary.org/obo/NCBITaxon_29520)","Borrelia hermsii (http://purl.obolibrary.org/obo/NCBITaxon_140)","Borrelia parkeri (http://purl.obolibrary.org/obo/NCBITaxon_141)","Borrelia (http://purl.obolibrary.org/obo/NCBITaxon_138)","Borrelia duttonii (http://purl.obolibrary.org/obo/NCBITaxon_40834)","Borrelia turicatae (http://purl.obolibrary.org/obo/NCBITaxon_142)","Clostridium tetani (http://purl.obolibrary.org/obo/NCBITaxon_1513)","Burkholderia pseudomallei (http://purl.obolibrary.org/obo/NCBITaxon_28450)","Vibrio cholerae O1 (http://purl.obolibrary.org/obo/NCBITaxon_127906)","Vibrio cholerae (http://purl.obolibrary.org/obo/NCBITaxon_666)","Vibrio cholerae O139 (http://purl.obolibrary.org/obo/NCBITaxon_45888)","Vibrio cholerae O395 (http://purl.obolibrary.org/obo/NCBITaxon_345073)","Treponema pallidum (http://purl.obolibrary.org/obo/NCBITaxon_160)","Campylobacter concisus 13826 (http://purl.obolibrary.org/obo/NCBITaxon_360104)","Helicobacter pylori (http://purl.obolibrary.org/obo/NCBITaxon_210)","Campylobacter fetus (http://purl.obolibrary.org/obo/NCBITaxon_196)","Campylobacter curvus (http://purl.obolibrary.org/obo/NCBITaxon_200)","Campylobacter coli (http://purl.obolibrary.org/obo/NCBITaxon_195)","Campylobacter jejuni (http://purl.obolibrary.org/obo/NCBITaxon_197)","Campylobacter (http://purl.obolibrary.org/obo/NCBITaxon_194)","Campylobacter lari (http://purl.obolibrary.org/obo/NCBITaxon_201)","Brucella suis (http://purl.obolibrary.org/obo/NCBITaxon_29461)","Yersinia pestis KIM10+ (http://purl.obolibrary.org/obo/NCBITaxon_187410)","Yersinia pestis D182038 (http://purl.obolibrary.org/obo/NCBITaxon_637385)","Yersinia pestis CO92 (http://purl.obolibrary.org/obo/NCBITaxon_214092)","Yersinia pestis Angola (http://purl.obolibrary.org/obo/NCBITaxon_349746)","Yersinia pestis Pestoides F (http://purl.obolibrary.org/obo/NCBITaxon_386656)","Yersinia pestis D106004 (http://purl.obolibrary.org/obo/NCBITaxon_637382)","Ehrlichia (http://purl.obolibrary.org/obo/NCBITaxon_943)","Ehrlichia ewingii (http://purl.obolibrary.org/obo/NCBITaxon_947)","Ehrlichia muris (http://purl.obolibrary.org/obo/NCBITaxon_35795)","Ehrlichia chaffeensis (http://purl.obolibrary.org/obo/NCBITaxon_945)","Mycobacterium intracellulare (http://purl.obolibrary.org/obo/NCBITaxon_1767)","Brucella (http://purl.obolibrary.org/obo/NCBITaxon_234)","Brucella melitensis (http://purl.obolibrary.org/obo/NCBITaxon_29459)","Brucella canis (http://purl.obolibrary.org/obo/NCBITaxon_36855)","Brucella ovis (http://purl.obolibrary.org/obo/NCBITaxon_236)","Brucella abortus (http://purl.obolibrary.org/obo/NCBITaxon_235)","Rickettsia africae (http://purl.obolibrary.org/obo/NCBITaxon_35788)","Legionella longbeachae (http://purl.obolibrary.org/obo/NCBITaxon_450)","Legionella pneumophila (http://purl.obolibrary.org/obo/NCBITaxon_446)","Tatlockia micdadei (http://purl.obolibrary.org/obo/NCBITaxon_451)","Legionella feeleii (http://purl.obolibrary.org/obo/NCBITaxon_453)","Fluoribacter bozemanae (http://purl.obolibrary.org/obo/NCBITaxon_447)","Legionella anisa (http://purl.obolibrary.org/obo/NCBITaxon_28082)","Fluoribacter dumoffii (http://purl.obolibrary.org/obo/NCBITaxon_463)","Anaplasma phagocytophilum (http://purl.obolibrary.org/obo/NCBITaxon_948)","Enterobacteriaceae (http://purl.obolibrary.org/obo/NCBITaxon_543)","Corynebacterium urealyticum (http://purl.obolibrary.org/obo/NCBITaxon_43771)","Staphylococcus saprophyticus (http://purl.obolibrary.org/obo/NCBITaxon_29385)","Proteus enterobacteria (http://purl.obolibrary.org/obo/NCBITaxon_583)","Listeria monocytogenes (http://purl.obolibrary.org/obo/NCBITaxon_1639)","Pasteurella canis (http://purl.obolibrary.org/obo/NCBITaxon_753)","Pasteurella (http://purl.obolibrary.org/obo/NCBITaxon_745)","Pasteurella dagmatis (http://purl.obolibrary.org/obo/NCBITaxon_754)","Pasteurella stomatis (http://purl.obolibrary.org/obo/NCBITaxon_760)","Pasteurella multocida subsp. septica (http://purl.obolibrary.org/obo/NCBITaxon_115545)","Pasteurella multocida (http://purl.obolibrary.org/obo/NCBITaxon_747)","Leptospira santarosai (http://purl.obolibrary.org/obo/NCBITaxon_28183)","Leptospira interrogans (http://purl.obolibrary.org/obo/NCBITaxon_173)","Leptospira borgpetersenii (http://purl.obolibrary.org/obo/NCBITaxon_174)","Leptospira (http://purl.obolibrary.org/obo/NCBITaxon_171)","Rickettsia japonica (http://purl.obolibrary.org/obo/NCBITaxon_35790)","Rickettsia (http://purl.obolibrary.org/obo/NCBITaxon_780)","Rickettsia heilongjiangensis (http://purl.obolibrary.org/obo/NCBITaxon_226665)","Rickettsia conorii str. Malish 7 (http://purl.obolibrary.org/obo/NCBITaxon_272944)","Rickettsia australis (http://purl.obolibrary.org/obo/NCBITaxon_787)","Rickettsia rickettsii (http://purl.obolibrary.org/obo/NCBITaxon_783)","Rickettsia massiliae (http://purl.obolibrary.org/obo/NCBITaxon_35791)","Rickettsia conorii (http://purl.obolibrary.org/obo/NCBITaxon_781)","Rickettsia sibirica (http://purl.obolibrary.org/obo/NCBITaxon_35793)","Nocardia brasiliensis (http://purl.obolibrary.org/obo/NCBITaxon_37326)","Actinomyces odontolyticus (http://purl.obolibrary.org/obo/NCBITaxon_1660)","Actinomyces viscosus (http://purl.obolibrary.org/obo/NCBITaxon_1656)","Actinomyces meyeri (http://purl.obolibrary.org/obo/NCBITaxon_52773)","Actinomyces naeslundii (http://purl.obolibrary.org/obo/NCBITaxon_1655)","Actinomyces gerencseriae (http://purl.obolibrary.org/obo/NCBITaxon_52769)","Actinomadura madurae (http://purl.obolibrary.org/obo/NCBITaxon_1993)","Pseudopropionibacterium propionicum (http://purl.obolibrary.org/obo/NCBITaxon_1750)","Clostridium butyricum (http://purl.obolibrary.org/obo/NCBITaxon_1492)","Clostridium botulinum F (http://purl.obolibrary.org/obo/NCBITaxon_36831)","Clostridium botulinum A (http://purl.obolibrary.org/obo/NCBITaxon_36826)","Clostridium botulinum E (http://purl.obolibrary.org/obo/NCBITaxon_36830)","Clostridium baratii (http://purl.obolibrary.org/obo/NCBITaxon_1561)","Clostridium botulinum B (http://purl.obolibrary.org/obo/NCBITaxon_36827)","Rickettsia felis (http://purl.obolibrary.org/obo/NCBITaxon_42862)","Rickettsia typhi (http://purl.obolibrary.org/obo/NCBITaxon_785)","Rickettsia prowazekii (http://purl.obolibrary.org/obo/NCBITaxon_782)","Neisseria meningitidis (http://purl.obolibrary.org/obo/NCBITaxon_487)","Clostridium botulinum (http://purl.obolibrary.org/obo/NCBITaxon_1491)","Spirillum (http://purl.obolibrary.org/obo/NCBITaxon_967)","Fusobacterium necrophorum (http://purl.obolibrary.org/obo/NCBITaxon_859)","Escherichia coli O145 (http://purl.obolibrary.org/obo/NCBITaxon_1055538)","Escherichia coli O111 (http://purl.obolibrary.org/obo/NCBITaxon_1055535)","Escherichia coli O113 (http://purl.obolibrary.org/obo/NCBITaxon_1162729)","Escherichia coli O111:H8 (http://purl.obolibrary.org/obo/NCBITaxon_991910)","Escherichia coli O157:H7 (http://purl.obolibrary.org/obo/NCBITaxon_83334)","Escherichia coli O103:H2 (http://purl.obolibrary.org/obo/NCBITaxon_376725)","Escherichia coli O104:H4 (http://purl.obolibrary.org/obo/NCBITaxon_1038927)","Escherichia coli O121 (http://purl.obolibrary.org/obo/NCBITaxon_1055537)","Escherichia coli O26 (http://purl.obolibrary.org/obo/NCBITaxon_404399)","Mycobacterium bovis (http://purl.obolibrary.org/obo/NCBITaxon_1765)","Rickettsia honei subsp. marmionii (http://purl.obolibrary.org/obo/NCBITaxon_362241)","Rickettsia honei (http://purl.obolibrary.org/obo/NCBITaxon_37816)","Rickettsia conorii subsp. conorii (http://purl.obolibrary.org/obo/NCBITaxon_319546)","Treponema pallidum subsp. endemicum (http://purl.obolibrary.org/obo/NCBITaxon_53436)","[Haemophilus] ducreyi (http://purl.obolibrary.org/obo/NCBITaxon_730)","Neisseria gonorrhoeae (http://purl.obolibrary.org/obo/NCBITaxon_485)","Serratia marcescens (http://purl.obolibrary.org/obo/NCBITaxon_615)","Eikenella corrodens (http://purl.obolibrary.org/obo/NCBITaxon_539)","Proteus mirabilis (http://purl.obolibrary.org/obo/NCBITaxon_584)","Neorickettsia sennetsu (http://purl.obolibrary.org/obo/NCBITaxon_951)","Mycobacterium lentiflavum (http://purl.obolibrary.org/obo/NCBITaxon_141349)","Streptococcus sp. 'group C' (http://purl.obolibrary.org/obo/NCBITaxon_33972)","Porphyromonas (http://purl.obolibrary.org/obo/NCBITaxon_836)","Streptococcus sp. 'group B' (http://purl.obolibrary.org/obo/NCBITaxon_1319)","Streptococcus sp. 'group G' (http://purl.obolibrary.org/obo/NCBITaxon_1320)","Bacteroides fragilis (http://purl.obolibrary.org/obo/NCBITaxon_817)","Arcanobacterium haemolyticum (http://purl.obolibrary.org/obo/NCBITaxon_28264)","Treponema pallidum subsp. pallidum (http://purl.obolibrary.org/obo/NCBITaxon_161)","Nocardia cyriacigeorgica (http://purl.obolibrary.org/obo/NCBITaxon_135487)","Nocardia nova (http://purl.obolibrary.org/obo/NCBITaxon_37330)","Nocardia (http://purl.obolibrary.org/obo/NCBITaxon_1817)","Nocardia abscessus (http://purl.obolibrary.org/obo/NCBITaxon_120957)","Nocardia farcinica (http://purl.obolibrary.org/obo/NCBITaxon_37329)","Shigella boydii (http://purl.obolibrary.org/obo/NCBITaxon_621)","Shigella (http://purl.obolibrary.org/obo/NCBITaxon_620)","Bordetella bronchiseptica (http://purl.obolibrary.org/obo/NCBITaxon_518)","Bordetella parapertussis (http://purl.obolibrary.org/obo/NCBITaxon_519)","Ureaplasma urealyticum (http://purl.obolibrary.org/obo/NCBITaxon_2130)","Mycobacterium ulcerans (http://purl.obolibrary.org/obo/NCBITaxon_1809)","Clostridium perfringens (http://purl.obolibrary.org/obo/NCBITaxon_1502)","Borrelia recurrentis (http://purl.obolibrary.org/obo/NCBITaxon_44449)","Rickettsia parkeri (http://purl.obolibrary.org/obo/NCBITaxon_35792)","Salmonella enterica subsp. enterica serovar Paratyphi C (http://purl.obolibrary.org/obo/NCBITaxon_57046)","Salmonella enterica subsp. enterica serovar Paratyphi B (http://purl.obolibrary.org/obo/NCBITaxon_57045)","Salmonella enterica subsp. enterica serovar Paratyphi A (http://purl.obolibrary.org/obo/NCBITaxon_54388)","Klebsiella pneumoniae subsp. rhinoscleromatis (http://purl.obolibrary.org/obo/NCBITaxon_39831)","Rickettsia conorii subsp. indica (http://purl.obolibrary.org/obo/NCBITaxon_317865)","Burkholderia mallei (http://purl.obolibrary.org/obo/NCBITaxon_13373)","Treponema (http://purl.obolibrary.org/obo/NCBITaxon_157)","Streptobacillus moniliformis (http://purl.obolibrary.org/obo/NCBITaxon_34105)","Yersinia pseudotuberculosis (http://purl.obolibrary.org/obo/NCBITaxon_633)","Anaplasma (http://purl.obolibrary.org/obo/NCBITaxon_768)","Bacillus cereus (http://purl.obolibrary.org/obo/NCBITaxon_1396)","Rickettsia helvetica (http://purl.obolibrary.org/obo/NCBITaxon_35789)","Rickettsia conorii subsp. israelensis (http://purl.obolibrary.org/obo/NCBITaxon_45258)","Rickettsia akari (http://purl.obolibrary.org/obo/NCBITaxon_786)","Streptococcus agalactiae (http://purl.obolibrary.org/obo/NCBITaxon_1311)","Actinobacillus ureae (http://purl.obolibrary.org/obo/NCBITaxon_723)","Rickettsia conorii subsp. caspia (http://purl.obolibrary.org/obo/NCBITaxon_302011)","Staphylococcus (http://purl.obolibrary.org/obo/NCBITaxon_1279)","Streptococcus sp. 'group A' (http://purl.obolibrary.org/obo/NCBITaxon_36470)","Klebsiella granulomatis (http://purl.obolibrary.org/obo/NCBITaxon_39824)","Erysipelothrix rhusiopathiae (http://purl.obolibrary.org/obo/NCBITaxon_1648)"],
  			marker: { size: 7 }
		};


		var data = [ trace2, trace3, trace1];

		return ( <Plot
        	data={[ trace2, trace3, trace1]}
        	layout={ {width: 1500, height: 1500, title: 'Pathogen phenotype distribution (t-SNE)',hovermode: 'closest',autosize: false,xaxis: { range: [-20,20],},yaxis: { range: [-40,45],}, }}
      	/> );
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
		Pathogen-disease relations are linked to disease-phenotypes by using text mining methods. 
		</p>
		<p>
		<h5><u>Mappings:</u></h5>
	    <ul>
		<li>Pathogens are mapped to NCBI Taxonomy</li>
	    <li>Diseases are mapped to Infectious disease class of Disease Ontology</li>
	    <li>Phenotypes are mapped to Human Phenotype Ontology and Mammalian Phenotype ontology.</li> 
	    <li>Drugs are mapped to PubChem</li>
	    <li>Resistant pathogen genes are mapped to ARO</li>
		</ul>
		</p>
		<p>
		<h5><u>Current statistics:</u></h5>
		</p>
		<table className="table table-striped">
  			<thead>
    			<th></th>
    			<th>Manual Curation</th> 
    			<th>Text mining + Manual Curation</th>
  			</thead>
  			<tbody>
  			<tr>
  				<td>Distinct pathogen-disease associations</td>
  				<td>1143</td>
  				<td>4169</td>
  			</tr>
  			<tr>
  				<td>Pathogen-disease associations linked to phenotypes</td>
  				<td>1140</td>
  				<td>3989</td>
  			</tr>
  			<tr>
  				<td>Diseases linked to pathogens</td>
  				<td>508</td>
  				<td>538</td>
  			</tr>
  			<tr>
  				<td>Diseases linked to pathogens and phenotypes</td>
  				<td>488</td>
  				<td>511</td>
  			</tr>
  			<tr>
  				<td>Pathogens linked to phenotypes</td>
  				<td>692  (insect: 32, fungi: 115, bacteria: 208, virus: 175, protozoa: 47, worm: 115)</td>
  				<td>1642  (fungi: 220, insect: 367, bacteria: 404, virus: 358, worm: 199, protozoa: 98)</td>
  			</tr>
  			<tr>
  				<td>Diseases with Drug information from Sider</td>
  				<td>130</td>
  				<td>139</td>
  			</tr>
  			<tr>
  				<td>Pathogens with resistant information from ARO</td>
  				<td>30</td>
  				<td>47</td>
  			</tr>
  		</tbody>
 		</table>
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
		<p><img src="/static/images/pathogen.png"/></p>

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
		<p><img src="/static/images/phenotype.png"/></p>

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
		<p><img src="/static/images/disease.png"/></p>
		</div>
	);
	
    }
    renderDownloadsPage() {
	if (this.state.page != 'downloads') {
	    return (<div></div>);
	}

	return (
		<div>
			<br/><br/>
			<h4><u> Data is available in RDF format</u></h4>
			<br/>
			<ul>
			<li><a href="/media/downloads/patho_pheno.nt" download><b>Version 1 (30 October 2018)</b></a></li>
			<li><a href="/media/downloads/patho_pheno.v2.nt" download><b>Version 2 (30 November 2018)</b></a></li>
			</ul>
		</div>
	);
	
    }

    renderExplorePage() {
	if (this.state.page != 'explore') {
	    return (<div></div>);
	}

	return (
		<div className="row">
		<br/>
		<p>Visualization of pathogens based on phenotypes they elicit in their hosts.</p>
		{ this.explore() }
		<br/>
		</div>
    );
  }
	
    
    render() {
	var section = (<div></div>);
	return (
		<div className="container">
		{ this.renderHeader() }
	    { this.renderSearchPage() }
	    {this.renderExplorePage()}
	    { this.renderAboutPage() }
	    { this.renderHelpPage() }
	    {this.renderDownloadsPage()}
      <div className="row">
        <div className="col-lg-4">
        </div>
        <div className="col-lg-4">
        </div>
        <div className="col-lg-4">
        </div>
      </div>

      <footer className="footer">
		<p>Report and issues at <a href="https://github.com/bio-ontology-research-group/pathophenodb/issues" target="_blank">the issue tracker</a></p><p>&copy; 2018 BORG, CBRC, KAUST.</p>
      </footer>

    </div>
    );
  }
}

export default App;
