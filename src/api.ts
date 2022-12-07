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
  size: string;
  created: Date;
}

export async function getUserFragments(user: any, expand?: boolean) {
  console.log(`API => Requesting fragments data... from ${apiUrl}`);
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
export async function getFragmentById(
  user: any,
  id: Fragment,
  ext: string = ""
) {
  try {
    console.log(`URL : ${apiUrl}/v1/fragments/${id}${ext}`);
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
      case "image/png":
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        return url;
      case "image/jpeg":
        const blob2 = await res.blob();
        const url2 = URL.createObjectURL(blob2);
        return url2;
      case "image/gif":
        const blob3 = await res.blob();
        const url3 = URL.createObjectURL(blob3);
        return url3;
      case "image/webp":
        const blob4 = await res.blob();
        const url4 = URL.createObjectURL(blob4);
        return url4;

      default:
        throw new Error(`Unknown content type: ${contentType}`);
    }
  } catch (err) {
    console.error("Unable to call GET /v1/fragments/:id", { err });
    return null;
  }
}
/*= GET BY ID =  */

export async function getFragmentInfo(user: any, id: Fragment) {
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
    console.log("Posted fragment data", { fragments: await res.json() });
    //return { fragments: await res.json() };
  } catch (err: Error | any) {
    console.error("Unable to call POST /v1/fragment", { err: err.message });
    throw new Error("Unable to call POST /v1/fragment");
  }
}

export async function deleteFragment(user: any, id: Fragment) {
  console.log("Deleting fragment data... ", { id });
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: user.authorizationHeaders().Authorization,
      },
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

    const data = res;
    console.log("Deleted fragment data", { fragments: data });
    return { fragments: data };
  } catch (err) {
    console.error("Unable to call DELETE /v1/fragment", { err });
  }
}

export async function updateFragment(
  user: any,
  id: Fragment,
  fragment: any,
  contentType: string
) {
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
        Authorization: user.authorizationHeaders().Authorization,
      },
      body: fragment,
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    console.log("Updated fragment data", { fragments: await res.json() });
  } catch (err: Error | any) {
    console.error("Unable to call PUT /v1/fragment", { err: err.message });
    throw new Error("Unable to call PUT /v1/fragment");
  }
}
