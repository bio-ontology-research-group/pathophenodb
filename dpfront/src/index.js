import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import {Route, HashRouter} from 'react-router-dom';
import registerServiceWorker from './registerServiceWorker';


ReactDOM.render(
    <HashRouter>
	<Route path="/:section?/:query?/:page?/" component={App} />
    </HashRouter>,
    document.getElementById('root'));
registerServiceWorker();
