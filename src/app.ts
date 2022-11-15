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
  const fragmentForm = document.querySelector("form");

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
  const fragment_result = await getUserFragments(user, true);
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

    if (isError(fragment_result)) {
      if (fragment_result.message === ErrorMessages.getUserFragmentsError)
        console.log(
          `Returned GET fragment error ${JSON.stringify(fragment_result)}`
        );
      else
        console.log(
          `Returned GET fragment error ${JSON.stringify(fragment_result)}`
        );
    }

    //3. GET - return a specific fragment by ID
    // =====
    //const totalLength = fragment_result?.fragments.length;
    //const newFragmentId = fragment_result?.fragments.data[totalLength - 1];

    // =====
    if (contentType) {
      const supportedExts = formats(contentType);
      console.log("Supported extensions are => ", supportedExts);
    }

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
  }

  fragment_result.data.forEach((fragment: any) => {
    const fragmentList = document.querySelector(".fragmentList");
    const fragmentListItem = document.createElement("li");
    fragmentListItem.classList.add("fragment");

    const dspId = `Fragment ID: ${fragment.id}`;
    fragmentListItem.appendChild(document.createTextNode(dspId));
    fragmentList?.appendChild(fragmentListItem);

    const dspType = `\nFragment Type: ${fragment.type}`;
    fragmentListItem.appendChild(document.createElement("br"));
    fragmentListItem.appendChild(document.createTextNode(dspType));

    const fragmentSize = `\nFragment Size: ${fragment.size}`;
    fragmentListItem.appendChild(document.createElement("br"));
    fragmentListItem.appendChild(document.createTextNode(fragmentSize));

    const formattedDate = new Date(fragment.created).toLocaleString(); // format date in a readable format for createdAt
    const dspCreatedAt = `\nCreated At: ${formattedDate}`;
    fragmentListItem.appendChild(document.createElement("br"));
    fragmentListItem.appendChild(document.createTextNode(dspCreatedAt));

    fragmentListItem.style.color = "white";
    fragmentListItem.style.backgroundColor = "black";

    // add a button to each list item
    // const fragmentBtn = document.createElement("button");
    // fragmentBtn.classList.add("fragmentBtn");
    // fragmentBtn.innerHTML = "Convert";
    // fragmentListItem.appendChild(fragmentBtn);
    // const dspData = `Fragment Data: ${fragment.data}`;
    // fragmentListItem.appendChild(document.createElement("br"));
    // fragmentListItem.appendChild(document.createTextNode(dspData));
  });
}

// Wait for the DOM to be ready, then start the app
addEventListener("DOMContentLoaded", init);
