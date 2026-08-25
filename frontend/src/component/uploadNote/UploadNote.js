import React, { useRef, useState } from "react";
import "./UploadNote.css";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  CloudUpload,
  Close,
  PictureAsPdf,
  AddCircle,
  Image,
} from "@material-ui/icons";
import { publicRequest } from "../../requestMethods";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
  uploadIcon: {
    color: "#167eec",
    fontSize: "3rem",
  },
  UploadPdfIcon: {
    color: "#167eec",
    fontSize: "3rem",
  },
  closeIcon: {
    fontSize: "3rem",
  },
  uploadAdd: {
    color: "#167eec",
    fontSize: "3rem",
  },
  upload: {
    color: "#167eec",
    fontSize: "2rem",
  },
}));

// Your Cloudinary settings
const CLOUD_NAME = "ejyohysu";
const UPLOAD_PRESET = "noteverse_upload";

const UploadNote = () => {
  const { currentUser: user } = useSelector((state) => state.user);

  const notename = useRef();
  const descritpion = useRef();

  const [isupload, setsetisupload] = useState(false);
  const [noteFile, setNoteFile] = useState(null);
  const [fileimg, setfileimg] = useState(null);
  const [uploading, setUploading] = useState(false);

  const uploadNoteFormSubmitHandler = async (e) => {
    e.preventDefault();

    if (!noteFile) {
      alert("Please select a PDF or document.");
      return;
    }

    if (!user || !user._id) {
      alert("Please login first.");
      return;
    }

    setUploading(true);

    try {
      // Upload PDF / document to your Cloudinary account
      const noteData = new FormData();

      noteData.append("file", noteFile);
      noteData.append("upload_preset", UPLOAD_PRESET);

      const noteResponse = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`,
        noteData
      );

      const noteUrl = noteResponse.data.secure_url;

      // Upload thumbnail to your Cloudinary account
      let thumbnailUrl = "";

      if (fileimg) {
        const imageData = new FormData();

        imageData.append("file", fileimg);
        imageData.append("upload_preset", UPLOAD_PRESET);

        const imageResponse = await axios.post(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          imageData
        );

        thumbnailUrl = imageResponse.data.secure_url;
      }

      // Save the Cloudinary URLs in MongoDB
      const newNote = {
        userId: user._id,
        desc: descritpion.current.value,
        notename: notename.current.value,
        notefilename: noteUrl,
        thumbnailfilename: thumbnailUrl,
      };

      await publicRequest.post("/notes", newNote);

      alert("Note uploaded successfully!");

      window.location.reload();
    } catch (err) {
      console.error("Upload error:", err);

      if (err.response) {
        console.error("Server response:", err.response.data);
      }

      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const classes = useStyles();

  return (
    <>
      {!isupload && (
        <div
          className="uploadNote-post"
          onClick={() => {
            setsetisupload((curr) => !curr);
          }}
        >
          <PictureAsPdf className={classes.UploadPdfIcon} />

          <p className="uploadNote-post-text">
            Upload a Note
          </p>

          <CloudUpload className={classes.uploadIcon} />
        </div>
      )}

      {isupload && (
        <div className="uploadNote-form-container">

          <div className="upload-note-top">

            <div className="upload-note-top-left">
              <AddCircle className={classes.uploadAdd} />

              <p className="upload-note-title">
                Upload a Note
              </p>
            </div>

            <Close
              onClick={() => {
                setsetisupload((curr) => !curr);
              }}
              className={classes.closeIcon}
              id="close-icon"
            />

          </div>

          <form
            onSubmit={uploadNoteFormSubmitHandler}
            className="uploadNote-form"
          >

            {/* Note name */}
            <input
              type="text"
              placeholder="Notename (not more than 30 characters)*"
              className="uploadNote-form-note-name"
              id="upload-note-input"
              ref={notename}
              maxLength="30"
              required
            />

            {/* Description */}
            <input
              type="text"
              placeholder="Description (not more than 300 characters)*"
              className="uploadNote-form-descritpion"
              ref={descritpion}
              id="upload-note-input"
              maxLength="300"
              required
            />

            {/* PDF / Document */}
            <label
              htmlFor="note-file-upload"
              className="custom-file-upload"
            >
              <PictureAsPdf className={classes.upload} />

              <p>
                {noteFile
                  ? noteFile.name
                  : "Choose PDF / DOC / DOCX / PPT / PPTX / TXT"}
              </p>

              <CloudUpload className={classes.upload} />
            </label>

            <input
              type="file"
              id="note-file-upload"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
              onChange={(e) => {
                setNoteFile(e.target.files[0]);
              }}
              required
            />

            {/* Thumbnail */}
            <label
              htmlFor="thumbnail-file-upload"
              className="custom-file-upload"
            >
              <Image className={classes.upload} />

              <p>
                {fileimg
                  ? fileimg.name
                  : "Upload a thumbnail image"}
              </p>

              <CloudUpload className={classes.upload} />
            </label>

            <input
              type="file"
              id="thumbnail-file-upload"
              accept=".png,.jpeg,.jpg"
              onChange={(e) => {
                setfileimg(e.target.files[0]);
              }}
            />

            {/* Upload button */}
            <button
              type="submit"
              className="uploadNote-form-submit-button"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>

          </form>
        </div>
      )}
    </>
  );
};

export default UploadNote;
