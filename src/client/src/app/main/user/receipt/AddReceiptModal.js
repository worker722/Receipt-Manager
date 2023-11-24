import FuseUtils from "@fuse/utils/FuseUtils";
import { yupResolver } from "@hookform/resolvers/yup";
import CloseIcon from "@mui/icons-material/Close";
import LoadingButton from "@mui/lab/LoadingButton";
import { Box } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Slide from "@mui/material/Slide";
import TextField from "@mui/material/TextField";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import { showMessage } from "app/store/fuse/messageSlice";
import * as React from "react";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import * as yup from "yup";
import { createReceipt } from "./store/receiptSlice";

/**
 * Form Validation Schema
 */
const schema = yup.object().shape({
  merchant_info: yup.string().required("You must enter merchant information."),
  issued_at: yup.date().required("You must enter expense issue date."),
  total_amount: yup.date().required("You must enter total amount."),
  currency: yup.date().required("You must enter transaction currency."),
  country: yup.date().required("You must enter merchant country."),
});

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

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function AddReceiptModal({
  open = false,
  handleClose = {},
  handleAdded = {},
}) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const uploadInputRef = useRef(false);
  const [file, setFile] = useState(false);

  const { control, formState, handleSubmit, setValue } = useForm({
    mode: "onChange",
    defaultValues: {},
    resolver: yupResolver(schema),
  });
  const { isValid, dirtyFields, errors, setError } = formState;

  const onSubmit = ({ name }) => {
    setLoading(true);
    dispatch(
      createReceipt({
        name,
        receipt_photo: file,
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

  const handleUpload = (event) => {
    if (uploadInputRef?.current) {
      uploadInputRef.current.click();
    }
  };

  const handleChange = (event) => {
    if (event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
    }
  };

  const _onClose = (event, reason) => {
    if (reason == "escapeKeyDown" || reason == "backdropClick") {
      // Unknown event, cannot be closed without receipt interactions
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
        TransitionComponent={Transition}
        fullScreen
      >
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Create Report
            </Typography>
            <Button autoFocus color="inherit" onClick={handleClose}>
              Save
            </Button>
          </Toolbar>
        </AppBar>
        <DialogContent>
          <div className=" flex pl-112 pr-112 h-full ">
            <div
              name={"fileUploadForm"}
              onClick={handleUpload}
              className="border-grey-600 border-solid rounded-6 border-2"
              style={{ width: 800 }}
            >
              <VisuallyHiddenInput
                ref={uploadInputRef}
                onChange={handleChange}
                accept="pdf/*"
                type="file"
              />
            </div>
            <div className=" w-full ml-40">
              <form
                name="addReceiptForm"
                noValidate
                className="flex flex-col justify-center w-full mt-32"
                onSubmit={handleSubmit(onSubmit)}
              >
                <Controller
                  name="vendor"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      className="mb-24"
                      label="Description / Vendor"
                      autoFocus
                      type="name"
                      placeholder="Taxi"
                      error={!!errors.merchant_info}
                      helperText={errors?.merchant_info?.message}
                      variant="outlined"
                      required
                      fullWidth
                    />
                  )}
                />

                <Controller
                  name="issued_at"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      className="mb-24"
                      label="Issued Date"
                      autoFocus
                      type="date"
                      error={!!errors.issued_at}
                      helperText={errors?.issued_at?.message}
                      variant="outlined"
                      required
                      fullWidth
                    />
                  )}
                />

                <Controller
                  name="total_amount"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      className="mb-24"
                      label="Total"
                      autoFocus
                      type="number"
                      error={!!errors.total_amount}
                      helperText={errors?.total_amount?.message}
                      variant="outlined"
                      required
                      fullWidth
                    />
                  )}
                />

                <Controller
                  name="currency"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      className="mb-24"
                      label="Currency"
                      autoFocus
                      type="string"
                      error={!!errors.currency}
                      helperText={errors?.currency.message}
                      variant="outlined"
                      required
                      fullWidth
                    />
                  )}
                />

                <Controller
                  name="country"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      className="mb-24"
                      label="Country"
                      autoFocus
                      type="string"
                      error={!!errors.country}
                      helperText={errors?.country.message}
                      variant="outlined"
                      required
                      fullWidth
                    />
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
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
