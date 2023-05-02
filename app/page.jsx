import React, { Suspense } from 'react';
import { getAll } from './db/get.js';
import SearchableAlbumList from './SearchableAlbumList';

// You can know this is a server component because it's an async function
/** @param {{ search: string }} props */
export default async function ServerRoot({ search }) {
	return (
		<>
			<h1>AbraMix</h1>
			<Suspense fallback={<h2>Loading...</h2>}>
				{/* The types have not been updated to work with server components
				    yet */}
				{/* @ts-expect-error 'Promise<Element>' is not a valid JSX element */}
				<Albums search={search} />
			</Suspense>
		</>
	);
}

// This is also a server component because it's an async function. And because
// it is you can do things like await database calls (e.g. `getAll()`)
/** @param {{ search: string }} props */
async function Albums({ search }) {
	const albums = await getAll();

	return <SearchableAlbumList search={search} albums={albums} />;
}
