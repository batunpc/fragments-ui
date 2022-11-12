import { Auth, getUser } from "./auth";
import {
  getUserFragments,
  getFragmentById,
  getFragmentInfo,
  postFragment,
} from "./api";
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

  // when user selects a content type from the buttons above, print the selected option to the console

  // ================= content type buttons =================
  // hidden divs
  const selectedContent = document.querySelector(".selected-content");
  const selectedConvertTo = document.querySelector(".selected-convert-to");
  // spans that display data type
  const convertToSpan = document.getElementById("convert-to-span");
  const selectedTypeSpan = document.getElementById("selected-type-span");
  //Plural buttons
  const convertToBtns = document.querySelectorAll(".convert-to-btns");
  const contentTypeBtns = document.querySelectorAll(".content-type-btns");

  contentTypeBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      selectedTypeSpan!.innerHTML = `${
        (e.target as HTMLButtonElement).id as string // gets the id of the each button
      }`;
      console.log(`${selectedTypeSpan!.innerHTML} selected`);
      selectedContent?.removeAttribute("hidden");
    });
  });

  // ================= content type buttons =================

  // ================= convert to buttons =================
  convertToBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      convertToSpan!.innerHTML = `${
        (e.target as HTMLButtonElement).id as string // gets the id of the each button
      }`;
      selectedConvertTo?.removeAttribute("hidden");
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
    let contentType = document.getElementById("selected-type-span")?.innerHTML;
    const ext = "." + document.getElementById("convert-to-span")?.innerHTML;

    console.log(`posting fragment with content type: ${contentType}`);
    // Value of whatever typed into textarea as data
    const inputValue = (<HTMLInputElement>(
      document.getElementById("textFragment")
    )).value;

    // 1. POST - Create a fragment
    // ==========================
    // error handling before posting fragment
    if (inputValue === "") return alert(ErrorMessages.emptyFragmentError);
    if (contentType === "") return alert(ErrorMessages.emptyContentTypeError);
    if (ext === ".") return alert(ErrorMessages.emptyConvertToError);
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
    console.log(`Request to convert ${contentType} to ${ext}`);

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
    // get by id
    const fragmentById = await getFragmentById(user, newFragmentId, ext);
    // get fragment info
    const fragmentInfo = await getFragmentInfo(user, newFragmentId);
    console.log("fragmentInfo: ", fragmentInfo);
    console.log("fragmentInfo type =>", fragmentInfo?.fragment.type);
    const createdAt = fragmentInfo?.fragment.created;

    if (ext === ".txt") {
      contentType = "text/plain";
    } else if (ext === ".md") {
      contentType = "text/markdown";
    } else if (ext === ".html") {
      contentType = "text/html";
    } else if (ext === ".json") {
      contentType = "application/json";
    }
    console.log("Updated fragment type =>", contentType);

    // dspData and dspType are going out of the list item display all in one list item li element
    const fragmentList = document.querySelector(".fragmentList");
    const fragmentListItem = document.createElement("li");
    fragmentListItem.classList.add("fragment");

    const dspId = `Fragment ID: ${newFragmentId}`;
    fragmentListItem.appendChild(document.createTextNode(dspId));
    fragmentList?.appendChild(fragmentListItem);

    const dspData = `Fragment Data: ${JSON.stringify(fragmentById)}`;

    fragmentListItem.appendChild(document.createElement("br"));
    fragmentListItem.appendChild(document.createTextNode(dspData));

    const dspType = `\nFragment Type: ${contentType}`;
    fragmentListItem.appendChild(document.createElement("br"));
    fragmentListItem.appendChild(document.createTextNode(dspType));

    const dspCreatedAt = `\nCreated At: ${createdAt}`;
    fragmentListItem.appendChild(document.createElement("br"));
    fragmentListItem.appendChild(document.createTextNode(dspCreatedAt));
  }
}

// Wait for the DOM to be ready, then start the app
addEventListener("DOMContentLoaded", init);
