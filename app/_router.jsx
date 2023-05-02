// @ts-expect-error Module '"react"' has no exported member 'use'.
import { StrictMode, useEffect, useState, use, startTransition } from 'react';
import { createRoot } from 'react-dom/client';
import { /* FOR FRAMEWORK DEVS */ createFromFetch } from 'react-server-dom-webpack/client';

/** Dev-only dependencies */
import { DevPanel } from './utils/dev/DevPanel.jsx';
import './utils/dev/live-reload.js';

// HACK: map webpack resolution to native ESM
globalThis.__webpack_require__ = async (/** @type {string} */ id) => {
	return import(id);
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('No root element');
const root = createRoot(rootElement);
root.render(
	<StrictMode>
		<Router />
	</StrictMode>
);

let callbacks = [];
globalThis.router = {
	navigate(/** @type {string} */ url) {
		window.history.replaceState({}, '', url);
		callbacks.forEach((cb) => cb());
	}
};

function Router() {
	const [url, setUrl] = useState('/rsc' + window.location.search);

	useEffect(() => {
		function handleNavigate() {
			startTransition(() => {
				setUrl('/rsc' + window.location.search);
			});
		}
		callbacks.push(handleNavigate);
		window.addEventListener('popstate', handleNavigate);
		return () => {
			callbacks.splice(callbacks.indexOf(handleNavigate), 1);
			window.removeEventListener('popstate', handleNavigate);
		};
	}, []);

	return (
		<>
			<ServerOutput url={url} />
			<DevPanel url={url} />
		</>
	);
}

const initialCache = new Map();

function ServerOutput({ url }) {
	const [cache, setCache] = useState(initialCache);
	if (!cache.has(url)) {
		cache.set(url, createFromFetch(fetch(url)));
	}
	const lazyJsx = cache.get(url);
	return use(lazyJsx);
}
