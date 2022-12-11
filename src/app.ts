// src/app.js

import authHandler from "../utils/index";
import { create, registerPlugin } from "filepond";
import "filepond/dist/filepond.css";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImageCrop from "filepond-plugin-image-crop";
import FilePondPluginImageResize from "filepond-plugin-image-resize";
import FilePondPluginImageTransform from "filepond-plugin-image-transform";
import FilePondPluginImageEdit from "filepond-plugin-image-edit";

import * as FilePond from "filepond";

import {
  getFragmentById,
  getUserFragments,
  postFragment,
  deleteFragment,
  updateFragment,
} from "./api";

async function init() {
  // spinner for loading indicator
  const spinner = document.querySelector(".spin") as HTMLDivElement;

  const user = await authHandler(); // User info

  if (user) createFragmentCard();

  // Form where fragment is created
  const createFragmentForm = document.getElementById("create-fragment-form");

  // Dropdown menu to select fragment type
  const fragmentTypeDropdown = document.getElementById(
    "fragment-type-dropdown"
  ) as HTMLSelectElement;

  // Textarea where fragment data is written
  const fragmentInput = document.getElementById(
    "fragmentData"
  ) as HTMLInputElement;

  // Button to create fragment manually
  const postFragmentManualButton = document.getElementById(
    "post-fragment-manual-btn"
  ) as HTMLButtonElement;

  const createFragmentWithFileForm = document.getElementById(
    "create-fragment-with-file-form"
  ) as HTMLFormElement;

  // == POST == // manually post fragment
  createFragmentForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fragmentType = fragmentTypeDropdown.value;
    const fragmentData = fragmentInput.value.trim();

    await postFragment(user, fragmentType, fragmentData);

    createFragmentCard();
    fragmentInput.value = "";

    console.log(`Posted fragment of type ${fragmentType}`);
  });

  /* ======== DROPBOX POST (using FilePond) ========  */
  const input = document.querySelector(
    'input[type="file"]'
  ) as HTMLInputElement;

  registerPlugin(
    FilePondPluginFileValidateType,
    FilePondPluginImageExifOrientation,
    FilePondPluginImagePreview,
    FilePondPluginImageCrop,
    FilePondPluginImageResize,
    FilePondPluginImageTransform,
    FilePondPluginImageEdit
  );

  const pond = create(input, {
    acceptedFileTypes: ["text/*", "application/json", "image/*"],
  });

  let isDraggedFile: any = "";
  // listen for addfile event
  pond.on("addfile", (error, file) => {
    if (error) {
      console.log(`Error posting the file: ${error}`);
      return;
    }

    // set the content type of the file to the fragment type dropdown menu
    fragmentTypeDropdown.value = file.fileType;
    // disable input and dropdown menu
    fragmentInput.disabled = true;
    fragmentTypeDropdown.disabled = true;
    postFragmentManualButton.disabled = true;

    console.log(`From dropdown => ${fragmentTypeDropdown.value}`, file);
    isDraggedFile = file;
  });

  createFragmentWithFileForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    spinner.removeAttribute("hidden");
    // if file is not uploaded yet focus on the filepond
    if (!isDraggedFile) {
      // click on the filepond
      input.click();
      return;
    }
    // read the file and check if it is a image or text
    const fileReader = new FileReader();

    if (isDraggedFile.fileType.includes("image")) {
      fileReader.readAsArrayBuffer(isDraggedFile.file);
    } else {
      fileReader.readAsText(isDraggedFile.file);
    }

    fileReader.onload = async () => {
      const fragmentType = isDraggedFile.fileType;
      // if the file is an image, the data is a base64 string
      const fragmentData = fileReader.result;

      console.log(`Fragment type: ${fragmentType}`);
      console.log(`Fragment data: ${fileReader.result}`);
      // log the size of the file
      console.log(`Uploaded fragment size is: ${isDraggedFile.file.size}`);
      await postFragment(user, fragmentType, fragmentData);

      createFragmentCard();
      //window.location.reload(); // this is to prevent user from posting the same file again
      spinner.setAttribute("hidden", "true");

      console.log(`Posted fragment of type ${fragmentType}`);
    };
    fileReader.onerror = (error) => {
      console.log(`Error reading the file: ${error}`);
    };

    // reset the filepond
    pond.removeFiles();
    // enable input and dropdown menu
    fragmentInput.disabled = false;
    fragmentTypeDropdown.disabled = false;
    postFragmentManualButton.disabled = false;

    console.log("File to be posted", isDraggedFile);
  });

  async function createFragmentCard() {
    const listOfFragments = getUserFragments(user, true);
    listOfFragments.then((data) => {
      const metadataCard = document.querySelector(
        "#metadataCard"
      ) as HTMLElement;
      metadataCard.innerHTML = "";
      console.log("current metadata: ", data?.fragments.fragments);
      data?.fragments.fragments.forEach((fragment: any) => {
        // do get by id
        const fragmentDiv = document.createElement("div");
        fragmentDiv.setAttribute(
          "style",
          `color: #233142;
           background-color: #DBE2EF;
           margin: 10px; 
           padding: 10px; 
           width: 95%; 
           overflow: scroll; 
           display: inline-block; 
           vertical-align: top; 
           text-align: left; 
           border-radius: 20px; 
           border: 5px solid #103664; 
           font-size: 17px;
            transition: all 0.3s ease-in-out;
            position: relative;
           `
        );

        const formattedDateCreated = new Date(fragment.created).toLocaleString(
          "en-US",
          {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
          }
        );
        const formattedDateUpdated = new Date(fragment.updated).toLocaleString(
          "en-US",
          {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
          }
        );

        // check if image
        if (fragment.type.includes("image")) {
          // convert the size which is in bytes to megabytes
          const fragmentSize = (fragment.size / 1000000).toFixed(2);
          fragmentDiv.innerHTML = `<span> Fragment ID:</span> <i> ${fragment.id} </i> <br>
          <span> Content-Type:</span> <i>${fragment.type}</i> <br>
          <span> Fragment Size:</span> ${fragmentSize} MB  <br>
          <span> Created:</span> ${formattedDateCreated} <br> 
          <span> Updated:</span> ${formattedDateUpdated} <br>`;

          async function getImageData() {
            const fragmentData = (await getFragmentById(
              user,
              fragment.id
            )) as any;
            return fragmentData;
          }
          const image = document.createElement("img");
          const imageData = getImageData();
          imageData.then((data) => {
            console.log("UUUUUUUU UU U U UU: ", data);
            image.setAttribute("src", data);
            image.setAttribute(
              "style",
              `width: 125px; height: 115px; position: absolute; top: 10px; right: 15px; border-radius: 20px; 
              border: 5px solid #222222; overflow: hidden;
              box-shadow: 0 0 4px #222222, 0 0 40px #222222, 0 0 60px #222222;
              cursor: pointer;
              `
            );
            // if image clicked, click on the getDataBtn
            image.addEventListener("click", () => {
              getDataBtn.click();
            });
            fragmentDiv.appendChild(image);
          });
        } else {
          fragmentDiv.innerHTML = `<span> Fragment ID:</span> <i> ${fragment.id} </i> <br>
          <span> Content-Type:</span> <i>${fragment.type}</i> <br>
          <span> Fragment Size:</span> ${fragment.size}  <br>
          <span> Created:</span> ${formattedDateCreated} <br> 
          <span> Updated:</span> ${formattedDateUpdated} <br>`;

          // create a div element and just show a file icon for non-image files using font awesome
          //  create div
          const fileIconDiv = document.createElement("div");
          fileIconDiv.setAttribute(
            "style",
            ` position: absolute; top: 10px; right: 15px; border-radius: 10px;
            border: 1px solid #222222; overflow: hidden;

            cursor: pointer;

            `
          );
          // create icon
          const fileIcon = document.createElement("i");
          fileIcon.setAttribute("class", "fas fa-file fa-5x");
          fileIcon.setAttribute(
            "style",
            `color: #222222; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);`
          );
          fileIconDiv.appendChild(fileIcon);
          // if file icon clicked, click on the getDataBtn
          fileIconDiv.addEventListener("click", () => {
            getDataBtn.click();
          });
          fragmentDiv.appendChild(fileIconDiv);
        }

        // == Delete button == //
        const deleteBtn = document.createElement("button");
        deleteBtn.setAttribute("class", "btn btn-danger btn-sm");
        deleteBtn.setAttribute("style", "float: right;");
        deleteBtn.innerHTML = "Delete Fragment";
        deleteBtn.addEventListener("click", async () => {
          await deleteFragment(user, fragment.id);
          createFragmentCard();
        });
        fragmentDiv.appendChild(deleteBtn);

        const getDataBtn = document.createElement("button");

        // == Update button == //
        const updateBtn = document.createElement("button");
        updateBtn.setAttribute("class", "btn btn-primary btn-sm");
        updateBtn.setAttribute("style", "float: right; margin-right: 10px;");
        updateBtn.innerHTML = "Update Fragment";
        const fragmentUpdateDiv = document.createElement("div");
        fragmentUpdateDiv.setAttribute(
          "style",
          ` margin: 50px 10px 10px 10px;
            padding: 10px;
            width: 95%;
            overflow: scroll;
            display: inline-block;
            vertical-align: top;
            text-align: left;
            border-radius: 20px;
            border: 5px solid #103664;
            font-size: 17px;
            display: none;
            `
        );

        updateBtn.addEventListener("click", async () => {
          // disable the view button
          getDataBtn.disabled = true;
          const fragmentData = (await getFragmentById(
            user,
            fragment.id
          )) as any;

          // if it is not an image, then it is a text so provide a text area
          // FOR NON-IMAGE FRAGMENTS UPDATES ONLY
          if (!fragment.type.includes("image")) {
            const textArea = document.createElement("textarea");
            textArea.setAttribute("id", "fragmentInput");
            textArea.setAttribute("rows", "5");
            textArea.setAttribute("cols", "50");
            textArea.setAttribute(
              "style",
              `width: 100%;
            resize: none;
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 12px 20px;
            box-sizing: border-box;
            display: inline-block;
            line-height: 20px;
            `
            );
            textArea.innerHTML = fragmentData;

            fragmentUpdateDiv.innerHTML = "";
            fragmentUpdateDiv.appendChild(textArea);

            // create a save button
            const saveBtn = document.createElement("button");
            saveBtn.setAttribute("class", "btn btn-success btn-sm");
            saveBtn.setAttribute(
              "style",
              "width: 70%; margin: 0 auto; text-align: center; display: block; justify-content: center;"
            );
            saveBtn.innerHTML = "Save updated fragment";
            saveBtn.addEventListener("click", async () => {
              const updatedFragmentData = document.querySelector(
                "#fragmentInput"
              ) as HTMLTextAreaElement;
              await updateFragment(
                user,
                fragment.id,
                updatedFragmentData.value,
                fragment.type
              );
              createFragmentCard();
            });

            fragmentUpdateDiv.appendChild(saveBtn);
          }
          if (fragment.type.includes("image")) {
            // FOR IMAGE FRAGMENTS UPDATES ONLY
            const image = document.createElement("img");
            image.setAttribute("src", fragmentData);
            image.setAttribute("width", "100%");
            image.setAttribute("height", "auto");
            image.setAttribute("style", "margin: 0 auto; display: block;");

            fragmentUpdateDiv.innerHTML = "";
            fragmentUpdateDiv.appendChild(image);

            const label = document.createElement("label");
            label.setAttribute("for", "fragmentInput");
            label.innerHTML =
              "Select a new image to upload (Upload jpg, png, gif, or webp)";
            label.setAttribute(
              "style",
              `width: 100%; margin: 0 auto; display: block;
              font-size: 17px;
              margin: 10px; 0px 2px 0px;`
            );
            // another label as note for the user right below the other label
            const noteLabel = document.createElement("label");
            noteLabel.setAttribute("for", "fragmentInput");
            noteLabel.innerHTML =
              "Note: The content type must be as the same as the original one";
            noteLabel.setAttribute(
              "style",
              `width: 100%; margin: 0 auto; display: block;
              padding: 2px;
              background-color: #3C4048;
              color: #00ABB3;
              border-radius: 5px;
              text-align: center;
              margin-bottom: 10px;
              `
            );
            fragmentUpdateDiv.appendChild(label);
            fragmentUpdateDiv.appendChild(noteLabel);

            const imageInput = document.createElement("input");
            imageInput.setAttribute("type", "file");
            imageInput.setAttribute("id", "fragmentInput");
            imageInput.setAttribute("accept", "image/*");
            imageInput.setAttribute(
              "style",
              "width: 100%; margin: 0 auto; display: block;"
            );

            fragmentUpdateDiv.appendChild(imageInput);

            const pond = FilePond.create(imageInput, {
              allowMultiple: false,
              acceptedFileTypes: ["image/*"],
            });
            let isDraggedFile: any = "";
            pond.on("addfile", (error, file) => {
              if (error) {
                console.log(`Error posting the file: ${error}`);
                return;
              }
              console.table(
                `File added with content type ${file.fileType}, and size ${file.fileSize}`
              );

              isDraggedFile = file;
            });

            // create a save button
            const saveBtn = document.createElement("button");
            saveBtn.setAttribute("class", "btn btn-success btn-sm");
            saveBtn.setAttribute(
              "style",
              "width: 70%; margin: 0 auto; text-align: center; display: block; justify-content: center;"
            );
            saveBtn.innerHTML = "Save updated fragment";

            saveBtn.addEventListener("click", async (e) => {
              e.preventDefault();
              if (!isDraggedFile) {
                // click on the filepond
                input.click();
                return;
              }
              const fileReader = new FileReader();
              fileReader.readAsArrayBuffer(isDraggedFile.file);

              fileReader.onload = async () => {
                const fragmentType = isDraggedFile.fileType;
                // if the file is an image, the data is a base64 string
                const fragmentData = fileReader.result;

                console.log(`Fragment type: ${fragmentType}`);
                console.log(`Fragment data: ${fileReader.result}`);

                await updateFragment(
                  user,
                  fragment.id,
                  fragmentData,
                  fragmentType
                );
                window.location.reload();

                // and click on the view fragment button
                getDataBtn.click();
                console.log(`Posted fragment of type ${fragmentType}`);
              };
              fileReader.onerror = (error) => {
                console.log(`Error reading the file: ${error}`);
              };
            });

            fragmentUpdateDiv.appendChild(saveBtn);
          }

          fragmentDiv.appendChild(fragmentUpdateDiv);

          if (fragmentUpdateDiv.style.display === "none") {
            fragmentUpdateDiv.style.display = "block";
          } else {
            fragmentUpdateDiv.style.display = "none";
            getDataBtn.disabled = false;
          }
        });

        // == View Fragment button == //
        getDataBtn.setAttribute("class", "btn btn-dark btn-sm");
        getDataBtn.setAttribute("style", "float: right; margin-right: 10px;");
        getDataBtn.innerHTML = "View Fragment ";
        const fragmentDataDiv = document.createElement("div");
        fragmentDataDiv.setAttribute(
          "style",
          `color: #233142;
            background-color: #DBE2EF;
            margin: 50px 20px;
            padding: 10px;
            width: 90%;
            overflow: scroll;
            display: inline-block;
            vertical-align: top;
            text-align: left;
            border-radius: 20px;
            border: 3px solid #103664;
            font-size: 17px;
            display: none;`
        );

        getDataBtn.addEventListener("click", async () => {
          const fragmentData = (await getFragmentById(
            user,
            fragment.id
          )) as any;
          // check if the fragment data is an image
          if (fragment?.type.includes("image")) {
            fragmentDataDiv.innerHTML = `<img src="${fragmentData}"
            alt="fragment image"
            style="width: 100%; height: 80%; border-radius: 20px;
            border: 3px solid #103664;">`;
          } else if (fragment?.type.includes("json")) {
            console.log(fragmentData.fragment);
            fragmentDataDiv.innerHTML = ` ${JSON.stringify(
              fragmentData.fragment,
              null,
              2
            )}`;
          } else {
            //console.log("Fragment Data", fragmentData);
            fragmentDataDiv.innerHTML = `<span> Fragment Data:</span> ${fragmentData}<br>`;
          }
          // add label for fragmentTypeDropdown
          const fragmentTypeLabel = document.createElement("label");
          fragmentTypeLabel.setAttribute("for", "fragment-type-dropdown");
          fragmentTypeLabel.innerHTML = "Select type to convert: ";
          // add dropdown menu to select fragment type
          const fragmentTypeDropdown = document.createElement("select");
          fragmentTypeDropdown.setAttribute("id", "fragment-type-dropdown");
          fragmentTypeDropdown.setAttribute(
            "style",
            "margin: 5px 10px; padding: 10px; width: 90%;"
          );
          fragmentTypeDropdown.innerHTML = `<option value=".txt">text/plain</option>
                                            <option value=".html">text/html</option>
                                            <option value=".md">text/markdown</option>
                                            <option value=".js">application/json</option>`;

          if (!fragment?.type.includes("image")) {
            fragmentDataDiv.appendChild(fragmentTypeDropdown);
            fragmentDataDiv.appendChild(fragmentTypeLabel);
          }
          const fragmentTypeDropdownForImage = document.createElement("select");
          if (fragment?.type.includes("image")) {
            const fragmentTypeLabelForImage = document.createElement("label");
            fragmentTypeLabelForImage.setAttribute(
              "for",
              "fragment-type-dropdown"
            );
            fragmentTypeLabelForImage.innerHTML =
              "Select Image type to convert : ";
            fragmentDataDiv.appendChild(fragmentTypeLabelForImage);

            fragmentTypeDropdownForImage.setAttribute(
              "id",
              "fragment-type-dropdown"
            );
            fragmentTypeDropdownForImage.setAttribute(
              "style",
              "margin: 5px 10px; padding: 10px; width: 90%;"
            );
            fragmentTypeDropdownForImage.innerHTML = `<option value=".png">image/png</option>
                                                      <option value=".jpg">image/jpeg</option>
                                                      <option value=".gif">image/gif</option>
                                                      <option value=".webp">image/webp</option>`;
            fragmentDataDiv.appendChild(fragmentTypeDropdownForImage);
          }

          // ADD CONVERT BUTTON
          const convertBtn = document.createElement("button");
          convertBtn.setAttribute("class", "btn btn-info btn-sm");
          convertBtn.setAttribute("style", "float: right; margin-right: 10px;");
          convertBtn.innerHTML = "Convert Fragment";
          convertBtn.addEventListener("click", () => {
            if (fragment?.type.includes("image")) {
              const fragmentType = fragmentTypeDropdownForImage.value;
              console.log("Fragment image Type ", fragmentType);
              getFragmentById(user, fragment.id, fragmentType).then((data) => {
                console.log("Converted Fragment", data);
                //fragmentDataDiv.innerHTML = `Converted to ${fragmentType}: ${data}`;
                fragmentDataDiv.innerHTML = `<img src="${data}"
                alt="fragment image"
                style="width: 100%; height: 80%; border-radius: 20px;
                border: 3px solid #103664;">`;
              });
            } else {
              const fragmentType = fragmentTypeDropdown.value;
              console.log("Fragment Type", fragmentType);

              getFragmentById(user, fragment.id, fragmentType).then((data) => {
                console.log("Converted Fragment", data);
                fragmentDataDiv.innerHTML = `Converted to ${fragmentType}: ${data}`;
                fragmentDataDiv.innerHTML = fragmentDataDiv.innerHTML.replace(
                  /</g,
                  "&lt;"
                );
                fragmentDataDiv.innerHTML = fragmentDataDiv.innerHTML.replace(
                  />/g,
                  "&gt;"
                );
                if (!data) {
                  fragmentDataDiv.innerHTML = "415: Unsupported Media Type";
                }
              });
            }
          });
          fragmentDataDiv.appendChild(convertBtn);

          fragmentDiv.appendChild(fragmentDataDiv);
          // toggle button to hide and show fragment data
          if (fragmentDataDiv.style.display === "none") {
            fragmentDataDiv.style.display = "block";
            getDataBtn.innerHTML = "Hide Fragment";
            // disable update button
            updateBtn.disabled = true;
          } else {
            fragmentDataDiv.style.display = "none";
            getDataBtn.innerHTML = "View Fragment ";
            // enable update button
            updateBtn.disabled = false;
          }
        });

        fragmentDiv.appendChild(getDataBtn);
        fragmentDiv.appendChild(updateBtn);

        metadataCard.appendChild(fragmentDiv);

        fragmentDiv.querySelectorAll("span").forEach((span) => {
          span.setAttribute(
            "style",
            ` color: #3F72AF; font-weight: 700; font-family: 'Courier New', Courier, monospace;`
          );
        });

        fragmentDiv.querySelectorAll("i").forEach((i) => {
          i.setAttribute(
            "style",
            // fragment id and content-type
            "background-color: #3C4048; color: #00ABB3; padding: 2px 5px; border-radius: 5px; font-weight: 500;"
          );
        });

        metadataCard?.appendChild(fragmentDiv);
      });
    });
  }
}

// Wait for the DOM to be ready, then start the app
addEventListener("DOMContentLoaded", init);
