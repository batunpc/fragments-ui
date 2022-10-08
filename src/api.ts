// fragments microservice API, defaults to localhost:8080
const apiUrl = process.env.API_URL || 'http://localhost:8080';

/**
 * Given an authenticated user, request all fragments for this user from the
 * fragments microservice (currently only running locally). We expect a user
 * to have an `idToken` attached, so we can send that along with the request.
 */

export async function getUserFragments(user: any) {
	console.log('Requesting user fragments data...');
	try {
		const res = await fetch(`${apiUrl}/v1/fragments`, {
			headers: {
				Authorization: user.authorizationHeaders().Authorization
			}
		});
		if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

		const data = await res.json();

		console.log('Got user fragments data', { fragments: data });
		return { fragments: data };
	} catch (err) {
		console.error('Unable to call GET /v1/fragments', { err });
	}
}

export async function getFragmentById(user: any, id: string) {
	console.log(`getFragmentById : ${id}`);
	try {
		const res = await fetch(`${apiUrl}/v1/fragments/${id}`, {
			headers: {
				Authorization: user.authorizationHeaders().Authorization
			}
		});
		if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
		const data = await res.json();
		console.log('Got user fragments data', { fragments: data });
		return { fragments: data };
	} catch (err: any) {
		console.error('Unable to call GET /v1/fragment/:id', { err });
	}
}
// user, contentType, data
export async function postFragment(user: any, contentType: string, value: any) {
	console.log('Creating fragment...');

	try {
		const res = await fetch(`${apiUrl}/v1/fragments`, {
			method: 'POST',
			headers: {
				'Content-Type': contentType,
				Authorization: user.authorizationHeaders().Authorization
			},
			body: value
		});
		if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
		const data = await res.json();
		return { fragments: data };
	} catch (err: Error | any) {
		console.error('Unable to call POST /v1/fragment', { err: err.message });
		throw new Error('Unable to call POST /v1/fragment');
	}
}
