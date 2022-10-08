import { Auth, getUser } from './auth';
import { getUserFragments, getFragmentById, postFragment } from './api';
import { ErrorMessages, isError } from './error';

async function init() {
	// Get our UI elements
	const userSection = document.querySelector('#user');
	const loginBtn = document.querySelector('#login');
	const logoutBtn = document.querySelector('#logout');
	const fragmentForm = document.querySelector('form');

	// See if we're signed in (i.e., we'll have a `user` object)
	const user = await getUser();
	// Wire up event handlers to deal with login and logout.
	loginBtn
		? loginBtn.addEventListener('click', () => Auth.federatedSignIn())
		: null;

	logoutBtn
		? logoutBtn.addEventListener('click', () => Auth.signOut())
		: null;

	if (!user) {
		// Disable the Logout button
		logoutBtn?.setAttribute('disabled', 'true');
		return;
	}
	// Log the user info for debugging purposes
	console.log({ user });
	// Update the UI to welcome the user
	userSection?.attributes.removeNamedItem('hidden');
	loginBtn?.setAttribute('disabled', 'true');

	userSection
		?.querySelector('.username')
		?.appendChild(document.createTextNode(user.username));
	loginBtn?.classList.add('hidden');

	// Do an authenticated request to the fragments API server and log the result
	getUserFragments(user); // api call

	// ========================================================
	// FRAGMENT FORM
	fragmentForm?.addEventListener('submit', fragmentEndpoints);
	async function fragmentEndpoints(e: Event) {
		e.preventDefault();

		// value of whatever typed into textarea
		const inputValue = (<HTMLInputElement>(
			document.getElementById('textFragment')
		)).value;

		// == POST - Create a fragment ==
		const newFragment = await postFragment(user, 'text/plain', inputValue);
		if (isError(newFragment)) {
			if (newFragment.message === ErrorMessages.postFragmentError) {
				console.log(
					`Returned POST fragment error ${JSON.stringify(
						newFragment
					)}`
				);
			} else {
				console.log(
					`Returned POST fragment error ${JSON.stringify(
						newFragment
					)}`
				);
			}
		} else {
			console.log(
				`Returned POST fragment ${JSON.stringify(newFragment)}`
			);
		}
		// == GET - return all fragments ==
		const fragment = await getUserFragments(user);
		if (isError(fragment)) {
			if (fragment.message === ErrorMessages.getUserFragmentsError) {
				console.log(
					`Returned GET fragment error ${JSON.stringify(fragment)}`
				);
			} else {
				console.log(
					`Returned GET fragment error ${JSON.stringify(fragment)}`
				);
			}
		} else {
			console.log(`Returned GET fragment ${fragment}`);
		}

		// Total number of fragments
		const totalLength = fragment?.fragments.data.length;
		// The newly created fragment Id
		const newFragmentId = fragment?.fragments.data[totalLength - 1];

		// List of fragment Ids
		const fragmentList = document.querySelector('#fragmentList');
		const fragmentListItem = document.createElement('li');
		fragmentListItem.classList.add('fragment');
		const dspId = `Fragment ID: ${newFragmentId}`;

		//fragmentListItem.appendChild(document.createTextNode(newFragmentId));
		fragmentListItem.appendChild(document.createTextNode(dspId));

		fragmentList?.appendChild(fragmentListItem);

		// == GET - return a specific fragment by ID==
		const fragmentById = await getFragmentById(user, newFragmentId);
		const data = fragmentById?.fragments.data;
		const dspData = `Fragment Data: ${data}`;
		// append data to fragmentList
		fragmentList?.appendChild(document.createTextNode(dspData));
		console.log(`Returned GET fragment by id ${data}`);
	}
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);
