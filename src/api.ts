// fragments microservice API, defaults to localhost:8080
const apiUrl = process.env.API_URL || "http://localhost:8080";

/**
 * Given an authenticated user, request all fragments for this user from the
 * fragments microservice (currently only running locally). We expect a user
 * to have an `idToken` attached, so we can send that along with the request.
 */

/*
 = GET =  */
// interface for Fragment metadata
interface Fragment {
  id: string;
  contentType: string;
  createdAt: string;
}

export async function getUserFragments(user: any, expand?: boolean) {
  console.log("API => Requestion fragments data...");
  try {
    let url = `${apiUrl}/v1/fragments`;
    if (expand) url += "?expand=1";

    const res = await fetch(url, {
      headers: {
        Authorization: user.authorizationHeaders().Authorization,
      },
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

    const data = await res.json();
    console.log("Got user fragments data", { fragments: data });
    return { fragments: data };
  } catch (err) {
    console.error("Unable to call GET /v1/fragments", { err });
  }
}
/*
 = GET BY ID =  */
export async function getFragmentById(user: any, id: string, ext: string = "") {
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${id}${ext}`, {
      headers: user.authorizationHeaders(),
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const contentType = res.headers.get("Content-Type");
    const type = contentType?.split(";")[0];

    switch (type) {
      case "text/plain":
        return await res.text();
      case "text/html":
        return await res.text();
      case "text/markdown":
        return await res.text();
      case "application/json":
        return { fragment: await res.json() };

      default:
        throw new Error(`Unknown content type: ${contentType}`);
    }
  } catch (err) {
    console.error(`Unable to call GET /v1/fragments/${id}`, { err });
  }
}
/*= GET BY ID =  */

export async function getFragmentInfo(user: any, id: string) {
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${id}/info`, {
      headers: user.authorizationHeaders(),
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
  } catch (err) {
    console.error(`Unable to call GET /v1/fragments/${id}`, { err });
  }
}

/* 
  = POST = */
export async function postFragment(user: any, contentType: string, value: any) {
  try {
    const res = await fetch(`${apiUrl}/v1/fragments`, {
      method: "POST",
      headers: {
        "Content-Type": contentType,
        Authorization: user.authorizationHeaders().Authorization,
      },
      body: value,
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return { fragments: await res.json() };
  } catch (err: Error | any) {
    console.error("Unable to call POST /v1/fragment", { err: err.message });
    throw new Error("Unable to call POST /v1/fragment");
  }
}
