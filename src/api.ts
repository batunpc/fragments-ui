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
		if (!res.ok) {
			throw new Error(`${res.status} ${res.statusText}`);
		}
		const data = await res.json();
		console.log('Got user fragments data', { data });
		return { data };
	} catch (err) {
		console.error('Unable to call GET /v1/fragments', { err });
	}
}

export async function getFragmentById(id: string, expand = false) {
	console.log(`getFragmentById : ${id}`);

	try {
		const res = await fetch(
			`${apiUrl}/v1/fragments/${id}?expand=${expand}`
		);
		if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
		const data = await res.json();
		console.log('Got fragment data', { data });

		const contentType = res.headers.get('content-type');
		if (contentType && contentType.indexOf('application/json') !== -1) {
			try {
				return { contentType, data: await res.text() };
			} catch (err) {
				console.error('Error returning text ', { err });
			}
		}
	} catch (err: any) {
		console.error('Unable to call GET /v1/fragment/:id', {
			err: err.message
		});
	}
}

export async function postFragment(user: any, value: any, contentType: string) {
	console.log('Posting fragment data...');
	try {
		const res = await fetch(`${apiUrl}/v1/fragments`, {
			method: 'POST',
			headers: {
				'Content-Type': contentType,
				...user.authorizationHeaders()
			},
			body: JSON.stringify({ value })
		});
		if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
		const data = await res.json();
		console.log('Posted fragment data', { data });
		return data;
	} catch (err: Error | any) {
		console.error('Unable to call POST /v1/fragment', { err: err.message });
		throw new Error('Unable to call POST /v1/fragment');
	}
}
