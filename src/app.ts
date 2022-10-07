import { Auth, getUser } from './auth';
import { getUserFragments, getFragmentById, postFragment } from './api';

async function init() {
	// Get our UI elements
	const userSection = document.querySelector('#user');
	const fragmentsSection = document.querySelector('#fragments');
	const loginBtn = document.querySelector('#login');
	const logoutBtn = document.querySelector('#logout');

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
	fragmentsSection?.attributes.removeNamedItem('hidden');
	loginBtn?.setAttribute('disabled', 'true');

	userSection
		?.querySelector('.username')
		?.appendChild(document.createTextNode(user.username));
	loginBtn?.classList.add('hidden');

	// Do an authenticated request to the fragments API server and log the result
	getUserFragments(user); // api call
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);
