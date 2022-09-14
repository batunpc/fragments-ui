// src/auth.js

import { Amplify, Auth } from 'aws-amplify';
import config from './constants/aws-exports';

// Configuring aws-amplify with the aws-exports.ts file
Amplify.configure(config);

/**
 * Get the authenticated user
 * @returns Promise<user>
 */

async function getUser() {
	try {
		// Get the user's info, see:
		// https://docs.amplify.aws/lib/auth/advanced/q/platform/js/#identity-pool-federation
		const currentAuthenticatedUser = await Auth.currentAuthenticatedUser();
		// If that didn't throw, we have a user object, and the user is authenticated
		console.log('The user is authenticated');
		// Get the user's username
		const username = currentAuthenticatedUser.username;
		// Get the user's Identity Token, which we'll use later with our
		// microservice. See discussion of various tokens:
		// https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-with-identity-providers.html
		const idToken =
			currentAuthenticatedUser.signInUserSession.idToken.jwtToken;
		const accessToken =
			currentAuthenticatedUser.signInUserSession.accessToken.jwtToken;
		// Return a simplified "user" object
		return {
			username,
			idToken,
			accessToken,
			// Include a simple method to generate headers with our Authorization info
			authorizationHeaders: (type = 'application/json') => {
				const headers: { [key: string]: any } = {
					'Content-Type': type
				};
				headers['Authorization'] = `Bearer ${idToken}`;
				return headers;
			}
		};
	} catch (err) {
		console.log(err);
		// Unable to get user, return `null` instead
		return null;
	}
}

export { Auth, getUser };
