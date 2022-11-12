import { Auth, getUser } from "./auth";
import { getUserFragments, getFragmentById, postFragment } from "./api";
import { ErrorMessages, isError } from "./error";

async function init() {
  // Get our UI elements
  const userSection = document.querySelector("#user");
  // buttons
  const loginBtn = document.querySelector("#login");
  const logoutBtn = document.querySelector("#logout");
  const postBtn = document.querySelector("#post");
  const fragmentForm = document.querySelector("form");
  const fragmentFormSection = document.querySelector("#fragments-form-section");
  const content = document.querySelector(".content");

  // See if we're signed in (i.e., we'll have a `user` object)
  const user = await getUser();

  // Wire up event handlers to deal with login and logout.
  loginBtn
    ? loginBtn.addEventListener("click", () => Auth.federatedSignIn())
    : null;

  logoutBtn ? logoutBtn.addEventListener("click", () => Auth.signOut()) : null;

  if (!user) {
    logoutBtn?.setAttribute("disabled", "true");
    return;
  }

  // Log the user info for debugging purposes
  console.log({ user });
  // Update the UI to welcome the user
  userSection?.attributes.removeNamedItem("hidden");
  loginBtn?.setAttribute("disabled", "true");

  userSection
    ?.querySelector(".username")
    ?.appendChild(document.createTextNode(user?.username));
  loginBtn?.classList.add("hidden");

  // Do an authenticated request to the fragments API server and log the result
  getUserFragments(user); // api call

  // Dropdown of content types to choose from for fragment
  // fragmentContentType is a select element with options for content types
  // when user selects a content type, print the selected option to the console
  /* 
    			<button type="button" id="text">text/plain</button>
					<button type="button" id="html">text/html</button>
					<button type="button" id="markdown">text/markdown</button>
					<button type="button" id="json">application/json</button>
  */
  // when user selects a content type from the buttons above, print the selected option to the console

  // ================= content type buttons =================
  const selectedType = document.getElementById("selected-type");
  const convertTo = document.getElementById("convert-to");
  const contentTypeBtns = document.querySelectorAll(".content-type-btns");
  const convertToBtns = document.querySelectorAll(".convert-to-btns");
  contentTypeBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      selectedType!.innerHTML = `${
        (e.target as HTMLButtonElement).id as string // gets the id of the each button
      }`;
      console.log(`${selectedType!.innerHTML} selected`);
      content?.removeAttribute("hidden");
    });
  });
  // ================= content type buttons =================

  // ================= convert to buttons =================
  convertToBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      convertTo!.innerHTML = `${
        (e.target as HTMLButtonElement).id as string // gets the id of the each button
      }`;
      console.log(`${convertTo!.innerHTML} selected`);
    });
  });
  // ================= formats =================
  const formats = (mimeType: string) => {
    if (mimeType === "text/plain") return [".txt"];
    if (mimeType === "text/markdown") return [".md", ".html", ".txt"];
    if (mimeType === "text/html") return [".html", ".txt"];
    if (mimeType === "application/json") return [".json", ".txt"];

    return [];
  };

  // ========================================================
  // FRAGMENT FORM
  fragmentForm?.addEventListener("submit", fragmentEndpoints);
  async function fragmentEndpoints(e: Event) {
    e.preventDefault();
    const contentType = document.getElementById("selected-type")?.innerHTML;
    const convertTo = "." + document.getElementById("convert-to")?.innerHTML;

    console.log(`posting fragment with content type: ${contentType}`);
    // Value of whatever typed into textarea as data
    const inputValue = (<HTMLInputElement>(
      document.getElementById("textFragment")
    )).value;

    // 1. POST - Create a fragment
    // ==========================

    if (inputValue === "") return alert(ErrorMessages.emptyFragmentError);
    if (contentType === "") return alert(ErrorMessages.emptyContentTypeError);
    else {
      if (contentType) {
        // successfull post
        const postedFragment = await postFragment(
          user,
          contentType,
          inputValue
        );
        console.log("postedFragment: ", postedFragment);
        // error handling
        if (isError(postedFragment)) {
          if (postedFragment.message === ErrorMessages.postFragmentError)
            console.log(
              `Returned POST postedFragment error ${JSON.stringify(
                postedFragment
              )}`
            );
        }
      }
    }
    console.log(`Request to convert ${contentType} to ${convertTo}`);

    const fragment = await getUserFragments(user);
    if (isError(fragment)) {
      if (fragment.message === ErrorMessages.getUserFragmentsError)
        console.log(`Returned GET fragment error ${JSON.stringify(fragment)}`);
      else
        console.log(`Returned GET fragment error ${JSON.stringify(fragment)}`);
    }

    //3. GET - return a specific fragment by ID
    // =====
    const totalLength = fragment?.fragments.data.length;
    const newFragmentId = fragment?.fragments.data[totalLength - 1];

    // =====
    if (contentType) {
      const supportedExts = formats(contentType);
      console.log("Supported extensions are => ", supportedExts);
    }

    const fragmentById = await getFragmentById(user, newFragmentId, convertTo);

    // List of fragment Ids
    // ====================
    const fragmentList = document.querySelector("#fragmentList");
    const fragmentListItem = document.createElement("li");
    fragmentListItem.classList.add("fragment");
    const dspId = `Fragment ID: ${newFragmentId}`;
    //fragmentListItem.appendChild(document.createTextNode(newFragmentId));
    fragmentListItem.appendChild(document.createTextNode(dspId));
    fragmentList?.appendChild(fragmentListItem);
    // append data to fragmentList
    const dspData = `Fragment Data: ${JSON.stringify(fragmentById)}`;
    fragmentList?.appendChild(document.createTextNode(dspData));
  }
}

// Wait for the DOM to be ready, then start the app
addEventListener("DOMContentLoaded", init);
