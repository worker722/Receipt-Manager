import FuseUtils from "@fuse/utils/FuseUtils";
import { yupResolver } from "@hookform/resolvers/yup";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import LoadingButton from "@mui/lab/LoadingButton";
import { Box } from "@mui/material";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";
import { showMessage } from "app/store/fuse/messageSlice";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import * as yup from "yup";
import { createCategory } from "./store/categorySlice";
/**
 * Form Validation Schema
 */
const schema = yup.object().shape({
  name: yup.string().required("You must enter display name"),
});

const defaultValues = {
  name: "",
};

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: "100%",
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: "100%",
});

export default function AddCategoryModal({
  open = false,
  handleClose = {},
  handleAdded = {},
}) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const uploadInputRef = useRef(false);
  const [photoUri, setPhotoUri] = useState(false);
  const [file, setFile] = useState(false);
  const [vatPossible, setVatPossible] = useState(false);

  const fileReader = new FileReader();

  const { control, formState, handleSubmit, setValue } = useForm({
    mode: "onChange",
    defaultValues,
    resolver: yupResolver(schema),
  });
  const { isValid, dirtyFields, errors, setError } = formState;

  const onSubmit = ({ name }) => {
    setLoading(true);
    dispatch(
      createCategory({
        name,
        vatPossible,
        category_photo: file,
      })
    ).then((data) => {
      fileReader.abort();
      setLoading(false);
      if (!FuseUtils.isEmpty(data?.payload?.message)) {
        dispatch(
          showMessage({
            message: data.payload?.message,
            variant: "error",
          })
        );
      } else {
        if (!FuseUtils.isEmpty(data?.payload))
          handleAdded && handleAdded(data?.payload);
      }
    });
  };

  const handleVatPossibleChanged = () => {
    setVatPossible(!vatPossible);
  };

  const handleUpload = (event) => {
    if (uploadInputRef?.current) {
      uploadInputRef.current.click();
    }
  };

  const handleChange = (event) => {
    if (event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);

      fileReader.onload = (e) => {
        const { result } = e.target;
        if (result) {
          setPhotoUri(result);
        }
      };
      fileReader.readAsDataURL(selectedFile);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUri(false);
    setFile(false);
  };

  const _onClose = (event, reason) => {
    if (reason == "escapeKeyDown" || reason == "backdropClick") {
      // Unknown event, cannot be closed without category interactions
    } else {
      // Can be added saving change confirmation like: 'There are some unsaved changes. Do you want to leave?'
      fileReader.abort();
      handleClose && handleClose();
    }
  };

  return (
    <div>
      <Dialog
        open={open}
        onClose={_onClose}
        aria-labelledby="fuse-dialog-title"
        maxWidth={"sm"}
        fullWidth={true}
        classes={{
          paper: "rounded-8",
        }}
      >
        <DialogTitle>Add Category</DialogTitle>
        <DialogContent>
          <form
            name="addCategoryForm"
            noValidate
            className="flex flex-col justify-center w-full mt-32"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className=" justify-center self-center">
              <div
                className=" w-200 h-200 border-dotted border-2 self-center"
                style={{ borderRadius: "2.2vmax" }}
                onClick={handleUpload}
              >
                {photoUri ? (
                  <img
                    src={photoUri}
                    alt={"Preview"}
                    loading="lazy"
                    style={{ borderRadius: "2.2vmax" }}
                    className=" w-full h-full object-cover"
                  />
                ) : (
                  <p
                    className=" text-center select-none"
                    style={{ lineHeight: "20rem" }}
                  >
                    Choose a photo
                  </p>
                )}
                <VisuallyHiddenInput
                  ref={uploadInputRef}
                  onChange={handleChange}
                  accept="image/*"
                  type="file"
                />
              </div>
            </div>

            <div className=" h-40 mb-12 justify-center self-center">
              {photoUri && (
                <IconButton
                  onClick={handleRemovePhoto}
                  size="large"
                  children={<HighlightOffIcon color="error" />}
                />
              )}
            </div>

            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  className="mb-12"
                  label="Name"
                  autoFocus
                  type="name"
                  placeholder="Taxi"
                  error={!!errors.name}
                  helperText={errors?.name?.message}
                  variant="outlined"
                  required
                  fullWidth
                />
              )}
            />

            <Controller
              name="vatPossible"
              control={control}
              render={({ field }) => (
                <div>
                  <FormControlLabel
                    {...field}
                    className="mb-12"
                    control={<Checkbox onChange={handleVatPossibleChanged} />}
                    label="VAT Possible"
                  />
                </div>
              )}
            />

            <Box>
              <Button
                variant="outlined"
                color={"error"}
                className="w-full mt-20"
                disabled={loading}
                aria-label="Cancel"
                onClick={_onClose}
              >
                Cancel
              </Button>
              <LoadingButton
                loading={loading}
                variant="contained"
                color="success"
                className=" w-full mt-10 "
                aria-label="Save"
                type="submit"
                disabled={_.isEmpty(dirtyFields) || !isValid}
              >
                Save
              </LoadingButton>
            </Box>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
