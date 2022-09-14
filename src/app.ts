// src/app.js

import { Auth, getUser } from './auth';

async function init() {
	// Get our UI elements
	const userSection = document.querySelector('#user');
	const loginBtn = document.querySelector('#login');
	const logoutBtn = document.querySelector('#logout');

	// Wire up event handlers to deal with login and logout.
	loginBtn
		? loginBtn.addEventListener('click', () => Auth.federatedSignIn())
		: null;

	logoutBtn
		? logoutBtn.addEventListener('click', () => Auth.signOut())
		: null;

	// See if we're signed in (i.e., we'll have a `user` object)
	const user = await getUser();
	if (!user) {
		// Disable the Logout button
		logoutBtn?.setAttribute('disabled', 'true');
		return;
	}
	// Log the user info for debugging purposes
	console.log({ user });
	// Update the UI to welcome the user
	//userSection?.classList.remove('hidden');
	userSection?.attributes.removeNamedItem('hidden');
	loginBtn?.setAttribute('disabled', 'true');

	userSection
		?.querySelector('.username')
		?.appendChild(document.createTextNode(user.username));
	loginBtn?.classList.add('hidden');
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);
